import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "../components/academy/LegalPage";
import { seo } from "../lib/academy";

export const Route = createFileRoute("/refunds")({
  head: () =>
    seo({
      title: "Refund Policy",
      description: "Eligibility and process for Najeeb Academy course refund requests.",
      path: "/refunds",
    }),
  component: RefundsPage,
});

function RefundsPage() {
  return (
    <LegalPage
      title="Refund policy"
      intro="We want learners to understand when a course purchase can be refunded and how to request one."
    >
      <LegalSection title="Eligibility">
        <p>
          You may request a refund within seven calendar days of confirmed purchase if you have
          completed no more than 20% of the course lessons. A course is not eligible after a
          certificate has been issued.
        </p>
      </LegalSection>
      <LegalSection title="How to request">
        <p>
          Use the contact page or email hello@academy.ndh.com.ng from the address on your account.
          Include the course title, payment reference, purchase date, and reason for the request.
        </p>
      </LegalSection>
      <LegalSection title="Processing">
        <p>
          Approved refunds are sent through the original payment channel where supported. Banks and
          payment providers control final settlement times; a typical refund may take 5–10 business
          days after approval.
        </p>
      </LegalSection>
      <LegalSection title="Exceptions">
        <p>
          Duplicate charges, confirmed unauthorized transactions, and technical failures are
          investigated separately and are not denied solely because the normal eligibility window
          has passed. Abuse, account sharing, or fraudulent activity may make a request ineligible.
        </p>
      </LegalSection>
      <LegalSection title="Bundles and promotions">
        <p>
          For bundles, discounts are recalculated based on courses retained, and any refund is
          limited to the remaining eligible amount. Non-cash promotional credits are not redeemable
          for cash.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
