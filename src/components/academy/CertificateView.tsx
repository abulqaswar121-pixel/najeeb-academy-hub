import { Award } from "lucide-react";

import { formatDate } from "../../lib/academy";

interface CertificateViewProps {
  studentName: string;
  courseTitle: string;
  issuedAt: string;
  code: string;
}

/** The signed certificate artwork — rendered on the dashboard, learn page and verification page. */
export function CertificateView({
  studentName,
  courseTitle,
  issuedAt,
  code,
}: CertificateViewProps) {
  return (
    <div className="border-gold/50 bg-card relative overflow-hidden rounded-3xl border-2 p-8 shadow-2xl sm:p-10">
      <div className="bg-dots-pattern absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="hero-glow -top-24 -right-24 h-[260px] w-[360px]" aria-hidden="true" />
      <div className="relative z-10 space-y-6 text-center">
        <div className="flex items-center justify-center gap-3">
          <div className="bg-gold/15 border-gold/40 text-gold flex h-12 w-12 items-center justify-center rounded-2xl border">
            <Award className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
        <div>
          <p className="text-muted-foreground font-mono text-[10px] tracking-[0.3em] uppercase">
            Najeeb Academy
          </p>
          <p className="text-gold mt-1 font-mono text-[10px] tracking-[0.2em] uppercase">
            Certificate of Completion
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs">This certifies that</p>
          <p className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
            {studentName}
          </p>
          <p className="text-muted-foreground text-xs">has successfully completed the course</p>
          <p className="text-gradient-brand text-lg font-bold sm:text-xl">{courseTitle}</p>
          <p className="text-muted-foreground text-xs">
            including the final assessment and practical capstone project
          </p>
        </div>
        <div className="flex items-end justify-between gap-4 pt-4 text-left">
          <div>
            <p className="text-muted-foreground text-[10px] tracking-wider uppercase">Issued</p>
            <p className="text-foreground text-sm font-bold">{formatDate(issuedAt)}</p>
            <p className="text-muted-foreground mt-2 text-[10px] tracking-wider uppercase">
              Verification code
            </p>
            <p className="text-gold font-mono text-sm font-bold">{code}</p>
            <p className="text-muted-foreground mt-1 text-[10px]">
              Verify at academy.ndh.com.ng/verify/{code}
            </p>
          </div>
          <div className="text-right">
            {/* Signature flourish */}
            <svg
              viewBox="0 0 160 48"
              className="text-brand-soft ml-auto h-12 w-40"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M8 36C24 12 32 10 36 18C40 26 30 40 26 38C22 36 36 16 50 14C64 12 58 34 66 32C74 30 76 14 88 16C100 18 94 34 104 30C114 26 116 14 128 18C136 21 140 28 152 22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <div className="border-border mt-1 border-t pt-1">
              <p className="text-foreground text-xs font-bold">Najeeb A.</p>
              <p className="text-muted-foreground text-[10px]">Founder, Najeeb Digital Hub</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
