import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
// import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  ticket_id: string;
  sender_type: 'visitor' | 'agent' | 'system';
  sender_name: string;
  content: string;
  created_at: string;
  read_at?: string;
}

interface Ticket {
  id: string;
  visitor_name: string;
  visitor_email?: string;
  status: 'open' | 'assigned' | 'resolved';
  session_id: string;
  created_at: string;
  last_message_at: string;
  unread_count?: number;
}

export default function SupportDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'assigned' | 'resolved'>('all');
  const [inputMessage, setInputMessage] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    loadTickets();
    subscribeToTickets();
    subscribeToPresence();
  }, [filter]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadTickets = async () => {
    try {
      let query = supabase
        .from('support_tickets')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data) {
        setTickets(data);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
  };

  const subscribeToTickets = () => {
    const channel = supabase
      .channel('support_tickets_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets'
        },
        () => loadTickets()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToPresence = () => {
    const channel = supabase.channel('agent_presence')
      .on('system', { event: 'postgres_changes' }, (payload: any) => {
        // Handle presence updates
        if (payload.event === 'SYNC') {
          const state = payload;
          const agents = Object.values(state).filter((u: any) => u.agent_online);
          setIsOnline(agents.length > 0);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            agent_online: true,
            agent_id: 'current_agent',
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const selectTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    await loadMessages(ticket.id);
    subscribeToMessages(ticket.id);

    // Mark ticket as assigned if it's open
    if (ticket.status === 'open') {
      await supabase
        .from('support_tickets')
        .update({ status: 'assigned', assigned_to: 'current_agent' })
        .eq('id', ticket.id);
    }
  };

  const loadMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const subscribeToMessages = (ticketId: string) => {
    const channel = supabase
      .channel(`ticket_messages:${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${ticketId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedTicket) return;

    try {
      const { error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: selectedTicket.id,
          sender_type: 'agent',
          sender_name: 'Support Agent',
          content: inputMessage.trim()
        });

      if (error) throw error;
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const updateTicketStatus = async (status: 'open' | 'assigned' | 'resolved') => {
    if (!selectedTicket) return;

    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', selectedTicket.id);

      if (error) throw error;

      // Add system message
      await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: selectedTicket.id,
          sender_type: 'system',
          sender_name: 'System',
          content: `Ticket status changed to ${status}`
        });
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getFilterCount = (statusFilter: string) => {
    if (statusFilter === 'all') return tickets.length;
    return tickets.filter(t => t.status === statusFilter).length;
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Left Column - Ticket Feed */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800 mb-4">Support Tickets</h1>
          <div className="flex gap-2">
            {(['all', 'open', 'assigned', 'resolved'] as const).map((statusFilter) => (
              <button
                key={statusFilter}
                onClick={() => setFilter(statusFilter)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === statusFilter
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} ({getFilterCount(statusFilter)})
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => selectTicket(ticket)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedTicket?.id === ticket.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="font-semibold text-gray-800">{ticket.visitor_name}</div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  ticket.status === 'open' ? 'bg-green-100 text-green-800' :
                  ticket.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {ticket.status}
                </span>
              </div>
              {ticket.visitor_email && (
                <div className="text-sm text-gray-600 mb-2">{ticket.visitor_email}</div>
              )}
              <div className="text-xs text-gray-500">
                Last message {new Date(ticket.last_message_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm text-gray-600">
              {isOnline ? 'Online' : 'Away'}
            </span>
          </div>
        </div>
      </div>

      {/* Right Column - Conversation Thread */}
      <div className="flex-1 flex flex-col">
        {selectedTicket ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{selectedTicket.visitor_name}</h2>
                  {selectedTicket.visitor_email && (
                    <p className="text-sm text-gray-600">{selectedTicket.visitor_email}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {(['open', 'assigned', 'resolved'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateTicketStatus(status)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedTicket.status === status
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="max-w-3xl mx-auto space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === 'visitor' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${
                      message.sender_type === 'visitor'
                        ? 'bg-blue-500 text-white'
                        : message.sender_type === 'system'
                        ? 'bg-gray-300 text-gray-800'
                        : 'bg-white text-gray-800 border border-gray-200'
                    } rounded-lg p-3`}>
                      <div className="text-sm font-medium mb-1">{message.sender_name}</div>
                      <div className="text-sm">{message.content}</div>
                      <div className="text-xs mt-1 opacity-70">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="max-w-3xl mx-auto flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim()}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Select a Ticket</h2>
              <p className="text-gray-500">Choose a ticket from the left to view the conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
