import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  tls: { rejectUnauthorized: false },
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
})

console.log('Testing SMTP connection...')

try {
  await transporter.verify()
  console.log('✅ SMTP connection successful')

  const info = await transporter.sendMail({
    from: 'hello@rebalancekit.com',
    to: 'test@example.com',
    subject: 'SMTP Test',
    text: 'This is a test email',
  })
  console.log('✅ Email sent:', info.messageId)
} catch (error) {
  console.error('❌ SMTP error:', error.message)
  console.error('Code:', error.code)
  console.error('Response:', error.response)
}
