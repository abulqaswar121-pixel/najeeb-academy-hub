import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "../components/academy/LegalPage";
import { seo } from "../lib/academy";

export const Route = createFileRoute("/terms")({
  head: () =>
    seo({
      title: "Terms of Service",
      description: "Terms governing use of Najeeb Academy courses, accounts and certificates.",
      path: "/terms",
    }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage
      title="Terms of service"
      intro="These terms govern your access to Najeeb Academy. By creating an account or buying a course, you agree to them."
    >
      <LegalSection title="Accounts">
        <p>
          Provide accurate information, keep your credentials private, and notify us of suspected
          unauthorized access. One account is for one learner unless a team plan says otherwise.
        </p>
      </LegalSection>
      <LegalSection title="Course access and payments">
        <p>
          Prices and included access are shown before purchase. Enrollment in a paid course is valid
          only after payment is confirmed. External tools used in coursework may have separate fees
          and terms unless explicitly included.
        </p>
      </LegalSection>
      <LegalSection title="Acceptable use">
        <p>
          Do not share paid content, bypass access controls, scrape the service, submit another
          person’s work, manipulate progress or assessments, issue false credentials, disrupt the
          platform, or use it unlawfully.
        </p>
      </LegalSection>
      <LegalSection title="Course content">
        <p>
          Course materials are licensed for your personal learning, not sold. You may use skills and
          your own project output commercially, but may not redistribute Academy videos, notes,
          assessments, branding, or source materials.
        </p>
      </LegalSection>
      <LegalSection title="Projects and certificates">
        <p>
          Certificates indicate completion of the Academy requirements in effect at issuance; they
          are not a professional licence, employment guarantee, or academic degree. Certificates
          obtained through fraud or error may be revoked.
        </p>
      </LegalSection>
      <LegalSection title="Availability and changes">
        <p>
          Tools and third-party videos change. We may update, replace, or retire material while
          making reasonable efforts to preserve the value of purchased access. Temporary
          interruptions may occur.
        </p>
      </LegalSection>
      <LegalSection title="Liability">
        <p>
          Courses are educational information and not legal, financial, medical, or other regulated
          professional advice. To the extent permitted by law, liability is limited to the amount
          you paid for the affected course.
        </p>
      </LegalSection>
      <LegalSection title="Contact">
        <p>Questions about these terms can be sent to hello@academy.ndh.com.ng.</p>
      </LegalSection>
    </LegalPage>
  );
}
