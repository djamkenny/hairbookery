
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create Supabase client with the service role key for admin privileges
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

interface AdminActionRequest {
  action: 'deleteUser';
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  try {
    // Get the Authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    // Verify the user is authenticated
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Unauthorized: Invalid token')
    }

    // Parse request body
    const { action, userId } = await req.json() as AdminActionRequest

    console.log(`Admin action requested: ${action} for user ${userId} by user ${user.id}`)

    // Only perform actions on the authenticated user (for safety)
    if (userId !== user.id) {
      throw new Error('You can only perform actions on your own account')
    }

    // Handle different admin actions
    if (action === 'deleteUser') {
      // Delete user
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
      
      if (deleteError) {
        console.error(`Error deleting user: ${deleteError.message}`)
        throw new Error(`Failed to delete user: ${deleteError.message}`)
      }

      return new Response(
        JSON.stringify({ success: true, message: 'User deleted successfully' }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }

    throw new Error(`Unsupported action: ${action}`)
  } catch (error) {
    console.error(`Error processing admin action: ${error.message}`)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )
  }
})
