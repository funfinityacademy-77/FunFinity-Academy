/**
 * GDPR/COPPA Privacy Request Handler
 * Supabase Edge Function for automated data deletion requests
 * 
 * This endpoint handles:
 * - GDPR Article 17: Right to erasure
 * - COPPA: Data deletion for minors
 * - General data export requests
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface PrivacyRequest {
  userId: string;
  email: string;
  requestType: 'deletion' | 'export' | 'restrict';
  reason?: string;
  verificationToken?: string;
}

interface PrivacyResponse {
  success: boolean;
  requestId: string;
  estimatedCompletion: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body: PrivacyRequest = await req.json();
    const { userId, email, requestType, reason, verificationToken } = body;

    // Validate required fields
    if (!userId || !email || !requestType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, email, requestType' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate request type
    if (!['deletion', 'export', 'restrict'].includes(requestType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid requestType. Must be: deletion, export, or restrict' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify user identity by checking email matches
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, id')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (profile.email.toLowerCase() !== email.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: 'Email does not match user record' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate request ID
    const requestId = crypto.randomUUID();

    // Log the privacy request
    const { error: logError } = await supabase.from('privacy_requests').insert({
      id: requestId,
      user_id: userId,
      email,
      request_type: requestType,
      reason: reason || 'Not provided',
      status: 'pending',
      created_at: new Date().toISOString(),
      estimated_completion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    });

    if (logError) {
      console.error('Failed to log privacy request:', logError);
      // Continue anyway - this is non-critical
    }

    // Handle different request types
    switch (requestType) {
      case 'deletion':
        await handleDeletionRequest(supabase, userId, requestId);
        break;
      case 'export':
        await handleExportRequest(supabase, userId, requestId);
        break;
      case 'restrict':
        await handleRestrictionRequest(supabase, userId, requestId);
        break;
    }

    const response: PrivacyResponse = {
      success: true,
      requestId,
      estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      message: `Your ${requestType} request has been received. You will receive a confirmation email within 24 hours with details about the processing timeline.`,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Privacy request handler error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Handle data deletion request (GDPR Article 17)
 */
async function handleDeletionRequest(
  supabase: any,
  userId: string,
  requestId: string
): Promise<void> {
  // Anonymize user data instead of hard delete for audit trail
  const anonymizedEmail = `deleted-${crypto.randomUUID()}@deleted.local`;
  const anonymizedName = 'Deleted User';

  // Update profiles table
  await supabase
    .from('profiles')
    .update({
      email: anonymizedEmail,
      display_name: anonymizedName,
      deleted_at: new Date().toISOString(),
      privacy_request_id: requestId,
    })
    .eq('id', userId);

  // Mark enrollments as deleted
  await supabase
    .from('enrollments')
    .update({
      deleted_at: new Date().toISOString(),
      privacy_request_id: requestId,
    })
    .eq('user_id', userId);

  // Mark learning DNA profiles as deleted
  await supabase
    .from('learning_dna_profiles')
    .update({
      deleted_at: new Date().toISOString(),
      privacy_request_id: requestId,
    })
    .eq('user_id', userId);

  // Delete user sessions
  await supabase.auth.admin.deleteUser(userId);

  // Log the deletion
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'data_deletion_requested',
    metadata: { requestId, timestamp: new Date().toISOString() },
  });
}

/**
 * Handle data export request
 */
async function handleExportRequest(
  supabase: any,
  userId: string,
  requestId: string
): Promise<void> {
  // Collect all user data
  const [profile, enrollments, learningDNA, gamification] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('enrollments').select('*').eq('user_id', userId),
    supabase.from('learning_dna_profiles').select('*').eq('user_id', userId),
    supabase.from('gamification_data').select('*').eq('user_id', userId),
  ]);

  const userData = {
    profile: profile.data,
    enrollments: enrollments.data,
    learningDNA: learningDNA.data,
    gamification: gamification.data,
    exportedAt: new Date().toISOString(),
    requestId,
  };

  // Store export in a secure storage (in production, use encrypted storage)
  await supabase.from('data_exports').insert({
    user_id: userId,
    request_id: requestId,
    data: userData,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
  });

  // Log the export
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'data_export_requested',
    metadata: { requestId, timestamp: new Date().toISOString() },
  });
}

/**
 * Handle data restriction request
 */
async function handleRestrictionRequest(
  supabase: any,
  userId: string,
  requestId: string
): Promise<void> {
  // Mark user account as restricted
  await supabase
    .from('profiles')
    .update({
      data_processing_restricted: true,
      privacy_request_id: requestId,
      restricted_at: new Date().toISOString(),
    })
    .eq('id', userId);

  // Log the restriction
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'data_processing_restricted',
    metadata: { requestId, timestamp: new Date().toISOString() },
  });
}
