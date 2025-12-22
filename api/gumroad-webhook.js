import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // You'll need this
)

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, sale_id, product_name } = req.body

    console.log('Gumroad webhook received:', { email, sale_id, product_name })

    if (!email) {
      return res.status(400).json({ error: 'No email provided' })
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (userError || !user) {
      console.error('User not found:', email)
      // User hasn't signed up yet - we'll need to handle this
      return res.status(200).json({
        message: 'User not found yet, they need to sign up first'
      })
    }

    // Update user to Pro
    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_pro: true,
        subscription_id: sale_id,
        subscribed_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating user:', updateError)
      return res.status(500).json({ error: 'Failed to update user' })
    }

    console.log('User upgraded to Pro:', email)
    return res.status(200).json({ success: true, message: 'User upgraded to Pro' })

  } catch (error) {
    console.error('Webhook error:', error)
    return res.status(500).json({ error: error.message })
  }
}
