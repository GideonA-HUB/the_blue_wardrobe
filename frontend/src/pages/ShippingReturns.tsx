import React from 'react'
import PolicyPageLayout, { type PolicySection } from '../components/PolicyPageLayout'
import { EmailLink, Li, P, Strong, Ul, WhatsAppLink } from '../components/policy/PolicyContent'

const sections: PolicySection[] = [
  {
    id: 'overview',
    title: 'Overview',
    content: (
      <>
        <P>
          At <Strong>THE BLUE WARDROBE</Strong>, we are committed to delivering your luxury designs with care
          and transparency. This Shipping &amp; Returns policy explains how we fulfil orders, our delivery
          standards across Nigeria and internationally, and when refunds or returns may be considered.
        </P>
        <P>
          Please read this policy alongside our{' '}
          <a href="/terms" className="font-medium text-blue-wardrobe-dark underline underline-offset-2 hover:text-blue-wardrobe-light dark:text-blue-luxury-300">
            Terms of Service
          </a>{' '}
          before placing an order. By completing a purchase, you agree to the conditions set out below.
        </P>
      </>
    ),
  },
  {
    id: 'shipping',
    title: 'Shipping & Delivery',
    content: (
      <>
        <P>
          <Strong>THE BLUE WARDROBE</Strong> offers curated delivery services designed to protect the
          integrity of your garment from our atelier to your door.
        </P>
        <Ul>
          <Li>
            <Strong>Nationwide Nigeria:</Strong> We deliver across all states in Nigeria. Estimated delivery
            timelines are typically <Strong>3–7 business days</Strong> from order confirmation, depending on
            your location and courier availability. Remote areas may require additional time.
          </Li>
          <Li>
            <Strong>International orders:</Strong> We ship to selected international destinations. Delivery
            times vary by country and customs processing — typically <Strong>7–21 business days</Strong>.
            International customers are responsible for any import duties, taxes, or customs fees unless
            otherwise stated at checkout.
          </Li>
          <Li>
            <Strong>Processing time:</Strong> Orders are processed after successful payment verification.
            Bespoke or made-to-measure pieces may require additional production time, which will be
            communicated at the time of order.
          </Li>
          <Li>
            <Strong>Delivery fees:</Strong> Shipping costs are calculated and displayed at checkout based on
            your delivery address, order value, and selected service. Free or promotional delivery may apply
            to qualifying orders as stated on our website.
          </Li>
          <Li>
            <Strong>Packaging:</Strong> Every design is carefully packaged to preserve fabric quality,
            structure, and presentation. We use protective materials appropriate to luxury garments.
          </Li>
          <Li>
            <Strong>Tracking:</Strong> Where available, you will receive tracking information via email or
            WhatsApp once your order has been dispatched.
          </Li>
          <Li>
            <Strong>Delivery address:</Strong> You are responsible for providing a complete and accurate
            delivery address including street, city, state, and a reachable phone number. We are not liable
            for failed delivery due to incorrect or incomplete information.
          </Li>
          <Li>
            <Strong>Recipient availability:</Strong> Please ensure someone is available to receive the
            package. Repeated failed delivery attempts may result in return to sender and additional
            re-delivery charges.
          </Li>
        </Ul>
      </>
    ),
  },
  {
    id: 'inspection',
    title: 'Inspecting Your Order',
    content: (
      <>
        <P>Upon delivery, we strongly recommend that you:</P>
        <Ul>
          <Li>Inspect the outer packaging for visible damage before signing for receipt.</Li>
          <Li>
            Open and inspect your garment promptly — ideally within <Strong>48 hours</Strong> of delivery.
          </Li>
          <Li>
            Check that the design, size, measurements, colour, and condition match your order confirmation.
          </Li>
          <Li>
            Retain all original packaging, tags, labels, and accessories in case a return is required.
          </Li>
          <Li>
            Report any shipping damage or discrepancies immediately with clear photographs to{' '}
            <EmailLink /> or <WhatsAppLink />.
          </Li>
        </Ul>
        <P>
          Claims reported after 48 hours may be more difficult to verify and may affect your eligibility for
          a return or refund.
        </P>
      </>
    ),
  },
  {
    id: 'general-refund',
    title: 'General Refund Eligibility',
    content: (
      <>
        <P>
          Refunds are considered only when <Strong>all</Strong> of the following conditions are met:
        </P>
        <Ul>
          <Li>
            The transaction has been successfully identified, verified, and confirmed in our payment system
            (Paystack or Flutterwave).
          </Li>
          <Li>
            The order has not been fulfilled, delivered, or substantially processed in accordance with your
            confirmed purchase — or a valid defect or error is demonstrated as described below.
          </Li>
          <Li>
            A valid refund request is submitted within the stated timeframes with supporting evidence where
            required.
          </Li>
          <Li>
            The garment is returned in its original, unworn, unaltered condition with all packaging, tags,
            and accessories intact (where a return is required).
          </Li>
        </Ul>
      </>
    ),
  },
  {
    id: 'verification',
    title: 'Transaction Verification Requirement',
    content: (
      <>
        <P>
          No refund shall be processed unless the original transaction has been positively identified and
          confirmed through our payment gateway records. Refunds will only be issued to the same payment
          method or account used for the original transaction, following verification that:
        </P>
        <Ul>
          <Li>Payment was received and recorded in our system.</Li>
          <Li>The order was not properly fulfilled, was materially defective, or was our error.</Li>
          <Li>All return conditions (where applicable) have been satisfied.</Li>
        </Ul>
        <P>
          This protects both our customers and our business against fraudulent refund claims.
        </P>
      </>
    ),
  },
  {
    id: 'eligible-scenarios',
    title: 'Eligible Refund & Return Scenarios',
    content: (
      <>
        <P>We may approve a refund or exchange where:</P>
        <Ul>
          <Li>
            <Strong>Wrong item delivered:</Strong> you received a different design, size, or measurement than
            ordered — subject to photographic evidence and return of the item.
          </Li>
          <Li>
            <Strong>Shipping damage:</Strong> the garment arrived significantly damaged due to transit —
            reported within 48 hours of delivery with clear photographs of the packaging and garment.
          </Li>
          <Li>
            <Strong>Material defect:</Strong> a manufacturing fault affecting wearability (e.g. significant
            stitching failure, undisclosed damage) — reported promptly with evidence. Normal fabric
            characteristics are not defects.
          </Li>
          <Li>
            <Strong>Not as described:</Strong> the product is materially different from its published
            description and is unused, with original packaging and labels intact.
          </Li>
          <Li>
            <Strong>Unable to fulfil:</Strong> we cannot fulfil your order due to stock unavailability or
            production issues after payment — a full refund will be issued.
          </Li>
          <Li>
            <Strong>Size/measurement error by us:</Strong> where we dispatched incorrect measurements despite
            your confirmed selection.
          </Li>
        </Ul>
      </>
    ),
  },
  {
    id: 'non-refundable',
    title: 'Non-Refundable Situations',
    content: (
      <>
        <P>Refunds will <Strong>not</Strong> be issued for:</P>
        <Ul>
          <Li>Change of mind after purchase.</Li>
          <Li>
            Garments that have been worn, washed, altered, tailored, steamed aggressively, or otherwise
            used outside of inspection.
          </Li>
          <Li>
            Incorrect size or measurement selected by the customer where the product matches the confirmed
            order — please consult our size guide and contact the atelier before ordering if unsure.
          </Li>
          <Li>Delays caused by incorrect delivery information provided by the customer.</Li>
          <Li>
            Minor variations in colour, drape, texture, or finish inherent to luxury natural and blended
            fabrics, or due to screen display differences.
          </Li>
          <Li>Custom, bespoke, or made-to-order pieces once production has commenced (unless defective).</Li>
          <Li>Items purchased during final sale or clearance events where stated as non-returnable.</Li>
          <Li>Damage resulting from improper care, storage, or handling after delivery.</Li>
        </Ul>
      </>
    ),
  },
  {
    id: 'how-to-request',
    title: 'How to Request a Refund or Return',
    content: (
      <>
        <P>Contact us at <EmailLink /> or via WhatsApp at <WhatsAppLink /> with:</P>
        <Ul>
          <Li>Your full name and order number.</Li>
          <Li>Date of purchase and payment reference (from Paystack or Flutterwave confirmation).</Li>
          <Li>A clear description of the issue.</Li>
          <Li>Photographs or video evidence where applicable (damage, wrong item, defect).</Li>
          <Li>Your preferred resolution (refund, exchange, or store credit where offered).</Li>
        </Ul>
        <P>
          We will acknowledge your request within <Strong>2 business days</Strong> and investigate within{' '}
          <Strong>5–7 business days</Strong>. Complex cases may require additional time — we will keep you
          informed throughout.
        </P>
      </>
    ),
  },
  {
    id: 'return-process',
    title: 'Return Process',
    content: (
      <>
        <P>If a return is approved, you will receive instructions including:</P>
        <Ul>
          <Li>The return address and any reference number to include with your package.</Li>
          <Li>Packaging requirements to protect the garment in transit.</Li>
          <Li>The deadline by which the item must be posted back to us.</Li>
        </Ul>
        <P>
          Items must be returned in <Strong>original condition</Strong> with all packaging, tags, labels, and
          accessories. Returns received in worn, damaged, or incomplete condition may be rejected or subject
          to a partial refund.
        </P>
        <P>
          <Strong>Return shipping costs</Strong> are typically borne by the customer unless the error or
          defect was caused by THE BLUE WARDROBE. In such cases, we may provide a prepaid return label or
          reimburse reasonable return postage upon receipt of proof.
        </P>
      </>
    ),
  },
  {
    id: 'refund-timeline',
    title: 'Refund Method & Timeline',
    content: (
      <>
        <P>
          Approved refunds are processed to the <Strong>original payment method</Strong> after transaction
          verification and receipt of returned goods (where applicable).
        </P>
        <Ul>
          <Li>
            Please allow <Strong>7–14 business days</Strong> for the refund to appear in your account,
            depending on your bank or payment provider.
          </Li>
          <Li>
            International refunds may take longer due to currency conversion and banking processes.
          </Li>
          <Li>
            We will send you email confirmation once the refund has been initiated on our end.
          </Li>
        </Ul>
      </>
    ),
  },
  {
    id: 'partial-refunds',
    title: 'Partial Refunds & Store Credit',
    content: (
      <>
        <P>
          In some circumstances, a <Strong>partial refund</Strong> may be offered at our discretion — for
          example, for minor defects that do not materially affect wearability, or where an item has been
          partially used but a fair resolution is appropriate.
        </P>
        <P>
          We may also offer <Strong>store credit</Strong> toward a future purchase as an alternative to a
          monetary refund, subject to your agreement.
        </P>
      </>
    ),
  },
  {
    id: 'exchanges',
    title: 'Exchanges',
    content: (
      <>
        <P>
          Where stock permits, we may offer an <Strong>exchange</Strong> for a different size or measurement
          instead of a refund. Exchange requests are subject to availability and must be initiated within 7
          days of delivery for eligible items.
        </P>
        <P>
          Any price difference between the original and replacement item will be charged or refunded
          accordingly. Contact our atelier for sizing guidance before requesting an exchange.
        </P>
      </>
    ),
  },
  {
    id: 'chargebacks',
    title: 'Chargebacks & Payment Disputes',
    content: (
      <>
        <P>
          We encourage all customers to contact us at <EmailLink /> or <WhatsAppLink /> before initiating a
          chargeback or payment dispute with their bank or card issuer.
        </P>
        <P>
          Unverified or fraudulent chargebacks may delay resolution, result in account suspension, and affect
          eligibility for future orders. We will provide payment gateway records to financial institutions
          where legitimate disputes arise.
        </P>
      </>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    content: (
      <>
        <P>Shipping, delivery, refund, and return enquiries:</P>
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

export default function ShippingReturns() {
  return (
    <PolicyPageLayout
      title="Shipping & Returns"
      subtitle="Delivery standards, inspection guidance, and our refund and return policy for THE BLUE WARDROBE luxury collections."
      lastUpdated="March 2026"
      documentTitle="Shipping & Returns — THE BLUE WARDROBE"
      sections={sections}
    />
  )
}
