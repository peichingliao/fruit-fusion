'use strict';

/**
 * Draw a fruit at canvas position (x, y), scaled to physics radius r.
 * No circular shell — each fruit is its own shape.
 */
function drawFruit(ctx, type, x, y, r, alpha) {
  if (r <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  if (alpha !== undefined) ctx.globalAlpha = alpha;
  ctx.shadowColor   = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur    = r * 0.28;
  ctx.shadowOffsetY = r * 0.1;

  switch (type) {
    case 1:  _blueberry(ctx, r);   break;
    case 2:  _grape(ctx, r);       break;
    case 3:  _cherry(ctx, r);      break;
    case 4:  _longan(ctx, r);      break;
    case 5:  _lychee(ctx, r);      break;
    case 6:  _strawberry(ctx, r);  break;
    case 7:  _mangosteen(ctx, r);  break;
    case 8:  _lemon(ctx, r);       break;
    case 9:  _orange(ctx, r);      break;
    case 10: _apple(ctx, r);       break;
    case 11: _banana(ctx, r);      break;
    case 12: _papaya(ctx, r);      break;
    case 13: _coconut(ctx, r);     break;
    case 14: _watermelon(ctx, r);  break;
    case 15: _durian(ctx, r);      break;
  }
  ctx.restore();
}

// ─── shared helpers ───────────────────────────────────────────────────────────
function _rg(ctx, r, hx, hy, c0, c1) {
  const g = ctx.createRadialGradient(hx, hy, 0, 0, 0, r);
  g.addColorStop(0, c0); g.addColorStop(1, c1);
  return g;
}
function _hl(ctx, r, hx, hy) {          // soft specular highlight
  ctx.beginPath();
  ctx.arc(hx, hy, r * 0.28, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.fill();
}
function _noShadow(ctx) { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }

// ─── 1. 藍莓 ─────────────────────────────────────────────────────────────────
function _blueberry(ctx, r) {
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = _rg(ctx, r, -r*.3, -r*.3, '#9575CD', '#311B92');
  ctx.fill();

  // 5-lobe calyx crown
  ctx.save(); _noShadow(ctx);
  ctx.translate(0, -r * 0.7);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(Math.cos(a)*r*.14, Math.sin(a)*r*.14, r*.12, 0, Math.PI*2);
    ctx.fillStyle = '#2E7D32'; ctx.fill();
  }
  ctx.restore();
  _hl(ctx, r, -r*.28, -r*.28);
}

// ─── 2. 葡萄 ─────────────────────────────────────────────────────────────────
function _grape(ctx, r) {
  const dots = [
    [0,     r*.38, r*.36],
    [-r*.33, r*.1,  r*.32],
    [ r*.33, r*.1,  r*.32],
    [-r*.33,-r*.24, r*.28],
    [ r*.33,-r*.24, r*.28],
    [0,    -r*.52,  r*.25],
  ];
  dots.forEach(([dx, dy, dr]) => {
    ctx.beginPath(); ctx.arc(dx, dy, dr, 0, Math.PI*2);
    ctx.fillStyle = '#7B1FA2'; ctx.fill();
    ctx.beginPath(); ctx.arc(dx - dr*.3, dy - dr*.3, dr*.35, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(220,170,255,.4)'; ctx.fill();
  });
  ctx.save(); _noShadow(ctx);
  ctx.strokeStyle = '#5D4037'; ctx.lineWidth = r*.07; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -r*.76); ctx.quadraticCurveTo(r*.18, -r*1.0, r*.28, -r*.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(r*.35, -r*.85, r*.2, r*.1, 0.5, 0, Math.PI*2);
  ctx.fillStyle = '#388E3C'; ctx.fill();
  ctx.restore();
}

// ─── 3. 櫻桃 ─────────────────────────────────────────────────────────────────
function _cherry(ctx, r) {
  const off = r * .28;
  [[-off, r*.1, '#C62828'], [off, r*.1, '#B71C1C']].forEach(([cx, cy, col]) => {
    ctx.beginPath(); ctx.arc(cx, cy, r*.52, 0, Math.PI*2);
    ctx.fillStyle = col; ctx.fill();
    ctx.beginPath(); ctx.arc(cx - r*.17, cy - r*.15, r*.16, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,200,200,.5)'; ctx.fill();
  });
  ctx.save(); _noShadow(ctx);
  ctx.strokeStyle = '#388E3C'; ctx.lineWidth = r*.07; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-off, -r*.38); ctx.quadraticCurveTo(-off*.4,-r*.82, 0,-r*.75); ctx.stroke();
  ctx.beginPath(); ctx.moveTo( off, -r*.38); ctx.quadraticCurveTo( off*.4,-r*.82, 0,-r*.75); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,-r*.75); ctx.lineTo(r*.06,-r*.98); ctx.stroke();
  ctx.restore();
}

