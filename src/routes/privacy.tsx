import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "../components/academy/LegalPage";
import { seo } from "../lib/academy";

export const Route = createFileRoute("/privacy")({
  head: () =>
    seo({
      title: "Privacy Policy",
      description: "How Najeeb Academy collects, uses and protects personal information.",
      path: "/privacy",
    }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      intro="This policy explains what information Najeeb Academy collects, why we use it, and the choices available to learners and visitors."
    >
      <LegalSection title="Information we collect">
        <p>
          We collect account details such as your name and email address, enrollment and learning
          progress, assessment results, project submissions, reviews, support messages, and
          certificate records. Payment providers may process billing details; the Academy should not
          store complete card details.
        </p>
      </LegalSection>
      <LegalSection title="How we use information">
        <p>
          We use information to provide courses, secure accounts, track progress, review projects,
          issue and verify certificates, provide support, process purchases and refunds, prevent
          abuse, and improve the service.
        </p>
      </LegalSection>
      <LegalSection title="Public certificate verification">
        <p>
          If you earn a certificate, its verification page may display your certificate name,
          course, issue date, and verification code. Contact us before certification if the name on
          your profile is incorrect.
        </p>
      </LegalSection>
      <LegalSection title="Sharing and processors">
        <p>
          Information may be handled by service providers needed for hosting, authentication,
          database services, video delivery, communications, analytics, and payments. We do not sell
          personal information.
        </p>
      </LegalSection>
      <LegalSection title="Retention and security">
        <p>
          We retain information while your account is active and as needed for legal, accounting,
          security, and certificate-verification purposes. No online service can guarantee absolute
          security, but access controls and reasonable technical safeguards are used.
        </p>
      </LegalSection>
      <LegalSection title="Your choices">
        <p>
          You may ask to access, correct, or delete eligible personal information, withdraw
          testimonial consent, or raise a privacy concern by emailing hello@academy.ndh.com.ng. Some
          records may need to be retained for legal or fraud-prevention reasons.
        </p>
      </LegalSection>
      <LegalSection title="Children and changes">
        <p>
          The service is not directed to children under 13. Where local law requires parental
          consent for older minors, a parent or guardian must provide it. Material policy changes
          will be posted on this page.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
