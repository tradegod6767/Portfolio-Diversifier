import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto bg-card rounded-xl border border-border p-8 md:p-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last Updated: January 11, 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-slate max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-muted-foreground leading-relaxed mb-4">
              At RebalanceKit ("we", "us", or "our"), we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our portfolio rebalancing calculator and related services (the "Service").
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              By using RebalanceKit, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          {/* 1. Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">1.1 Information You Provide</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you use RebalanceKit, you may provide:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Account Information:</strong> Email address, password (encrypted), and display name</li>
              <li><strong>Portfolio Data:</strong> Ticker symbols, asset amounts, target allocations, and portfolio names that you enter</li>
              <li><strong>Payment Information:</strong> Processed by third-party payment processors (Stripe, Gumroad). We do not store your credit card information.</li>
              <li><strong>Support Communications:</strong> Email correspondence when you contact support</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">1.2 Information Collected Automatically</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you use the Service, we automatically collect:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Usage Data:</strong> Pages viewed, features used, time spent, and actions taken</li>
              <li><strong>Device Information:</strong> IP address, browser type, operating system, device type</li>
              <li><strong>Cookies and Local Storage:</strong> Authentication tokens, preferences, and session data</li>
              <li><strong>API Usage:</strong> Requests made to our API endpoints for rate limiting and abuse prevention</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">1.3 Information from Third Parties</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may receive information from third-party services:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Stripe/Gumroad:</strong> Payment status, subscription status, transaction IDs</li>
              <li><strong>Supabase:</strong> Authentication and database hosting (see section 3)</li>
            </ul>
          </section>

          {/* 2. How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use your information to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Provide the Service:</strong> Calculate rebalancing strategies, generate AI insights, create charts and reports</li>
              <li><strong>Manage Your Account:</strong> Authenticate users, save portfolios, manage subscriptions</li>
              <li><strong>Process Payments:</strong> Handle Pro subscription billing and refunds</li>
              <li><strong>Improve the Service:</strong> Analyze usage patterns, fix bugs, develop new features</li>
              <li><strong>Communicate:</strong> Send transactional emails (welcome, subscription changes, password resets)</li>
              <li><strong>Prevent Abuse:</strong> Implement rate limiting, detect fraud, enforce terms of service</li>
              <li><strong>Legal Compliance:</strong> Comply with applicable laws and regulations</li>
            </ul>

            <div className="bg-muted border-l-4 border-foreground p-4 my-6">
              <p className="text-sm text-foreground">
                <strong>Important:</strong> We do NOT sell your personal information or portfolio data to third parties. We do NOT use your portfolio data for advertising or marketing purposes.
              </p>
            </div>
          </section>

          {/* 3. Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              RebalanceKit uses the following third-party services to provide functionality:
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">3.1 Supabase (Authentication & Database)</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Purpose:</strong> User authentication and portfolio data storage</li>
              <li><strong>Data Shared:</strong> Email, encrypted password, portfolio data, subscription status</li>
              <li><strong>Location:</strong> US data centers (configurable by region)</li>
              <li><strong>Privacy Policy:</strong> <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-foreground underline hover:text-muted-foreground">https://supabase.com/privacy</a></li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">3.2 Anthropic (AI Analysis)</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Purpose:</strong> Generate AI-powered portfolio insights and analysis</li>
              <li><strong>Data Shared:</strong> Portfolio ticker symbols, allocations, and rebalancing data (anonymized - no email or personal identifiers)</li>
              <li><strong>Data Retention:</strong> Anthropic does not train models on your data or store it long-term</li>
              <li><strong>Privacy Policy:</strong> <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-foreground underline hover:text-muted-foreground">https://www.anthropic.com/legal/privacy</a></li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">3.3 Stripe (Payment Processing)</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Purpose:</strong> Process Pro subscription payments</li>
              <li><strong>Data Shared:</strong> Email, payment information (credit card processed by Stripe, not us)</li>
              <li><strong>Privacy Policy:</strong> <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-foreground underline hover:text-muted-foreground">https://stripe.com/privacy</a></li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">3.4 Gumroad (Alternative Payment Processing)</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Purpose:</strong> Alternative payment processor for Pro subscriptions</li>
              <li><strong>Data Shared:</strong> Email, payment information</li>
              <li><strong>Privacy Policy:</strong> <a href="https://gumroad.com/privacy" target="_blank" rel="noopener noreferrer" className="text-foreground underline hover:text-muted-foreground">https://gumroad.com/privacy</a></li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">3.5 Upstash Redis (Rate Limiting)</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Purpose:</strong> Rate limiting to prevent API abuse</li>
              <li><strong>Data Shared:</strong> IP addresses, user IDs, request counts (temporary, auto-expire)</li>
              <li><strong>Privacy Policy:</strong> <a href="https://upstash.com/docs/redis/overall/privacy" target="_blank" rel="noopener noreferrer" className="text-foreground underline hover:text-muted-foreground">https://upstash.com/docs/redis/overall/privacy</a></li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">3.6 Resend (Transactional Emails)</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Purpose:</strong> Send transactional emails (welcome, subscription updates, password resets)</li>
              <li><strong>Data Shared:</strong> Email address, name, email content</li>
              <li><strong>Privacy Policy:</strong> <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-foreground underline hover:text-muted-foreground">https://resend.com/legal/privacy-policy</a></li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">3.7 Vercel (Hosting)</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Purpose:</strong> Web hosting and serverless functions</li>
              <li><strong>Data Shared:</strong> Request logs, function execution logs (IP addresses, timestamps)</li>
              <li><strong>Privacy Policy:</strong> <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-foreground underline hover:text-muted-foreground">https://vercel.com/legal/privacy-policy</a></li>
            </ul>
          </section>

          {/* 4. How We Protect Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. How We Protect Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We implement security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Encryption:</strong> All data is transmitted over HTTPS (TLS 1.3)</li>
              <li><strong>Password Security:</strong> Passwords are hashed using bcrypt before storage</li>
              <li><strong>Database Security:</strong> Row-level security policies in Supabase</li>
              <li><strong>API Security:</strong> Rate limiting, CORS restrictions, webhook signature verification</li>
              <li><strong>Access Controls:</strong> Limited employee access with audit logs</li>
              <li><strong>Regular Updates:</strong> Security patches applied promptly</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>However, no method of transmission or storage is 100% secure.</strong> We cannot guarantee absolute security of your data.
            </p>
          </section>

          {/* 5. Your Privacy Rights */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Your Privacy Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You have the right to:
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">5.1 Access Your Data</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You can access your account information and portfolio data at any time by logging into your account.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">5.2 Export Your Data</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You can export your portfolio data in CSV or JSON format using the export feature. For a complete copy of all your data, contact us at hello@rebalancekit.com.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">5.3 Delete Your Data</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You can delete individual portfolios from your account. To delete your entire account and all associated data:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Email us at hello@rebalancekit.com with subject "Account Deletion Request"</li>
              <li>We will verify your identity and delete your data within 30 days</li>
              <li>Some data may be retained for legal compliance (e.g., transaction records for tax purposes)</li>
            </ol>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">5.4 Opt-Out of Communications</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You can opt-out of marketing emails by clicking "unsubscribe" in any email. Note: You cannot opt-out of transactional emails (password resets, subscription changes) required to provide the Service.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">5.5 GDPR Rights (EU Users)</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you are in the European Union, you have additional rights under GDPR:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Right to rectification (correct inaccurate data)</li>
              <li>Right to restriction of processing</li>
              <li>Right to object to processing</li>
              <li>Right to data portability</li>
              <li>Right to withdraw consent</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">5.6 CCPA Rights (California Users)</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              California residents have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Know what personal information is collected</li>
              <li>Know if personal information is sold or disclosed (we do not sell data)</li>
              <li>Request deletion of personal information</li>
              <li>Opt-out of sale of personal information (not applicable - we don't sell data)</li>
              <li>Non-discrimination for exercising privacy rights</li>
            </ul>
          </section>

          {/* 6. Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We retain your data as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Account Data:</strong> Retained until account deletion</li>
              <li><strong>Portfolio Data:</strong> Retained until you delete portfolios or your account</li>
              <li><strong>Transaction Records:</strong> Retained for 7 years for tax and legal compliance</li>
              <li><strong>Usage Logs:</strong> Retained for 90 days</li>
              <li><strong>Rate Limit Data:</strong> Auto-expires after 1 hour</li>
              <li><strong>Support Communications:</strong> Retained for 3 years</li>
            </ul>
          </section>

          {/* 7. Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              RebalanceKit is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you are a parent and believe your child has provided us with personal information, please contact us and we will delete it.
            </p>
          </section>

          {/* 8. International Data Transfers */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">8. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Your information may be transferred to and processed in countries other than your own. We use third-party services (Supabase, Anthropic, Stripe) that may process data in the United States and other countries.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              By using RebalanceKit, you consent to the transfer of your information to countries that may not have the same data protection laws as your jurisdiction.
            </p>
          </section>

          {/* 9. Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">9. Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use cookies and similar technologies:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Essential Cookies:</strong> Authentication tokens (required for the Service to work)</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Analytics Cookies:</strong> Understand how users interact with the Service (anonymized)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You can control cookies through your browser settings. Disabling essential cookies will prevent you from using the Service.
            </p>
          </section>

          {/* 10. Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. Material changes will be communicated via email or in-app notification.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Your continued use of the Service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* 11. Contact Us */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">11. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have questions about this Privacy Policy or want to exercise your privacy rights, contact us:
            </p>
            <ul className="list-none space-y-2 text-muted-foreground mb-4">
              <li><strong>Email:</strong> <a href="mailto:hello@rebalancekit.com" className="text-foreground underline hover:text-muted-foreground">hello@rebalancekit.com</a></li>
              <li><strong>Subject Line:</strong> "Privacy Inquiry" or "Data Request"</li>
              <li><strong>Response Time:</strong> We will respond within 30 days</li>
            </ul>
          </section>

          {/* Summary */}
          <section className="bg-muted border border-border rounded-lg p-6 mt-8">
            <h3 className="text-lg font-bold text-foreground mb-3">Privacy Summary</h3>
            <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
              <li>We collect email, portfolio data, and usage information</li>
              <li>We use your data to provide the Service and improve it</li>
              <li>We share anonymized portfolio data with Anthropic for AI analysis</li>
              <li>We do NOT sell your personal information</li>
              <li>You can export or delete your data at any time</li>
              <li>We protect your data with encryption and security best practices</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