// ─── 4. 龍眼 ─────────────────────────────────────────────────────────────────
function _longan(ctx, r) {
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2);
  ctx.fillStyle = _rg(ctx, r, -r*.25, -r*.25, '#D4A96A', '#795548');
  ctx.fill();
  // dark "eye"
  ctx.beginPath(); ctx.arc(0, r*.08, r*.32, 0, Math.PI*2);
  ctx.fillStyle = '#3E2723'; ctx.fill();
  ctx.beginPath(); ctx.arc(r*.06, r*.02, r*.13, 0, Math.PI*2);
  ctx.fillStyle = '#0D0300'; ctx.fill();
  ctx.beginPath(); ctx.arc(r*.1, -r*.02, r*.06, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fill();
  _hl(ctx, r, -r*.3, -r*.3);
}

// ─── 5. 荔枝 ─────────────────────────────────────────────────────────────────
function _lychee(ctx, r) {
  const bumps = 12, inner = r*.8, outer = r;
  ctx.beginPath();
  for (let i = 0; i < bumps*2; i++) {
    const a = (i/(bumps*2))*Math.PI*2 - Math.PI/2;
    const rad = (i%2===0) ? outer : inner;
    ctx[i===0?'moveTo':'lineTo'](Math.cos(a)*rad, Math.sin(a)*rad);
  }
  ctx.closePath();
  ctx.fillStyle = _rg(ctx, r, -r*.2,-r*.2, '#EF5350', '#B71C1C');
  ctx.fill();
  ctx.save(); _noShadow(ctx);
  ctx.strokeStyle = '#2E7D32'; ctx.lineWidth = r*.1; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0,-r*.88); ctx.lineTo(r*.04,-r*1.05); ctx.stroke();
  ctx.restore();
  _hl(ctx, r*.75, -r*.25, -r*.3);
}

