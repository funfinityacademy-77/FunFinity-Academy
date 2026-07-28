// Chat API Route
// Isolated module for chat functionality
// High-concurrency optimized for local HDD storage

import { postgres } from '@/lib/postgres';
import { z } from 'zod';

// Request validation schemas
const CreateRoomSchema = z.object({
  room_name: z.string().min(1).max(200),
  room_type: z.enum(['course', 'study_group', 'private', 'announcement']),
  course_id: z.string().optional(),
  created_by: z.string().uuid(),
});

const SendMessageSchema = z.object({
  room_id: z.string().uuid(),
  user_id: z.string().uuid(),
  message_type: z.enum(['text', 'file', 'image', 'system']).default('text'),
  message_content: z.object({
    text: z.string().optional(),
    file_url: z.string().url().optional(),
    file_name: z.string().optional(),
    metadata: z.object({}).optional(),
  }),
  reply_to: z.string().uuid().optional(),
});

const JoinRoomSchema = z.object({
  room_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum(['admin', 'moderator', 'participant']).default('participant'),
});

// GET: Retrieve chat rooms and messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const roomId = searchParams.get('room_id');
    const roomType = searchParams.get('room_type');
    const courseId = searchParams.get('course_id');
    const action = searchParams.get('action'); // 'rooms', 'messages', 'participants'

    if (action === 'rooms') {
      // Get user's chat rooms
      if (!userId) {
        return NextResponse.json(
          { error: 'user_id is required for rooms' },
          { status: 400 }
        );
      }

      let query = `
        SELECT cr.*, cp.role as user_role, cp.last_read_at,
          COUNT(cm.id) as message_count,
          MAX(cm.created_at) as last_message_time
        FROM chat_rooms cr
        JOIN chat_participants cp ON cr.id = cp.room_id
        LEFT JOIN chat_messages cm ON cr.id = cm.room_id
        WHERE cp.user_id = $1 AND cp.is_active = true AND cr.is_active = true
      `;

      const params = [userId];

      if (roomType) {
        query += ' AND cr.room_type = $' + (params.length + 1);
        params.push(roomType);
      }

      if (courseId) {
        query += ' AND cr.course_id = $' + (params.length + 1);
        params.push(courseId);
      }

      query += ' GROUP BY cr.id, cp.role, cp.last_read_at ORDER BY last_message_time DESC NULLS LAST';

      const rooms = await postgres.query(query, params);

      return NextResponse.json({
        success: true,
        data: rooms,
        count: rooms.length,
      });

    } else if (action === 'messages') {
      // Get room messages
      if (!roomId) {
        return NextResponse.json(
          { error: 'room_id is required for messages' },
          { status: 400 }
        );
      }

      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      const messagesQuery = `
        SELECT cm.*, u.display_name, u.avatar_url,
          (SELECT COUNT(*) FROM chat_messages WHERE room_id = $1) as total_count
        FROM chat_messages cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.room_id = $1
        ORDER BY cm.created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const messages = await postgres.query(messagesQuery, [roomId, limit, offset]);

      return NextResponse.json({
        success: true,
        data: messages.reverse(), // Reverse to show oldest first
        count: messages.length,
        total: messages[0]?.total_count || 0,
      });

    } else if (action === 'participants') {
      // Get room participants
      if (!roomId) {
        return NextResponse.json(
          { error: 'room_id is required for participants' },
          { status: 400 }
        );
      }

      const participantsQuery = `
        SELECT cp.*, u.display_name, u.avatar_url, u.email
        FROM chat_participants cp
        JOIN users u ON cp.user_id = u.id
        WHERE cp.room_id = $1 AND cp.is_active = true
        ORDER BY cp.joined_at ASC
      `;

      const participants = await postgres.query(participantsQuery, [roomId]);

      return NextResponse.json({
        success: true,
        data: participants,
        count: participants.length,
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use: rooms, messages, or participants' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error in chat GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create chat rooms, send messages, or join rooms
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'create_room') {
      // Create new chat room
      const validatedData = CreateRoomSchema.parse(body);
      
      const roomQuery = `
        INSERT INTO chat_rooms (room_name, room_type, course_id, created_by, participant_count)
        VALUES ($1, $2, $3, $4, 0)
        RETURNING *
      `;
      
      const room = await postgres.queryOne(roomQuery, [
        validatedData.room_name,
        validatedData.room_type,
        validatedData.course_id || null,
        validatedData.created_by,
      ]);

      // Add creator as admin participant
      const participantQuery = `
        INSERT INTO chat_participants (room_id, user_id, role, joined_at)
        VALUES ($1, $2, 'admin', CURRENT_TIMESTAMP)
        RETURNING *
      `;
      
      const participant = await postgres.queryOne(participantQuery, [room.id, validatedData.created_by]);

      // Update participant count
      await postgres.query('UPDATE chat_rooms SET participant_count = 1 WHERE id = $1', [room.id]);

      return NextResponse.json({
        success: true,
        data: { room, participant },
      });

    } else if (action === 'send_message') {
      // Send message to chat room
      const validatedData = SendMessageSchema.parse(body);
      
      // Verify user is participant
      const participantCheck = await postgres.queryOne(
        'SELECT id FROM chat_participants WHERE room_id = $1 AND user_id = $2 AND is_active = true',
        [validatedData.room_id, validatedData.user_id]
      );

      if (!participantCheck) {
        return NextResponse.json(
          { error: 'User is not a participant in this room' },
          { status: 403 }
        );
      }

      const messageQuery = `
        INSERT INTO chat_messages (room_id, user_id, message_type, message_content, reply_to)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const message = await postgres.queryOne(messageQuery, [
        validatedData.room_id,
        validatedData.user_id,
        validatedData.message_type,
        JSON.stringify(validatedData.message_content),
        validatedData.reply_to || null,
      ]);

      // Update room's last activity
      await postgres.query('UPDATE chat_rooms SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [validatedData.room_id]);

      return NextResponse.json({
        success: true,
        data: message,
      });

    } else if (action === 'join_room') {
      // Join chat room
      const validatedData = JoinRoomSchema.parse(body);
      
      // Check if room exists
      const room = await postgres.queryOne('SELECT id FROM chat_rooms WHERE id = $1 AND is_active = true', [validatedData.room_id]);
      
      if (!room) {
        return NextResponse.json(
          { error: 'Room not found' },
          { status: 404 }
        );
      }

      // Check if already participant
      const existingParticipant = await postgres.queryOne(
        'SELECT id FROM chat_participants WHERE room_id = $1 AND user_id = $2',
        [validatedData.room_id, validatedData.user_id]
      );

      let participant;
      
      if (existingParticipant) {
        // Reactivate existing participant
        const reactivateQuery = `
          UPDATE chat_participants 
          SET is_active = true, role = $1, joined_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING *
        `;
        
        participant = await postgres.queryOne(reactivateQuery, [validatedData.role, existingParticipant.id]);
      } else {
        // Add new participant
        const joinQuery = `
          INSERT INTO chat_participants (room_id, user_id, role, joined_at)
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
          RETURNING *
        `;
        
        participant = await postgres.queryOne(joinQuery, [
          validatedData.room_id,
          validatedData.user_id,
          validatedData.role,
        ]);
      }

      // Update participant count
      await postgres.query(`
        UPDATE chat_rooms 
        SET participant_count = (
          SELECT COUNT(*) FROM chat_participants 
          WHERE room_id = $1 AND is_active = true
        )
        WHERE id = $1
      `, [validatedData.room_id]);

      return NextResponse.json({
        success: true,
        data: participant,
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use: create_room, send_message, or join_room' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error in chat POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update chat room or participant status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'leave_room') {
      // Leave chat room
      const { room_id, user_id } = body;
      
      if (!room_id || !user_id) {
        return NextResponse.json(
          { error: 'room_id and user_id are required' },
          { status: 400 }
        );
      }

      const result = await postgres.query(
        'UPDATE chat_participants SET is_active = false WHERE room_id = $1 AND user_id = $2',
        [room_id, user_id]
      );

      // Update participant count
      await postgres.query(`
        UPDATE chat_rooms 
        SET participant_count = (
          SELECT COUNT(*) FROM chat_participants 
          WHERE room_id = $1 AND is_active = true
        )
        WHERE id = $1
      `, [room_id]);

      return NextResponse.json({
        success: true,
        left: result.length > 0,
      });

    } else if (action === 'mark_read') {
      // Mark messages as read
      const { room_id, user_id, last_read_at } = body;
      
      if (!room_id || !user_id) {
        return NextResponse.json(
          { error: 'room_id and user_id are required' },
          { status: 400 }
        );
      }

      const result = await postgres.query(
        'UPDATE chat_participants SET last_read_at = $1 WHERE room_id = $2 AND user_id = $3 AND is_active = true',
        [last_read_at || new Date().toISOString(), room_id, user_id]
      );

      return NextResponse.json({
        success: true,
        updated: result.length > 0,
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use: leave_room or mark_read' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error in chat PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete chat room or messages
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const roomId = searchParams.get('room_id');
    const messageId = searchParams.get('message_id');
    const userId = searchParams.get('user_id');

    if (action === 'delete_room' && roomId) {
      // Delete chat room (soft delete)
      const result = await postgres.query(
        'UPDATE chat_rooms SET is_active = false WHERE id = $1',
        [roomId]
      );

      return NextResponse.json({
        success: true,
        deleted: result.length > 0,
      });

    } else if (action === 'delete_message' && messageId && userId) {
      // Delete message (only by sender or admin)
      const message = await postgres.queryOne(
        'SELECT user_id FROM chat_messages WHERE id = $1',
        [messageId]
      );

      if (!message || message.user_id !== userId) {
        return NextResponse.json(
          { error: 'Message not found or permission denied' },
          { status: 404 }
        );
      }

      const result = await postgres.query(
        'DELETE FROM chat_messages WHERE id = $1',
        [messageId]
      );

      return NextResponse.json({
        success: true,
        deleted: result.length > 0,
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error in chat DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
