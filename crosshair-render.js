/* Shared crosshair code decode + canvas renderer.
   Mirrors the drawing logic in crosshair-maker.html so previews look
   identical wherever they're shown. */

function chrHexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function chrDrawLine(ctx, x1, y1, x2, y2, s) {
  if (s.outlineOn) {
    ctx.strokeStyle = s.outlineColor;
    ctx.lineWidth = s.thickness + s.outlineWidth * 2;
    ctx.globalAlpha = s.opacity;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  const c = chrHexToRgb(s.color);
  ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},1)`;
  ctx.lineWidth = s.thickness;
  ctx.globalAlpha = s.opacity;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.globalAlpha = 1;
}

function renderCrosshairToCanvas(canvas, s) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2;
  ctx.clearRect(0, 0, w, h);
  ctx.lineCap = 'round';

  const shape = s.shape || 'cross';

  if (shape === 'circle' && s.length > 0) {
    if (s.outlineOn) {
      ctx.beginPath(); ctx.arc(cx, cy, s.length, 0, Math.PI * 2);
      ctx.strokeStyle = s.outlineColor; ctx.lineWidth = s.thickness + s.outlineWidth * 2;
      ctx.globalAlpha = s.opacity; ctx.stroke();
    }
    const c = chrHexToRgb(s.color);
    ctx.beginPath(); ctx.arc(cx, cy, s.length, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},1)`; ctx.lineWidth = s.thickness;
    ctx.globalAlpha = s.opacity; ctx.stroke(); ctx.globalAlpha = 1;
  } else if (shape === 'square' && s.length > 0) {
    if (s.outlineOn) {
      ctx.strokeStyle = s.outlineColor; ctx.lineWidth = s.thickness + s.outlineWidth * 2;
      ctx.globalAlpha = s.opacity;
      ctx.strokeRect(cx - s.length, cy - s.length, s.length * 2, s.length * 2);
    }
    const c = chrHexToRgb(s.color);
    ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},1)`; ctx.lineWidth = s.thickness;
    ctx.globalAlpha = s.opacity;
    ctx.strokeRect(cx - s.length, cy - s.length, s.length * 2, s.length * 2);
    ctx.globalAlpha = 1;
  } else if (s.length > 0) {
    if (!s.tstyle) chrDrawLine(ctx, cx, cy - s.gap - s.length, cx, cy - s.gap, s);
    chrDrawLine(ctx, cx, cy + s.gap, cx, cy + s.gap + s.length, s);
    chrDrawLine(ctx, cx - s.gap - s.length, cy, cx - s.gap, cy, s);
    chrDrawLine(ctx, cx + s.gap, cy, cx + s.gap + s.length, cy, s);
  }

  if (s.dotOn) {
    if (s.outlineOn) {
      ctx.beginPath();
      ctx.arc(cx, cy, s.dotSize + s.outlineWidth, 0, Math.PI * 2);
      ctx.fillStyle = s.outlineColor;
      ctx.globalAlpha = s.dotOpacity;
      ctx.fill();
    }
    const c = chrHexToRgb(s.color);
    ctx.beginPath();
    ctx.arc(cx, cy, s.dotSize, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},1)`;
    ctx.globalAlpha = s.dotOpacity;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function decodeCrosshairCode(code) {
  try {
    const raw = String(code).trim().replace(/^KRXH1:/, '');
    return JSON.parse(decodeURIComponent(escape(atob(raw))));
  } catch (e) { return null; }
}