// ─── 6. 草莓 ─────────────────────────────────────────────────────────────────
function _strawberry(ctx, r) {
  ctx.beginPath();
  ctx.moveTo(0, r*.92);
  ctx.bezierCurveTo(-r*.95, r*.35, -r*1.0, -r*.45, -r*.45, -r*.62);
  ctx.quadraticCurveTo(-r*.1, -r*.82, 0, -r*.58);
  ctx.quadraticCurveTo( r*.1, -r*.82,  r*.45, -r*.62);
  ctx.bezierCurveTo( r*1.0, -r*.45,  r*.95, r*.35, 0, r*.92);
  ctx.closePath();
  ctx.fillStyle = _rg(ctx, r, -r*.1,-r*.1, '#EF5350', '#B71C1C');
  ctx.fill();

  ctx.save(); _noShadow(ctx);
  // seeds
  [[-r*.35,r*.05],[r*.35,r*.05],[0,r*.32],[-r*.22,-r*.2],[r*.22,-r*.2],
   [-r*.42,r*.32],[r*.42,r*.32],[0,r*.6],[-r*.1,r*.6],[r*.1,r*.6]].forEach(([sx,sy]) => {
    ctx.beginPath(); ctx.ellipse(sx,sy,r*.05,r*.07,0,0,Math.PI*2);
    ctx.fillStyle = '#FFF176'; ctx.fill();
  });
  // crown leaves
  ctx.translate(0, -r*.56);
  for (let i = 0; i < 5; i++) {
    const a = (i/5)*Math.PI*2 - Math.PI/2;
    ctx.save(); ctx.rotate(a);
    ctx.beginPath(); ctx.ellipse(0,-r*.26,r*.09,r*.26,0,0,Math.PI*2);
    ctx.fillStyle = '#388E3C'; ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

// ─── 7. 山竹 ─────────────────────────────────────────────────────────────────
function _mangosteen(ctx, r) {
  ctx.beginPath(); ctx.arc(0, r*.05, r*.9, 0, Math.PI*2);
  ctx.fillStyle = _rg(ctx, r, -r*.2,-r*.28, '#9C27B0', '#1A0033');
  ctx.fill();
  ctx.save(); _noShadow(ctx);
  // green petal crown
  ctx.translate(0, -r*.76);
  for (let i = 0; i < 5; i++) {
    const a = (i/5)*Math.PI*2 - Math.PI/2;
    ctx.save(); ctx.rotate(a);
    ctx.beginPath(); ctx.ellipse(0,-r*.2,r*.09,r*.22,0,0,Math.PI*2);
    ctx.fillStyle = '#2E7D32'; ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  // yellow nub bottom
  ctx.beginPath(); ctx.arc(0, r*.88, r*.13, 0, Math.PI*2);
  ctx.fillStyle = '#F9A825'; ctx.fill();
  _hl(ctx, r*.88, -r*.25, -r*.3);
}

// ─── 8. 檸檬 ─────────────────────────────────────────────────────────────────
function _lemon(ctx, r) {
  ctx.beginPath(); ctx.ellipse(0, 0, r*.76, r, 0, 0, Math.PI*2);
  const g = ctx.createRadialGradient(-r*.25,-r*.3,0, 0,0,r);
  g.addColorStop(0,'#FFF176'); g.addColorStop(.6,'#FFEE58'); g.addColorStop(1,'#F9A825');
  ctx.fillStyle = g; ctx.fill();
  // pointed nubs
  ctx.save(); _noShadow(ctx);
  [[0,-r*.9],[0,r*.9]].forEach(([nx,ny]) => {
    ctx.beginPath(); ctx.ellipse(nx,ny,r*.12,r*.16,0,0,Math.PI*2);
    ctx.fillStyle = '#F57F17'; ctx.fill();
  });
  ctx.restore();
  ctx.beginPath(); ctx.ellipse(-r*.2,-r*.28,r*.2,r*.32,-0.3,0,Math.PI*2);
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fill();
}

// ─── 9. 橘子 ─────────────────────────────────────────────────────────────────
function _orange(ctx, r) {
  ctx.beginPath(); ctx.ellipse(0, 0, r, r*.94, 0, 0, Math.PI*2);
  const g = ctx.createRadialGradient(-r*.2,-r*.25,0,0,0,r);
  g.addColorStop(0,'#FF8F00'); g.addColorStop(.7,'#E65100'); g.addColorStop(1,'#BF360C');
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); _noShadow(ctx);
  ctx.strokeStyle = 'rgba(180,70,0,.3)'; ctx.lineWidth = r*.04;
  for (let i = 0; i < 6; i++) {
    const a = (i/6)*Math.PI*2;
    ctx.beginPath(); ctx.moveTo(0,0);
    ctx.lineTo(Math.cos(a)*r*.9, Math.sin(a)*r*.88); ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(0,-r*.84,r*.1,0,Math.PI*2);
  ctx.fillStyle = '#388E3C'; ctx.fill();
  ctx.restore();
  _hl(ctx, r, -r*.28,-r*.28);
}

// ─── 10. 蘋果 ────────────────────────────────────────────────────────────────
function _apple(ctx, r) {
  ctx.beginPath();
  ctx.moveTo(0, r*.88);
  ctx.bezierCurveTo(-r, r*.5, -r*.9, -r*.42, -r*.38, -r*.65);
  ctx.bezierCurveTo(-r*.1, -r*.88, r*.1, -r*.88, r*.38, -r*.65);
  ctx.bezierCurveTo(r*.9, -r*.42, r, r*.5, 0, r*.88);
  ctx.closePath();
  const g = ctx.createRadialGradient(-r*.2,-r*.1,0,0,r*.05,r);
  g.addColorStop(0,'#EF5350'); g.addColorStop(.6,'#C62828'); g.addColorStop(1,'#8B0000');
  ctx.fillStyle = g; ctx.fill();

  ctx.save(); _noShadow(ctx);
  ctx.strokeStyle = '#5D4037'; ctx.lineWidth = r*.1; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0,-r*.68); ctx.quadraticCurveTo(r*.12,-r*1.0,r*.08,-r*.95); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(r*.2,-r*.88,r*.2,r*.1,-0.6,0,Math.PI*2);
  ctx.fillStyle = '#43A047'; ctx.fill();
  ctx.restore();
  _hl(ctx, r, -r*.3,-r*.22);
}

// ─── 11. 香蕉 ────────────────────────────────────────────────────────────────
function _banana(ctx, r) {
  ctx.beginPath();
  ctx.moveTo(-r*.86, r*.22);
  ctx.bezierCurveTo(-r*.5,-r*.88, r*.5,-r*.88, r*.86, r*.22);
  ctx.bezierCurveTo(r*.48,-r*.3, -r*.48,-r*.3, -r*.86, r*.22);
  ctx.closePath();
  const g = ctx.createLinearGradient(0,-r*.88,0,r*.22);
  g.addColorStop(0,'#FFF9C4'); g.addColorStop(.35,'#FFD600'); g.addColorStop(1,'#F57F17');
  ctx.fillStyle = g; ctx.fill();

  ctx.save(); _noShadow(ctx);
  [[-r*.86,r*.22],[r*.86,r*.22]].forEach(([tx,ty]) => {
    ctx.beginPath(); ctx.ellipse(tx,ty,r*.11,r*.09,0,0,Math.PI*2);
    ctx.fillStyle = '#4E342E'; ctx.fill();
  });
  ctx.strokeStyle = 'rgba(255,255,255,.38)';
  ctx.lineWidth = r*.1; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-r*.55,-r*.45); ctx.bezierCurveTo(-r*.28,-r*.72, r*.28,-r*.72, r*.55,-r*.45);
  ctx.stroke();
  ctx.restore();
}

// ─── 12. 木瓜 ────────────────────────────────────────────────────────────────
function _papaya(ctx, r) {
  ctx.beginPath(); ctx.ellipse(0, r*.08, r*.76, r, 0, 0, Math.PI*2);
  const g = ctx.createRadialGradient(-r*.15,-r*.2,0,0,0,r);
  g.addColorStop(0,'#FFCC80'); g.addColorStop(.5,'#FF7043'); g.addColorStop(1,'#BF360C');
  ctx.fillStyle = g; ctx.fill();
  // green unripe top
  ctx.save(); _noShadow(ctx);
  ctx.beginPath(); ctx.ellipse(0,-r*.72,r*.52,r*.32,0,0,Math.PI*2);
  ctx.fillStyle = 'rgba(100,180,60,.55)'; ctx.fill();
  ctx.strokeStyle = '#5D4037'; ctx.lineWidth = r*.08; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0,-r*.97); ctx.lineTo(r*.04,-r*1.12); ctx.stroke();
  ctx.restore();
  _hl(ctx, r*.72, -r*.2,-r*.25);
}

