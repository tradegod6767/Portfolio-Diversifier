import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">Last Updated: January 11, 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-slate max-w-none space-y-8">
          {/* 1. Agreement to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              By accessing or using RebalanceKit ("Service", "we", "us", or "our"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this Service.
            </p>
          </section>

          {/* 2. Description of Service */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              RebalanceKit is a portfolio rebalancing calculator and educational tool that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Calculates buy/sell amounts needed to reach target portfolio allocations</li>
              <li>Provides portfolio analysis and health scores</li>
              <li>Generates AI-powered investment insights</li>
              <li>Offers tax-efficient rebalancing strategies</li>
              <li>Allows users to save and export portfolio data</li>
            </ul>
            <div className="bg-muted border-l-4 border-foreground p-4 my-6">
              <p className="text-sm text-foreground font-semibold">
                <strong>IMPORTANT:</strong> RebalanceKit is a calculator and educational tool only. It does not execute trades, manage funds, or provide personalized financial advice.
              </p>
            </div>
          </section>

          {/* 3. Financial Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Financial Disclaimer & No Investment Advice</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>RebalanceKit is for informational and educational purposes only.</strong> Nothing on this Service constitutes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Financial, investment, tax, or legal advice</li>
              <li>A recommendation to buy, sell, or hold any security</li>
              <li>An endorsement of any investment strategy</li>
              <li>Professional financial planning services</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>You are solely responsible for your investment decisions.</strong> Before making any investment decision, you should:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Consult a licensed financial advisor</li>
              <li>Consult a tax professional regarding tax implications</li>
              <li>Conduct your own research and due diligence</li>
              <li>Consider your individual financial situation, goals, and risk tolerance</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Past performance does not guarantee future results.</strong> All investments carry risk, including potential loss of principal. We make no guarantees about the accuracy, completeness, or applicability of any information provided.
            </p>
          </section>

          {/* 4. User Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. User Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">You agree to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Provide accurate portfolio information</li>
              <li>Use the Service only for lawful purposes</li>
              <li>Not attempt to circumvent any security features or rate limits</li>
              <li>Not use automated tools to scrape or abuse the Service</li>
              <li>Not share your account credentials with others</li>
              <li>Verify all calculations independently before executing any trades</li>
              <li>Maintain the security of your account and password</li>
            </ul>
          </section>

          {/* 5. Account and Subscription */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Account and Subscription</h2>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Free Tier</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Basic features are available for free, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Portfolio rebalancing calculator</li>
              <li>Basic AI-powered analysis</li>
              <li>Interactive charts</li>
              <li>Save up to 3 portfolios</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Pro Subscription</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Pro subscription includes additional features:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Detailed tax impact estimates</li>
              <li>PDF report generation</li>
              <li>Portfolio health scoring</li>
              <li>Model portfolio comparison</li>
              <li>Unlimited saved portfolios</li>
              <li>Priority AI analysis with higher limits</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Billing and Refunds</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Pro subscriptions are billed monthly or annually through our payment processor (Stripe or Gumroad)</li>
              <li>You may cancel your subscription at any time</li>
              <li>Upon cancellation, you will retain Pro features until the end of your current billing period</li>
              <li>Refunds are handled on a case-by-case basis within 14 days of purchase</li>
              <li>We reserve the right to change pricing with 30 days notice to existing subscribers</li>
            </ul>
          </section>

          {/* 6. Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>RebalanceKit is provided "AS IS" and "AS AVAILABLE" without warranties of any kind</li>
              <li>We do not guarantee the accuracy, reliability, or completeness of any information or calculations</li>
              <li>We are not liable for any investment losses, trading errors, tax consequences, or financial damages resulting from use of this Service</li>
              <li>We are not liable for any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Our total liability shall not exceed the amount you paid for the Service in the past 12 months</li>
              <li>We are not responsible for third-party services (Stripe, Gumroad, Supabase, Anthropic)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Some jurisdictions do not allow limitations on implied warranties or liability for incidental damages, so some limitations may not apply to you.
            </p>
          </section>

          {/* 7. Data and Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Data and Privacy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Your use of the Service is governed by our <Link to="/privacy" className="text-foreground underline hover:text-muted-foreground">Privacy Policy</Link>. By using the Service, you consent to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Collection and storage of portfolio data you enter</li>
              <li>Use of cookies and local storage for authentication and preferences</li>
              <li>Sharing of anonymized usage data with third-party services (Anthropic for AI analysis)</li>
            </ul>
          </section>

          {/* 8. Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">8. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Service, including all content, features, and functionality, is owned by RebalanceKit and protected by copyright, trademark, and other intellectual property laws. You may not:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Copy, modify, or distribute our code or content without permission</li>
              <li>Reverse engineer or attempt to extract source code</li>
              <li>Remove or alter any copyright or trademark notices</li>
              <li>Use our branding or trademarks without written permission</li>
            </ul>
          </section>

          {/* 9. Termination */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">9. Termination</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We reserve the right to terminate or suspend your account and access to the Service:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>For violation of these Terms of Service</li>
              <li>For abusive or fraudulent behavior</li>
              <li>For exceeding rate limits or system abuse</li>
              <li>At our sole discretion, with or without notice</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Upon termination, you may request a copy of your data within 30 days.
            </p>
          </section>

          {/* 10. Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">10. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to this page. Continued use of the Service after changes constitutes acceptance of the modified terms.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We will notify users of material changes via email or in-app notification.
            </p>
          </section>

          {/* 11. Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">11. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Any disputes arising from these Terms or use of the Service shall be resolved through binding arbitration, except where prohibited by law.
            </p>
          </section>

          {/* 12. Contact */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">12. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Email:</strong> <a href="mailto:hello@rebalancekit.com" className="text-foreground underline hover:text-muted-foreground">hello@rebalancekit.com</a>
            </p>
          </section>

          {/* Acceptance */}
          <section className="bg-muted border border-border rounded-lg p-6 mt-8">
            <p className="text-sm text-muted-foreground leading-relaxed">
              By using RebalanceKit, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree, you must immediately cease using the Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
