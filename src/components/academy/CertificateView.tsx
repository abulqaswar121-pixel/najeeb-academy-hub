import { Award, ShieldCheck } from "lucide-react";

import logo from "../../assets/ndh-logo-gateway-cropped.png";
import { formatDate } from "../../lib/academy";

interface CertificateViewProps {
  studentName: string;
  courseTitle: string;
  issuedAt: string;
  code: string;
}

/**
 * Landscape A4 certificate (297 × 210) in the same deep violet aurora style
 * as the PIN voucher card: real NDH logo, glass panels, gold frame and seal.
 * Sized with container units so it scales on phones and prints as one page.
 */
export function CertificateView({ studentName, courseTitle, issuedAt, code }: CertificateViewProps) {
  return (
    <div className="cert-wrap print-certificate">
      <article className="cert" aria-label={`Certificate of completion for ${studentName}`}>
        <div className="cert-bg" aria-hidden="true" />
        <div className="cert-halo" aria-hidden="true" />
        <div className="cert-watermark" aria-hidden="true">
          <img src={logo} alt="" />
        </div>
        <div className="cert-sheen" aria-hidden="true" />
        <div className="cert-frame" aria-hidden="true">
          <i className="tl" /><i className="tr" /><i className="bl" /><i className="br" />
        </div>

        <div className="cert-inner">
          <header className="cert-top">
            <div className="cert-brand">
              <span className="cert-logo"><img src={logo} alt="" /></span>
              <span>
                <span className="cert-hub">Najeeb Digital Hub</span>
                <span className="cert-word">NDH <em>ACADEMY</em></span>
              </span>
            </div>
            <span className="cert-badge">
              <span className="cert-badge-dot" aria-hidden="true" />
              Official Academic Award
            </span>
          </header>

          <section className="cert-main">
            <h2 className="cert-title">Certificate <span>of Completion</span></h2>
            <div className="cert-rule" aria-hidden="true"><i /><b /><i /></div>
            <p className="cert-small">This is proudly presented to</p>
            <p className="cert-name">{studentName}</p>
            <p className="cert-small">for successfully completing the course</p>
            <p className="cert-course">{courseTitle}</p>
            <p className="cert-note">
              including all lessons, the final assessment and a practical capstone project.
            </p>
          </section>

          <footer className="cert-foot">
            <div className="cert-glass">
              <p className="cert-label">Date issued</p>
              <p className="cert-value">{formatDate(issuedAt)}</p>
              <p className="cert-label">Certificate ID</p>
              <p className="cert-code">{code}</p>
              <p className="cert-verify">
                <ShieldCheck aria-hidden="true" /> academy.ndh.com.ng/verify/{code}
              </p>
            </div>

            <div className="cert-seal" aria-hidden="true">
              <svg viewBox="0 0 120 120">
                <defs>
                  <radialGradient id="cert-gold" cx="35%" cy="30%" r="75%">
                    <stop offset="0%" stopColor="#fff1b8" />
                    <stop offset="45%" stopColor="#e6b84d" />
                    <stop offset="100%" stopColor="#9a6a12" />
                  </radialGradient>
                  <path id="cert-seal-arc" d="M60 60 m-45 0 a45 45 0 1 1 90 0 a45 45 0 1 1 -90 0" />
                </defs>
                <circle cx="60" cy="60" r="58" fill="url(#cert-gold)" />
                <circle cx="60" cy="60" r="52" className="seal-ring" />
                <circle cx="60" cy="60" r="36" className="seal-inner" />
                <text className="seal-text">
                  <textPath href="#cert-seal-arc">
                    NDH ACADEMY • CERTIFIED • NDH ACADEMY • CERTIFIED •
                  </textPath>
                </text>
              </svg>
              <span className="cert-seal-logo"><img src={logo} alt="" /></span>
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
              <p className="cert-award"><Award aria-hidden="true" /> Learn AI</p>
            </div>
          </footer>
        </div>
      </article>
    </div>
  );
}