// ─── 13. 椰子 ────────────────────────────────────────────────────────────────
function _coconut(ctx, r) {
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2);
  ctx.fillStyle = _rg(ctx, r, -r*.25,-r*.25, '#8D6E63', '#3E2723');
  ctx.fill();
  ctx.save(); _noShadow(ctx);
  ctx.strokeStyle = 'rgba(50,25,10,.4)'; ctx.lineWidth = r*.04;
  for (let i = 0; i < 14; i++) {
    const a = (i/14)*Math.PI*2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a)*r*.58, Math.sin(a)*r*.58);
    ctx.lineTo(Math.cos(a)*r*.95, Math.sin(a)*r*.95);
    ctx.stroke();
  }
  // three eyes
  [[-r*.22,-r*.22],[r*.22,-r*.22],[0,r*.1]].forEach(([ex,ey]) => {
    ctx.beginPath(); ctx.ellipse(ex,ey,r*.1,r*.12,0,0,Math.PI*2);
    ctx.fillStyle = '#1A0A06'; ctx.fill();
  });
  ctx.restore();
  _hl(ctx, r, -r*.28,-r*.28);
}

// ─── 14. 西瓜 ────────────────────────────────────────────────────────────────
function _watermelon(ctx, r) {
  ctx.save();
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2);
  ctx.fillStyle = '#2E7D32'; ctx.fill();
  ctx.clip();
  _noShadow(ctx);
  ctx.strokeStyle = '#66BB6A'; ctx.lineWidth = r*.19;
  for (let i = 0; i < 8; i++) {
    const a = (i/8)*Math.PI*2;
    ctx.beginPath(); ctx.moveTo(0,0);
    ctx.lineTo(Math.cos(a)*r*1.2, Math.sin(a)*r*1.2); ctx.stroke();
  }
  ctx.restore();
  // overlay gradient
  ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2);
  const g = ctx.createRadialGradient(-r*.3,-r*.3,0,0,0,r);
  g.addColorStop(0,'rgba(120,220,120,.2)'); g.addColorStop(1,'rgba(0,50,0,.3)');
  ctx.fillStyle = g; ctx.fill();
  // yellow ground spot
  ctx.beginPath(); ctx.ellipse(r*.52,r*.52,r*.26,r*.18,.8,0,Math.PI*2);
  ctx.fillStyle = 'rgba(255,230,100,.32)'; ctx.fill();
  _hl(ctx, r, -r*.3,-r*.3);
}

