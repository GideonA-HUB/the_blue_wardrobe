import React from 'react'
import PolicyPageLayout, { type PolicySection } from '../components/PolicyPageLayout'
import { EmailLink, Li, P, Strong, Ul, WhatsAppLink } from '../components/policy/PolicyContent'

const sections: PolicySection[] = [
  {
    id: 'agreement',
    title: 'Agreement to Terms',
    content: (
      <>
        <P>
          By accessing or using the <Strong>THE BLUE WARDROBE</Strong> website at{' '}
          <Strong>www.thebluewardrobe.ng</Strong>, browsing our Dress Diaries collections, adding items to
          your wardrobe, or purchasing our designs, you agree to be bound by these Terms of Service
          (&quot;Terms&quot;). If you do not agree, please do not use our services.
        </P>
        <P>
          These Terms constitute a legally binding agreement between you and THE BLUE WARDROBE. We recommend
          reading them carefully before placing an order.
        </P>
      </>
    ),
  },
  {
    id: 'about',
    title: 'About THE BLUE WARDROBE',
    content: (
      <>
        <P>
          <Strong>THE BLUE WARDROBE</Strong> is a luxury fashion atelier and e-commerce brand specialising in
          premium womenswear, bespoke-inspired dress diaries, and exclusive collections crafted from rare
          and premium fabrics sourced globally. We serve discerning customers in Nigeria and internationally,
          offering timeless design, meticulous craftsmanship, and an elevated shopping experience.
        </P>
        <P>
          Our studio is located at Shop 20, 445 Plaza, Nnebisi Road, Asaba, Delta State, Nigeria. Private
          viewings and bespoke consultations may be arranged by appointment.
        </P>
      </>
    ),
  },
  {
    id: 'eligibility',
    title: 'Eligibility',
    content: (
      <P>
        You must be at least <Strong>18 years old</Strong> and capable of entering into a binding contract
        under applicable law to use our services, create an account (where applicable), and place orders. By
        using our website, you represent and warrant that you meet these requirements.
      </P>
    ),
  },
  {
    id: 'products-pricing',
    title: 'Products & Pricing',
    content: (
      <>
        <Ul>
          <Li>
            All product descriptions, images, fabric details, size charts, and specifications are provided
            in good faith. Slight variations in colour, texture, drape, or finish may occur due to lighting,
            screen calibration, or the natural characteristics of luxury fabrics.
          </Li>
          <Li>
            Prices are displayed in <Strong>Nigerian Naira (NGN)</Strong> by default. Where available, we
            also display indicative prices in <Strong>USD</Strong> and <Strong>GBP</Strong> for international
            customers. The currency charged at checkout is determined by your selection and our payment
            gateway configuration.
          </Li>
          <Li>
            We reserve the right to correct pricing errors, update prices, and modify product availability
            without prior notice. If an error affects a confirmed order, we will contact you before
            processing.
          </Li>
          <Li>
            Promotional offers, seasonal sales, and limited-edition releases are subject to stated terms,
            availability, and may be withdrawn at any time.
          </Li>
          <Li>
            Each design is part of our curated Dress Diaries — stock is limited and certain sizes or
            measurements may sell out without notice.
          </Li>
        </Ul>
      </>
    ),
  },
  {
    id: 'orders-payment',
    title: 'Orders & Payment',
    content: (
      <>
        <Ul>
          <Li>
            Placing an order constitutes an offer to purchase. We reserve the right to accept, decline, or
            cancel any order at our discretion — for example, due to stock unavailability, suspected fraud,
            or pricing errors.
          </Li>
          <Li>
            Payment is processed securely via <Strong>Paystack</Strong> or <Strong>Flutterwave</Strong> at
            checkout. We do not store your full card details.
          </Li>
          <Li>
            An order is confirmed only after <Strong>successful payment verification</Strong> by our payment
            gateway. You will receive an order confirmation email once payment is confirmed.
          </Li>
          <Li>
            You are responsible for providing accurate contact, delivery, and sizing information. Incorrect
            details may result in delivery delays, failed delivery, or additional charges.
          </Li>
          <Li>
            We may request additional verification for high-value orders or where fraud prevention measures
            are triggered.
          </Li>
        </Ul>
      </>
    ),
  },
  {
    id: 'delivery',
    title: 'Delivery',
    content: (
      <>
        <Ul>
          <Li>
            Delivery fees, estimated timelines, and service areas are displayed at checkout or communicated
            during order processing.
          </Li>
          <Li>
            We offer <Strong>nationwide delivery across Nigeria</Strong> and international shipping to
            selected destinations. Delivery times are estimates and not guaranteed.
          </Li>
          <Li>
            Risk of loss passes to you upon delivery to the address provided or upon collection by your
            nominated courier, whichever occurs first.
          </Li>
          <Li>
            We are not liable for delays caused by third-party couriers, customs clearance, incorrect
            addresses, recipient unavailability, force majeure events, or circumstances beyond our
            reasonable control.
          </Li>
          <Li>
            You must inspect your package upon delivery and report visible damage within 48 hours with
            photographic evidence. See our Shipping &amp; Returns policy for full details.
          </Li>
        </Ul>
      </>
    ),
  },
  {
    id: 'product-care',
    title: 'Product Care & Use',
    content: (
      <>
        <P>
          Luxury garments require appropriate care. Each design includes or references care guidance
          appropriate to its fabric and construction. We are not responsible for damage resulting from:
        </P>
        <Ul>
          <Li>Improper washing, dry cleaning, ironing, or storage.</Li>
          <Li>Unauthorized alterations, repairs, or modifications.</Li>
          <Li>Wear beyond normal use, negligence, or failure to follow care instructions.</Li>
          <Li>Exposure to harsh chemicals, excessive heat, or improper handling.</Li>
        </Ul>
        <P>
          For bespoke sizing or alteration guidance, contact our atelier before making any changes to your
          garment.
        </P>
      </>
    ),
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property',
    content: (
      <>
        <P>
          All website content — including branding, logos, collection names, product photography, journal
          articles, design descriptions, and text — is owned by <Strong>THE BLUE WARDROBE</Strong> or our
          licensors and is protected by copyright, trademark, and other intellectual property laws.
        </P>
        <P>
          You may not reproduce, distribute, modify, publicly display, or exploit our content for commercial
          purposes without our prior written consent. Limited personal use (such as sharing product links) is
          permitted provided our branding and attribution remain intact.
        </P>
      </>
    ),
  },
  {
    id: 'user-conduct',
    title: 'User Conduct',
    content: (
      <>
        <P>You agree not to:</P>
        <Ul>
          <Li>Misuse our website, attempt unauthorised access, or interfere with site security.</Li>
          <Li>Submit false, misleading, or fraudulent information during checkout or support enquiries.</Li>
          <Li>Post defamatory, abusive, or unlawful content in reviews or communications.</Li>
          <Li>Use automated tools to scrape, harvest, or overload our systems.</Li>
          <Li>Resell our products in a manner that misrepresents their origin or breaches our brand guidelines.</Li>
          <Li>Engage in chargeback abuse or fraudulent payment disputes.</Li>
        </Ul>
      </>
    ),
  },
  {
    id: 'reviews',
    title: 'Reviews & User Content',
    content: (
      <>
        <P>
          When you submit a product review, you grant THE BLUE WARDROBE a non-exclusive, royalty-free licence
          to display, moderate, and use your review content on our website and marketing materials. Reviews
          must be honest, based on genuine experience, and comply with our community standards.
        </P>
        <P>
          We reserve the right to moderate, edit, or remove reviews that violate these Terms or contain
          inappropriate content.
        </P>
      </>
    ),
  },
  {
    id: 'limitation',
    title: 'Limitation of Liability',
    content: (
      <>
        <P>
          To the fullest extent permitted by Nigerian law, <Strong>THE BLUE WARDROBE</Strong> shall not be
          liable for any indirect, incidental, special, consequential, or punitive damages arising from your
          use of our services or products, including loss of profits, data, or goodwill.
        </P>
        <P>
          Our total aggregate liability for any claim arising from a specific order shall not exceed the
          amount you paid for that order. Nothing in these Terms excludes liability that cannot be excluded
          under applicable law.
        </P>
      </>
    ),
  },
  {
    id: 'indemnification',
    title: 'Indemnification',
    content: (
      <P>
        You agree to indemnify, defend, and hold harmless THE BLUE WARDROBE, its founders, employees, and
        partners against any claims, losses, damages, liabilities, and expenses (including reasonable legal
        fees) arising from your breach of these Terms, misuse of our services, or violation of any third-party
        rights.
      </P>
    ),
  },
  {
    id: 'governing-law',
    title: 'Governing Law & Disputes',
    content: (
      <>
        <P>
          These Terms are governed by the laws of the <Strong>Federal Republic of Nigeria</Strong>. Any
          disputes arising from or relating to these Terms or your use of our services shall first be
          addressed through good-faith negotiation. If unresolved, disputes shall be subject to the exclusive
          jurisdiction of the courts of Nigeria.
        </P>
        <P>
          Nothing in this section prevents either party from seeking urgent injunctive relief where
          appropriate.
        </P>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to These Terms',
    content: (
      <P>
        We may revise these Terms at any time. Updated Terms will be posted on this page with a revised
        &quot;Last updated&quot; date. Material changes may also be communicated via email or a site notice
        where appropriate. Continued use of the website after changes constitutes acceptance of the revised
        Terms.
      </P>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    content: (
      <>
        <P>Questions about these Terms of Service:</P>
        <Ul>
          <Li>
            <Strong>Email:</Strong> <EmailLink />
          </Li>
          <Li>
            <Strong>WhatsApp:</Strong> <WhatsAppLink />
          </Li>
          <Li>
            <Strong>Website:</Strong> www.thebluewardrobe.ng
          </Li>
        </Ul>
      </>
    ),
  },
]

export default function TermsOfService() {
  return (
    <PolicyPageLayout
      title="Terms of Service"
      subtitle="The terms governing your use of THE BLUE WARDROBE website, collections, and luxury shopping experience."
      lastUpdated="March 2026"
      documentTitle="Terms of Service — THE BLUE WARDROBE"
      sections={sections}
    />
  )
}
