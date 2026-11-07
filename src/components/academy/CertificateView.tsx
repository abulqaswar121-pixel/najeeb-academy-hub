import { GraduationCap, ShieldCheck } from "lucide-react";

import { formatDate } from "../../lib/academy";
import { NdhFamilySymbol } from "../layout/NdhFamilySymbol";

interface CertificateViewProps {
  studentName: string;
  courseTitle: string;
  issuedAt: string;
  code: string;
}

/**
 * Landscape A4 certificate artwork (297 × 210 mm proportions). Sized with
 * container units so it scales on phones and prints edge-to-edge as one
 * landscape PDF page.
 */
export function CertificateView({ studentName, courseTitle, issuedAt, code }: CertificateViewProps) {
  return (
    <div className="cert-wrap print-certificate">
      <article className="cert" aria-label={`Certificate of completion for ${studentName}`}>
        <div className="cert-guilloche" aria-hidden="true" />
        <div className="cert-frame" aria-hidden="true" />

        {/* Left brand band */}
        <aside className="cert-band">
          <div className="cert-band-glow" aria-hidden="true" />
          <span className="brand-lockup size-lg cert-mark">
            <NdhFamilySymbol SectorIcon={GraduationCap} className="size-lg" />
          </span>
          <p className="cert-band-hub">NAJEEB DIGITAL HUB</p>
          <p className="cert-band-name">
            NDH <em>ACADEMY</em>
          </p>
          <span className="cert-band-pill">Learn AI</span>
          <div className="cert-band-foot">
            <p>academy.ndh.com.ng</p>
          </div>
        </aside>

        {/* Main body */}
        <section className="cert-body">
          <p className="cert-kicker">Official Academic Award</p>
          <h2 className="cert-title">
            Certificate <span>of Completion</span>
          </h2>
          <div className="cert-rule" aria-hidden="true">
            <i />
            <b />
            <i />
          </div>

          <p className="cert-small">This is proudly presented to</p>
          <p className="cert-name">{studentName}</p>
          <p className="cert-small">for successfully completing the course</p>
          <p className="cert-course">{courseTitle}</p>
          <p className="cert-note">
            including all lessons, the final assessment and a practical capstone project.
          </p>

          <div className="cert-foot">
            <div className="cert-meta">
              <p className="cert-label">Date issued</p>
              <p className="cert-value">{formatDate(issuedAt)}</p>
              <p className="cert-label">Certificate ID</p>
              <p className="cert-code">{code}</p>
              <p className="cert-verify">
                <ShieldCheck aria-hidden="true" /> Verify: academy.ndh.com.ng/verify/{code}
              </p>
            </div>

            <div className="cert-seal" aria-hidden="true">
              <svg viewBox="0 0 120 120">
                <defs>
                  <path id="cert-seal-arc" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" />
                </defs>
                <circle cx="60" cy="60" r="57" className="seal-outer" />
                <circle cx="60" cy="60" r="50" className="seal-ring" />
                <circle cx="60" cy="60" r="34" className="seal-inner" />
                <text className="seal-text">
                  <textPath href="#cert-seal-arc">
                    NDH ACADEMY • CERTIFIED • NDH ACADEMY • CERTIFIED •
                  </textPath>
                </text>
              </svg>
              <GraduationCap className="cert-seal-icon" />
            </div>

            <div className="cert-sign">
              <svg viewBox="0 0 160 48" fill="none">
                <path
                  d="M8 36C24 12 32 10 36 18C40 26 30 40 26 38C22 36 36 16 50 14C64 12 58 34 66 32C74 30 76 14 88 16C100 18 94 34 104 30C114 26 116 14 128 18C136 21 140 28 152 22"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
              <p className="cert-sign-name">Najeeb A.</p>
              <p className="cert-label">Founder, Najeeb Digital Hub</p>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