// ─── 15. 榴槤 ────────────────────────────────────────────────────────────────
function _durian(ctx, r) {
  const spikes = 22, inner = r*.72, outer = r;
  ctx.beginPath();
  for (let i = 0; i < spikes*2; i++) {
    const a = (i/(spikes*2))*Math.PI*2 - Math.PI/2;
    const rad = (i%2===0) ? outer : inner;
    ctx[i===0?'moveTo':'lineTo'](Math.cos(a)*rad, Math.sin(a)*rad);
  }
  ctx.closePath();
  const g = ctx.createRadialGradient(-r*.15,-r*.2,0,0,0,r);
  g.addColorStop(0,'#E6EE9C'); g.addColorStop(.5,'#9E9D24'); g.addColorStop(1,'#827717');
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); _noShadow(ctx);
  ctx.strokeStyle = 'rgba(90,70,0,.3)'; ctx.lineWidth = r*.04;
  for (let i = 0; i < 5; i++) {
    const a = (i/5)*Math.PI;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a)*r*.6, Math.sin(a)*r*.6);
    ctx.quadraticCurveTo(0,0,-Math.cos(a)*r*.6,-Math.sin(a)*r*.6);
    ctx.stroke();
  }
  ctx.restore();
  _hl(ctx, r*.7, -r*.2,-r*.22);
}
