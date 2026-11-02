import { passTier } from "../data/passes";
import { formatNaira } from "./currency";

/**
 * Canvas renderer for the physical-looking student pass voucher.
 *
 * 1012 × 638 px at 300 DPI is exactly CR80 (85.6 mm × 54 mm), so the exported
 * PNG is sharp enough for print, phone galleries and WhatsApp status.
 */
export const VOUCHER_CARD_WIDTH = 1012;
export const VOUCHER_CARD_HEIGHT = 638;

export interface VoucherArtworkInput {
  code: string;
  tier: string;
  retailNgn: number;
}

export function voucherFileName(code: string): string {
  return `ndh-academy-voucher-${code.replace(/[^a-z0-9-]+/gi, "-")}.png`;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawChip(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const gradient = ctx.createLinearGradient(x, y, x + 104, y + 76);
  gradient.addColorStop(0, "#fdf0b0");
  gradient.addColorStop(0.35, "#e7c14d");
  gradient.addColorStop(0.7, "#b8860b");
  gradient.addColorStop(1, "#f7e08a");

  roundedRect(ctx, x, y, 104, 76, 12);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.strokeStyle = "rgba(74,50,0,0.55)";
  ctx.lineWidth = 2;
  for (let i = 1; i <= 3; i += 1) {
    const lineY = y + (76 / 4) * i;
    ctx.beginPath();
    ctx.moveTo(x + 10, lineY);
    ctx.lineTo(x + 94, lineY);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(x + 52, y + 8);
  ctx.lineTo(x + 52, y + 68);
  ctx.stroke();
}

function drawContactless(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.strokeStyle = "rgba(253,230,138,0.8)";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  for (let i = 1; i <= 3; i += 1) {
    ctx.beginPath();
    ctx.arc(x, y + 38, 12 * i, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();
  }
}

function drawLogo(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.strokeStyle = "#7dd3fc";
  ctx.lineWidth = 4;
  ctx.shadowColor = "rgba(34,211,238,0.45)";
  ctx.shadowBlur = 18;
  roundedRect(ctx, x, y, 76, 76, 20);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + 21, y + 57);
  ctx.lineTo(x + 21, y + 30);
  ctx.quadraticCurveTo(x + 21, y + 25, x + 26, y + 29);
  ctx.lineTo(x + 55, y + 57);
  ctx.lineTo(x + 55, y + 20);
  ctx.strokeStyle = "#e0f7ff";
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws the card. Throws if the 2D context or PNG encoder is unavailable.
 */
export async function renderVoucherCard(input: VoucherArtworkInput): Promise<Blob> {
  const tier = passTier(input.tier);
  const tierName = (tier?.name ?? input.tier).toUpperCase();
  const unlocks = tier?.courses ? `UNLOCKS ANY ${tier.courses} COURSES` : "UNLOCKS ALL 60+ COURSES";
  const width = VOUCHER_CARD_WIDTH;
  const height = VOUCHER_CARD_HEIGHT;

  // Wait for the display fonts so the exported artwork matches the app.
  try {
    await document.fonts?.ready;
  } catch {
    /* system fallbacks are fine */
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");

  // ── Card stock: deep navy metal with a cyan / gold glow ──
  const base = ctx.createLinearGradient(0, 0, width, height);
  base.addColorStop(0, "#0a1b3a");
  base.addColorStop(0.45, "#112f5c");
  base.addColorStop(1, "#050f26");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  const cyanGlow = ctx.createRadialGradient(width * 0.08, 0, 0, width * 0.08, 0, width * 0.75);
  cyanGlow.addColorStop(0, "rgba(56,189,248,0.28)");
  cyanGlow.addColorStop(1, "rgba(56,189,248,0)");
  ctx.fillStyle = cyanGlow;
  ctx.fillRect(0, 0, width, height);

  const goldGlow = ctx.createRadialGradient(width, height, 0, width, height, width * 0.7);
  goldGlow.addColorStop(0, "rgba(212,175,55,0.22)");
  goldGlow.addColorStop(1, "rgba(212,175,55,0)");
  ctx.fillStyle = goldGlow;
  ctx.fillRect(0, 0, width, height);

  // ── Security micro-grid, clipped to the card's rounded corners ──
  ctx.save();
  roundedRect(ctx, 0, 0, width, height, 34);
  ctx.clip();

  ctx.strokeStyle = "rgba(148,197,255,0.10)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += 24) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Fine diagonal security print.
  ctx.strokeStyle = "rgba(212,175,55,0.10)";
  for (let offset = -height; offset < width; offset += 26) {
    ctx.beginPath();
    ctx.moveTo(offset, height);
    ctx.lineTo(offset + height, 0);
    ctx.stroke();
  }

  // Metallic sheen sweep.
  ctx.fillStyle = "rgba(255,255,255,0.055)";
  ctx.beginPath();
  ctx.moveTo(width * 0.32, 0);
  ctx.lineTo(width * 0.46, 0);
  ctx.lineTo(width * 0.18, height);
  ctx.lineTo(width * 0.04, height);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Gold hairline border.
  roundedRect(ctx, 10, 10, width - 20, height - 20, 26);
  ctx.strokeStyle = "rgba(212,175,55,0.55)";
  ctx.lineWidth = 2;
  ctx.stroke();

  const pad = 46;

  // ── Brand lockup ──
  drawLogo(ctx, pad, 38);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "rgba(226,232,240,0.72)";
  ctx.font = '600 17px "DM Sans", ui-sans-serif, system-ui, sans-serif';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "3px";
  ctx.fillText("NAJEEB DIGITAL HUB", pad + 96, 68);

  ctx.fillStyle = "#ffffff";
  ctx.font = '800 40px "Space Grotesk", ui-sans-serif, system-ui, sans-serif';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "1px";
  ctx.fillText("NDH ACADEMY", pad + 96, 110);

  // ── Official voucher badge ──
  const badgeW = 344;
  const badgeH = 52;
  const badgeX = width - pad - badgeW;
  const badgeY = 40;
  roundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 26);
  ctx.fillStyle = "rgba(212,175,55,0.12)";
  ctx.fill();
  ctx.strokeStyle = "rgba(212,175,55,0.65)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#fde68a";
  ctx.font = '700 15px "DM Sans", ui-sans-serif, system-ui, sans-serif';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "2.2px";
  ctx.textAlign = "center";
  ctx.fillText("OFFICIAL STUDENT PASS VOUCHER", badgeX + badgeW / 2, badgeY + 33);
  ctx.textAlign = "left";

  // ── Holographic seal ──
  const sealX = width - pad - 62;
  const sealY = 250;
  ctx.save();
  ctx.strokeStyle = "rgba(253,230,138,0.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(sealX, sealY, 52, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(sealX, sealY, 44, 0, Math.PI * 2);
  ctx.setLineDash([5, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(253,230,138,0.85)";
  ctx.textAlign = "center";
  ctx.font = '800 16px "Space Grotesk", ui-sans-serif, system-ui, sans-serif';
  ctx.fillText("NDH", sealX, sealY - 2);
  ctx.font = '600 9px "DM Sans", ui-sans-serif, system-ui, sans-serif';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "1.5px";
  ctx.fillText("SECURE", sealX, sealY + 16);
  ctx.restore();

  // ── Chip + contactless mark ──
  drawChip(ctx, pad, 176);
  drawContactless(ctx, pad + 128, 186);
  ctx.fillStyle = "rgba(226,232,240,0.62)";
  ctx.font = '600 13px "DM Sans", ui-sans-serif, system-ui, sans-serif';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "2px";
  ctx.fillText("PASS CREDIT", pad, 278);

  // ── Tier + retail price ──
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = '800 58px "Space Grotesk", ui-sans-serif, system-ui, sans-serif';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "-1px";
  ctx.fillText(tierName, pad, 348);

  ctx.fillStyle = "rgba(186,230,253,0.92)";
  ctx.font = '600 20px "DM Sans", ui-sans-serif, system-ui, sans-serif';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "1px";
  ctx.fillText(unlocks, pad, 382);

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(253,230,138,0.82)";
  ctx.font = '600 14px "DM Sans", ui-sans-serif, system-ui, sans-serif';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "2px";
  ctx.fillText("RETAIL PRICE", width - pad, 312);

  ctx.fillStyle = "#fde68a";
  ctx.font = '800 44px "Space Grotesk", ui-sans-serif, system-ui, sans-serif';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  ctx.fillText(formatNaira(input.retailNgn), width - pad, 358);
  ctx.textAlign = "left";

  // ── PIN panel ──
  const pinY = 408;
  const pinH = 88;
  roundedRect(ctx, pad, pinY, width - pad * 2, pinH, 18);
  ctx.fillStyle = "rgba(2,10,25,0.62)";
  ctx.fill();
  ctx.strokeStyle = "rgba(125,211,252,0.45)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 6]);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(125,211,252,0.78)";
  ctx.font = '700 14px "DM Sans", ui-sans-serif, system-ui, sans-serif';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "2.5px";
  ctx.fillText("PIN", pad + 26, pinY + 53);

  ctx.fillStyle = "#e0f7ff";
  ctx.font = '700 44px ui-monospace, "SFMono-Regular", Menlo, monospace';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "5px";
  ctx.textAlign = "right";
  ctx.fillText(input.code, width - pad - 26, pinY + 58);
  ctx.textAlign = "left";

  // ── Redemption steps ──
  ctx.fillStyle = "rgba(226,232,240,0.78)";
  ctx.font = '600 15px "DM Sans", ui-sans-serif, system-ui, sans-serif';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0.2px";
  const steps = [
    "1. Visit academy.ndh.com.ng",
    "2. Log in → My passes",
    "3. Enter this PIN · one use only",
  ];
  const column = (width - pad * 2) / 3;
  steps.forEach((step, index) => {
    ctx.fillText(step, pad + column * index, 566);
  });

  ctx.fillStyle = "rgba(226,232,240,0.35)";
  ctx.font = '600 12px ui-monospace, "SFMono-Regular", Menlo, monospace';
  ctx.textAlign = "right";
  ctx.fillText("academy.ndh.com.ng", width - pad, 606);
  ctx.textAlign = "left";

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not encode the voucher image."));
    }, "image/png");
  });
}
