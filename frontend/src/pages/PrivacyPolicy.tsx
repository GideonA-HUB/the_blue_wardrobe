import React from 'react'
import PolicyPageLayout, { type PolicySection } from '../components/PolicyPageLayout'
import { EmailLink, Li, P, Strong, Ul, WhatsAppLink } from '../components/policy/PolicyContent'

const sections: PolicySection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    content: (
      <>
        <P>
          <Strong>THE BLUE WARDROBE</Strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates{' '}
          <Strong>www.thebluewardrobe.ng</Strong> and is committed to protecting your personal information
          with the same care we bring to our craft. This Privacy Policy explains how we collect, use,
          disclose, and safeguard your data when you visit our website, browse our Dress Diaries collections,
          place an order, subscribe to our journal, or contact our atelier.
        </P>
        <P>
          By using our website and services, you acknowledge that you have read and understood this policy.
          If you do not agree with our practices, please discontinue use of our platform.
        </P>
      </>
    ),
  },
  {
    id: 'information-collected',
    title: 'Information We Collect',
    content: (
      <>
        <P>We may collect the following categories of personal data:</P>
        <Ul>
          <Li>
            <Strong>Identity &amp; contact:</Strong> full name, email address, phone number, delivery
            address (street, city, state, country), and any billing details required to fulfil your order.
          </Li>
          <Li>
            <Strong>Order &amp; transaction:</Strong> designs purchased, size selections, order history,
            payment references, currency preference (NGN, USD, or GBP), and transaction status. Payments are
            processed securely by <Strong>Paystack</Strong> and <Strong>Flutterwave</Strong> — we do not
            store full card or bank account details on our servers.
          </Li>
          <Li>
            <Strong>Wardrobe (cart) data:</Strong> items added to your wardrobe, session identifiers, and
            preferences needed to maintain your shopping experience across visits.
          </Li>
          <Li>
            <Strong>Communications:</Strong> messages sent via our contact form, WhatsApp, email, product
            reviews, and customer support correspondence.
          </Li>
          <Li>
            <Strong>Marketing preferences:</Strong> newsletter subscription status and communication
            preferences where you have opted in.
          </Li>
          <Li>
            <Strong>Technical &amp; usage:</Strong> IP address, browser type, device information, referring
            pages, pages viewed, and cookies used for site functionality, security, and aggregated analytics.
          </Li>
        </Ul>
      </>
    ),
  },
  {
    id: 'how-we-use',
    title: 'How We Use Your Information',
    content: (
      <>
        <P>We use your personal data to:</P>
        <Ul>
          <Li>Process, fulfil, and deliver orders — including coordinating with logistics partners.</Li>
          <Li>
            Send order confirmations, payment receipts, shipping updates, and essential service-related
            communications.
          </Li>
          <Li>Provide sizing guidance, bespoke inquiries, and atelier customer support.</Li>
          <Li>Manage returns, refunds, and dispute resolution in accordance with our policies.</Li>
          <Li>Improve our website, collections, product descriptions, and overall customer experience.</Li>
          <Li>Detect, prevent, and address fraud, security incidents, and unauthorised activity.</Li>
          <Li>Comply with legal, regulatory, and accounting obligations under Nigerian law.</Li>
          <Li>
            Send marketing communications about new collections, journal posts, and exclusive offers — only
            where you have given consent and with the option to unsubscribe at any time.
          </Li>
        </Ul>
      </>
    ),
  },
  {
    id: 'legal-basis',
    title: 'Legal Basis for Processing',
    content: (
      <>
        <P>We process personal data on the following legal bases:</P>
        <Ul>
          <Li>
            <Strong>Contract performance:</Strong> when you place an order or request a service we have
            agreed to provide.
          </Li>
          <Li>
            <Strong>Consent:</Strong> for marketing emails, newsletters, and optional communications you
            have explicitly agreed to receive.
          </Li>
          <Li>
            <Strong>Legitimate interests:</Strong> in operating, securing, and improving our business,
            provided these interests do not override your fundamental rights.
          </Li>
          <Li>
            <Strong>Legal obligation:</Strong> where we are required to retain or disclose information by
            applicable Nigerian law, court order, or regulatory authority.
          </Li>
        </Ul>
      </>
    ),
  },
  {
    id: 'sharing',
    title: 'Sharing Your Information',
    content: (
      <>
        <P>
          <Strong>We do not sell your personal data.</Strong> We may share information only as necessary
          with trusted third parties, including:
        </P>
        <Ul>
          <Li>
            <Strong>Payment processors</Strong> (Paystack, Flutterwave) to authorise and verify transactions.
          </Li>
          <Li>
            <Strong>Delivery and logistics partners</Strong> to ship your orders to the address you provide.
          </Li>
          <Li>
            <Strong>Cloud hosting, email, and storage providers</Strong> that support our platform
            infrastructure (including Resend for transactional emails where applicable).
          </Li>
          <Li>
            <Strong>Professional advisers</Strong> (accountants, legal counsel) bound by confidentiality
            obligations.
          </Li>
          <Li>
            <Strong>Law enforcement or regulators</Strong> when required by law or to protect our rights,
            customers, and the public.
          </Li>
        </Ul>
        <P>
          All third-party processors are required to handle your data securely and only for the purposes we
          specify.
        </P>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'Data Retention',
    content: (
      <>
        <P>
          We retain personal data only for as long as necessary to fulfil the purposes described in this
          policy, including:
        </P>
        <Ul>
          <Li>
            <Strong>Order and transaction records:</Strong> typically up to seven (7) years for accounting,
            tax, and legal compliance.
          </Li>
          <Li>
            <Strong>Customer support correspondence:</Strong> for the duration needed to resolve enquiries
            and any related disputes.
          </Li>
          <Li>
            <Strong>Marketing data:</Strong> until you unsubscribe or withdraw consent, after which we
            suppress your contact details from future campaigns.
          </Li>
          <Li>
            <Strong>Technical logs:</Strong> for a limited period necessary for security monitoring and
            troubleshooting.
          </Li>
        </Ul>
        <P>
          When data is no longer required, we securely delete or anonymise it in accordance with our
          retention schedule.
        </P>
      </>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your Rights',
    content: (
      <>
        <P>Subject to applicable Nigerian law, you may have the right to:</P>
        <Ul>
          <Li>Request access to the personal data we hold about you.</Li>
          <Li>Request correction of inaccurate or incomplete information.</Li>
          <Li>Request deletion of your data, where legally permissible.</Li>
          <Li>Request restriction of processing in certain circumstances.</Li>
          <Li>Object to processing based on legitimate interests.</Li>
          <Li>Withdraw consent for marketing at any time without affecting prior lawful processing.</Li>
          <Li>Lodge a complaint with a relevant data protection authority where applicable.</Li>
        </Ul>
        <P>
          To exercise any of these rights, contact us at <EmailLink />. We will respond within a reasonable
          timeframe and may require identity verification to protect your account.
        </P>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies & Similar Technologies',
    content: (
      <>
        <P>We use cookies and similar technologies to:</P>
        <Ul>
          <Li>Maintain your wardrobe (cart) and session across pages.</Li>
          <Li>Remember your theme preference (light or dark mode) and currency selection.</Li>
          <Li>Enable secure checkout and CSRF protection.</Li>
          <Li>Understand aggregated site usage to improve performance and design.</Li>
        </Ul>
        <P>
          <Strong>Essential cookies</Strong> are required for core site functionality and cannot be disabled
          without affecting your experience. You may disable non-essential cookies through your browser
          settings. Note that blocking certain cookies may limit features such as cart persistence.
        </P>
      </>
    ),
  },
  {
    id: 'security',
    title: 'Security',
    content: (
      <>
        <P>
          We implement appropriate technical and organisational measures to protect your personal data,
          including encrypted connections (HTTPS), secure payment gateways, access controls, and regular
          review of our data practices.
        </P>
        <P>
          However, no method of transmission over the Internet or electronic storage is 100% secure. While
          we strive to protect your information, we cannot guarantee absolute security. Please use strong
          passwords, keep your devices secure, and contact us immediately if you suspect unauthorised access
          to your account or order.
        </P>
      </>
    ),
  },
  {
    id: 'international',
    title: 'International Customers',
    content: (
      <>
        <P>
          THE BLUE WARDROBE serves customers in Nigeria and internationally. If you access our website from
          outside Nigeria, your information may be transferred to and processed in Nigeria or in countries
          where our service providers operate. By using our services, you consent to such transfers where
          permitted by law.
        </P>
        <P>
          International orders may be subject to customs duties, import taxes, or local regulations in your
          country. These are the responsibility of the recipient unless otherwise stated at checkout.
        </P>
      </>
    ),
  },
  {
    id: 'children',
    title: "Children's Privacy",
    content: (
      <P>
        Our services are directed to individuals aged 18 and over. We do not knowingly collect personal data
        from anyone under 18. If you believe a minor has provided us with personal information, please
        contact us at <EmailLink /> and we will take steps to delete such data promptly.
      </P>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to This Policy',
    content: (
      <P>
        We may update this Privacy Policy from time to time to reflect changes in our practices, technology,
        or legal requirements. Material changes will be posted on this page with an updated &quot;Last
        updated&quot; date. We encourage you to review this policy periodically. Continued use of our website
        after changes constitutes acceptance of the revised policy.
      </P>
    ),
  },
  {
    id: 'contact',
    title: 'Contact Us',
    content: (
      <>
        <P>For privacy-related enquiries, data requests, or concerns, please contact:</P>
        <Ul>
          <Li>
            <Strong>Email:</Strong> <EmailLink />
          </Li>
          <Li>
            <Strong>WhatsApp:</Strong> <WhatsAppLink />
          </Li>
          <Li>
            <Strong>Studio:</Strong> Shop 20, 445 Plaza, Nnebisi Road, Asaba, Delta State, Nigeria
          </Li>
          <Li>
            <Strong>Website:</Strong> www.thebluewardrobe.ng
          </Li>
        </Ul>
      </>
    ),
  },
]

export default function PrivacyPolicy() {
  return (
    <PolicyPageLayout
      title="Privacy Policy"
      subtitle="How THE BLUE WARDROBE collects, uses, and protects your personal information when you shop our luxury collections and engage with our atelier."
      lastUpdated="March 2026"
      documentTitle="Privacy Policy — THE BLUE WARDROBE"
      sections={sections}
    />
  )
}
