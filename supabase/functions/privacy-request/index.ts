/**
 * Supabase Edge Function: Privacy Data Deletion Request
 * GDPR Article 17 - Right to Erasure
 * COPPA - Data Deletion for Minors
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key (for admin operations)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const { userId, email, reason } = await req.json()

    // Validate required fields
    if (!userId && !email) {
      return new Response(
        JSON.stringify({ error: 'Either userId or email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If email provided, find the user
    let targetUserId = userId
    if (!targetUserId && email) {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (userError || !userData) {
        return new Response(
          JSON.stringify({ error: 'User not found with provided email' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      targetUserId = userData.id
    }

    // Verify user identity (require authentication)
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the requesting user matches the target user (or is admin)
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    const isOwnRequest = user.id === targetUserId

    if (!isAdmin && !isOwnRequest) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: You can only delete your own data' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create deletion request record
    const { error: requestError } = await supabase
      .from('privacy_requests')
      .insert({
        user_id: targetUserId,
        requested_by: user.id,
        status: 'pending',
        reason: reason || 'User requested data deletion',
        requested_at: new Date().toISOString(),
      })

    if (requestError) {
      console.error('Failed to create privacy request:', requestError)
      return new Response(
        JSON.stringify({ error: 'Failed to create deletion request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For immediate deletion (admin only or if user confirms)
    if (isAdmin || reason === 'immediate') {
      await deleteUserData(supabase, targetUserId)
      
      // Update request status
      await supabase
        .from('privacy_requests')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('user_id', targetUserId)
        .eq('status', 'pending')

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Data deletion completed',
          deleted: true 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For regular users, schedule deletion (30-day grace period)
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Deletion request submitted. Your data will be deleted within 30 days.',
        deleted: false,
        gracePeriodDays: 30
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Privacy request error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

/**
 * Delete all user data from the database
 * This is a comprehensive deletion covering all user-related tables
 */
async function deleteUserData(supabase: any, userId: string) {
  const tablesToDelete = [
    'enrollments',
    'lesson_progress',
    'quiz_attempts',
    'quiz_responses',
    'achievements',
    'user_achievements',
    'experience_logs',
    'milestones',
    'career_profiles',
    'study_notes',
    'infographics',
    'notifications',
    'subscriptions',
    'payments',
    'activity_logs',
    'compliance_records',
    'parental_consent_records',
    'age_verification_attempts',
    'ai_memory',
    'support_tickets',
    'support_messages',
    'profiles', // Delete last
  ]

  for (const table of tablesToDelete) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('user_id', userId)

      if (error && error.code !== 'PGRST116') {
        console.warn(`Failed to delete from ${table}:`, error)
      }
    } catch (error) {
      console.warn(`Error deleting from ${table}:`, error)
    }
  }

  // Delete auth user (requires service role)
  try {
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)
    if (authError) {
      console.warn('Failed to delete auth user:', authError)
    }
  } catch (error) {
    console.warn('Error deleting auth user:', error)
  }
}
