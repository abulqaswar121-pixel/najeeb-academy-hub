import logoUrl from "../assets/ndh-logo-gateway-cropped.png";
import { passTier } from "../data/passes";
import { formatNaira } from "./currency";

/**
 * Canvas renderer for the physical-looking student pass voucher.
 *
 * 1012 × 638 px at 300 DPI is exactly CR80 (85.6 mm × 54 mm), so the exported
 * PNG is sharp enough for print, phone galleries and WhatsApp status. The
 * artwork mirrors the on-page card: a violet aurora drawn from the NDH logo
 * palette, the real logo mark, frosted glass panels and no grid pattern.
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

let logoPromise: Promise<HTMLImageElement | null> | null = null;

function loadLogo(): Promise<HTMLImageElement | null> {
  if (typeof window === "undefined" || typeof Image === "undefined") return Promise.resolve(null);
  if (!logoPromise) {
    logoPromise = new Promise((resolve) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = logoUrl;
    });
  }
  return logoPromise;
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

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  if (!sourceWidth || !sourceHeight) return;
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  ctx.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function drawLogo(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  x: number,
  y: number,
  size: number,
) {
  const radius = size * 0.27;

  ctx.save();
  roundedRect(ctx, x, y, size, size, radius);
  ctx.clip();
  ctx.fillStyle = "#0b1030";
  ctx.fillRect(x, y, size, size);
  if (image) {
    drawImageCover(ctx, image, x, y, size, size);
  } else {
    const fallback = ctx.createLinearGradient(x, y, x + size, y + size);
    fallback.addColorStop(0, "#8b5cf6");
    fallback.addColorStop(0.6, "#6366f1");
    fallback.addColorStop(1, "#22d3ee");
    ctx.fillStyle = fallback;
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = "#ffffff";
    ctx.font = `800 ${Math.round(size * 0.44)}px "Space Grotesk", ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("N", x + size / 2, y + size / 2 + 1);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }
  ctx.restore();

  roundedRect(ctx, x + 0.75, y + 0.75, size - 1.5, size - 1.5, radius);
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawGlassPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const fill = ctx.createLinearGradient(x, y, x + width, y + height);
  fill.addColorStop(0, "rgba(255,255,255,0.16)");
  fill.addColorStop(1, "rgba(255,255,255,0.05)");
  roundedRect(ctx, x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1.25;
  ctx.stroke();
}

function drawChip(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const gradient = ctx.createLinearGradient(x, y, x + 92, y + 66);
  gradient.addColorStop(0, "#f8fafc");
  gradient.addColorStop(0.28, "#ddd6fe");
  gradient.addColorStop(0.58, "#a78bfa");
  gradient.addColorStop(0.82, "#7dd3fc");
  gradient.addColorStop(1, "#f0f9ff");

  roundedRect(ctx, x, y, 92, 66, 13);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.strokeStyle = "rgba(59,7,100,0.48)";
  ctx.lineWidth = 2;
  for (let i = 1; i <= 3; i += 1) {
    const lineY = y + (66 / 4) * i;
    ctx.beginPath();
    ctx.moveTo(x + 9, lineY);
    ctx.lineTo(x + 83, lineY);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(x + 46, y + 7);
  ctx.lineTo(x + 46, y + 59);
  ctx.stroke();
}

function drawContactless(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.strokeStyle = "rgba(233,213,255,0.82)";
  ctx.lineWidth = 2.6;
  ctx.lineCap = "round";
  const centerY = y + size / 2;
  for (let i = 1; i <= 3; i += 1) {
    ctx.beginPath();
    ctx.arc(x + size * 0.16, centerY, size * 0.18 * i, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();
  }
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

  // Wait for the display fonts and the real logo before painting.
  try {
    await document.fonts?.ready;
  } catch {
    /* system fallbacks are fine */
  }
  const logo = await loadLogo();

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");

  // ── Card stock: violet aurora drawn from the NDH logo palette ──
  ctx.save();
  roundedRect(ctx, 0, 0, width, height, 34);
  ctx.clip();

  const base = ctx.createLinearGradient(0, 0, width, height);
  base.addColorStop(0, "#190936");
  base.addColorStop(0.38, "#32106b");
  base.addColorStop(0.64, "#4c1d95");
  base.addColorStop(1, "#10143f");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  const violetGlow = ctx.createRadialGradient(width * 0.05, 0, 0, width * 0.05, 0, width * 0.85);
  violetGlow.addColorStop(0, "rgba(192,132,252,0.75)");
  violetGlow.addColorStop(1, "rgba(192,132,252,0)");
  ctx.fillStyle = violetGlow;
  ctx.fillRect(0, 0, width, height);

  const blueGlow = ctx.createRadialGradient(width * 0.98, 0, 0, width * 0.98, 0, width * 0.75);
  blueGlow.addColorStop(0, "rgba(96,165,250,0.62)");
  blueGlow.addColorStop(1, "rgba(96,165,250,0)");
  ctx.fillStyle = blueGlow;
  ctx.fillRect(0, 0, width, height);

  const cyanGlow = ctx.createRadialGradient(
    width * 0.92,
    height,
    0,
    width * 0.92,
    height,
    width * 0.6,
  );
  cyanGlow.addColorStop(0, "rgba(34,211,238,0.38)");
  cyanGlow.addColorStop(1, "rgba(34,211,238,0)");
  ctx.fillStyle = cyanGlow;
  ctx.fillRect(0, 0, width, height);

  const plumGlow = ctx.createRadialGradient(
    width * 0.3,
    height,
    0,
    width * 0.3,
    height,
    width * 0.7,
  );
  plumGlow.addColorStop(0, "rgba(124,58,237,0.55)");
  plumGlow.addColorStop(1, "rgba(124,58,237,0)");
  ctx.fillStyle = plumGlow;
  ctx.fillRect(0, 0, width, height);

  // Soft orbital halos in place of the old security grid.
  ctx.strokeStyle = "rgba(233,213,255,0.16)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(width * 1.02, -height * 0.2, width * 0.55, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(167,139,250,0.12)";
  ctx.beginPath();
  ctx.arc(width * 1.02, -height * 0.2, width * 0.46, 0, Math.PI * 2);
  ctx.stroke();

  // Oversized logo watermark, blended like ink into the aurora.
  if (logo) {
    const markSize = width * 0.58;
    ctx.save();
    ctx.globalAlpha = 0.085;
    ctx.globalCompositeOperation = "screen";
    ctx.translate(width * 0.94, height * 0.5);
    ctx.rotate(-0.2);
    ctx.drawImage(logo, -markSize / 2, -markSize / 2, markSize, markSize);
    ctx.restore();
  }

  // Diagonal light sweep and bottom vignette for text contrast.
  ctx.fillStyle = "rgba(255,255,255,0.055)";
  ctx.beginPath();
  ctx.moveTo(width * 0.32, 0);
  ctx.lineTo(width * 0.46, 0);
  ctx.lineTo(width * 0.18, height);
  ctx.lineTo(width * 0.04, height);
  ctx.closePath();
  ctx.fill();

  const vignette = ctx.createLinearGradient(0, height * 0.45, 0, height);
  vignette.addColorStop(0, "rgba(8,4,30,0)");
  vignette.addColorStop(1, "rgba(8,4,30,0.35)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // Double hairline border.
  roundedRect(ctx, 1, 1, width - 2, height - 2, 34);
  ctx.strokeStyle = "rgba(233,213,255,0.38)";
  ctx.lineWidth = 2;
  ctx.stroke();
  roundedRect(ctx, 8, 8, width - 16, height - 16, 28);
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  ctx.stroke();

  const pad = 46;

  // ── Brand lockup ──
  drawLogo(ctx, logo, pad, 38, 96);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(237,233,254,0.74)";
  ctx.font = '600 18px "DM Sans", ui-sans-serif, system-ui, sans-serif';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "3px";
  ctx.fillText("NAJEEB DIGITAL HUB", pad + 114, 70);

  ctx.fillStyle = "#ffffff";
  ctx.font = '800 40px "Space Grotesk", ui-sans-serif, system-ui, sans-serif';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "1.5px";
  ctx.fillText("NDH ACADEMY", pad + 114, 112);

  // ── Frosted official badge ──
  const badgeText = "OFFICIAL STUDENT PASS VOUCHER";
  ctx.font = '700 14px "DM Sans", ui-sans-serif, system-ui, sans-serif';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "1.6px";
  const badgeTextWidth = ctx.measureText(badgeText).width;
  const badgeW = badgeTextWidth + 64;
  const badgeH = 46;
  const badgeX = width - pad - badgeW;
  const badgeY = 40;
  drawGlassPanel(ctx, badgeX, badgeY, badgeW, badgeH, 23);

  const dot = ctx.createLinearGradient(badgeX + 16, badgeY + 18, badgeX + 26, badgeY + 28);
  dot.addColorStop(0, "#f5f3ff");
  dot.addColorStop(0.55, "#c084fc");
  dot.addColorStop(1, "#67e8f9");
  ctx.fillStyle = dot;
  ctx.beginPath();
  ctx.arc(badgeX + 22, badgeY + badgeH / 2, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f3e8ff";
  ctx.fillText(badgeText, badgeX + 36, badgeY + 29);
  ctx.textAlign = "left";

  // ── Chip + contactless mark ──
  drawChip(ctx, pad, 176);
  drawContactless(ctx, pad + 112, 184, 50);
  ctx.fillStyle = "rgba(237,233,254,0.62)";
  ctx.font = '600 13px "DM Sans", ui-sans-serif, system-ui, sans-serif';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "2.2px";
  ctx.fillText("PASS CREDIT", pad, 272);

  // ── Tier + retail price ──
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = '800 58px "Space Grotesk", ui-sans-serif, system-ui, sans-serif';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "-1px";
  ctx.fillText(tierName, pad, 350);

  ctx.fillStyle = "rgba(207,250,254,0.92)";
  ctx.font = '600 19px "DM Sans", ui-sans-serif, system-ui, sans-serif';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "1px";
  ctx.fillText(unlocks, pad, 386);

  const priceW = 270;
  const priceH = 94;
  const priceX = width - pad - priceW;
  const priceY = 282;
  drawGlassPanel(ctx, priceX, priceY, priceW, priceH, 18);

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(237,233,254,0.76)";
  ctx.font = '700 13px "DM Sans", ui-sans-serif, system-ui, sans-serif';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "2px";
  ctx.fillText("RETAIL PRICE", width - pad - 20, priceY + 34);

  ctx.fillStyle = "#ffffff";
  ctx.font = '800 40px "Space Grotesk", ui-sans-serif, system-ui, sans-serif';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  ctx.fillText(formatNaira(input.retailNgn), width - pad - 20, priceY + 78);
  ctx.textAlign = "left";

  // ── Embossed PIN strip ──
  const pinY = 408;
  const pinH = 88;
  const pinGradient = ctx.createLinearGradient(pad, pinY, width - pad, pinY + pinH);
  pinGradient.addColorStop(0, "rgba(12,7,35,0.58)");
  pinGradient.addColorStop(1, "rgba(76,29,149,0.3)");
  roundedRect(ctx, pad, pinY, width - pad * 2, pinH, 20);
  ctx.fillStyle = pinGradient;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1.25;
  ctx.stroke();

  ctx.font = '700 12px "DM Sans", ui-sans-serif, system-ui, sans-serif';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "2px";
  const pinLabelWidth = ctx.measureText("PIN").width + 30;
  roundedRect(ctx, pad + 22, pinY + 27, pinLabelWidth, 34, 17);
  ctx.fillStyle = "rgba(196,181,253,0.16)";
  ctx.fill();
  ctx.strokeStyle = "rgba(196,181,253,0.32)";
  ctx.stroke();
  ctx.fillStyle = "#ddd6fe";
  ctx.fillText("PIN", pad + 37, pinY + 49);

  ctx.fillStyle = "#f8faff";
  ctx.font = '700 40px ui-monospace, "SFMono-Regular", Menlo, monospace';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "4px";
  ctx.textAlign = "right";
  ctx.fillText(input.code, width - pad - 24, pinY + 56);
  ctx.textAlign = "left";

  // ── Redemption steps ──
  ctx.fillStyle = "rgba(237,233,254,0.64)";
  ctx.font = '600 15px "DM Sans", ui-sans-serif, system-ui, sans-serif';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0.2px";
  const steps = [
    "1. Visit academy.ndh.com.ng",
    "2. Log in → My passes",
    "3. Enter this PIN · one use only",
  ];
  const column = (width - pad * 2) / 3;
  steps.forEach((step, index) => {
    ctx.fillText(step, pad + column * index, 572);
  });

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not encode the voucher image."));
    }, "image/png");
  });
}
