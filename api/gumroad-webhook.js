import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  console.log('Webhook received!')

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, sale_id } = req.body

    console.log('Gumroad webhook data:', { email, sale_id, body: req.body })

    if (!email) {
      return res.status(400).json({ error: 'No email provided' })
    }

    // Get user from Supabase Auth by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error('Error listing users:', listError)
      return res.status(500).json({ error: 'Failed to find user' })
    }

    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (!user) {
      console.log('User not found:', email)
      return res.status(200).json({ message: 'User needs to sign up first' })
    }

    // Update user metadata to mark as Pro
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          is_pro: true,
          subscription_id: sale_id,
          subscribed_at: new Date().toISOString()
        }
      }
    )

    if (updateError) {
      console.error('Error updating user:', updateError)
      return res.status(500).json({ error: 'Failed to upgrade user' })
    }

    console.log('SUCCESS! User upgraded:', email)
    return res.status(200).json({ success: true, userId: user.id })

  } catch (error) {
    console.error('Webhook error:', error)
    return res.status(500).json({ error: error.message })
  }
}
