const canvas = document.getElementById("particle-field");
const ctx = canvas?.getContext("2d");
const articleParticleColors = ["#33a6b8", "#f596aa", "#ffd84d", "#51d88a", "#df63ff", "#ff6767"];
const TAU = Math.PI * 2;
let particles = [];
let pointer = { x: -9999, y: -9999 };
let ambientBackgroundMode = "innei";
let lastParticleFrame = 0;
let canvasDpr = 1;
let lastAjisaiRippleEvent = { time: 0, x: -9999, y: -9999 };

function isArticleSurface() {
  const page = window.location.pathname.split("/").pop() || "index.html";
  return Boolean(document.querySelector(".article-page")) || page === "article.html" || page === "note-ai.html";
}

function getParticleConfig() {
  if (ambientBackgroundMode === "article") {
    return {
      kind: "particles",
      colors: articleParticleColors,
      countBase: 17000,
      minCount: 70,
      size: [0.45, 1.5],
      alpha: [0.18, 0.52],
      speed: 0.12,
      repel: 88,
    };
  }
  return {
    kind: "pond",
    density: 1.65,
    speed: 1.35,
    intensity: 1.45,
    variant: "ripple",
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

const inneiAjisaiBackground = (() => {
  const l = 2 * Math.PI;
  const i = Math.tan((8 * Math.PI) / 180);
  const g = [];
  const v = [];
  const M = [];
  const b = { width: 0, height: 0, dpr: 1 };
  const W = { density: 1.65, speed: 1.35, intensity: 1.3, variant: "full" };
  let start = 0;
  let last = 0;

  const u = (e) => (Math.random() < 0.04 ? e * (0.84 + 0.12 * Math.random()) : null);
  const c = (e, t, r) => {
    e.y = -e.len;
    e.x = Math.random() * (t + r * i);
    e.groundY = u(r);
  };
  const h = (e, t, r) => {
    const a = Math.min(1, Math.max(0, (t / r - 0.84) / 0.12));
    return {
      x: e,
      y: t,
      age: 0,
      duration: 2.4 + 1.2 * Math.random() - 0.6 * a,
      maxRadius: 30 + 14 * Math.random() + 26 * a,
      second: Math.random() < 0.4,
      secondDelay: 0.4 + 0.2 * Math.random(),
    };
  };
  const H = (e, t) => {
    const { density: r } = W;
    g.length = 0;
    for (let a = 0, n = Math.max(0, Math.round(90 * r)); a < n; a += 1) {
      const r = u(t);
      g.push({
        x: Math.random() * (e + t * i),
        y: Math.random() * (r ?? t),
        len: 24 + 16 * Math.random(),
        vel: 150 + 130 * Math.random(),
        alphaScale: 0.55 + 0.45 * Math.random(),
        groundY: r,
      });
    }
  };
  const sprite = (e, t, r, a, n) => {
    const o = document.createElement("canvas");
    const l = Math.max(2, Math.ceil(2 * e * n));
    o.width = l;
    o.height = l;
    const i = o.getContext("2d");
    if (!i) return o;
    const s = l / 2;
    const u = i.createRadialGradient(s, s, 0, s, s, s);
    u.addColorStop(0, `hsla(${t}, ${r}%, ${a}%, 1)`);
    u.addColorStop(0.55, `hsla(${t}, ${r}%, ${a}%, 0.5)`);
    u.addColorStop(1, `hsla(${t}, ${r}%, ${a}%, 0)`);
    i.fillStyle = u;
    i.fillRect(0, 0, l, l);
    return o;
  };
  const $ = (e, t, r) => {
    const { density: a } = W;
    const n = Math.min(12, Math.max(0, Math.round((5 + 3 * Math.random()) * (0.6 + 0.4 * Math.max(0, a)))));
    v.length = 0;
    for (let a = 0; a < n; a += 1) {
      const o = 90 + 110 * Math.random();
      v.push({
        x: ((a + 0.15 + 0.7 * Math.random()) / Math.max(1, n)) * e,
        y: (0.7 + 0.35 * Math.random()) * t,
        radius: o,
        aspect: 0.6 + 0.25 * Math.random(),
        driftAmpX: 4 + 6 * Math.random(),
        driftAmpY: 2 + 3 * Math.random(),
        driftFreq: 0.3 + 0.3 * Math.random(),
        driftPhase: Math.random() * l,
        breathFreq: l / (8 + 6 * Math.random()),
        breathPhase: Math.random() * l,
        baseAlpha: 0.1 + 0.06 * Math.random(),
        sprite: sprite(o, 225 + 50 * Math.random(), 30 + 15 * Math.random(), 60 + 12 * Math.random(), r),
      });
    }
  };

  const api = {
    resize(e) {
      const t = Math.min(window.devicePixelRatio || 1, 2);
      const { innerWidth: r, innerHeight: a } = window;
      b.width = r;
      b.height = a;
      b.dpr = t;
      e.width = Math.floor(r * t);
      e.height = Math.floor(a * t);
      e.style.width = `${r}px`;
      e.style.height = `${a}px`;
      H(r, a);
      const n = W.variant;
      if (n === "bokeh" || n === "full") $(r, a, t);
    },
    draw(t, e) {
      if (!start) {
        start = e;
        last = e;
      }
      const n = (e - start) / 1000;
      const s = Math.min((e - last) / 1000, 0.05);
      last = e;
      const { width: u, height: f, dpr: d } = b;
      const { speed: m, intensity: p, variant: x } = W;
      const w = x === "ripple" || x === "full";
      t.setTransform(d, 0, 0, d, 0, 0);
      t.clearRect(0, 0, u, f);

      if (x === "bokeh" || x === "full") {
        for (const e of v) {
          const r = Math.sin(n * e.driftFreq * m + e.driftPhase) * e.driftAmpX;
          const a = Math.cos(n * e.driftFreq * 0.8 * m + e.driftPhase) * e.driftAmpY;
          const o = 0.6 + 0.4 * Math.sin(n * e.breathFreq * m + e.breathPhase);
          const l = e.baseAlpha * o * p;
          if (l <= 0.003) continue;
          t.globalAlpha = Math.min(1, Math.max(0, l));
          const i = 2 * e.radius;
          const s = i * e.aspect;
          t.drawImage(e.sprite, e.x + r - e.radius, e.y + a - s / 2, i, s);
        }
        t.globalAlpha = 1;
      }

      if (w) {
        for (const e of M) {
          e.age += s * m;
          const r = e.age / 0.24;
          if (r < 1) {
            const a = 0.6 * p * (1 - r);
            t.fillStyle = `hsla(225, 32%, 62%, ${a})`;
            t.beginPath();
            t.arc(e.x, e.y, 1.8 * (1 - 0.5 * r), 0, l);
            t.fill();
            const n = 8 * Math.sin(Math.PI * r);
            t.beginPath();
            t.arc(e.x + 3 * r, e.y - n, 1.1, 0, l);
            t.fill();
          }
          const a = 1 + ((e.maxRadius - 30) / 40) * 0.5;
          const n = e.second ? 2 : 1;
          for (let r = 0; r < n; r += 1) {
            const n = (e.age - (r === 1 ? e.secondDelay : 0)) / e.duration;
            if (n <= 0 || n >= 1) continue;
            const o = 1 - (1 - n) ** 2;
            const i = e.maxRadius * o;
            const s = 0.4 * p * Math.min(1, n / 0.04) * (1 - n) ** 1.2 * (r === 1 ? 0.5 : 1);
            if (s < 0.004) continue;
            t.strokeStyle = `hsla(225, 28%, 52%, ${s})`;
            t.lineWidth = a;
            t.beginPath();
            t.ellipse(e.x, e.y, i, 0.3 * i, 0, 0, l);
            t.stroke();
          }
        }
        for (let e = M.length - 1; e >= 0; e -= 1) {
          const t = M[e];
          if (t.age > t.duration + (t.second ? t.secondDelay : 0)) M.splice(e, 1);
        }
      } else if (M.length > 0) {
        M.length = 0;
      }

      if (x === "ripple") {
        t.globalAlpha = 1;
        return;
      }

      t.lineWidth = 1;
      for (const e of g) {
        e.y += e.vel * m * s;
        e.x -= e.vel * m * s * i;
        if (w && e.groundY !== null && e.y >= e.groundY) {
          if (M.length < 14) {
            M.push(h(e.x - e.len * i * 0.5, e.groundY, f));
            c(e, u, f);
            continue;
          }
          e.groundY = null;
        }
        if (e.y - e.len > f) c(e, u, f);
        const r = e.x - e.len * i * 0.5;
        const a = e.y;
        const n = r + e.len * i;
        const o = a - e.len;
        const l = Math.min(1, 0.28 * p * e.alphaScale);
        const d = t.createLinearGradient(r, a, n, o);
        d.addColorStop(0, "hsla(225, 28%, 52%, 0)");
        d.addColorStop(0.65, `hsla(225, 28%, 52%, ${l})`);
        d.addColorStop(1, `hsla(225, 28%, 52%, ${0.35 * l})`);
        t.strokeStyle = d;
        t.beginPath();
        t.moveTo(r, a);
        t.lineTo(n, o);
        t.stroke();
      }
    },
    ripple(e, t) {
      if (M.length < 14) M.push(h(e, t, b.height || window.innerHeight));
    },
  };
  return api;
})();

function getSakuraCount(config) {
  const area = window.innerWidth * window.innerHeight;
  const density = Math.max(0, config.density);
  const count = Math.floor((area / 18000) * density);
  return Math.max(Math.floor(60 * density), Math.min(Math.floor(400 * density), count));
}

function resetSakuraPetal(petal, fromTop = true, yOverride) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  petal.z = 0.35 + 1.25 * Math.random();
  petal.y = typeof yOverride === "number"
    ? yOverride
    : fromTop
      ? -height / 2 - 60 - 100 * Math.random()
      : (2 * Math.random() - 1) * (height / 2);
  petal.x = (2 * Math.random() - 1) * (width / 2 + 80);
  const depth = (petal.z - 0.35) / 1.25;
  petal.baseSize = 8 + (1 - depth) * 18 + 10 * Math.random();
  petal.opacity = 0.35 + (1 - depth) * 0.45 + 0.15 * Math.random();
  petal.vx = 0;
  petal.vy = 0;
  petal.seed = Math.random();
  petal.rotation = Math.random() * TAU;
  petal.angularVelocity = (2 * Math.random() - 1) * (0.8 + (1 - depth) * 0.8);
  petal.tilt = Math.random() * TAU;
  petal.tiltVelocity = (2 * Math.random() - 1) * 1.5;
  return petal;
}

function createSakuraPetal(fromTop = false, yOverride) {
  return resetSakuraPetal({}, fromTop, yOverride);
}

function syncAmbientBackgroundMode(options = {}) {
  const nextMode = isArticleSurface() ? "article" : "innei";
  const changed = nextMode !== ambientBackgroundMode;
  ambientBackgroundMode = nextMode;
  document.body.classList.toggle("innei-background", ambientBackgroundMode === "innei");
  document.body.classList.toggle("article-surface", ambientBackgroundMode === "article");
  canvas?.setAttribute("data-background-mode", ambientBackgroundMode);
  if ((changed || options.rebuild) && ctx) {
    resizeCanvas();
  }
}

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const config = getParticleConfig();
  canvasDpr = ratio;
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  if (config.kind === "pond") {
    inneiAjisaiBackground.resize(canvas);
    return;
  }
  if (config.kind === "sakura") {
    const count = getSakuraCount(config);
    const topStart = -window.innerHeight / 2 - 60;
    particles = Array.from({ length: count }, (_, index) => {
      const petal = createSakuraPetal(false, (2 * Math.random() - 1) * (window.innerHeight / 2));
      if (index < count * 0.32) resetSakuraPetal(petal, true, topStart - Math.random() * Math.max(400, window.innerHeight + 100));
      return petal;
    });
    return;
  }
  const count = Math.max(config.minCount, Math.floor((window.innerWidth * window.innerHeight) / config.countBase));
  if (config.kind === "particles") {
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * (config.size[1] - config.size[0]) + config.size[0],
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      vx: (Math.random() - 0.5) * config.speed,
      vy: (Math.random() - 0.5) * config.speed,
      alpha: Math.random() * (config.alpha[1] - config.alpha[0]) + config.alpha[0],
      twinkle: Math.random() * Math.PI * 2,
    }));
    return;
  }
  const spread = Math.max(window.innerWidth, window.innerHeight);
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * (window.innerWidth + 180) - 90,
    y: Math.random() * (window.innerHeight + 240) - 120,
    z: Math.random() * 0.9 + 0.35,
    size: Math.random() * (config.size[1] - config.size[0]) + config.size[0],
    color: config.colors[Math.floor(Math.random() * config.colors.length)],
    vx: (Math.random() * 0.22 + 0.03) * config.speed * (spread / 1000),
    vy: (Math.random() * 0.24 + 0.08) * config.speed,
    alpha: Math.random() * (config.alpha[1] - config.alpha[0]) + config.alpha[0],
    rotation: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.012,
    sway: Math.random() * Math.PI * 2,
  }));
}

function drawArticleParticles(config) {
  for (const p of particles) {
    const dx = p.x - pointer.x;
    const dy = p.y - pointer.y;
    const dist = Math.hypot(dx, dy);
    if (dist < config.repel) {
      p.x += dx * 0.004;
      p.y += dy * 0.004;
    }
    p.x += p.vx;
    p.y += p.vy;
    p.twinkle += 0.011;
    if (p.x < -8) p.x = window.innerWidth + 8;
    if (p.x > window.innerWidth + 8) p.x = -8;
    if (p.y < -8) p.y = window.innerHeight + 8;
    if (p.y > window.innerHeight + 8) p.y = -8;

    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function updateSakuraPetal(petal, dt, seconds, config) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const depth = 1 - (petal.z - 0.35) / 1.25;
  const volume = Math.max(0, config.volume);
  const weight = Math.max(0, config.weight);
  const invWeight = 1 / Math.max(0.2, weight);
  const sizeFloor = 8 * volume;
  const sizeRange = 28 * Math.max(0.001, volume);
  const windAngle = (Math.PI * config.windDirection) / 180;
  const windX = Math.cos(windAngle);
  const windY = Math.sin(windAngle);
  const windPulse = Math.max(0, 15 + 1.5 * Math.sin(0.3 * seconds) + 0.8 * Math.sin(0.8 * seconds) + 0.3 * Math.sin(1.5 * seconds)) * config.windSpeed;
  const sizeRatio = clamp((petal.baseSize * volume - sizeFloor) / sizeRange, 0, 1);
  const drag = 1 / (1 + (0.2 + 0.4 * sizeRatio) * 1.2);
  const fall = (25 + 50 * depth) * config.speed * config.intensity * drag * weight;
  const flutter = (15 + 20 * depth) * drag * (1 + (0.5 - sizeRatio) * 0.8) * invWeight;
  const seedSpeed = 0.6 + 0.4 * petal.seed;
  const sideFlutter = (
    1.2 * Math.sin(seconds * seedSpeed + 15 * petal.seed)
    + 0.8 * Math.cos(seconds * seedSpeed * 1.7 + 0.003 * petal.y)
    + 0.5 * Math.sin(seconds * seedSpeed * 0.5 + 8 * petal.seed)
  ) * flutter * config.intensity;
  const verticalFlutter = (
    Math.sin(seconds * seedSpeed * 0.8 + 12 * petal.seed)
    + Math.cos(seconds * seedSpeed * 0.6 + 0.002 * petal.x)
  ) * (0.15 * flutter);
  const windForce = windPulse * (0.5 + 0.7 * depth) * drag * invWeight;
  petal.vx = windForce * windX + sideFlutter;
  petal.vy = fall + windForce * windY + verticalFlutter;
  petal.vy = Math.max(petal.vy, 8 * config.speed * config.intensity * drag * weight);
  petal.x += petal.vx * dt;
  petal.y += petal.vy * dt;
  petal.rotation += petal.angularVelocity * dt;
  petal.tilt += petal.tiltVelocity * dt;
  petal.angularVelocity += (0.5 * Math.sin(2 * seconds + 20 * petal.seed) - 0.1 * petal.angularVelocity) * dt;
  petal.tiltVelocity += (0.8 * Math.cos(1.5 * seconds + 15 * petal.seed) - 0.1 * petal.tiltVelocity) * dt;
  if (petal.y > height / 2 + 80) resetSakuraPetal(petal, true);
  if (petal.x < -width / 2 - 80) petal.x = width / 2 + 80;
  if (petal.x > width / 2 + 80) petal.x = -width / 2 - 80;
}

function drawSakuraPetal(petal, config) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const cameraZ = config.cameraZ;
  const projectedZ = Math.max(0.2, petal.z - cameraZ);
  const scale = 1 / projectedZ;
  const x = petal.x * scale + width / 2;
  const y = petal.y * scale + height / 2;
  if (x < -80 || x > width + 80 || y < -80 || y > height + 80) return;

  const near = 0.35 - cameraZ;
  const far = 1.6 - cameraZ;
  const depth = clamp(1 - (projectedZ - near) / (far - near), 0, 1);
  const size = clamp(petal.baseSize * config.volume * scale, 4, 45);
  const alpha = clamp(petal.opacity * (0.85 + 0.15 * depth) * config.intensity * 0.62, 0, 0.66);
  const length = size * 1.12;
  const petalWidth = size * 0.52;
  const tiltScale = 0.68 + 0.28 * Math.cos(petal.tilt);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(petal.rotation + Math.sin(petal.tilt) * 0.18);
  ctx.scale(tiltScale, 1);
  ctx.globalAlpha = alpha;
  const fill = ctx.createLinearGradient(0, -length * 0.52, 0, length * 0.58);
  fill.addColorStop(0, "rgba(255, 245, 248, 0.98)");
  fill.addColorStop(0.45, "rgba(247, 203, 214, 0.95)");
  fill.addColorStop(1, "rgba(236, 177, 195, 0.82)");
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(0, -length * 0.48);
  ctx.bezierCurveTo(petalWidth * 0.48, -length * 0.44, petalWidth * 0.62, -length * 0.1, petalWidth * 0.42, length * 0.16);
  ctx.bezierCurveTo(petalWidth * 0.25, length * 0.42, petalWidth * 0.06, length * 0.56, 0, length * 0.58);
  ctx.bezierCurveTo(-petalWidth * 0.06, length * 0.56, -petalWidth * 0.25, length * 0.42, -petalWidth * 0.42, length * 0.16);
  ctx.bezierCurveTo(-petalWidth * 0.62, -length * 0.1, -petalWidth * 0.48, -length * 0.44, 0, -length * 0.48);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = alpha * 0.28;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.74)";
  ctx.lineWidth = Math.max(0.35, size * 0.035);
  ctx.beginPath();
  ctx.moveTo(0, -length * 0.34);
  ctx.quadraticCurveTo(petalWidth * 0.04, length * 0.08, 0, length * 0.46);
  ctx.stroke();
  ctx.restore();
}

function drawSakuraField(now, config) {
  const seconds = now / 1000;
  const dt = lastParticleFrame ? Math.min(0.05, Math.max(0, (now - lastParticleFrame) / 1000)) : 0;
  lastParticleFrame = now;
  const desiredCount = getSakuraCount(config);
  if (particles.length !== desiredCount) {
    while (particles.length < desiredCount) particles.push(createSakuraPetal(true));
    particles.length = desiredCount;
  }
  particles.forEach((petal) => {
    updateSakuraPetal(petal, dt, seconds, config);
    drawSakuraPetal(petal, config);
  });
}

function drawParticles(now = 0) {
  if (!ctx) return;
  const config = getParticleConfig();
  if (ambientBackgroundMode === "innei") {
    inneiAjisaiBackground.draw(ctx, now);
  } else {
    ctx.setTransform(canvasDpr, 0, 0, canvasDpr, 0, 0);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    lastParticleFrame = now;
    drawArticleParticles(config);
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(drawParticles);
}

function isRippleClickTarget(event) {
  if (ambientBackgroundMode !== "innei" || (event.button !== 0 && event.button !== 1)) return false;
  const target = event.target;
  if (!(target instanceof Element)) return true;
  return !target.closest([
    "a",
    "button",
    "input",
    "textarea",
    "select",
    "label",
    "summary",
    "[role='button']",
    ".site-chrome",
    ".nav-menu",
    ".visitor-popover",
    ".home-mega-panel",
    ".posts-mega-panel",
    ".timeline-mega-panel",
    ".article-shell",
    ".reading-rail",
    ".route-orb-loader",
  ].join(","));
}

function createBackgroundRipple(event) {
  if (!isRippleClickTarget(event)) return;
  const now = performance.now();
  const distance = Math.hypot(event.clientX - lastAjisaiRippleEvent.x, event.clientY - lastAjisaiRippleEvent.y);
  if (now - lastAjisaiRippleEvent.time < 140 && distance < 4) return;
  lastAjisaiRippleEvent = { time: now, x: event.clientX, y: event.clientY };
  inneiAjisaiBackground.ripple(event.clientX, event.clientY);
}

syncAmbientBackgroundMode({ rebuild: true });
drawParticles();
document.body.classList.add("route-ready");
window.addEventListener("resize", resizeCanvas);
document.addEventListener("pointerdown", createBackgroundRipple, { passive: true, capture: true });
document.addEventListener("mousedown", createBackgroundRipple, { passive: true, capture: true });
document.addEventListener("mouseup", createBackgroundRipple, { passive: true, capture: true });
document.addEventListener("click", createBackgroundRipple, { passive: true, capture: true });
window.addEventListener("mousemove", (event) => {
  pointer = { x: event.clientX, y: event.clientY };
});
window.addEventListener("mouseleave", () => {
  pointer = { x: -9999, y: -9999 };
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });

document.querySelectorAll(".reveal").forEach((node) => revealObserver.observe(node));

const navIconPaths = {
  home: '<path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-8.5Z"/>',
  posts: '<path d="M6 4h9l3 3v13H6V4Z"/><path d="M14 4v4h4"/><path d="M9 12h6M9 16h6"/>',
  notes: '<path d="M18.5 3.5c-2.1 2.3-3.7 4.7-4.8 7.2l-1.8 4.2-3.8 1.5 1.5-3.8 4.2-1.8c2.5-1.1 4.9-2.7 7.2-4.8"/><path d="M5 20c2.2-1.2 3.4-2.7 3.6-4.6"/>',
  timeline: '<circle cx="12" cy="12" r="7"/><path d="M12 8v4l3 2"/>',
  projects: '<path d="M4 7h16v12H4z"/><path d="M8 7V5h8v2M8 12h8"/>',
  says: '<path d="M5 6h14v9H8l-3 3V6Z"/><path d="M8 10h8M8 13h5"/>',
};

function getNavKind(item) {
  const href = item.getAttribute("href") || "";
  if (href.includes("index.html") || href === "/" || href === "#home") return "home";
  if (href.includes("posts.html")) return "posts";
  if (href.includes("notes.html")) return "notes";
  if (href.includes("timeline.html")) return "timeline";
  if (href.includes("projects.html")) return "projects";
  if (href.includes("says.html")) return "says";
  return "";
}

function createNavIconSvg(kind, className) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add(className);
  svg.innerHTML = navIconPaths[kind] || "";
  return svg;
}

function createNavIcon(kind) {
  return createNavIconSvg(kind, "nav-icon");
}

function createNavActiveIconRunner() {
  const runner = document.createElement("span");
  runner.className = "nav-active-icon-runner";
  runner.setAttribute("aria-hidden", "true");
  runner.append(createNavIconSvg("", "nav-active-icon"));
  return runner;
}

function createNavActiveIndicator() {
  const indicator = document.createElement("span");
  indicator.className = "nav-active-indicator";
  indicator.setAttribute("aria-hidden", "true");
  return indicator;
}

function ensureTimelineNavItem(nav) {
  const existing = nav.querySelector('a.nav-item[href="timeline.html"]');
  if (existing) return existing;
  const item = document.createElement("a");
  item.className = "nav-item";
  item.href = "timeline.html";
  item.setAttribute("data-nav", "");
  item.textContent = "时光";
  const notesLink = nav.querySelector('a.nav-item[href="notes.html"]');
  if (notesLink) {
    notesLink.insertAdjacentElement("afterend", item);
  } else {
    nav.insertBefore(item, nav.querySelector(".nav-more"));
  }
  return item;
}

function createHomeMegaPanel() {
  const panel = document.createElement("div");
  panel.className = "home-mega-panel";
  panel.id = "home-mega-panel";
  panel.setAttribute("aria-label", "首页速览");
  panel.setAttribute("aria-hidden", "true");
  panel.innerHTML = `
    <section class="home-mega-stats" aria-label="站况">
      <p>首页</p>
      <div><strong>30</strong><span>文稿</span></div>
      <div><strong>43</strong><span>手记</span></div>
      <div><strong>186</strong><span>日序</span></div>
    </section>
    <section class="home-mega-feed" aria-label="近作">
      <p>近作</p>
      <a href="article.html"><span>飞书机器人助手停止服务</span><time>07.01</time></a>
      <a href="article.html"><span>用“足迹”聚合</span><time>06.17</time></a>
      <a href="note-ai.html?note=%E6%97%A0%E6%B3%95%E6%A0%87%E5%AE%9A%E7%9A%84%E6%9C%AA%E6%9D%A5"><span>无法标定的未来</span><time>07.03</time></a>
    </section>
  `;
  return panel;
}

function preparePrimaryNavigation() {
  const nav = document.querySelector(".main-nav");
  if (!nav) return;

  ensureTimelineNavItem(nav);

  const homeTrigger = nav.querySelector('a.nav-item[href="index.html"]');
  if (homeTrigger) {
    homeTrigger.setAttribute("data-home-mega-trigger", "");
    homeTrigger.setAttribute("aria-haspopup", "true");
    homeTrigger.setAttribute("aria-expanded", "false");
    homeTrigger.setAttribute("aria-controls", "home-mega-panel");
    if (!document.getElementById("home-mega-panel")) {
      homeTrigger.insertAdjacentElement("afterend", createHomeMegaPanel());
    }
  }

  nav.querySelectorAll(".nav-item").forEach((item) => {
    const kind = getNavKind(item);
    attachPjaxLinkHandler(item);
    item.querySelectorAll(".nav-icon").forEach((icon) => icon.remove());
    if (!kind) return;
  });

  if (!nav.querySelector(".nav-active-icon-runner")) {
    nav.prepend(createNavActiveIconRunner());
  }

  if (!nav.querySelector(".nav-active-indicator")) {
    nav.prepend(createNavActiveIndicator());
  }

  if (!nav.querySelector(".nav-hover-indicator")) {
    const indicator = document.createElement("span");
    indicator.className = "nav-hover-indicator";
    indicator.setAttribute("aria-hidden", "true");
    nav.prepend(indicator);
  }
}

preparePrimaryNavigation();

let routeInitialAnimationsSuppressed = false;

function runStaggerReveal(nodes, options = {}) {
  const items = Array.from(nodes || []).filter((node) => node && !node.classList.contains("is-hidden"));
  if (!items.length || routeInitialAnimationsSuppressed || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const baseDelay = options.baseDelay ?? 40;
  const interval = options.interval ?? 52;
  const duration = options.duration ?? 620;

  items.forEach((item, index) => {
    if (item._staggerCleanup) {
      item._staggerCleanup();
    }
    item.classList.remove("is-staggered");
    item.classList.add("stagger-item");
    item.style.setProperty("--stagger-delay", `${baseDelay + index * interval}ms`);
    item.style.setProperty("--stagger-duration", `${duration}ms`);
    const cleanup = () => {
      item.classList.remove("stagger-item", "is-staggered");
      item.style.removeProperty("--stagger-delay");
      item.style.removeProperty("--stagger-duration");
      item.removeEventListener("animationend", cleanup);
      if (item._staggerTimer) {
        window.clearTimeout(item._staggerTimer);
        item._staggerTimer = 0;
      }
      item._staggerCleanup = null;
    };

    item._staggerCleanup = cleanup;
    item.addEventListener("animationend", cleanup, { once: true });
    item._staggerTimer = window.setTimeout(cleanup, baseDelay + index * interval + duration + 120);
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      items.forEach((item) => item.classList.add("is-staggered"));
    });
  });
}

const navLinks = Array.from(document.querySelectorAll("[data-nav]"));
const siteChrome = document.querySelector(".site-chrome");
const primaryNav = document.querySelector(".main-nav");
const navHoverIndicator = primaryNav?.querySelector(".nav-hover-indicator");
const navActiveIndicator = primaryNav?.querySelector(".nav-active-indicator");
const navActiveIconRunner = primaryNav?.querySelector(".nav-active-icon-runner");
let navActiveIconKind = "";
let navIconMorphTimer = 0;
let navActiveIndicatorTimer = 0;
const TIMELINE_PROGRESS_REPLAY_KEY = "timeline-progress-replay";
const TIMELINE_PROGRESS_REPLAY_DURATION = 1050;
const routeLoadingTargets = {
  home: "首页",
  posts: "文稿",
  notes: "手记",
  timeline: "时光",
  projects: "项目",
  says: "一言",
  default: "下一页",
};
const routeLoadingLines = [
  "稍候片刻，月出文字自明。",
  "风过空庭，字句正徐来。",
  "纸白微明，未成篇章。",
  "夜退星沉，此页初醒。",
  "墨痕未定，片语已生春。",
  "云开一隙，文章将至。",
  "万籁俱寂，万字将成。",
  "且听风定，再看句成。",
  "山明水净，字影初开。",
  "长风渡野，好句徐来。",
  "半窗疏影，行文渐起。",
  "茶烟未散，文心已至。",
];
let routeLoadingLineIndex = 0;
let routeLoadingResolveTimer = 0;
let routeHeightLockTimer = 0;
let chromeLastScrollY = window.scrollY;
let chromeScrollTicking = false;

const routePrimaryHrefs = {
  home: "index.html",
  posts: "posts.html",
  notes: "notes.html",
  timeline: "timeline.html",
  projects: "projects.html",
  says: "says.html",
};

function getPrimaryNavHref() {
  const page = window.location.pathname.split("/").pop() || "index.html";
  if (page === "index.html") return "index.html";
  if (["posts.html", "category.html", "article.html"].includes(page)) return "posts.html";
  if (["notes.html", "note-category.html", "note-ai.html"].includes(page)) return "notes.html";
  if (page === "timeline.html") return "timeline.html";
  if (page === "projects.html") return "projects.html";
  if (["says.html", "thoughts.html"].includes(page)) return "says.html";
  return "";
}

function previewPrimaryActiveNav(url) {
  const activeHref = routePrimaryHrefs[getRouteKindFromUrl(url)];
  if (!activeHref) return;
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === activeHref);
  });
  const active = primaryNav?.querySelector(".nav-item.is-active");
  if (active) {
    moveNavActiveIndicator(active);
    moveNavHoverIndicator(active);
    moveNavActiveIcon(active);
  }
}

function syncPrimaryActiveNav(options = {}) {
  const activeHref = getPrimaryNavHref();
  if (!activeHref) {
    navActiveIndicator?.classList.remove("is-visible", "is-instant", "is-moving");
    navActiveIconRunner?.classList.remove("is-visible", "is-instant", "is-morphing");
    return;
  }
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === activeHref);
  });
  const active = primaryNav?.querySelector(".nav-item.is-active");
  if (active) {
    moveNavActiveIndicator(active, { instant: options.instant ?? true });
    moveNavActiveIcon(active, { instant: options.instant ?? true });
  }
}

function moveNavHoverIndicator(item, options = {}) {
  if (!primaryNav || !navHoverIndicator || !item) return;
  const navRect = primaryNav.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  navHoverIndicator.style.setProperty("--nav-hover-x", `${itemRect.left - navRect.left}px`);
  navHoverIndicator.style.setProperty("--nav-hover-y", `${itemRect.top - navRect.top}px`);
  navHoverIndicator.style.setProperty("--nav-hover-w", `${itemRect.width}px`);
  navHoverIndicator.style.setProperty("--nav-hover-h", `${itemRect.height}px`);
  navHoverIndicator.classList.toggle("is-instant", Boolean(options.instant));
  navHoverIndicator.classList.add("is-visible");
}

function hideNavHoverIndicator() {
  navHoverIndicator?.classList.remove("is-visible", "is-instant");
}

function moveNavActiveIndicator(item, options = {}) {
  if (!primaryNav || !navActiveIndicator || !item) return;
  const navRect = primaryNav.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  const shouldInstant = Boolean(options.instant);
  const wasInstant = navActiveIndicator.classList.contains("is-instant");

  navActiveIndicator.classList.toggle("is-instant", shouldInstant);
  if (!shouldInstant && wasInstant) {
    void navActiveIndicator.offsetWidth;
  }

  navActiveIndicator.style.setProperty("--nav-active-x", `${itemRect.left - navRect.left}px`);
  navActiveIndicator.style.setProperty("--nav-active-y", `${itemRect.top - navRect.top}px`);
  navActiveIndicator.style.setProperty("--nav-active-w", `${itemRect.width}px`);
  navActiveIndicator.style.setProperty("--nav-active-h", `${itemRect.height}px`);
  navActiveIndicator.classList.add("is-visible");

  window.clearTimeout(navActiveIndicatorTimer);
  if (shouldInstant) {
    requestAnimationFrame(() => navActiveIndicator.classList.remove("is-instant"));
  }

  if (!shouldInstant && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    navActiveIndicator.classList.add("is-moving");
    navActiveIndicatorTimer = window.setTimeout(() => {
      navActiveIndicator.classList.remove("is-moving");
      navActiveIndicatorTimer = 0;
    }, 460);
  } else {
    navActiveIndicator.classList.remove("is-moving");
  }
}

function updateNavActiveIcon(kind, options = {}) {
  if (!navActiveIconRunner || !kind) return;
  const svg = navActiveIconRunner.querySelector(".nav-active-icon");
  if (!svg) return;
  if (navActiveIconKind === kind && svg.innerHTML) return;

  const applyIcon = () => {
    svg.innerHTML = navIconPaths[kind] || "";
    navActiveIconKind = kind;
  };

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (options.instant || prefersReducedMotion || !navActiveIconKind || !svg.innerHTML) {
    window.clearTimeout(navIconMorphTimer);
    navActiveIconRunner.classList.remove("is-morphing");
    applyIcon();
    return;
  }

  navActiveIconRunner.classList.add("is-morphing");
  window.clearTimeout(navIconMorphTimer);
  navIconMorphTimer = window.setTimeout(() => {
    applyIcon();
    requestAnimationFrame(() => {
      navActiveIconRunner.classList.remove("is-morphing");
    });
  }, 125);
}

function moveNavActiveIcon(item, options = {}) {
  if (!primaryNav || !navActiveIconRunner || !item) return;
  const kind = getNavKind(item);
  if (!kind) {
    navActiveIconRunner.classList.remove("is-visible", "is-instant", "is-morphing");
    return;
  }
  const navRect = primaryNav.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  const iconSize = 14;
  const iconX = itemRect.left - navRect.left + 7;
  const iconY = itemRect.top - navRect.top + (itemRect.height - iconSize) / 2;

  navActiveIconRunner.style.setProperty("--nav-active-icon-x", `${iconX}px`);
  navActiveIconRunner.style.setProperty("--nav-active-icon-y", `${iconY}px`);
  navActiveIconRunner.classList.toggle("is-instant", Boolean(options.instant));
  navActiveIconRunner.classList.add("is-visible");
  updateNavActiveIcon(kind, options);
}

syncPrimaryActiveNav({ instant: true });

navLinks.forEach((link) => {
  link.addEventListener("pointerenter", () => moveNavHoverIndicator(link));
  link.addEventListener("focus", () => moveNavHoverIndicator(link));
  link.addEventListener("click", (event) => {
    if (link.getAttribute("href") !== "timeline.html") return;
    try {
      sessionStorage.setItem(TIMELINE_PROGRESS_REPLAY_KEY, "1");
    } catch {}
    if (getPrimaryNavHref() === "timeline.html") {
      event.preventDefault();
      window.dispatchEvent(new CustomEvent("timeline:replay-progress"));
    }
  });
});

primaryNav?.addEventListener("pointerleave", hideNavHoverIndicator);
primaryNav?.addEventListener("focusout", (event) => {
  if (!primaryNav.contains(event.relatedTarget)) hideNavHoverIndicator();
});

window.addEventListener("resize", () => {
  const active = primaryNav?.querySelector(".nav-item.is-active");
  if (active && navHoverIndicator?.classList.contains("is-visible")) {
    moveNavHoverIndicator(active, { instant: true });
  }
  if (active) {
    moveNavActiveIndicator(active, { instant: true });
    moveNavActiveIcon(active, { instant: true });
  }
});

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const activeHref = `#${entry.target.id}`;
    if (!Array.from(navLinks).some((link) => link.getAttribute("href") === activeHref)) return;
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === activeHref);
    });
  });
}, { rootMargin: "-42% 0px -48% 0px", threshold: 0.01 });

document.querySelectorAll("main section[id], main[id]").forEach((section) => navObserver.observe(section));

const moreButton = document.querySelector(".nav-more");
const navMenu = document.getElementById("nav-menu");

moreButton.addEventListener("click", (event) => {
  event.stopPropagation();
  closeHomeMega();
  closePostsMega();
  closeNotesMega();
  const open = navMenu.classList.toggle("is-open");
  moreButton.setAttribute("aria-expanded", String(open));
  navMenu.setAttribute("aria-hidden", String(!open));
});

const visitorButton = document.querySelector(".visitor-button");
const visitorPopover = document.getElementById("visitor-popover");

visitorButton.addEventListener("click", (event) => {
  event.stopPropagation();
  closeHomeMega();
  closePostsMega();
  closeNotesMega();
  closeTimelineMega();
  visitorPopover.classList.toggle("is-open");
  visitorPopover.setAttribute("aria-hidden", String(!visitorPopover.classList.contains("is-open")));
});

const homeMegaTrigger = document.querySelector("[data-home-mega-trigger]");
const homeMegaPanel = document.getElementById("home-mega-panel");
let homeMegaCloseTimer = 0;

function openHomeMega() {
  if (!homeMegaTrigger || !homeMegaPanel) return;
  window.clearTimeout(homeMegaCloseTimer);
  closePostsMega();
  closeNotesMega();
  closeTimelineMega();
  homeMegaPanel.classList.add("is-open");
  homeMegaPanel.setAttribute("aria-hidden", "false");
  homeMegaTrigger.setAttribute("aria-expanded", "true");
  runStaggerReveal(homeMegaPanel.querySelectorAll("a, .home-mega-stats div"), {
    baseDelay: 28,
    interval: 34,
    duration: 460,
  });
}

function closeHomeMega() {
  if (!homeMegaTrigger || !homeMegaPanel) return;
  window.clearTimeout(homeMegaCloseTimer);
  homeMegaPanel.classList.remove("is-open");
  homeMegaPanel.setAttribute("aria-hidden", "true");
  homeMegaTrigger.setAttribute("aria-expanded", "false");
}

function scheduleHomeMegaClose() {
  window.clearTimeout(homeMegaCloseTimer);
  homeMegaCloseTimer = window.setTimeout(closeHomeMega, 140);
}

if (homeMegaTrigger && homeMegaPanel) {
  homeMegaTrigger.addEventListener("mouseenter", openHomeMega);
  homeMegaTrigger.addEventListener("focus", openHomeMega);
  homeMegaTrigger.addEventListener("mouseleave", scheduleHomeMegaClose);
  homeMegaPanel.addEventListener("mouseenter", openHomeMega);
  homeMegaPanel.addEventListener("mouseleave", scheduleHomeMegaClose);
  homeMegaPanel.addEventListener("focusin", openHomeMega);
}

function setMegaTriggerAttributes(trigger, panelId, triggerAttribute) {
  trigger.setAttribute(triggerAttribute, "");
  trigger.setAttribute("aria-haspopup", "true");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", panelId);
}

function createPostsMegaPanel() {
  const categories = ["问学录", "观微集", "践行札", "营造志", "闲居记"];
  const panel = document.createElement("div");
  panel.className = "posts-mega-panel";
  panel.id = "posts-mega-panel";
  panel.setAttribute("aria-label", "文稿分类速览");
  panel.setAttribute("aria-hidden", "true");
  panel.innerHTML = `
    <section class="posts-mega-cats" aria-label="分类">
      <p>分类</p>
      ${categories.map((category) => `
        <a href="category.html?cat=${encodeURIComponent(category)}" data-mega-category="${category}">
          <span>${category}</span><b>0</b>
        </a>
      `).join("")}
    </section>
    <section class="posts-mega-feed" aria-label="最近文稿">
      <p><span id="posts-mega-category">最近文稿</span></p>
      <div class="posts-mega-list" id="posts-mega-list"></div>
    </section>
    <footer class="posts-mega-footer">
      <a href="posts.html">查看全部文稿</a>
      <a href="posts.html">全部文稿</a>
    </footer>
  `;
  return panel;
}

function createNotesMegaPanel() {
  const categories = ["一日笺", "七日札", "月痕录", "岁时书", "山河记"];
  const panel = document.createElement("div");
  panel.className = "posts-mega-panel notes-mega-panel";
  panel.id = "notes-mega-panel";
  panel.setAttribute("aria-label", "手记分类速览");
  panel.setAttribute("aria-hidden", "true");
  panel.innerHTML = `
    <section class="posts-mega-cats notes-mega-cats" aria-label="手记分类">
      <p>分类</p>
      ${categories.map((category) => `
        <a href="note-category.html?cat=${encodeURIComponent(category)}" data-note-mega-category="${category}">
          <span>${category}</span><b>0</b>
        </a>
      `).join("")}
    </section>
    <section class="posts-mega-feed notes-mega-feed" aria-label="最近手记">
      <p><span id="notes-mega-category">最近手记</span></p>
      <div class="posts-mega-list" id="notes-mega-list"></div>
    </section>
    <footer class="posts-mega-footer">
      <a href="notes.html">查看全部手记</a>
      <a href="notes.html">全部手记</a>
    </footer>
  `;
  return panel;
}

function createTimelineMegaPanel() {
  const panel = document.createElement("div");
  panel.className = "timeline-mega-panel";
  panel.id = "timeline-mega-panel";
  panel.setAttribute("aria-label", "时光速览");
  panel.setAttribute("aria-hidden", "true");
  panel.innerHTML = `
    <section class="timeline-mega-stats" aria-label="时间概览">
      <p>时光</p>
      <div><strong data-timeline-mega-count>43</strong><span>条记录</span></div>
      <div><strong data-timeline-mega-year>51%</strong><span>年度进度</span></div>
      <div><strong data-timeline-mega-day>40%</strong><span>今日进度</span></div>
    </section>
    <section class="timeline-mega-feed" aria-label="最近时光">
      <p>最近</p>
      <div data-timeline-mega-list></div>
    </section>
  `;
  return panel;
}

function ensureNavMegaPanels() {
  const nav = document.querySelector(".main-nav");
  if (!nav) return;

  const postsTrigger = nav.querySelector('a.nav-item[href="posts.html"]');
  const notesTrigger = nav.querySelector('a.nav-item[href="notes.html"]');
  const timelineTrigger = nav.querySelector('a.nav-item[href="timeline.html"]');

  if (postsTrigger) {
    setMegaTriggerAttributes(postsTrigger, "posts-mega-panel", "data-posts-mega-trigger");
    if (!document.getElementById("posts-mega-panel")) {
      postsTrigger.insertAdjacentElement("afterend", createPostsMegaPanel());
    }
  }

  if (notesTrigger) {
    setMegaTriggerAttributes(notesTrigger, "notes-mega-panel", "data-notes-mega-trigger");
    if (!document.getElementById("notes-mega-panel")) {
      notesTrigger.insertAdjacentElement("afterend", createNotesMegaPanel());
    }
  }

  if (timelineTrigger) {
    setMegaTriggerAttributes(timelineTrigger, "timeline-mega-panel", "data-timeline-mega-trigger");
    if (!document.getElementById("timeline-mega-panel")) {
      timelineTrigger.insertAdjacentElement("afterend", createTimelineMegaPanel());
    }
  }
}

ensureNavMegaPanels();

const postsMegaTrigger = document.querySelector("[data-posts-mega-trigger]");
const postsMegaPanel = document.getElementById("posts-mega-panel");
const postsMegaCategory = document.getElementById("posts-mega-category");
const postsMegaList = document.getElementById("posts-mega-list");
const postsMegaButtons = Array.from(document.querySelectorAll("[data-mega-category]"));
let postsMegaCloseTimer = 0;
let postsMegaSwitchTimer = 0;
let postsMegaActiveCategory = "";

const notesMegaTrigger = document.querySelector("[data-notes-mega-trigger]");
const notesMegaPanel = document.getElementById("notes-mega-panel");
const notesMegaCategory = document.getElementById("notes-mega-category");
const notesMegaList = document.getElementById("notes-mega-list");
const notesMegaControls = Array.from(document.querySelectorAll("[data-note-mega-category]"));
let notesMegaCloseTimer = 0;
let notesMegaSwitchTimer = 0;
let notesMegaActiveCategory = "";
const timelineMegaTrigger = document.querySelector("[data-timeline-mega-trigger]");
const timelineMegaPanel = document.getElementById("timeline-mega-panel");
const timelineMegaCount = timelineMegaPanel?.querySelector("[data-timeline-mega-count]");
const timelineMegaYear = timelineMegaPanel?.querySelector("[data-timeline-mega-year]");
const timelineMegaDay = timelineMegaPanel?.querySelector("[data-timeline-mega-day]");
const timelineMegaList = timelineMegaPanel?.querySelector("[data-timeline-mega-list]");
let timelineMegaCloseTimer = 0;
const noteCategoryOrder = [
  "一日笺",
  "七日札",
  "月痕录",
  "岁时书",
  "山河记"
];
const noteCategoryMeta = {
  "一日笺": {
    title: "一日笺",
    description: "记录一天里的细节、杂念和小小的判断。",
    mark: "日",
  },
  "七日札": {
    title: "七日札",
    description: "记录一周的节奏、推进和恢复办法。",
    mark: "周",
  },
  "月痕录": {
    title: "月痕录",
    description: "记录每个月留下的速度、疲惫和转向。",
    mark: "月",
  },
  "岁时书": {
    title: "岁时书",
    description: "记录一年结束时仍然值得留下的线索。",
    mark: "岁",
  },
  "山河记": {
    title: "山河记",
    description: "记录去到的地方，见到的人。",
    mark: "游",
  },
};
const noteCategoryAliases = new Map([
  ["日记", "一日笺"],
  ["周记", "七日札"],
  ["月记", "月痕录"],
  ["年记", "岁时书"],
  ["游记", "山河记"],
  ["daily", "一日笺"],
  ["weekly", "七日札"],
  ["monthly", "月痕录"],
  ["yearly", "岁时书"],
  ["travel", "山河记"],
]);

function normalizeNoteCategoryName(value) {
  if (!value) return "一日笺";
  let normalized = String(value).trim();
  try {
    normalized = decodeURIComponent(normalized);
  } catch {}
  if (noteCategoryMeta[normalized]) return normalized;
  const lower = normalized.toLowerCase();
  return noteCategoryAliases.get(normalized) || noteCategoryAliases.get(lower) || "一日笺";
}
const noteArchiveEntries = [];

/* Legacy fallback note data disabled after mojibake repair.
const legacyNoteCategoryMeta = {
  "涓€鏃ョ": {
    "title": "涓€鏃ョ",
    "description": "璁板綍涓€澶╅噷鐨勭粏鑺傘€佹潅蹇靛拰灏忓皬鐨勫垽鏂?,
    "mark": "鏃?
  },
  "涓冩棩鏈?: {
    "title": "涓冩棩鏈?,
    "description": "璁板綍涓€鍛ㄧ殑鑺傚銆佹帹杩涘拰鎭㈠鍔炴硶",
    "mark": "鍛?
  },
  "鏈堢棔褰?: {
    "title": "鏈堢棔褰?,
    "description": "璁板綍姣忎釜鏈堢暀涓嬬殑閫熷害銆佺柌鎯拰杞悜",
    "mark": "鏈?
  },
  "宀佹椂涔?: {
    "title": "宀佹椂涔?,
    "description": "璁板綍涓€骞寸粨鏉熸椂浠嶇劧鍊煎緱鐣欎笅鐨勭嚎绱?,
    "mark": "宀?
  },
  "灞辨渤璁?: {
    "title": "灞辨渤璁?,
    "description": "璁板綍鍘诲埌鐨勫湴鏂癸紝瑙佸埌鐨勪汉",
    "mark": "娓?
  }
};
const noteCategoryAliases = new Map([
  ["鏃ヨ", "涓€鏃ョ"],
  ["鍛ㄨ", "涓冩棩鏈?],
  ["鏈堣", "鏈堢棔褰?],
  ["骞磋", "宀佹椂涔?],
  ["娓歌", "灞辨渤璁?],
  ["daily", "涓€鏃ョ"],
  ["weekly", "涓冩棩鏈?],
  ["monthly", "鏈堢棔褰?],
  ["yearly", "宀佹椂涔?],
  ["travel", "灞辨渤璁?],
]);

function normalizeNoteCategoryName(value) {
  if (!value) return "涓€鏃ョ";
  let normalized = String(value).trim();
  try {
    normalized = decodeURIComponent(normalized);
  } catch {}
  if (noteCategoryMeta[normalized]) return normalized;
  const lower = normalized.toLowerCase();
  return noteCategoryAliases.get(normalized) || noteCategoryAliases.get(lower) || "涓€鏃ョ";
}
const noteArchiveEntries = [
  {
    "type": "涓€鏃ョ",
    "date": "2026-07-03",
    "title": "鏃犳硶鏍囧畾鐨勬湭鏉?,
    "summary": "涔呮病鍐欐墜璁颁簡锛屾渶杩戝仛鐨勪簨鎯呰秺鏉ヨ秺鏉傦紝寰堝鎯虫硶杩樻病鏉ュ緱鍙婂綊绫汇€?,
    "href": "note-ai.html"
  },
  {
    "type": "鏈堢棔褰?,
    "date": "2026-06-30",
    "title": "鍏湀鐨勯€熷害鍜岀柌鎯?,
    "summary": "鎶婅繖涓湀鐨勬帹杩涢€熷害閲嶆柊鐪嬩簡涓€閬嶏紝纭鍝簺浜嬫儏鍊煎緱缁х画锛屽摢浜涘彧鏄儻鎬с€?,
    "href": "note-ai.html"
  },
  {
    "type": "涓冩棩鏈?,
    "date": "2026-06-30",
    "title": "鍏湀鏈€鍚庝竴鍛?,
    "summary": "宸ヤ綔鑺傚閲嶆柊鎺掑竷锛屽嚑涓暱鏈熶换鍔＄粓浜庢湁浜嗘竻鏅扮殑杈圭晫銆?,
    "href": "note-ai.html"
  },
  {
    "type": "涓冩棩鏈?,
    "date": "2026-06-22",
    "title": "鎶婁緥琛屼簨椤归檷鍣?,
    "summary": "鍑忓皯閲嶅鎻愰啋锛屾妸鐪熸闇€瑕佸垽鏂殑浜嬫儏鐣欑粰鑷繁銆?,
    "href": "note-ai.html"
  },
  {
    "type": "涓€鏃ョ",
    "date": "2026-06-19",
    "title": "闆ㄥ仠鍚庣殑鍗婂皬鏃?,
    "summary": "鏁ｆ鍥炴潵锛屾妸娼箍绌烘皵閲岀敓鍑虹殑蹇靛ご褰掓。銆?,
    "href": "note-ai.html"
  },
  {
    "type": "涓冩棩鏈?,
    "date": "2026-06-15",
    "title": "琚細璁垏纰庣殑涓€鍛?,
    "summary": "璁板綍鍑犱釜琚墦鏂悗鐨勬仮澶嶅姙娉曪紝閬垮厤涓嬩竴鍛ㄧ户缁け鐒︺€?,
    "href": "note-ai.html"
  },
  {
    "type": "灞辨渤璁?,
    "date": "2026-06-13",
    "title": "绗竴娆′笢浜細杩熷埌 26 骞寸殑鏃呰",
    "summary": "涓嶆槸鏀荤暐锛屾槸涓€娆℃妸鏈熷緟鏀惧洖鐜板疄閲岀殑鏁ｆ銆?,
    "href": "note-ai.html"
  },
  {
    "type": "涓€鏃ョ",
    "date": "2026-06-08",
    "title": "娌℃湁缁撹鐨勪竴澶?,
    "summary": "鍏佽鏈変簺浜嬫儏鏆傛椂娌℃湁绛旀锛屽彧鎶婄幇鍦轰繚瀛樹笅鏉ャ€?,
    "href": "note-ai.html"
  },
  {
    "type": "涓€鏃ョ",
    "date": "2026-05-27",
    "title": "妗岄潰娓呯┖浠ュ悗",
    "summary": "鏁寸悊鏂囦欢鏃堕『渚挎暣鐞嗕簡涓€涓嬫渶杩戠殑娉ㄦ剰鍔涖€?,
    "href": "note-ai.html"
  },
  {
    "type": "鏈堢棔褰?,
    "date": "2026-05-31",
    "title": "浜旀湀鐨勫伐鍏锋劅",
    "summary": "宸ュ叿瓒婃潵瓒婇『鎵嬶紝鍙嶈€屾洿闇€瑕佺晫瀹氫粈涔堜笉璇ヨ嚜鍔ㄥ寲銆?,
    "href": "note-ai.html"
  },
  {
    "type": "灞辨渤璁?,
    "date": "2026-05-12",
    "title": "闆ㄩ噷鐨勮嫃宸炲贩鍙?,
    "summary": "璧板緱寰堟參锛屽弽鑰岃浣忎簡鏇村娌℃湁鍚嶅瓧鐨勮钀姐€?,
    "href": "note-ai.html"
  },
  {
    "type": "鏈堢棔褰?,
    "date": "2026-04-30",
    "title": "鍥涙湀鐨勭暀鐧?,
    "summary": "鍑忓皯椤圭洰鏁伴噺涔嬪悗锛屽垽鏂姏鎱㈡參鍥炲埌姝ｅ父浣嶇疆銆?,
    "href": "note-ai.html"
  },
  {
    "type": "鏈堢棔褰?,
    "date": "2026-03-31",
    "title": "涓夋湀鐨勯噸鍚?,
    "summary": "閲嶅啓浜嗗嚑涓叆鍙ｏ紝涔熼噸鍐欎簡涓€鐐硅嚜宸辩殑宸ヤ綔涔犳儻銆?,
    "href": "note-ai.html"
  },
  {
    "type": "宀佹椂涔?,
    "date": "2025-12-31",
    "title": "浜屻€囦簩浜旓紝鎱㈡參鎴愬舰",
    "summary": "杩欎竴骞存病鏈夌獊鐒跺彉濂斤紝浣嗚澶氫笢瑗跨粓浜庡紑濮嬬ǔ瀹氫笅鏉ャ€?,
    "href": "note-ai.html"
  },
  {
    "type": "灞辨渤璁?,
    "date": "2025-10-04",
    "title": "灞卞煄澶滆矾",
    "summary": "鍙伴樁銆侀浘姘斿拰鏅氶キ鍚庣殑姹熼锛岀粍鎴愪竴娈佃交寰け閲嶇殑璁板繂銆?,
    "href": "note-ai.html"
  },
  {
    "type": "灞辨渤璁?,
    "date": "2025-07-19",
    "title": "娴疯竟鐭殏鍋滅暀",
    "summary": "娴锋氮娌℃湁缁欑瓟妗堬紝浣嗚寰堝闂鏆傛椂瀹夐潤浜嗕笅鏉ャ€?,
    "href": "note-ai.html"
  },
  {
    "type": "宀佹椂涔?,
    "date": "2024-12-31",
    "title": "浜屻€囦簩鍥涳紝鍚戝唴鏀舵潫",
    "summary": "鎶婅繃澶氱殑澶栭儴鐩爣鎷嗘帀锛岄噸鏂扮湅瑙侀暱鏈熸柟鍚戙€?,
    "href": "note-ai.html"
  },
  {
    "type": "宀佹椂涔?,
    "date": "2023-12-31",
    "title": "浜屻€囦簩涓夛紝寮€濮嬭褰?,
    "summary": "浠庝笉绋冲畾鐨勬兂娉曢噷鎸戝嚭鍑犳潯鐪熸鎰挎剰缁х画鍋氱殑绾裤€?,
    "href": "note-ai.html"
  }
];

*/
const categoryArchiveData = {};

/* Legacy fallback post data disabled after mojibake repair.
const legacyCategoryArchiveData = {
  "鎶€鏈?: {
    "posts": [
      {
        "title": "澶фā鍨嬩笂涓嬫枃闀垮害鐢变粈涔堝喅瀹?,
        "date": "2026-05-27",
        "tags": [
          "LM"
        ]
      },
      {
        "title": "RL - MDP",
        "date": "2026-05-18",
        "tags": []
      },
      {
        "title": "TurboQuant锛氳妭鐪?x鍐呭瓨锛屾彁鍗?x閫熷害",
        "date": "2026-03-27",
        "tags": [
          "LM"
        ]
      },
      {
        "title": "Agent Skills",
        "date": "2025-12-31",
        "tags": [
          "Skills"
        ]
      },
      {
        "title": "浠?Function Call 鍒?MCP",
        "date": "2025-10-20",
        "tags": [
          "FunctionCall",
          "MCP"
        ]
      },
      {
        "title": "BM25绠楁硶",
        "date": "2025-04-03",
        "tags": [
          "淇℃伅妫€绱?,
          "鎺掑悕"
        ]
      },
      {
        "title": "鍗歌浇 python 瑕佸厛瀹夎 python?",
        "date": "2023-01-01",
        "tags": [
          "绋嬪簭",
          "鍗歌浇"
        ]
      }
    ]
  },
  "瀛︿範": {
    "posts": [
      {
        "title": "RL - MDP",
        "date": "2026-05-18",
        "tags": [
          "寮哄寲瀛︿範"
        ]
      },
      {
        "title": "涓婁笅鏂囩獥鍙ｇ瑪璁?,
        "date": "2026-04-06",
        "tags": [
          "LLM"
        ]
      },
      {
        "title": "妯″瀷璇勬祴鏂规硶鏁寸悊",
        "date": "2026-02-17",
        "tags": [
          "璇勬祴"
        ]
      },
      {
        "title": "Agent Skills",
        "date": "2025-12-31",
        "tags": [
          "Agent"
        ]
      },
      {
        "title": "MCP 宸ュ叿瀛︿範",
        "date": "2025-11-02",
        "tags": [
          "MCP"
        ]
      },
      {
        "title": "淇℃伅妫€绱㈠崱鐗?,
        "date": "2025-08-14",
        "tags": [
          "妫€绱?
        ]
      },
      {
        "title": "璇讳功鎽樺綍鐨勭粨鏋?,
        "date": "2024-10-09",
        "tags": [
          "璇讳功"
        ]
      }
    ]
  },
  "鎶樿吘": {
    "posts": [
      {
        "title": "椋炰功鏈哄櫒浜哄姪鎵嬪仠姝㈡湇鍔?,
        "date": "2026-06-20",
        "tags": [
          "椋炰功"
        ]
      },
      {
        "title": "鐢ㄢ€滆冻杩光€濊仛鍚?,
        "date": "2026-06-17",
        "tags": [
          "鍗氬"
        ]
      },
      {
        "title": "IOS蹇嵎鎸囦护 + 椋炰功 + LLM鍏ㄨ嚜鍔ㄨ璐?,
        "date": "2026-05-31",
        "tags": [
          "IOS",
          "椋炰功"
        ]
      },
      {
        "title": "Yohaku 閮ㄧ讲",
        "date": "2026-05-29",
        "tags": [
          "閮ㄧ讲"
        ]
      },
      {
        "title": "Shiro/Yohaku 涓汉鐘舵€佹姤閿?,
        "date": "2026-05-29",
        "tags": [
          "Yohaku"
        ]
      },
      {
        "title": "鍗氬澧炲姞鍙嬪湀",
        "date": "2026-05-28",
        "tags": [
          "鍗氬"
        ]
      },
      {
        "title": "鏈湴椤甸潰婊氬姩鏉″疄楠?,
        "date": "2026-04-22",
        "tags": [
          "浜や簰"
        ]
      },
      {
        "title": "椤甸潰鑳屾櫙閲嶆瀯",
        "date": "2026-03-13",
        "tags": [
          "璁捐"
        ]
      },
      {
        "title": "NAS 鏂囦欢鏁寸悊",
        "date": "2025-12-08",
        "tags": [
          "瀛樺偍"
        ]
      }
    ]
  },
  "鎬濊€?: {
    "posts": [
      {
        "title": "濡備綍绠＄悊涓婁笅鏂?,
        "date": "2026-06-01",
        "tags": [
          "鏂规硶"
        ]
      }
    ]
  },
  "鏁堢巼": {
    "posts": [
      {
        "title": "AI 鏃朵唬鐨勬晥鐜囨倴璁?,
        "date": "2026-03-01",
        "tags": [
          "productivity"
        ]
      }
    ]
  }
};

*/

const postsMegaData = Object.fromEntries(Object.entries(categoryArchiveData).map(([category, data]) => [
  category,
  data.posts.slice(0, 5).map((post) => [post.title, formatFullDate(post.date)]),
]));

const INDEX_ROOT = "content/indexes";
const frontendIndexState = {
  ready: false,
  posts: [],
  notes: [],
  site: null,
};

function getDateOnly(value, fallback = "2026-01-01") {
  if (!value) return fallback;
  const text = String(value).trim();
  const exact = text.match(/^(\d{4}-\d{2}-\d{2})/);
  if (exact) return exact[1];
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toISOString().slice(0, 10);
}

function normalizeIndexTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }
  if (typeof tags === "string") {
    return tags.split(/[,\s，、]+/).map((tag) => tag.trim()).filter(Boolean);
  }
  return [];
}

function createIndexSummary(item, fallbackCategory) {
  if (item.summary) return String(item.summary);
  if (item.excerpt) return String(item.excerpt);
  const tags = normalizeIndexTags(item.tags);
  const pieces = [fallbackCategory, ...tags].filter(Boolean).slice(0, 3);
  const wordCount = Number(item.wordCount) || 0;
  if (pieces.length && wordCount) return `${pieces.join(" / ")} / ${wordCount} 字`;
  if (pieces.length) return pieces.join(" / ");
  return wordCount ? `${wordCount} 字` : "";
}

function createPostIndexSummary(item) {
  if (item?.summary) return String(item.summary);
  if (item?.excerpt) return String(item.excerpt);
  return "";
}

function normalizeIndexPost(item) {
  const title = String(item?.title || item?.slug || "Untitled").trim();
  const category = String(item?.category || "未分类").trim();
  const date = getDateOnly(item?.date || item?.createdAt || item?.updatedAt);
  const updated = getDateOnly(item?.updatedAt || item?.modifiedAt || item?.date, date);
  const tags = normalizeIndexTags(item?.tags);
  return {
    ...item,
    title,
    category,
    date,
    updated,
    tags,
    wordCount: Number(item?.wordCount) || 0,
    summary: createPostIndexSummary(item || {}),
    href: getArticleUrl(title),
  };
}

function normalizeIndexNote(item) {
  const title = String(item?.title || item?.slug || "Untitled").trim();
  const type = normalizeNoteCategoryName(item?.category || item?.noteType || item?.type);
  const date = getDateOnly(item?.date || item?.happenedAt || item?.createdAt || item?.updatedAt);
  const updated = getDateOnly(item?.updatedAt || item?.modifiedAt || item?.date, date);
  const tags = normalizeIndexTags(item?.tags);
  return {
    ...item,
    title,
    type,
    category: type,
    date,
    updated,
    tags,
    wordCount: Number(item?.wordCount) || 0,
    summary: createIndexSummary(item || {}, type),
    href: getNoteUrl(title),
  };
}

async function fetchIndexJson(path) {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function refreshPostsMegaDataset() {
  Object.keys(postsMegaData).forEach((category) => delete postsMegaData[category]);
  Object.assign(postsMegaData, Object.fromEntries(Object.entries(categoryArchiveData).map(([category, data]) => [
    category,
    data.posts.slice(0, 5).map((post) => [post.title, formatFullDate(post.date)]),
  ])));
}

function applyFrontendIndexes({ posts, notes, site }) {
  const nextPosts = (Array.isArray(posts) ? posts : [])
    .filter((post) => post?.visible !== false)
    .map(normalizeIndexPost)
    .filter((post) => post.title);
  const nextNotes = (Array.isArray(notes) ? notes : [])
    .filter((note) => note?.visible !== false)
    .map(normalizeIndexNote)
    .filter((note) => note.title);

  if (!nextPosts.length && !nextNotes.length) return false;

  Object.keys(categoryArchiveData).forEach((category) => delete categoryArchiveData[category]);
  nextPosts.forEach((post) => {
    if (!categoryArchiveData[post.category]) categoryArchiveData[post.category] = { posts: [] };
    categoryArchiveData[post.category].posts.push(post);
  });
  Object.values(categoryArchiveData).forEach((data) => {
    data.posts.sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date));
  });

  noteArchiveEntries.splice(0, noteArchiveEntries.length, ...nextNotes.sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date)));
  nextNotes.forEach((note) => {
    if (!noteCategoryMeta[note.type]) {
      noteCategoryMeta[note.type] = {
        title: note.type,
        description: "",
        mark: note.type.slice(0, 1),
      };
    }
    if (!noteCategoryOrder.includes(note.type)) noteCategoryOrder.push(note.type);
  });

  frontendIndexState.ready = true;
  frontendIndexState.posts = nextPosts;
  frontendIndexState.notes = nextNotes;
  frontendIndexState.site = site || null;
  refreshPostsMegaDataset();
  return true;
}

async function loadFrontendIndexes() {
  if (frontendIndexState.ready) return true;
  const [posts, notes, site] = await Promise.all([
    fetchIndexJson(`${INDEX_ROOT}/posts.json`),
    fetchIndexJson(`${INDEX_ROOT}/notes.json`),
    fetchIndexJson(`${INDEX_ROOT}/site-summary.json`),
  ]);
  const applied = applyFrontendIndexes({ posts, notes, site });
  if (applied) renderIndexBackedCurrentPage(document, { rebind: true });
  return applied;
}

function parsePostDate(value) {
  return new Date(`${value}T00:00:00`);
}

function formatFullDate(value) {
  const date = parsePostDate(value);
  const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日${weekdays[date.getDay()]}`;
}

function formatMonthDay(value) {
  const date = parsePostDate(value);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function getCategoryFromUrl() {
  const rawCategory = new URLSearchParams(window.location.search).get("cat") || "";
  if (categoryArchiveData[rawCategory]) return rawCategory;
  return Object.keys(categoryArchiveData)[0] || rawCategory || "问学录";
}

function getArticleUrl(postOrTitle) {
  const title = typeof postOrTitle === "string" ? postOrTitle : postOrTitle?.title;
  return title ? `article.html?post=${encodeURIComponent(title)}` : "article.html";
}

function getNoteUrl(noteOrTitle) {
  const title = typeof noteOrTitle === "string" ? noteOrTitle : noteOrTitle?.title;
  return title ? `note-ai.html?note=${encodeURIComponent(title)}` : "note-ai.html";
}

function getAllPostDetails() {
  const seen = new Map();
  Object.entries(categoryArchiveData).forEach(([category, data]) => {
    data.posts.forEach((post) => {
      if (!seen.has(post.title)) {
        seen.set(post.title, { ...post, category });
      }
    });
  });
  return Array.from(seen.values()).sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date));
}

function countContentWords(text) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  const cjkCount = (normalized.match(/[\u4e00-\u9fff]/g) || []).length;
  const latinCount = (normalized.replace(/[\u4e00-\u9fff]/g, " ").match(/[A-Za-z0-9]+/g) || []).length;
  return cjkCount + latinCount;
}

function getArticleWordSource(post) {
  const sections = buildPostDetailSections(post);
  const parts = [
    post.title,
    post.category,
    ...(post.tags || []),
  ];
  sections.forEach((section) => {
    parts.push(section.title || "");
    parts.push(...(section.paragraphs || []));
    if (section.quote) parts.push(section.quote);
  });
  return parts.join(" ");
}

function getAllArticleWordCount() {
  const indexedTotal = Number(frontendIndexState.site?.wordCount);
  if (frontendIndexState.ready && indexedTotal) return indexedTotal;
  if (frontendIndexState.ready) {
    return [...frontendIndexState.posts, ...frontendIndexState.notes].reduce((total, item) => total + (Number(item.wordCount) || 0), 0);
  }
  return getAllPostDetails().reduce((total, post) => total + countContentWords(getArticleWordSource(post)), 0);
}

function getPostFromUrl() {
  const requested = new URLSearchParams(window.location.search).get("post");
  const posts = getAllPostDetails();
  return posts.find((post) => post.title === requested) || posts[0];
}

function getNoteFromUrl() {
  const requested = new URLSearchParams(window.location.search).get("note");
  const notes = getSortedNotes("all");
  return notes.find((note) => note.title === requested) || notes[0];
}

function createPostsMegaLink(title, date) {
  const link = document.createElement("a");
  link.href = getArticleUrl(title);
  const heading = document.createElement("span");
  heading.className = "mega-title";
  heading.textContent = title;
  const time = document.createElement("time");
  time.textContent = date;
  link.append(heading, time);
  return link;
}

function syncPostsMegaCategory(category) {
  if (!postsMegaList || !postsMegaCategory || !postsMegaData[category]) return;
  postsMegaActiveCategory = category;
  postsMegaCategory.textContent = category;
  postsMegaButtons.forEach((control) => {
    const controlCategory = control.dataset.megaCategory;
    control.classList.toggle("is-active", controlCategory === category);
    if (control.tagName === "A" && controlCategory) {
      control.href = `category.html?cat=${encodeURIComponent(controlCategory)}`;
    }
    const countNode = control.querySelector("b");
    const count = categoryArchiveData[controlCategory]?.posts.length || 0;
    if (countNode) countNode.textContent = String(count);
  });
  postsMegaList.replaceChildren(...postsMegaData[category].slice(0, 5).map(([title, date]) => createPostsMegaLink(title, date)));
}

function renderPostsMegaRecent() {
  if (!postsMegaList || !postsMegaCategory) return;
  postsMegaActiveCategory = "";
  postsMegaCategory.textContent = "最近文稿";
  postsMegaButtons.forEach((control) => {
    const controlCategory = control.dataset.megaCategory;
    control.classList.remove("is-active");
    if (control.tagName === "A" && controlCategory) {
      control.href = `category.html?cat=${encodeURIComponent(controlCategory)}`;
    }
    const countNode = control.querySelector("b");
    const count = categoryArchiveData[controlCategory]?.posts.length || 0;
    if (countNode) countNode.textContent = String(count);
  });
  const recentPosts = getAllPostDetails().slice(0, 5);
  postsMegaList.replaceChildren(...recentPosts.map((post) => createPostsMegaLink(post.title, formatFullDate(post.date))));
}

function animatePostsMegaList() {
  runStaggerReveal(postsMegaList?.querySelectorAll("a"), { baseDelay: 35, interval: 42, duration: 520 });
}

function blurMegaFocus(panel) {
  const active = document.activeElement;
  if (panel && active instanceof HTMLElement && panel.contains(active)) {
    active.blur();
  }
}

const lastMegaPointer = { x: Number.NaN, y: Number.NaN };

function rememberMegaPointer(event) {
  if (!event || typeof event.clientX !== "number" || typeof event.clientY !== "number") return;
  lastMegaPointer.x = event.clientX;
  lastMegaPointer.y = event.clientY;
}

function pointerIsInsideElement(element) {
  if (!element || !Number.isFinite(lastMegaPointer.x) || !Number.isFinite(lastMegaPointer.y)) return false;
  const rect = element.getBoundingClientRect();
  return lastMegaPointer.x >= rect.left
    && lastMegaPointer.x <= rect.right
    && lastMegaPointer.y >= rect.top
    && lastMegaPointer.y <= rect.bottom;
}

function targetIsInsideMega(target, panel, trigger) {
  return target instanceof Node && targetWithinAny(target, panel, trigger);
}

function pointerElementIsInsideMega(panel, trigger) {
  if (!Number.isFinite(lastMegaPointer.x) || !Number.isFinite(lastMegaPointer.y)) return false;
  const target = document.elementFromPoint(lastMegaPointer.x, lastMegaPointer.y);
  return targetIsInsideMega(target, panel, trigger);
}

function leaveGoesInsideMega(event, panel, trigger) {
  return targetIsInsideMega(event?.relatedTarget, panel, trigger);
}

function openPostsMega() {
  if (!postsMegaPanel || !postsMegaTrigger) return;
  const wasOpen = postsMegaPanel.classList.contains("is-open");
  window.clearTimeout(postsMegaCloseTimer);
  closeHomeMega();
  closeNotesMega();
  closeTimelineMega();
  postsMegaPanel.classList.add("is-open");
  postsMegaPanel.setAttribute("aria-hidden", "false");
  postsMegaTrigger.setAttribute("aria-expanded", "true");
  if (!wasOpen) {
    renderPostsMegaRecent();
    requestAnimationFrame(animatePostsMegaList);
  }
}

function closePostsMega() {
  if (!postsMegaPanel || !postsMegaTrigger) return;
  window.clearTimeout(postsMegaCloseTimer);
  window.clearTimeout(postsMegaSwitchTimer);
  blurMegaFocus(postsMegaPanel);
  postsMegaPanel.classList.remove("is-open");
  postsMegaPanel.setAttribute("aria-hidden", "true");
  postsMegaTrigger.setAttribute("aria-expanded", "false");
}

function closePostsMegaIfPointerOutside() {
  if (!postsMegaPanel?.classList.contains("is-open")) return;
  if (!pointerElementIsInsideMega(postsMegaPanel, postsMegaTrigger)) {
    closePostsMega();
  }
}

function schedulePostsMegaClose(event) {
  rememberMegaPointer(event);
  window.clearTimeout(postsMegaCloseTimer);
  if (leaveGoesInsideMega(event, postsMegaPanel, postsMegaTrigger)) return;
  postsMegaCloseTimer = window.setTimeout(closePostsMegaIfPointerOutside, 90);
}

function renderPostsMegaCategory(category) {
  if (!postsMegaList || !postsMegaCategory) return;
  if (!category || category === postsMegaActiveCategory) return;
  postsMegaActiveCategory = category;
  window.clearTimeout(postsMegaSwitchTimer);
  postsMegaCategory.textContent = category;
  postsMegaButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.megaCategory === category);
  });
  postsMegaList.classList.remove("is-entering");
  postsMegaList.classList.add("is-exiting");

  postsMegaSwitchTimer = window.setTimeout(() => {
    syncPostsMegaCategory(category);
    postsMegaList.classList.remove("is-exiting");
    postsMegaList.classList.add("is-entering");
    animatePostsMegaList();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        postsMegaList.classList.remove("is-entering");
      });
    });
  }, 72);
}

function attachPostsMegaControl(button) {
  if (!button || button.dataset.megaBound === "true") return;
  button.dataset.megaBound = "true";
  button.addEventListener("mouseenter", () => renderPostsMegaCategory(button.dataset.megaCategory));
  button.addEventListener("focus", () => renderPostsMegaCategory(button.dataset.megaCategory));
  button.addEventListener("click", () => renderPostsMegaCategory(button.dataset.megaCategory));
}

function rebuildPostsMegaControls() {
  if (!postsMegaPanel) return;
  const categories = Object.keys(categoryArchiveData);
  const cats = postsMegaPanel.querySelector(".posts-mega-cats");
  if (!cats || !categories.length) return;
  const label = document.createElement("p");
  label.textContent = "分类";
  cats.replaceChildren(label, ...categories.map((category) => {
    const link = document.createElement("a");
    link.href = `category.html?cat=${encodeURIComponent(category)}`;
    link.dataset.megaCategory = category;
    const title = document.createElement("span");
    title.textContent = category;
    const count = document.createElement("b");
    count.textContent = String(categoryArchiveData[category]?.posts.length || 0);
    link.append(title, count);
    attachPostsMegaControl(link);
    attachPjaxLinkHandler(link);
    return link;
  }));
  postsMegaButtons.splice(0, postsMegaButtons.length, ...Array.from(cats.querySelectorAll("[data-mega-category]")));
  const footerCount = postsMegaPanel.querySelector(".posts-mega-footer a:last-child");
  if (footerCount) footerCount.textContent = `${getAllPostDetails().length} 篇文稿`;
}

if (postsMegaTrigger && postsMegaPanel) {
  postsMegaTrigger.addEventListener("mouseenter", openPostsMega);
  postsMegaTrigger.addEventListener("focus", openPostsMega);
  postsMegaTrigger.addEventListener("mouseleave", schedulePostsMegaClose);
  postsMegaTrigger.addEventListener("pointerleave", schedulePostsMegaClose);
  postsMegaPanel.addEventListener("mouseenter", openPostsMega);
  postsMegaPanel.addEventListener("mouseleave", schedulePostsMegaClose);
  postsMegaPanel.addEventListener("pointerleave", schedulePostsMegaClose);
  postsMegaPanel.addEventListener("focusin", openPostsMega);

  postsMegaButtons.forEach(attachPostsMegaControl);
  renderPostsMegaRecent();
}

function getNoteEntriesData() {
  if (frontendIndexState.ready) return noteArchiveEntries;
  const domNoteItems = Array.from(document.querySelectorAll("[data-note-item]"));
  if (!domNoteItems.length) {
    return noteArchiveEntries;
  }
  const domEntries = domNoteItems
    .map((entry) => {
      const link = entry.matches("a[href]") ? entry : entry.querySelector("a[href]");
      const title = entry.querySelector(".note-letter-card h3, .latest-note-head h1, strong, h1, h2, h3");
      const summary = entry.querySelector(".note-letter-card p, .latest-note-body p, p");
      return {
        type: entry.dataset.noteType || "一日笺",
        date: entry.dataset.noteDate || "2026-01-01",
        title: title?.textContent.trim() || "",
        summary: summary?.textContent.trim() || "",
        href: link?.getAttribute("href") || "note-ai.html",
      };
    })
    .filter((note) => note.title);
  const known = new Set(noteArchiveEntries.map((note) => [note.type, note.date, note.title].join("|")));
  const extras = domEntries.filter((note) => !known.has([note.type, note.date, note.title].join("|")));
  return [...noteArchiveEntries, ...extras];
}

function formatDotDate(value) {
  const date = parsePostDate(value);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join(".");
}

function formatSlashDate(value) {
  const date = parsePostDate(value);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatRelativeDate(value) {
  const date = parsePostDate(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.max(0, Math.floor((today - date) / 86400000));
  if (diff === 0) return "今天";
  if (diff < 30) return String(diff) + " 天前";
  if (diff < 365) return String(Math.floor(diff / 30)) + " 个月前";
  return String(Math.floor(diff / 365)) + " 年前";
}

function getNoteCategoryFromUrl() {
  const rawCategory = new URLSearchParams(window.location.search).get("cat") || "一日笺";
  return normalizeNoteCategoryName(rawCategory);
}

function getSortedNotes(category = "all") {
  return getNoteEntriesData()
    .filter((note) => category === "all" || note.type === category)
    .sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date));
}

function createNotesMegaLink(note) {
  const link = document.createElement("a");
  link.href = getNoteUrl(note);
  const heading = document.createElement("span");
  heading.className = "mega-title";
  heading.textContent = note.title;
  const time = document.createElement("time");
  time.textContent = formatFullDate(note.date);
  link.append(heading, time);
  return link;
}

function syncNotesMegaCategory(category) {
  if (!notesMegaList || !notesMegaCategory) return;
  const notes = getSortedNotes(category).slice(0, 5);
  notesMegaActiveCategory = category;
  notesMegaCategory.textContent = category;
  notesMegaControls.forEach((control) => {
    const controlCategory = control.dataset.noteMegaCategory;
    const countNode = control.querySelector("b");
    const count = getSortedNotes(controlCategory).length;
    control.classList.toggle("is-active", controlCategory === category);
    if (control.tagName === "A" && controlCategory) {
      control.href = `note-category.html?cat=${encodeURIComponent(controlCategory)}`;
    }
    if (countNode) {
      countNode.textContent = String(count);
    }
  });
  notesMegaList.replaceChildren(...notes.map(createNotesMegaLink));
}

function renderNotesMegaRecent() {
  if (!notesMegaList || !notesMegaCategory) return;
  notesMegaActiveCategory = "";
  notesMegaCategory.textContent = "最近手记";
  notesMegaControls.forEach((control) => {
    const controlCategory = control.dataset.noteMegaCategory;
    const countNode = control.querySelector("b");
    const count = getSortedNotes(controlCategory).length;
    control.classList.remove("is-active");
    if (control.tagName === "A" && controlCategory) {
      control.href = `note-category.html?cat=${encodeURIComponent(controlCategory)}`;
    }
    if (countNode) countNode.textContent = String(count);
  });
  notesMegaList.replaceChildren(...getSortedNotes("all").slice(0, 5).map(createNotesMegaLink));
}

function animateNotesMegaList() {
  runStaggerReveal(notesMegaList?.querySelectorAll("a"), { baseDelay: 35, interval: 42, duration: 520 });
}

function openNotesMega() {
  if (!notesMegaPanel || !notesMegaTrigger) return;
  const wasOpen = notesMegaPanel.classList.contains("is-open");
  window.clearTimeout(notesMegaCloseTimer);
  closeHomeMega();
  closePostsMega();
  closeTimelineMega();
  notesMegaPanel.classList.add("is-open");
  notesMegaPanel.setAttribute("aria-hidden", "false");
  notesMegaTrigger.setAttribute("aria-expanded", "true");
  if (!wasOpen) {
    renderNotesMegaRecent();
    requestAnimationFrame(animateNotesMegaList);
  }
}

function closeNotesMega() {
  if (!notesMegaPanel || !notesMegaTrigger) return;
  window.clearTimeout(notesMegaCloseTimer);
  window.clearTimeout(notesMegaSwitchTimer);
  blurMegaFocus(notesMegaPanel);
  notesMegaPanel.classList.remove("is-open");
  notesMegaPanel.setAttribute("aria-hidden", "true");
  notesMegaTrigger.setAttribute("aria-expanded", "false");
}

function closeNotesMegaIfPointerOutside() {
  if (!notesMegaPanel?.classList.contains("is-open")) return;
  if (!pointerElementIsInsideMega(notesMegaPanel, notesMegaTrigger)) {
    closeNotesMega();
  }
}

function scheduleNotesMegaClose(event) {
  rememberMegaPointer(event);
  window.clearTimeout(notesMegaCloseTimer);
  if (leaveGoesInsideMega(event, notesMegaPanel, notesMegaTrigger)) return;
  notesMegaCloseTimer = window.setTimeout(closeNotesMegaIfPointerOutside, 90);
}

function renderNotesMegaCategory(category) {
  if (!notesMegaList || !notesMegaCategory) return;
  if (!category || category === notesMegaActiveCategory) return;
  notesMegaActiveCategory = category;
  window.clearTimeout(notesMegaSwitchTimer);
  notesMegaCategory.textContent = category;
  notesMegaControls.forEach((control) => {
    control.classList.toggle("is-active", control.dataset.noteMegaCategory === category);
  });
  notesMegaList.classList.remove("is-entering");
  notesMegaList.classList.add("is-exiting");

  notesMegaSwitchTimer = window.setTimeout(() => {
    syncNotesMegaCategory(category);
    notesMegaList.classList.remove("is-exiting");
    notesMegaList.classList.add("is-entering");
    animateNotesMegaList();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        notesMegaList.classList.remove("is-entering");
      });
    });
  }, 72);
}

if (notesMegaTrigger && notesMegaPanel) {
  notesMegaTrigger.addEventListener("mouseenter", openNotesMega);
  notesMegaTrigger.addEventListener("focus", openNotesMega);
  notesMegaTrigger.addEventListener("mouseleave", scheduleNotesMegaClose);
  notesMegaTrigger.addEventListener("pointerleave", scheduleNotesMegaClose);
  notesMegaPanel.addEventListener("mouseenter", openNotesMega);
  notesMegaPanel.addEventListener("mouseleave", scheduleNotesMegaClose);
  notesMegaPanel.addEventListener("pointerleave", scheduleNotesMegaClose);
  notesMegaPanel.addEventListener("focusin", openNotesMega);

  notesMegaControls.forEach((control) => {
    control.addEventListener("mouseenter", () => renderNotesMegaCategory(control.dataset.noteMegaCategory));
    control.addEventListener("focus", () => renderNotesMegaCategory(control.dataset.noteMegaCategory));
    control.addEventListener("click", () => renderNotesMegaCategory(control.dataset.noteMegaCategory));
  });
  renderNotesMegaRecent();
}

function getTimelineMegaEntries() {
  const posts = getAllPostDetails().map((post) => ({
    title: post.title,
    date: post.date,
    href: getArticleUrl(post),
  }));
  const notes = getSortedNotes("all").map((note) => ({
    title: note.title,
    date: note.date,
    href: getNoteUrl(note),
  }));
  return [...posts, ...notes]
    .sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date))
    .slice(0, 4);
}

function getTimelineProgressSnapshot() {
  const now = new Date();
  const year = now.getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  const dayStart = new Date(year, now.getMonth(), now.getDate());
  const dayOfYear = Math.floor((dayStart - start) / 86400000) + 1;
  const yearProgress = Math.floor(((now - start) / (end - start)) * 100);
  const dayProgress = Math.floor(((now - dayStart) / 86400000) * 100);
  return { dayOfYear, yearProgress, dayProgress };
}

function syncTimelineMega() {
  if (!timelineMegaPanel || !timelineMegaList) return;
  const entries = getTimelineMegaEntries();
  const total = getAllPostDetails().length + getSortedNotes("all").length;
  const progress = getTimelineProgressSnapshot();
  if (timelineMegaCount) timelineMegaCount.textContent = String(total);
  if (timelineMegaYear) timelineMegaYear.textContent = `${progress.yearProgress}%`;
  if (timelineMegaDay) timelineMegaDay.textContent = `${progress.dayProgress}%`;
  timelineMegaList.replaceChildren(...entries.map((entry) => {
    const link = document.createElement("a");
    link.href = entry.href;
    const title = document.createElement("span");
    title.textContent = entry.title;
    const time = document.createElement("time");
    time.textContent = formatMonthDay(entry.date);
    link.append(title, time);
    return link;
  }));
}

function openTimelineMega() {
  if (!timelineMegaPanel || !timelineMegaTrigger) return;
  const wasOpen = timelineMegaPanel.classList.contains("is-open");
  window.clearTimeout(timelineMegaCloseTimer);
  closeHomeMega();
  closePostsMega();
  closeNotesMega();
  syncTimelineMega();
  timelineMegaPanel.classList.add("is-open");
  timelineMegaPanel.setAttribute("aria-hidden", "false");
  timelineMegaTrigger.setAttribute("aria-expanded", "true");
  if (!wasOpen) {
    runStaggerReveal(timelineMegaPanel.querySelectorAll(".timeline-mega-stats div, .timeline-mega-feed a"), {
      baseDelay: 28,
      interval: 34,
      duration: 480,
    });
  }
}

function closeTimelineMega() {
  if (!timelineMegaPanel || !timelineMegaTrigger) return;
  window.clearTimeout(timelineMegaCloseTimer);
  timelineMegaPanel.classList.remove("is-open");
  timelineMegaPanel.setAttribute("aria-hidden", "true");
  timelineMegaTrigger.setAttribute("aria-expanded", "false");
}

function scheduleTimelineMegaClose() {
  window.clearTimeout(timelineMegaCloseTimer);
  timelineMegaCloseTimer = window.setTimeout(closeTimelineMega, 140);
}

if (timelineMegaTrigger && timelineMegaPanel) {
  timelineMegaTrigger.addEventListener("mouseenter", openTimelineMega);
  timelineMegaTrigger.addEventListener("focus", openTimelineMega);
  timelineMegaTrigger.addEventListener("mouseleave", scheduleTimelineMegaClose);
  timelineMegaPanel.addEventListener("mouseenter", openTimelineMega);
  timelineMegaPanel.addEventListener("mouseleave", scheduleTimelineMegaClose);
  timelineMegaPanel.addEventListener("focusin", openTimelineMega);
}

function renderNoteCategoryPage(noteCategoryPage = document.querySelector("[data-note-category-page]")) {
  if (!noteCategoryPage) return;
  const category = getNoteCategoryFromUrl();
  if (noteCategoryPage.dataset.noteCategoryRendered === "true" && noteCategoryPage.dataset.noteCategoryRenderedFor === category) return;
  const meta = noteCategoryMeta[category] || noteCategoryMeta["涓€鏃ョ"];
  const notes = getSortedNotes(category).sort((a, b) => parsePostDate(a.date) - parsePostDate(b.date));
  const latestNote = [...notes].sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date))[0];
  const title = noteCategoryPage.querySelector("[data-note-category-title]");
  const description = noteCategoryPage.querySelector("[data-note-category-description]");
  const mark = noteCategoryPage.querySelector("[data-note-category-mark]");
  const total = noteCategoryPage.querySelector("[data-note-category-total]");
  const updated = noteCategoryPage.querySelector("[data-note-category-updated]");
  const archive = noteCategoryPage.querySelector("[data-note-category-archive]");
  if (!title || !description || !mark || !total || !updated || !archive) return;
  noteCategoryPage.dataset.noteCategoryRendered = "true";
  noteCategoryPage.dataset.noteCategoryRenderedFor = category;

  document.title = `${meta.title} - 鎵嬭 - 闈欍亱銇． Replica`;
  title.textContent = meta.title;
  description.textContent = meta.description;
  mark.textContent = meta.mark;
  total.textContent = String(notes.length);
  updated.textContent = latestNote ? formatRelativeDate(latestNote.date) : "鏆傛棤";

  const track = document.createElement("div");
  track.className = "note-category-track";
  const indicator = document.createElement("i");
  indicator.className = "note-category-indicator";
  indicator.setAttribute("aria-hidden", "true");
  track.appendChild(indicator);

  notes.forEach((note) => {
    const link = document.createElement("a");
    link.className = "note-category-row";
    link.href = getNoteUrl(note);
    link.classList.toggle("is-active", latestNote && note.date === latestNote.date && note.title === latestNote.title);

    const time = document.createElement("time");
    time.dateTime = note.date;
    time.textContent = formatSlashDate(note.date);

    const headingText = document.createElement("span");
    headingText.textContent = note.title;

    link.append(time, headingText);
    track.appendChild(link);
  });

  if (!notes.length) {
    const empty = document.createElement("p");
    empty.className = "note-category-empty";
    empty.textContent = "这个分类下还没有手记。";
    track.appendChild(empty);
  }

  archive.replaceChildren(track);
  noteCategoryPage.classList.add("is-visible");
  noteCategoryPage.querySelectorAll(".reveal").forEach((node) => node.classList.add("is-visible"));

  function updateNoteCategoryIndicator(row) {
    if (!row) return;
    track.style.setProperty("--active-y", `${row.offsetTop}px`);
    track.style.setProperty("--active-height", `${row.offsetHeight}px`);
  }

  const activeRow = track.querySelector(".note-category-row.is-active") || track.querySelector(".note-category-row");
  requestAnimationFrame(() => updateNoteCategoryIndicator(activeRow));

  archive.addEventListener("pointerover", (event) => {
    const row = event.target.closest(".note-category-row");
    if (!row || !archive.contains(row)) return;
    archive.querySelectorAll(".note-category-row").forEach((item) => item.classList.toggle("is-active", item === row));
    updateNoteCategoryIndicator(row);
  });

  archive.addEventListener("focusin", (event) => {
    const row = event.target.closest(".note-category-row");
    if (!row || !archive.contains(row)) return;
    archive.querySelectorAll(".note-category-row").forEach((item) => item.classList.toggle("is-active", item === row));
    updateNoteCategoryIndicator(row);
  });

  window.addEventListener("resize", () => {
    updateNoteCategoryIndicator(archive.querySelector(".note-category-row.is-active"));
  });

  runStaggerReveal(archive.querySelectorAll(".note-category-row"), {
    baseDelay: 120,
    interval: 52,
    duration: 560,
  });
  syncNotesMegaCategory(category);
}

renderNoteCategoryPage();

function renderCategoryPage(categoryPage = document.querySelector("[data-category-page]")) {
  if (!categoryPage || categoryPage.dataset.categoryRendered === "true") return;
  const category = getCategoryFromUrl();
  const categoryData = categoryArchiveData[category];
  if (!categoryData) return;
  const categoryTitle = categoryPage.querySelector("[data-category-title]");
  const categoryTotal = categoryPage.querySelector("[data-category-total]");
  const categorySince = categoryPage.querySelector("[data-category-since]");
  const categoryArchive = categoryPage.querySelector("[data-category-archive]");
  const categoryTags = categoryPage.querySelector("[data-category-tags]");
  const categoryNavLabel = document.querySelector("[data-category-nav-label]");
  const sortedPosts = [...categoryData.posts].sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date));
  const years = [...new Set(sortedPosts.map((post) => String(parsePostDate(post.date).getFullYear())))].sort((a, b) => b - a);
  const sinceYear = years[years.length - 1] || String(new Date().getFullYear());
  if (!categoryTitle || !categoryTotal || !categoryArchive || !categoryTags) return;
  categoryPage.dataset.categoryRendered = "true";

  document.title = `${category} - 分类 - Replica`;
  categoryTitle.textContent = category;
  categoryTotal.textContent = String(sortedPosts.length);
  if (categorySince) categorySince.textContent = sinceYear;
  if (categoryNavLabel) {
    categoryNavLabel.textContent = category;
    categoryNavLabel.href = `category.html?cat=${encodeURIComponent(category)}`;
  }

  categoryArchive.replaceChildren(...years.map((year) => {
    const postsInYear = sortedPosts.filter((post) => String(parsePostDate(post.date).getFullYear()) === year);
    const block = document.createElement("section");
    block.className = "category-year-block";

    const heading = document.createElement("h2");
    heading.textContent = year;
    const count = document.createElement("small");
    count.textContent = `${postsInYear.length} 篇`;
    heading.append(count);
    block.appendChild(heading);

    postsInYear.forEach((post) => {
      const link = document.createElement("a");
      link.className = "category-post-row";
      link.href = getArticleUrl(post);

      const title = document.createElement("span");
      title.className = "category-post-title";
      title.textContent = post.title;

      const tags = document.createElement("span");
      tags.className = "category-post-tags";
      tags.textContent = post.tags.join(", ");

      const time = document.createElement("time");
      time.dateTime = post.date;
      time.textContent = formatMonthDay(post.date);

      link.append(title, tags, time);
      block.appendChild(link);
    });

    return block;
  }));

  const tagCounts = sortedPosts.flatMap((post) => post.tags).reduce((counts, tag) => {
    counts.set(tag, (counts.get(tag) || 0) + 1);
    return counts;
  }, new Map());

  categoryTags.replaceChildren(...Array.from(tagCounts.entries()).map(([tag, count]) => {
    const link = document.createElement("a");
    link.href = `posts.html?tag=${encodeURIComponent(tag)}`;
    link.textContent = `#${tag} ${count}`;
    return link;
  }));

  runStaggerReveal(categoryArchive.querySelectorAll(".category-year-block h2, .category-post-row"), {
    baseDelay: 120,
    interval: 54,
    duration: 660,
  });
  runStaggerReveal(categoryTags.querySelectorAll("a"), {
    baseDelay: 220 + sortedPosts.length * 34,
    interval: 34,
    duration: 520,
  });
  syncPostsMegaCategory(category);
}

renderCategoryPage();

function createTextNodeElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = text;
  return node;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripMarkdownFrontMatter(markdown) {
  return String(markdown || "").replace(/^\uFEFF?---\s*[\r\n]+[\s\S]*?[\r\n]+---\s*(?:[\r\n]+|$)/, "");
}

function stripLeadingMarkdownTitle(markdown, title) {
  const source = String(markdown || "");
  const lines = source.split(/\r?\n/);
  const expected = plainMarkdownText(title || "");
  let index = 0;
  while (index < lines.length && !lines[index].trim()) index += 1;
  const match = lines[index]?.match(/^ {0,3}#\s+(.+?)\s*#*\s*$/);
  const actual = plainMarkdownText(match?.[1] || "");
  if (!match || !expected || actual !== expected) return source;
  lines.splice(index, 1);
  while (index < lines.length && !lines[index].trim()) lines.splice(index, 1);
  return lines.join("\n");
}

function normalizeContentPath(path) {
  return String(path || "").replace(/\\/g, "/").replace(/^\.?\//, "");
}

function encodeContentPath(path) {
  return normalizeContentPath(path)
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function resolveMarkdownAssetUrl(src, basePath) {
  const raw = String(src || "").trim();
  if (!raw || /^(?:[a-z]+:|#|\/)/i.test(raw)) return raw;
  const baseParts = normalizeContentPath(basePath).split("/").slice(0, -1);
  raw.split("/").forEach((part) => {
    if (!part || part === ".") return;
    if (part === "..") {
      baseParts.pop();
      return;
    }
    baseParts.push(part);
  });
  return encodeContentPath(baseParts.join("/"));
}

function plainMarkdownText(value) {
  return String(value || "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~+#>|=[\]{}()!]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function createHeadingSlug(text, context) {
  const base = plainMarkdownText(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "") || "section";
  const used = context.headingSlugs;
  const count = (used.get(base) || 0) + 1;
  used.set(base, count);
  return count > 1 ? `${base}-${count}` : base;
}

function parseMarkdownLinkTarget(raw) {
  const trimmed = String(raw || "").trim();
  const match = trimmed.match(/^(\S+)(?:\s+["'](.+)["'])?$/);
  return {
    href: match?.[1] || trimmed,
    title: match?.[2] || "",
  };
}

function isEscapedMarkdownChar(text, index) {
  let slashes = 0;
  for (let cursor = index - 1; cursor >= 0 && text[cursor] === "\\"; cursor -= 1) {
    slashes += 1;
  }
  return slashes % 2 === 1;
}

function renderKatexMath(source, displayMode = false) {
  const formula = String(source || "").trim();
  if (!formula) return "";
  if (window.katex?.renderToString) {
    try {
      return window.katex.renderToString(formula, {
        displayMode,
        throwOnError: false,
        strict: "ignore",
        trust: false,
        output: "html",
      });
    } catch (error) {
      return `<code class="math-error">${escapeHtml(formula)}</code>`;
    }
  }
  const className = displayMode ? "math-display-fallback" : "math-inline-fallback";
  return `<span class="${className}">${escapeHtml(formula)}</span>`;
}

function stashInlineMathSource(source, mathStore) {
  const text = String(source || "");
  let html = "";
  let index = 0;

  while (index < text.length) {
    const open = text.indexOf("$", index);
    if (open === -1) {
      html += text.slice(index);
      break;
    }

    if (isEscapedMarkdownChar(text, open) || text[open + 1] === "$") {
      html += text.slice(index, open + 1);
      index = open + 1;
      continue;
    }

    let close = open + 1;
    while (close < text.length) {
      close = text.indexOf("$", close);
      if (close === -1) break;
      if (!isEscapedMarkdownChar(text, close) && text[close + 1] !== "$") break;
      close += 1;
    }

    if (close === -1) {
      html += text.slice(index);
      break;
    }

    const formula = text.slice(open + 1, close);
    if (!formula.trim() || /\n/.test(formula) || /^\s|\s$/.test(formula)) {
      html += text.slice(index, open + 1);
      index = open + 1;
      continue;
    }

    const token = `\u0000MATH${mathStore.length}\u0000`;
    mathStore.push(renderKatexMath(formula, false));
    html += text.slice(index, open) + token;
    index = close + 1;
  }

  return html;
}

function renderMarkdownInline(text, context, depth = 0) {
  if (depth > 6) return escapeHtml(text);
  const codeStore = [];
  const mathStore = [];
  let source = String(text || "");

  source = source.replace(/`([^`]+)`/g, (_, code) => {
    const token = `\u0000CODE${codeStore.length}\u0000`;
    codeStore.push(`<code>${escapeHtml(code)}</code>`);
    return token;
  });

  let html = escapeHtml(stashInlineMathSource(source, mathStore));

  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, rawTarget) => {
    const target = parseMarkdownLinkTarget(rawTarget);
    const src = resolveMarkdownAssetUrl(target.href, context.basePath);
    const title = target.title ? ` title="${escapeHtml(target.title)}"` : "";
    return `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${title} loading="lazy"></figure>`;
  });

  html = html.replace(/\[\^([^\]]+)\]/g, (_, rawId) => {
    const id = String(rawId).trim();
    if (!context.footnoteOrder.includes(id)) context.footnoteOrder.push(id);
    const index = context.footnoteOrder.indexOf(id) + 1;
    return `<sup><a data-footnote-ref href="#fn-${escapeHtml(id)}" id="fnref-${escapeHtml(id)}">${index}</a></sup>`;
  });

  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, rawTarget) => {
    const target = parseMarkdownLinkTarget(rawTarget);
    const href = resolveMarkdownAssetUrl(target.href, context.basePath);
    const title = target.title ? ` title="${escapeHtml(target.title)}"` : "";
    return `<a href="${escapeHtml(href)}"${title}>${renderMarkdownInline(label, context, depth + 1)}</a>`;
  });

  html = html.replace(/\{(.+?)\}\((.+?)\)|!!(.+?)!!|==(.+?)==|\+\+(.+?)\+\+/g, (...parts) => {
    const [, rubyBase, rubyReading, spoiler, rainbow, underline] = parts;
    if (rubyBase && rubyReading) {
      if (rubyReading.includes("|")) {
        const bases = Array.from(rubyBase);
        const readings = rubyReading.split("|");
        return `<ruby>${bases.map((char, index) => `${escapeHtml(char)}<rt>${escapeHtml(readings[index] || "")}</rt>`).join("")}</ruby>`;
      }
      return `<ruby>${escapeHtml(rubyBase)}<rt>${escapeHtml(rubyReading)}</rt></ruby>`;
    }
    if (spoiler) return `<span class="spoiler">${renderMarkdownInline(spoiler, context, depth + 1)}</span>`;
    if (rainbow) return `<span class="rainbow-text">${renderMarkdownInline(rainbow, context, depth + 1)}</span>`;
    if (underline) return `<span class="underline-text">${renderMarkdownInline(underline, context, depth + 1)}</span>`;
    return "";
  });

  html = html
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/(^|[^\*])\*([^\*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/(^|[^_])_([^_\n]+)_/g, "$1<em>$2</em>");

  mathStore.forEach((value, index) => {
    html = html.replace(new RegExp(`\\u0000MATH${index}\\u0000`, "g"), value);
  });

  codeStore.forEach((value, index) => {
    html = html.replace(new RegExp(`\\u0000CODE${index}\\u0000`, "g"), value);
  });
  return html;
}

function extractMarkdownFootnotes(markdown) {
  const lines = String(markdown || "").split(/\r?\n/);
  const footnotes = new Map();
  const kept = [];
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^\[\^([^\]]+)\]:\s*(.*)$/);
    if (!match) {
      kept.push(lines[index]);
      continue;
    }
    const [, id, firstLine] = match;
    const content = [firstLine];
    while (index + 1 < lines.length && /^(?:\s{2,}|\t)\S/.test(lines[index + 1])) {
      index += 1;
      content.push(lines[index].trim());
    }
    footnotes.set(id.trim(), content.join(" "));
  }
  return { markdown: kept.join("\n"), footnotes };
}

function isMarkdownFence(line) {
  return /^ {0,3}(```|~~~)/.test(line);
}

function isMarkdownDirective(line) {
  return /^:::\s*(note|tip|important|warning|caution|quote)(?:\[(.*?)\])?\s*$/i.test(line);
}

function isMarkdownHeading(line) {
  return /^ {0,3}#{1,6}\s+\S/.test(line);
}

function isMarkdownHr(line) {
  return /^ {0,3}([-*_])(?:\s*\1){2,}\s*$/.test(line);
}

function isMarkdownList(line) {
  return /^ {0,3}(?:[-*+]\s+|\d+\.\s+)/.test(line);
}

function isMarkdownQuote(line) {
  return /^ {0,3}>\s?/.test(line);
}

function isMarkdownTable(lines, index) {
  return Boolean(lines[index]?.includes("|") && /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[index + 1] || ""));
}

function isMarkdownMathBlock(line) {
  return /^ {0,3}\$\$\s*$/.test(line) || /^ {0,3}\$\$\s*\S.*?\s*\$\$\s*$/.test(line);
}

function isMarkdownRawHtml(line) {
  return /^ {0,3}<(?:div|section|article|aside|figure|figcaption|iframe|video|audio|details|summary|table|thead|tbody|tr|td|th|p|span|br|hr|img|center|right|left)\b/i.test(line);
}

function isMarkdownBlockStart(lines, index) {
  const line = lines[index] || "";
  return !line.trim()
    || isMarkdownFence(line)
    || isMarkdownDirective(line)
    || isMarkdownHeading(line)
    || isMarkdownHr(line)
    || isMarkdownList(line)
    || isMarkdownQuote(line)
    || isMarkdownTable(lines, index)
    || isMarkdownMathBlock(line)
    || isMarkdownRawHtml(line);
}

function splitMarkdownTableRow(line) {
  return String(line || "")
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderMarkdownTable(lines, start, context) {
  const header = splitMarkdownTableRow(lines[start]);
  const align = splitMarkdownTableRow(lines[start + 1]).map((cell) => {
    if (/^:-+:$/.test(cell)) return "center";
    if (/^-+:$/.test(cell)) return "right";
    if (/^:-+$/.test(cell)) return "left";
    return "";
  });
  let index = start + 2;
  const rows = [];
  while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
    rows.push(splitMarkdownTableRow(lines[index]));
    index += 1;
  }
  const headHtml = header.map((cell, cellIndex) => {
    const style = align[cellIndex] ? ` style="text-align:${align[cellIndex]}"` : "";
    return `<th${style}>${renderMarkdownInline(cell, context)}</th>`;
  }).join("");
  const bodyHtml = rows.map((row) => `<tr>${row.map((cell, cellIndex) => {
    const style = align[cellIndex] ? ` style="text-align:${align[cellIndex]}"` : "";
    return `<td${style}>${renderMarkdownInline(cell, context)}</td>`;
  }).join("")}</tr>`).join("");
  return {
    html: `<div class="markdown-table-wrap"><table><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`,
    next: index,
  };
}

function renderMarkdownList(lines, start, context) {
  const ordered = /^ {0,3}\d+\.\s+/.test(lines[start]);
  const tag = ordered ? "ol" : "ul";
  let index = start;
  const items = [];
  while (index < lines.length) {
    const line = lines[index];
    const match = ordered
      ? line.match(/^ {0,3}\d+\.\s+(.*)$/)
      : line.match(/^ {0,3}[-*+]\s+(.*)$/);
    if (!match) break;
    let content = match[1];
    let task = "";
    const taskMatch = content.match(/^\[([ xX])\]\s+(.*)$/);
    if (taskMatch) {
      task = `<input type="checkbox" disabled${taskMatch[1].trim() ? " checked" : ""}> `;
      content = taskMatch[2];
    }
    items.push(`<li>${task}${renderMarkdownInline(content, context)}</li>`);
    index += 1;
  }
  return { html: `<${tag}>${items.join("")}</${tag}>`, next: index };
}

function renderMarkdownFootnotes(context) {
  if (!context.footnoteOrder.length) return "";
  const items = context.footnoteOrder.map((id) => {
    const content = context.footnotes.get(id) || "";
    return `<li id="fn-${escapeHtml(id)}"><p>${renderMarkdownInline(content, context)} <a data-footnote-backref href="#fnref-${escapeHtml(id)}" aria-label="返回正文">&#8617;</a></p></li>`;
  }).join("");
  return `<section data-footnotes><h2 class="sr-only">Footnotes</h2><ol>${items}</ol></section>`;
}

function renderMarkdownBlocks(markdown, context) {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (isMarkdownFence(line)) {
      const fence = line.match(/^ {0,3}(```|~~~)\s*([^\s`]*)/);
      const marker = fence?.[1] || "```";
      const language = fence?.[2] || "";
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith(marker)) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      html.push(`<pre><code${language ? ` class="language-${escapeHtml(language)}"` : ""}>${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }

    const directiveMatch = line.match(/^:::\s*(note|tip|important|warning|caution|quote)(?:\[(.*?)\])?\s*$/i);
    if (directiveMatch) {
      const [, typeRaw, customTitle] = directiveMatch;
      const type = typeRaw.toLowerCase();
      const inner = [];
      index += 1;
      while (index < lines.length && !/^:::\s*$/.test(lines[index])) {
        inner.push(lines[index]);
        index += 1;
      }
      index += 1;
      const innerHtml = renderMarkdownBlocks(inner.join("\n"), context);
      if (type === "quote") {
        html.push(`<div class="quote">${innerHtml}</div>`);
      } else {
        const fallbackTitles = { note: "Note", tip: "Tip", important: "Important", warning: "Warning", caution: "Caution" };
        const title = customTitle || fallbackTitles[type] || type;
        html.push(`<div class="${type}"><span class="admonition-title">${escapeHtml(title)}</span>${innerHtml}</div>`);
      }
      continue;
    }

    const headingMatch = line.match(/^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const title = headingMatch[2];
      const id = createHeadingSlug(title, context);
      const rail = level <= 2 ? ` data-rail-title="${escapeHtml(plainMarkdownText(title))}" data-rail-level="${level}"` : "";
      html.push(`<h${level} id="${escapeHtml(id)}"${rail}>${renderMarkdownInline(title, context)}</h${level}>`);
      index += 1;
      continue;
    }

    const singleLineMath = line.match(/^ {0,3}\$\$\s*(\S.*?)\s*\$\$\s*$/);
    if (singleLineMath) {
      html.push(`<div class="math-display-block">${renderKatexMath(singleLineMath[1], true)}</div>`);
      index += 1;
      continue;
    }

    if (/^ {0,3}\$\$\s*$/.test(line)) {
      const formula = [];
      index += 1;
      while (index < lines.length && !/^ {0,3}\$\$\s*$/.test(lines[index])) {
        formula.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      html.push(`<div class="math-display-block">${renderKatexMath(formula.join("\n"), true)}</div>`);
      continue;
    }

    if (isMarkdownHr(line)) {
      html.push("<hr>");
      index += 1;
      continue;
    }

    if (isMarkdownTable(lines, index)) {
      const rendered = renderMarkdownTable(lines, index, context);
      html.push(rendered.html);
      index = rendered.next;
      continue;
    }

    if (isMarkdownList(line)) {
      const rendered = renderMarkdownList(lines, index, context);
      html.push(rendered.html);
      index = rendered.next;
      continue;
    }

    if (isMarkdownQuote(line)) {
      const quote = [];
      while (index < lines.length && isMarkdownQuote(lines[index])) {
        quote.push(lines[index].replace(/^ {0,3}>\s?/, ""));
        index += 1;
      }
      html.push(`<blockquote>${renderMarkdownBlocks(quote.join("\n"), context)}</blockquote>`);
      continue;
    }

    if (isMarkdownRawHtml(line)) {
      const raw = [];
      while (index < lines.length && lines[index].trim()) {
        raw.push(lines[index]);
        index += 1;
      }
      html.push(raw.join("\n"));
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && !isMarkdownBlockStart(lines, index)) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    html.push(`<p>${renderMarkdownInline(paragraph.join(" "), context)}</p>`);
  }

  return html.join("\n");
}

function renderMarkdownDocument(rawMarkdown, options = {}) {
  const markdown = stripMarkdownFrontMatter(rawMarkdown);
  const body = options.stripLeadingTitle
    ? stripLeadingMarkdownTitle(markdown, options.title)
    : markdown;
  const extracted = extractMarkdownFootnotes(body);
  const context = {
    basePath: options.basePath || "",
    headingSlugs: new Map(),
    footnotes: extracted.footnotes,
    footnoteOrder: [],
  };
  return `${renderMarkdownBlocks(extracted.markdown, context)}${renderMarkdownFootnotes(context)}`;
}

function createMarkdownLoadingSection(text) {
  const section = document.createElement("section");
  section.className = "article-section article-markdown-section article-markdown-state reveal is-visible";
  const message = document.createElement("p");
  message.textContent = text;
  section.appendChild(message);
  return section;
}

async function fetchMarkdownContent(path) {
  const response = await fetch(encodeContentPath(path), { cache: "no-store" });
  if (!response.ok) throw new Error(`Markdown fetch failed: ${response.status}`);
  return response.text();
}

let markdownScrollObserver = null;

function getMarkdownScrollObserver() {
  if (markdownScrollObserver) return markdownScrollObserver;
  markdownScrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-visible", entry.isIntersecting);
    });
  }, {
    threshold: 0.08,
    rootMargin: "0px 0px -6% 0px",
  });
  return markdownScrollObserver;
}

function copyTextWithFallback(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const field = document.createElement("textarea");
  field.value = text;
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  document.execCommand("copy");
  field.remove();
  return Promise.resolve();
}

function enhanceMarkdownContent(container) {
  if (!container) return;

  const copyIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
  const checkIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

  container.querySelectorAll("pre").forEach((block) => {
    if (block.parentElement?.classList.contains("code-block-wrapper")) return;
    const wrapper = document.createElement("div");
    wrapper.className = "code-block-wrapper";
    block.parentNode.insertBefore(wrapper, block);
    wrapper.appendChild(block);
    const button = document.createElement("button");
    button.className = "copy-btn";
    button.type = "button";
    button.setAttribute("aria-label", "Copy code");
    button.innerHTML = `<span class="icon-copy">${copyIcon}</span><span class="icon-check">${checkIcon}</span>`;
    wrapper.appendChild(button);
    button.addEventListener("click", async () => {
      const code = block.querySelector("code");
      await copyTextWithFallback(code ? code.innerText : block.innerText);
      button.classList.add("copied");
      window.setTimeout(() => button.classList.remove("copied"), 2000);
    });
  });

  container.querySelectorAll(".spoiler").forEach((spoiler) => {
    if (spoiler.dataset.spoilerBound) return;
    spoiler.dataset.spoilerBound = "true";
    let timer = 0;
    spoiler.addEventListener("click", () => {
      spoiler.classList.add("revealed");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => spoiler.classList.remove("revealed"), 3000);
    });
  });

  const observer = getMarkdownScrollObserver();
  container.querySelectorAll("h1, h2, h3, h4, h5, h6, p, blockquote, ul, ol, figure, .markdown-table-wrap, .math-display-block, .code-block-wrapper, .note, .tip, .important, .warning, .caution, .quote, hr, section[data-footnotes]").forEach((node) => {
    node.classList.add("markdown-scroll-fade");
    observer.observe(node);
  });
}

function refreshArticleReadingRail() {
  cleanupRoutedReadingRail();
  document.getElementById("reading-rail")?.removeAttribute("data-rail-bound");
  bindRoutedArticlePage(document);
}

function formatLicenseCardDate(value) {
  const date = parsePostDate(value);
  if (Number.isNaN(date.getTime())) return String(value || "");
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

function createArticleLicenseCard(post) {
  const section = document.createElement("section");
  section.className = "article-license-section reveal is-visible";
  const card = document.createElement("div");
  card.className = "article-license-card markdown-scroll-fade is-visible";

  const title = document.createElement("div");
  title.className = "article-license-title";
  title.textContent = post.title;

  const url = document.createElement("a");
  url.className = "article-license-url";
  url.href = window.location.href;
  url.textContent = decodeURIComponent(window.location.href);

  const grid = document.createElement("div");
  grid.className = "article-license-grid";
  [
    ["作者", post.author || "liyj"],
    ["发布时间", formatLicenseCardDate(post.date)],
    ["许可协议", "CC BY-NC-SA 4.0"],
  ].forEach(([labelText, valueText], index) => {
    const item = document.createElement("div");
    const label = document.createElement("div");
    label.className = "article-license-label";
    label.textContent = labelText;
    const value = index === 2 ? document.createElement("a") : document.createElement("div");
    value.className = "article-license-value";
    value.textContent = valueText;
    if (index === 2) {
      value.href = "https://creativecommons.org/licenses/by-nc-sa/4.0/";
      value.target = "_blank";
      value.rel = "noreferrer";
    }
    item.append(label, value);
    grid.appendChild(item);
  });

  const mark = document.createElement("div");
  mark.className = "article-license-watermark";
  mark.setAttribute("aria-hidden", "true");
  mark.textContent = "CC";

  card.append(title, url, grid, mark);
  section.appendChild(card);
  return section;
}

async function renderMarkdownEntry(entry, {
  shell,
  page,
  renderedKey,
  includeLicense = false,
  stripLeadingTitle = false,
  loadingText = "Markdown 正在读取中...",
  errorText = "Markdown 文件读取失败，请检查索引中的 contentPath。",
  fallback,
}) {
  const markdownPath = entry.contentPath || entry.importedPath;
  shell.querySelectorAll(".article-section, .article-license-section").forEach((section) => section.remove());
  if (!markdownPath) {
    if (typeof fallback === "function") {
      fallback();
      return;
    }
  }

  const state = createMarkdownLoadingSection(loadingText);
  shell.appendChild(state);

  try {
    if (!markdownPath) throw new Error("No markdown content path");
    const rawMarkdown = await fetchMarkdownContent(markdownPath);
    const section = document.createElement("section");
    section.className = "article-section article-markdown-section reveal is-visible";
    const content = document.createElement("div");
    content.className = "markdown-content onload-animation";
    content.setAttribute("data-pagefind-body", "");
    content.innerHTML = renderMarkdownDocument(rawMarkdown, {
      basePath: markdownPath,
      title: entry.title,
      stripLeadingTitle,
    });
    section.appendChild(content);
    state.replaceWith(section);
    if (includeLicense) {
      section.insertAdjacentElement("afterend", createArticleLicenseCard(entry));
    }
    enhanceMarkdownContent(content);
    observeRouteReveals(page);
    refreshArticleReadingRail();
    page.dataset[renderedKey] = "true";
  } catch (error) {
    if (typeof fallback === "function") {
      state.remove();
      fallback();
      return;
    }
    state.classList.add("is-error");
    state.replaceChildren(createTextNodeElement("p", "", errorText));
    page.dataset[renderedKey] = "error";
  }
}

async function renderArticleMarkdown(post, { shell, hero, page }) {
  return renderMarkdownEntry(post, {
    shell,
    page,
    renderedKey: "articleRendered",
    includeLicense: true,
  });
}

function createDetailSection({ id, railTitle, title, paragraphs, quote }) {
  const section = document.createElement("section");
  section.className = "article-section reveal";
  section.id = id;
  section.dataset.railTitle = railTitle || title;
  section.appendChild(createTextNodeElement("h2", "", title));
  paragraphs.forEach((paragraph) => section.appendChild(createTextNodeElement("p", "", paragraph)));
  if (quote) section.appendChild(createTextNodeElement("blockquote", "", quote));
  return section;
}

function buildPostDetailSections(post) {
  const tagText = post.tags?.length ? post.tags.join("、") : post.category;
  return [
    {
      id: "context",
      railTitle: "背景",
      title: "为什么记录",
      paragraphs: [
        "《" + post.title + "》记录于 " + formatFullDate(post.date) + "，归档在「" + post.category + "」。",
        "这篇内容关联 " + tagText + "，主要用于保存当时的判断、上下文和后续可以复用的线索。",
      ],
    },
    {
      id: "process",
      railTitle: "处理方式",
      title: "处理方式",
      paragraphs: [
        "先保留可验证的事实，再把需要继续判断的部分放到后续更新里。",
        "围绕《" + post.title + "》，这里会优先保留关键事实和可复用步骤。",
      ],
    },
    {
      id: "takeaway",
      railTitle: "结论",
      title: "留下来的结论",
      paragraphs: [
        "这不是最终答案，而是后续继续展开的索引。",
        "再次遇到与《" + post.title + "》相关的问题时，可以从这里继续补充。",
      ],
      quote: "先把可复用的部分写下来，剩下的判断以后再更新。",
    },
  ];
}

function buildNoteDetailSections(note) {
  const meta = noteCategoryMeta[note.type] || { title: note.type || "手记" };
  return [
    {
      id: "state",
      railTitle: "状态",
      title: "当时的状态",
      paragraphs: [
        "这则「" + meta.title + "」写于 " + formatSlashDate(note.date) + "。",
        note.summary || "这一天先把与《" + note.title + "》相关的片段保存下来。",
      ],
    },
    {
      id: "fragment",
      railTitle: "片段",
      title: "记下来的事情",
      paragraphs: [
        "围绕《" + note.title + "》，这里更像是一段时间戳。",
        "手记不需要给出完整答案，它只需要保留当时的气味、节奏和一点还没有整理完的想法。",
      ],
    },
    {
      id: "after",
      railTitle: "之后",
      title: "留给之后",
      paragraphs: [
        "之后再回看这则记录时，重点是理解那时为什么会写下《" + note.title + "》。",
      ],
      quote: "先记录，再慢慢理解。",
    },
  ];
}

function renderNoteFallbackSections(note, { shell, page }) {
  shell.querySelectorAll(".article-section, .article-license-section").forEach((section) => section.remove());
  buildNoteDetailSections(note).forEach((section) => shell.appendChild(createDetailSection(section)));
  observeRouteReveals(page);
  refreshArticleReadingRail();
  page.dataset.noteRendered = "true";
}

async function renderNoteMarkdown(note, { shell, page }) {
  return renderMarkdownEntry(note, {
    shell,
    page,
    renderedKey: "noteRendered",
    includeLicense: false,
    stripLeadingTitle: true,
    loadingText: "手记 Markdown 正在读取中...",
    errorText: "手记 Markdown 文件读取失败，请检查索引中的 contentPath。",
    fallback: () => renderNoteFallbackSections(note, { shell, page }),
  });
}

function createArticleSummaryBlock(post) {
  const summary = document.createElement("div");
  summary.className = "article-summary";

  const label = document.createElement("span");
  label.className = "article-summary-label";
  label.textContent = "概要：";

  const body = document.createElement("p");
  body.className = "article-summary-body";
  body.textContent = post.summary || "";

  summary.append(label, body);
  return summary;
}

const articleMetaIconPaths = {
  calendar: '<path d="M8 2v4M16 2v4M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01"/>',
  pen: '<path d="M12 19 5 21l2-7L17.5 3.5a2.1 2.1 0 0 1 3 3L10 17Z"/><path d="m15 6 3 3M7 14l3 3"/>',
  tag: '<path d="M20 12.5 12.5 20a2 2 0 0 1-2.83 0L4 14.33V4h10.33L20 9.67a2 2 0 0 1 0 2.83Z"/><path d="M8.5 8.5h.01"/>',
  category: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h3L12 6.5h5.5A2.5 2.5 0 0 1 20 9v7.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5Z"/><path d="M4 10h16"/>',
  edit: '<path d="m4 20 4.5-1L19 8.5 15.5 5 5 15.5Z"/><path d="m14.5 6 3.5 3.5"/>',
};

function createArticleMetaIcon(kind, label) {
  const icon = document.createElement("span");
  icon.className = "article-meta-icon";
  icon.title = label;
  icon.setAttribute("aria-label", label);
  icon.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${articleMetaIconPaths[kind] || articleMetaIconPaths.tag}</svg>`;
  return icon;
}

function createArticleMetaBlock(post) {
  const meta = document.createElement("div");
  meta.className = "article-meta article-meta-panel";
  const items = [
    { label: "时间", icon: "calendar", value: formatSlashDate(post.date) },
    { label: "分类", icon: "category", value: post.category },
    post.wordCount ? { label: "字数", icon: "pen", value: String(post.wordCount) + " 字" } : null,
    post.updated && post.updated !== post.date ? { label: "修改", icon: "edit", value: formatSlashDate(post.updated) } : null,
    post.tags?.length ? { label: "标签", icon: "tag", value: post.tags.join("、") } : null,
  ].filter(Boolean);

  items.forEach(({ label, icon, value }) => {
    const item = document.createElement("span");
    item.className = "article-meta-item";
    item.append(createArticleMetaIcon(icon, label), document.createTextNode(value));
    meta.appendChild(item);
  });

  return meta;
}

function renderArticleDetailPage(root = document) {
  if (!window.location.pathname.endsWith("article.html")) return;
  const page = root.querySelector(".article-page");
  const shell = page?.querySelector(".article-shell");
  const hero = shell?.querySelector(".article-hero");
  if (!page || !shell || !hero || ["true", "loading", "waiting"].includes(page.dataset.articleRendered)) return;
  if (!frontendIndexState.ready) {
    page.dataset.articleRendered = "waiting";
    loadFrontendIndexes().then(() => {
      if (!document.body.contains(page)) return;
      page.removeAttribute("data-article-rendered");
      renderArticleDetailPage(root);
    });
    return;
  }

  const post = getPostFromUrl();
  if (!post) return;

  page.dataset.articleRendered = "loading";
  document.title = post.title + " - 文稿 - Replica";
  hero.id = "intro";
  hero.dataset.railTitle = post.title;
  hero.replaceChildren(
    createTextNodeElement("h1", "article-title", post.title),
    createArticleSummaryBlock(post),
    createArticleMetaBlock(post),
  );

  renderArticleMarkdown(post, { shell, hero, page });
}

function renderNoteDetailPage(root = document) {
  if (!window.location.pathname.endsWith("note-ai.html")) return;
  const page = root.querySelector(".article-page");
  const shell = page?.querySelector(".article-shell");
  const hero = shell?.querySelector(".article-hero");
  if (!page || !shell || !hero || ["true", "loading", "waiting"].includes(page.dataset.noteRendered)) return;
  if (!frontendIndexState.ready) {
    page.dataset.noteRendered = "waiting";
    loadFrontendIndexes().then(() => {
      if (!document.body.contains(page)) return;
      page.removeAttribute("data-note-rendered");
      renderNoteDetailPage(root);
    });
    return;
  }

  const note = getNoteFromUrl();
  if (!note) return;

  page.dataset.noteRendered = "loading";
  page.classList.add("note-detail");
  document.title = note.title + " - 手记 - Replica";
  hero.id = "note-intro";
  hero.dataset.railTitle = note.title;
  hero.replaceChildren(
    createTextNodeElement("p", "eyebrow", "NOTE / " + note.type),
    createTextNodeElement("h1", "", note.title),
    createTextNodeElement("p", "article-subtitle", note.summary || "写于 " + formatSlashDate(note.date) + " 的一则手记。"),
  );
  const meta = document.createElement("div");
  meta.className = "article-meta";
  [formatSlashDate(note.date), note.type].forEach((item) => meta.appendChild(createTextNodeElement("span", "", item)));
  hero.appendChild(meta);

  renderNoteMarkdown(note, { shell, page });
}

function createPostListRow(post) {
  const row = document.createElement("article");
  row.className = "article-row";
  row.dataset.postItem = "";
  row.dataset.tags = [post.category, ...(post.tags || [])].join(" ");
  row.dataset.created = post.date;
  row.dataset.updated = post.updated || post.date;

  const link = document.createElement("a");
  link.href = getArticleUrl(post);
  const title = document.createElement("h2");
  title.textContent = post.title;
  const summary = document.createElement("p");
  summary.textContent = post.summary || "";
  const foot = document.createElement("div");
  foot.className = "article-foot";
  const date = document.createElement("time");
  date.textContent = formatSlashDate(post.date);
  const category = document.createElement("span");
  category.className = "article-foot-action article-category-mark";
  category.dataset.label = post.category;
  category.textContent = post.category;
  foot.append(date, createTextNodeElement("span", "article-foot-separator", "·"), category);
  (post.tags || []).forEach((tag) => {
    const tagNode = document.createElement("span");
    tagNode.className = "article-foot-action article-tag-mark";
    tagNode.dataset.label = tag;
    tagNode.textContent = tag;
    foot.append(createTextNodeElement("span", "article-foot-separator", "/"), tagNode);
  });
  link.append(title, summary, foot);
  row.appendChild(link);
  return row;
}

function renderPostsIndexPage(root = document) {
  const postsPage = root.querySelector(".posts-page");
  if (!postsPage || !frontendIndexState.ready) return;
  const posts = getAllPostDetails();
  const articleList = postsPage.querySelector(".article-list");
  const count = postsPage.querySelector(".posts-count-sort > span");
  const tagCloud = postsPage.querySelector(".tag-cloud");
  if (!articleList) return;

  articleList.replaceChildren(...posts.map(createPostListRow));
  if (count) count.textContent = `共 ${posts.length} 篇`;

  if (tagCloud) {
    const tagCounts = new Map();
    posts.forEach((post) => {
      [post.category, ...(post.tags || [])].filter(Boolean).forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    tagCloud.replaceChildren(...Array.from(tagCounts.entries()).map(([tag, total]) => {
      const button = document.createElement("button");
      button.className = "tag-chip";
      button.type = "button";
      button.dataset.postTag = tag;
      button.append(document.createTextNode(`${tag} `));
      const number = document.createElement("span");
      number.textContent = `(${total})`;
      button.appendChild(number);
      return button;
    }));
  }

  delete postsPage.dataset.pjaxBound;
  runStaggerReveal(articleList.querySelectorAll(".article-row"), {
    baseDelay: 80,
    interval: 42,
    duration: 520,
  });
}

function getNoteBadgeClass(type) {
  return {
    "一日笺": "badge-daily",
    "七日札": "badge-weekly",
    "月痕录": "badge-monthly",
    "岁时书": "badge-yearly",
    "山河记": "badge-travel",
  }[type] || "badge-daily";
}

function createNoteReadAction(label = "阅读全文") {
  const action = document.createElement("span");
  action.className = "note-read-action";
  const text = document.createElement("p");
  text.className = "note-read-action-label";
  text.dataset.label = label;
  text.textContent = label;
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("fill", "none");
  icon.setAttribute("stroke", "currentColor");
  icon.setAttribute("stroke-width", "4");
  icon.setAttribute("aria-hidden", "true");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  path.setAttribute("d", "M14 5l7 7m0 0l-7 7m7-7H3");
  icon.appendChild(path);
  action.append(text, icon);
  return action;
}

function createNoteLetterRow(note, index) {
  const row = document.createElement("article");
  row.className = "note-letter-row";
  row.dataset.noteItem = "";
  row.dataset.noteType = note.type;
  row.dataset.noteDate = note.date;

  const date = parsePostDate(note.date);
  const rail = document.createElement("div");
  rail.className = "note-date-rail";
  const day = document.createElement("span");
  day.textContent = String(date.getDate()).padStart(2, "0");
  const month = document.createElement("small");
  month.textContent = `${date.getMonth() + 1}月`;
  rail.append(day, month, document.createElement("b"));

  const link = document.createElement("a");
  link.className = `note-letter-card${note.type === "山河记" ? " has-ribbon" : ""}`;
  link.href = getNoteUrl(note);
  const header = document.createElement("header");
  const badge = document.createElement("span");
  badge.className = `letter-badge ${getNoteBadgeClass(note.type)}`;
  badge.textContent = note.type;
  const small = document.createElement("small");
  small.textContent = [note.weather, note.mood].filter(Boolean).join(" / ") || "片刻";
  header.append(badge, small);
  const title = document.createElement("h3");
  title.textContent = note.title;
  const summary = document.createElement("p");
  summary.textContent = note.summary || `${note.type} / ${note.wordCount || 0} 字`;
  const footer = document.createElement("footer");
  const number = document.createElement("span");
  number.textContent = `LETTER No.${index + 1}`;
  footer.append(number, createNoteReadAction());
  link.append(header, title, summary, footer);
  row.append(rail, link);
  return row;
}

function renderNotesIndexPage(root = document) {
  const notesPage = root.querySelector(".notes-index");
  if (!notesPage || !frontendIndexState.ready) return;
  const shell = notesPage.querySelector(".notes-letter-shell");
  if (!shell) return;
  const notes = getSortedNotes("all");

  const years = notes.reduce((map, note) => {
    const year = String(parsePostDate(note.date).getFullYear());
    if (!map.has(year)) map.set(year, []);
    map.get(year).push(note);
    return map;
  }, new Map());

  const sections = Array.from(years.entries()).map(([year, yearNotes]) => {
    const section = document.createElement("section");
    section.className = "note-year-section reveal is-visible";
    const header = document.createElement("header");
    header.className = "note-year-heading";
    const label = document.createElement("div");
    label.innerHTML = `<span>ANNO</span><h2>${year}</h2>`;
    const count = document.createElement("p");
    count.textContent = `${yearNotes.length} LETTERS`;
    header.append(label, count);
    const list = document.createElement("div");
    list.className = "note-letter-list";
    yearNotes.forEach((note, index) => list.appendChild(createNoteLetterRow(note, notes.length - index - 1)));
    section.append(header, list);
    return section;
  });

  shell.replaceChildren(...sections);
  delete notesPage.dataset.pjaxBound;
  runStaggerReveal(shell.querySelectorAll(".note-year-heading, .note-letter-row"), {
    baseDelay: 90,
    interval: 42,
    duration: 520,
  });
}

function buildIndexTimelineEntries() {
  const posts = getAllPostDetails().map((post) => ({
    date: post.date,
    title: post.title,
    href: getArticleUrl(post),
    kind: "鍗氭枃",
    meta: post.category,
    key: `${post.date}-${post.title}`,
  }));
  const notes = getSortedNotes("all").map((note) => ({
    date: note.date,
    title: note.title,
    href: getNoteUrl(note),
    kind: "手记",
    meta: [note.mood && `心情：${note.mood}`, note.weather && `天气：${note.weather}`, note.type].filter(Boolean).join(" / "),
    key: `${note.date}-${note.title}`,
  }));
  return [...posts, ...notes].sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date));
}

function renderTimelineArchiveFromEntries(timelinePage, entries) {
  const archive = timelinePage?.querySelector("[data-timeline-archive]");
  if (!archive) return;
  const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
  const monthCodes = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const byYear = entries.reduce((years, entry) => {
    const date = parsePostDate(entry.date);
    const year = date.getFullYear();
    const month = date.getMonth();
    if (!years.has(year)) years.set(year, new Map());
    if (!years.get(year).has(month)) years.get(year).set(month, []);
    years.get(year).get(month).push(entry);
    return years;
  }, new Map());

  archive.replaceChildren(...Array.from(byYear.entries()).map(([year, months]) => {
    const total = Array.from(months.values()).reduce((sum, items) => sum + items.length, 0);
    const block = document.createElement("section");
    block.className = "timeline-year-block reveal is-visible";
    const heading = document.createElement("header");
    heading.className = "timeline-year-heading";
    heading.innerHTML = `<h2>${year}</h2><span>本年 ${total} 篇</span>`;
    block.appendChild(heading);

    Array.from(months.entries()).sort((a, b) => b[0] - a[0]).forEach(([month, monthEntries]) => {
      const monthBlock = document.createElement("section");
      monthBlock.className = "timeline-month-block";
      const monthHeading = document.createElement("h3");
      monthHeading.textContent = `${monthNames[month]} / ${monthCodes[month]}`;
      monthBlock.appendChild(monthHeading);
      monthEntries.forEach((entry) => {
        const link = document.createElement("a");
        link.className = "timeline-row";
        link.href = entry.href;
        link.dataset.timelineSearch = `${entry.title} ${entry.meta} ${entry.kind}`.toLowerCase();
        const date = parsePostDate(entry.date);
        const day = document.createElement("span");
        day.className = "timeline-day";
        day.textContent = String(date.getDate()).padStart(2, "0");
        const title = document.createElement("strong");
        title.textContent = entry.title;
        const meta = document.createElement("em");
        meta.textContent = `${entry.meta} / ${entry.kind}`;
        link.append(day, title, meta);
        monthBlock.appendChild(link);
      });
      block.appendChild(monthBlock);
    });
    return block;
  }));

  archive.classList.add("is-visible");
  runStaggerReveal(archive.querySelectorAll(".timeline-year-heading, .timeline-month-block h3, .timeline-row"), {
    baseDelay: 70,
    interval: 24,
    duration: 520,
  });
}

function renderTimelineIndexPage(root = document) {
  const timelinePage = root.querySelector("[data-timeline-page]");
  if (!timelinePage || !frontendIndexState.ready) return;
  const entries = buildIndexTimelineEntries();
  const count = timelinePage.querySelector("[data-timeline-count]");
  const totalWords = timelinePage.querySelector("[data-timeline-total-words]");
  if (count) count.textContent = String(entries.length);
  if (totalWords) totalWords.textContent = String(getAllArticleWordCount());
  renderTimelineArchiveFromEntries(timelinePage, entries);
  delete timelinePage.dataset.pjaxBound;
}

function renderHomeIndexPage(root = document) {
  const home = root.querySelector(".wibus-home");
  if (!home || !frontendIndexState.ready) return;
  const posts = getAllPostDetails();
  const notes = getSortedNotes("all");
  const featured = home.querySelector(".home-featured-writing");
  const list = home.querySelector(".home-writing-list");
  const stats = home.querySelector(".wibus-stats");
  if (stats) stats.textContent = `${posts.length} posts / ${notes.length} notes / ${getTimelineProgressSnapshot().dayOfYear} days`;
  if (featured && posts[0]) {
    featured.href = getArticleUrl(posts[0]);
    featured.querySelector(".home-featured-type").textContent = posts[0].category;
    featured.querySelector("strong").textContent = posts[0].title;
    featured.querySelector("em").textContent = posts[0].summary || `${posts[0].wordCount || 0} 字`;
    featured.querySelector("small").textContent = `${formatFullDate(posts[0].date)} / ${posts[0].category}`;
  }
  if (list) {
    const items = [...posts.slice(1, 4).map((post) => ({ ...post, href: getArticleUrl(post), meta: `${post.category} / 文稿` })),
      ...notes.slice(0, 1).map((note) => ({ ...note, href: getNoteUrl(note), meta: `手记 / ${note.type}` }))];
    list.replaceChildren(...items.map((item) => {
      const link = document.createElement("a");
      link.href = item.href;
      const time = document.createElement("time");
      time.textContent = formatSlashDate(item.date);
      const title = document.createElement("span");
      title.textContent = item.title;
      const meta = document.createElement("small");
      meta.textContent = item.meta;
      link.append(time, title, meta);
      return link;
    }));
  }
}

function refreshHomeMegaPanel() {
  if (!homeMegaPanel || !frontendIndexState.ready) return;
  const posts = getAllPostDetails();
  const notes = getSortedNotes("all");
  const stats = homeMegaPanel.querySelectorAll(".home-mega-stats div strong");
  if (stats[0]) stats[0].textContent = String(posts.length);
  if (stats[1]) stats[1].textContent = String(notes.length);
  if (stats[2]) stats[2].textContent = String(getTimelineProgressSnapshot().dayOfYear);
  const feed = homeMegaPanel.querySelector(".home-mega-feed");
  if (!feed) return;
  const label = feed.querySelector("p") || document.createElement("p");
  label.textContent = "近作";
  const items = [...posts.slice(0, 2).map((post) => ({ title: post.title, date: post.date, href: getArticleUrl(post) })),
    ...notes.slice(0, 1).map((note) => ({ title: note.title, date: note.date, href: getNoteUrl(note) }))];
  feed.replaceChildren(label, ...items.map((item) => {
    const link = document.createElement("a");
    link.href = item.href;
    const title = document.createElement("span");
    title.textContent = item.title;
    const time = document.createElement("time");
    time.textContent = formatDotDate(item.date).slice(5);
    link.append(title, time);
    attachPjaxLinkHandler(link);
    return link;
  }));
}

function renderIndexBackedCurrentPage(root = document, options = {}) {
  if (!frontendIndexState.ready) return;
  rebuildPostsMegaControls();
  refreshHomeMegaPanel();
  renderHomeIndexPage(root);
  renderPostsIndexPage(root);
  renderNotesIndexPage(root);
  renderTimelineIndexPage(root);
  if (root === document && typeof window.__refreshIndexTimelinePage === "function" && document.querySelector("[data-timeline-page]")) {
    window.__refreshIndexTimelinePage();
  }

  const categoryPage = root.querySelector("[data-category-page]");
  if (categoryPage) {
    categoryPage.removeAttribute("data-category-rendered");
    renderCategoryPage(categoryPage);
  }

  const noteCategoryPage = root.querySelector("[data-note-category-page]");
  if (noteCategoryPage) {
    noteCategoryPage.removeAttribute("data-note-category-rendered");
    noteCategoryPage.removeAttribute("data-note-category-rendered-for");
    renderNoteCategoryPage(noteCategoryPage);
  }

  root.querySelector(".article-page")?.removeAttribute("data-article-rendered");
  root.querySelector(".article-page")?.removeAttribute("data-note-rendered");
  renderArticleDetailPage(root);
  renderNoteDetailPage(root);
  normalizeDetailLinks(root);
  renderPostsMegaRecent();
  renderNotesMegaRecent();
  syncTimelineMega();

  if (options.rebind) {
    bindRoutedPostsPage(root);
    bindRoutedTimelinePage(root);
    observeRouteReveals(root);
  }
}

function getFirstTextBySelectors(container, selectors) {
  if (!container) return "";
  for (const selector of selectors) {
    const text = container.querySelector(selector)?.textContent?.trim();
    if (text) return text;
  }
  return "";
}

function getArticleTitleFromLink(link) {
  const container = link.closest("[data-post-item], .category-post-row, .timeline-row, .timeline-mega-feed a, .home-featured-writing, .home-writing-list a, .home-mega-feed a, .posts-mega-list a");
  return getFirstTextBySelectors(container, ["h2", ".category-post-title", ".mega-title", "strong", ".home-writing-list span", ".timeline-mega-feed span"])
    || getFirstTextBySelectors(link, ["h2", ".category-post-title", ".mega-title", "strong", "span"])
    || "";
}

function getNoteTitleFromLink(link) {
  const container = link.closest("[data-note-item], .note-category-row, .timeline-row, .timeline-mega-feed a, .home-writing-list a, .home-mega-feed a, .notes-mega-feed a, .note-letter-row");
  return getFirstTextBySelectors(container, [".latest-note-head h1", ".note-letter-card h3", ".mega-title", ".note-category-row span", "strong", "h1", "h2", "h3", ".home-writing-list span", ".timeline-mega-feed span"])
    || getFirstTextBySelectors(link, [".mega-title", "strong", "h1", "h2", "h3", "span:not(.letter-badge):not(.timeline-day)"])
    || "";
}

function normalizeDetailLinks(root = document) {
  root.querySelectorAll("a[href]").forEach((link) => {
    const rawHref = link.getAttribute("href") || "";
    const url = new URL(rawHref, window.location.href);
    if (url.pathname.endsWith("/article.html")) {
      const title = getArticleTitleFromLink(link);
      if (title) link.href = getArticleUrl(title);
    }
    if (url.pathname.endsWith("/note-ai.html")) {
      const title = getNoteTitleFromLink(link);
      if (title) link.href = getNoteUrl(title);
    }
  });
}

normalizeDetailLinks(document);
renderArticleDetailPage(document);
renderNoteDetailPage(document);

document.addEventListener("click", (event) => {
  closeFloatingMenus(event.target);
});

document.addEventListener("click", (event) => {
  if (event.defaultPrevented) return;
  const link = event.target.closest("a[href]");
  if (!link) return;
  const url = new URL(link.href, window.location.href);
  const samePageHash = url.pathname === window.location.pathname && url.hash;
  const isLocalPage = url.origin === window.location.origin && url.pathname.endsWith(".html");
  const isTimelineReplayLink = url.pathname.endsWith("/timeline.html") && window.location.pathname.endsWith("/timeline.html") && !url.hash;
  if (!isLocalPage || samePageHash || link.target || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }
  if (isTimelineReplayLink) {
    event.preventDefault();
    window.dispatchEvent(new CustomEvent("timeline:replay-progress"));
    return;
  }
  if (canUsePjaxLink(link, url)) return;
  event.preventDefault();
  document.body.classList.add("is-leaving");
  window.setTimeout(() => {
    window.location.href = url.href;
  }, 180);
});

let pjaxNavigationToken = 0;
let pjaxActiveFrame = null;
let routedTimelineStatsTimer = null;

function isTimelineLeapYear(year) {
  return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
}

function getLiveTimelineStats() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  const yearProgress = (dayOfYear / (isTimelineLeapYear(now.getFullYear()) ? 366 : 365)) * 100;
  const dayProgress = ((now.getSeconds() + 60 * (now.getMinutes() + 60 * now.getHours())) / 86400) * 100;
  const dayProgressInteger = Math.trunc(dayProgress);
  const dayProgressFraction = Math.floor((dayProgress - dayProgressInteger) * 100);
  return {
    dayOfYear,
    yearProgress: Math.round(Math.max(0, Math.min(100, yearProgress))),
    dayProgressInteger,
    dayProgressFraction,
    totalWords: getAllArticleWordCount(),
  };
}

function createRouteNumberFlow(target, { minIntegerDigits = 1 } = {}) {
  if (!target) return { set() {}, resetFor() {} };
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  let currentText = "";
  let slots = [];

  function normalize(value) {
    const text = String(value);
    return /^\d+$/.test(text) ? text.padStart(minIntegerDigits, "0") : text;
  }

  function createDigitSlot(startDigit, nextDigit) {
    const digit = document.createElement("span");
    digit.className = "number-flow-digit";
    digit.style.setProperty("--nf-digit", startDigit);
    digit.dataset.digit = String(nextDigit);

    const ribbon = document.createElement("span");
    ribbon.className = "number-flow-ribbon";
    for (let index = 0; index <= 9; index += 1) {
      const item = document.createElement("span");
      item.textContent = String(index);
      ribbon.appendChild(item);
    }

    digit.appendChild(ribbon);
    return { digit, nextDigit };
  }

  function build(fromText, nextText, animate) {
    const flow = document.createElement("span");
    flow.className = "number-flow";
    if (!animate || prefersReducedMotion) flow.classList.add("is-instant");
    slots = [];

    nextText.split("").forEach((char, index) => {
      if (/\d/.test(char)) {
        const startChar = /\d/.test(fromText[index] || "") ? fromText[index] : "0";
        const slot = createDigitSlot(Number(startChar), Number(char));
        slots.push(slot);
        flow.appendChild(slot.digit);
      } else {
        const symbol = document.createElement("span");
        symbol.className = "number-flow-symbol";
        symbol.textContent = char;
        flow.appendChild(symbol);
      }
    });

    target.replaceChildren(flow);

    requestAnimationFrame(() => {
      slots.forEach((slot) => {
        slot.digit.style.setProperty("--nf-digit", slot.nextDigit);
      });
      flow.classList.remove("is-instant");
    });
  }

  function compatible(nextText) {
    const currentChars = currentText.split("");
    const nextChars = nextText.split("");
    return currentChars.length === nextChars.length
      && currentChars.every((char, index) => (/\d/.test(char) && /\d/.test(nextChars[index])) || char === nextChars[index]);
  }

  return {
    resetFor(value) {
      const nextText = normalize(value);
      const zeroText = nextText.replace(/\d/g, "0");
      currentText = zeroText;
      build(zeroText, zeroText, true);
    },
    set(value, options = {}) {
      const nextText = normalize(value);
      const animate = options.animate !== false;
      if (!currentText || !compatible(nextText)) {
        const fromText = (currentText || "0").padStart(nextText.length, "0").slice(-nextText.length);
        build(fromText, nextText, animate);
      } else {
        const flow = target.querySelector(".number-flow");
        if (!animate || prefersReducedMotion) flow?.classList.add("is-instant");
        let digitIndex = 0;
        nextText.split("").forEach((char) => {
          if (!/\d/.test(char)) return;
          const slot = slots[digitIndex];
          if (slot) {
            const nextDigit = Number(char);
            slot.nextDigit = nextDigit;
            slot.digit.dataset.digit = char;
            slot.digit.style.setProperty("--nf-digit", slot.nextDigit);
          }
          digitIndex += 1;
        });
        if (!animate || prefersReducedMotion) requestAnimationFrame(() => flow?.classList.remove("is-instant"));
      }
      currentText = nextText;
    },
  };
}

function getRouteKindFromUrl(url) {
  const pathname = url?.pathname || window.location.pathname;
  const page = pathname.split("/").pop() || "index.html";
  if (page === "index.html") return "home";
  if (["posts.html", "category.html", "article.html"].includes(page)) return "posts";
  if (["notes.html", "note-category.html", "note-ai.html"].includes(page)) return "notes";
  if (page === "timeline.html") return "timeline";
  if (page === "projects.html") return "projects";
  if (["says.html", "thoughts.html"].includes(page)) return "says";
  return "default";
}

function updateRouteLoaderCopy(url) {
  const loader = ensureRouteLoader();
  const kind = getRouteKindFromUrl(url);
  const target = routeLoadingTargets[kind] || routeLoadingTargets.default;
  const line = routeLoadingLines[routeLoadingLineIndex % routeLoadingLines.length];
  routeLoadingLineIndex += 1;
  const lineNode = loader.querySelector("[data-route-loader-line]");
  const targetNode = loader.querySelector("[data-route-loader-target]");
  if (lineNode) lineNode.textContent = line;
  if (targetNode) targetNode.textContent = `正在前往 ${target}`;
}

function ensureRouteLoader() {
  let loader = document.getElementById("route-orb-loader");
  if (loader) return loader;
  loader = document.createElement("div");
  loader.id = "route-orb-loader";
  loader.className = "route-orb-loader";
  loader.setAttribute("aria-hidden", "true");
  loader.innerHTML = `
    <span class="route-loader-orbit">
      <span class="route-orb-wave route-orb-wave-a"></span>
      <span class="route-orb-wave route-orb-wave-b"></span>
      <span class="route-orb-wave route-orb-wave-c"></span>
      <span class="route-orb-core"></span>
    </span>
    <span class="route-loader-copy">
      <span class="route-loader-line" data-route-loader-line>稍候片刻，月出文自明。</span>
      <span class="route-loader-target" data-route-loader-target>正在前往下一页</span>
    </span>
  `;
  document.body.appendChild(loader);
  return loader;
}

function setRouteLoading(loading, url) {
  const loader = ensureRouteLoader();
  if (routeLoadingResolveTimer) {
    window.cancelAnimationFrame(routeLoadingResolveTimer);
    routeLoadingResolveTimer = 0;
  }
  loader.classList.remove("is-resolving");
  if (loading) {
    updateRouteLoaderCopy(url);
  } else {
    loader.classList.add("is-resolving");
    routeLoadingResolveTimer = window.requestAnimationFrame(() => {
      loader.classList.remove("is-resolving");
      routeLoadingResolveTimer = 0;
    });
  }
  document.body.classList.toggle("is-route-loading", loading);
}

function lockRouteLayoutHeight() {
  window.clearTimeout(routeHeightLockTimer);
  routeHeightLockTimer = 0;
  const height = Math.max(
    window.innerHeight,
    document.documentElement.scrollHeight,
    document.body?.scrollHeight || 0,
  );
  document.documentElement.style.setProperty("--route-lock-height", `${height}px`);
  document.body.classList.add("is-route-height-locked");
}

function releaseRouteLayoutHeight(delay = 280) {
  window.clearTimeout(routeHeightLockTimer);
  routeHeightLockTimer = window.setTimeout(() => {
    document.body.classList.remove("is-route-height-locked");
    document.documentElement.style.removeProperty("--route-lock-height");
    routeHeightLockTimer = 0;
  }, delay);
}

function waitForNextPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

function canUsePjaxLink(link, url) {
  const samePageHash = url.pathname === window.location.pathname && url.hash;
  return url.origin === window.location.origin
    && url.pathname.endsWith(".html")
    && !samePageHash
    && !link.target
    && !link.hasAttribute("download");
}

function attachPjaxLinkHandler(link) {
  if (!link || link.dataset.pjaxBound) return;
  link.dataset.pjaxBound = "true";
  link.addEventListener("click", handlePjaxLinkClick, true);
}

function handlePjaxLinkClick(event) {
  if (event.defaultPrevented) return;
  const link = event.target.closest("a[href]");
  if (!link) return;
  const url = new URL(link.href, window.location.href);
  if (!canUsePjaxLink(link, url) || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const sameRoute = url.pathname === window.location.pathname && url.search === window.location.search && !url.hash;
  event.preventDefault();
  event.stopImmediatePropagation();
  closeFloatingMenus();
  link.blur?.();
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  if (sameRoute) {
    if (url.pathname.endsWith("/timeline.html")) replayCopiedTimelineStats(document);
    return;
  }

  if (url.pathname.endsWith("/timeline.html")) {
    try {
      sessionStorage.setItem(TIMELINE_PROGRESS_REPLAY_KEY, "1");
    } catch {}
  }
  navigateWithPjax(url);
}

function getMainAndFooter(doc) {
  const main = doc.querySelector("main");
  const footer = doc.querySelector("footer.footer");
  const readingRail = doc.getElementById("reading-rail");
  return { main, footer, readingRail };
}

function clearRouteTransientAnimationState(root) {
  if (!root) return;
  root.querySelectorAll(".stagger-item, .is-staggered, .route-content-enter, .route-content-exit").forEach((node) => {
    node.classList.remove("stagger-item", "is-staggered", "route-content-enter", "route-content-exit");
    node.style.removeProperty("--stagger-delay");
    node.style.removeProperty("--stagger-duration");
  });
}

function waitForFrameReady(frame) {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("route load timeout")), 6500);
    const poll = window.setInterval(checkReady, 24);

    const cleanup = () => {
      window.clearTimeout(timer);
      window.clearInterval(poll);
      frame.removeEventListener("load", checkReady);
      frame.removeEventListener("error", handleError);
    };

    function checkReady() {
      const doc = frame.contentDocument;
      const href = frame.contentWindow?.location?.href || doc?.URL || "";
      if (!doc || !href || href === "about:blank" || doc.readyState === "loading") return;
      cleanup();
      resolve();
    }

    const handleError = () => {
      cleanup();
      reject(new Error("route load failed"));
    };

    frame.addEventListener("load", checkReady);
    frame.addEventListener("error", handleError);
  });
}

async function renderRouteInFrame(url, token) {
  if (pjaxActiveFrame) {
    pjaxActiveFrame.remove();
    pjaxActiveFrame = null;
  }
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 6500);
  let frameDoc;
  try {
    const response = await fetch(url.href, {
      credentials: "same-origin",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`route fetch failed: ${response.status}`);
    const html = await response.text();
    frameDoc = new DOMParser().parseFromString(html, "text/html");
  } finally {
    window.clearTimeout(timeout);
  }
  if (token !== pjaxNavigationToken) throw new Error("route superseded");
  if (!frameDoc) throw new Error("route document unavailable");
  const { main, footer, readingRail } = getMainAndFooter(frameDoc);
  if (!main) throw new Error("route main unavailable");
  const payload = {
    title: frameDoc.title,
    main: main.cloneNode(true),
    footer: footer?.cloneNode(true) || null,
    readingRail: readingRail?.cloneNode(true) || null,
  };
  clearRouteTransientAnimationState(payload.main);
  clearRouteTransientAnimationState(payload.footer);
  clearRouteTransientAnimationState(payload.readingRail);
  return payload;
}

function observeRouteReveals(root = document) {
  root.querySelectorAll(".reveal").forEach((node) => {
    if (!node.classList.contains("is-visible")) revealObserver.observe(node);
  });
}

function replayCopiedTimelineStats(root = document) {
  const timelinePage = root.querySelector("[data-timeline-page]");
  if (!timelinePage) return;

  if (routedTimelineStatsTimer) {
    window.clearInterval(routedTimelineStatsTimer);
    routedTimelineStatsTimer = null;
  }

  const timelineCount = timelinePage.querySelector("[data-timeline-count]");
  const dayOfYearNode = timelinePage.querySelector("[data-timeline-day]");
  const yearProgressNode = timelinePage.querySelector("[data-timeline-year-progress]");
  const dayProgressNode = timelinePage.querySelector("[data-timeline-day-progress]");
  const totalWordsNode = timelinePage.querySelector("[data-timeline-total-words]");
  if (!dayOfYearNode || !yearProgressNode || !dayProgressNode) return;

  const dayOfYearFlow = createRouteNumberFlow(dayOfYearNode);
  const yearProgressFlow = createRouteNumberFlow(yearProgressNode);
  const totalWordsFlow = createRouteNumberFlow(totalWordsNode);

  dayProgressNode.classList.add("timeline-flow-composite");
  const integerNode = document.createElement("span");
  const dotNode = document.createElement("span");
  const fractionNode = document.createElement("span");
  integerNode.className = "timeline-flow-integer";
  dotNode.className = "timeline-flow-dot";
  dotNode.textContent = ".";
  fractionNode.className = "timeline-flow-fraction";
  dayProgressNode.replaceChildren(integerNode, dotNode, fractionNode);

  const dayProgressIntegerFlow = createRouteNumberFlow(integerNode);
  const dayProgressFractionFlow = createRouteNumberFlow(fractionNode, { minIntegerDigits: 2 });

  function render(stats, options = {}) {
    const animate = options.animate !== false;
    if (timelineCount) {
      const rowCount = timelinePage.querySelectorAll(".timeline-row").length;
      if (rowCount) timelineCount.textContent = String(rowCount);
    }
    dayOfYearFlow.set(stats.dayOfYear, { animate });
    yearProgressFlow.set(stats.yearProgress, { animate });
    dayProgressIntegerFlow.set(stats.dayProgressInteger, { animate });
    dayProgressFractionFlow.set(stats.dayProgressFraction, { animate });
    totalWordsFlow.set(stats.totalWords, { animate });
  }

  const stats = getLiveTimelineStats();
  dayOfYearFlow.set(stats.dayOfYear, { animate: false });
  yearProgressFlow.resetFor(stats.yearProgress);
  dayProgressIntegerFlow.resetFor(stats.dayProgressInteger);
  dayProgressFractionFlow.resetFor(stats.dayProgressFraction);
  totalWordsFlow.resetFor(stats.totalWords);
  timelinePage.classList.add("is-replaying-progress");

  window.setTimeout(() => {
    render(stats);
    window.setTimeout(() => {
      timelinePage.classList.remove("is-replaying-progress");
    }, TIMELINE_PROGRESS_REPLAY_DURATION);
  }, 110);

  routedTimelineStatsTimer = window.setInterval(() => {
    render(getLiveTimelineStats());
  }, 2000);
}

function bindRoutedPostsPage(root = document) {
  const postsPage = root.querySelector(".posts-page");
  if (!postsPage || postsPage.dataset.pjaxBound) return;
  postsPage.dataset.pjaxBound = "true";
  const searchInput = postsPage.querySelector("[data-post-search]");
  const tagButtons = Array.from(postsPage.querySelectorAll("[data-post-tag]"));
  const sortButtons = Array.from(postsPage.querySelectorAll("[data-post-sort]"));
  const postItems = Array.from(postsPage.querySelectorAll("[data-post-item]"));
  const articleList = postsPage.querySelector(".article-list");
  const articleRows = Array.from(postsPage.querySelectorAll(".article-row"));
  let activeTag = "all";

  function animatePostRows(baseDelay = 45) {
    runStaggerReveal(postItems.filter((item) => !item.classList.contains("is-hidden")), {
      baseDelay,
      interval: 50,
      duration: 560,
    });
  }

  function filterPostItems(options = {}) {
    const query = (searchInput?.value || "").trim().toLowerCase();
    postItems.forEach((item) => {
      const text = item.textContent.toLowerCase();
      const tags = (item.dataset.tags || "").toLowerCase();
      const matchesQuery = !query || text.includes(query) || tags.includes(query);
      const matchesTag = activeTag === "all" || tags.split(/\s+/).includes(activeTag);
      item.classList.toggle("is-hidden", !matchesQuery || !matchesTag);
    });
    if (options.animate) animatePostRows(options.baseDelay);
  }

  searchInput?.addEventListener("input", filterPostItems);
  tagButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeTag = (button.dataset.postTag || "all").toLowerCase();
      tagButtons.forEach((tag) => tag.classList.toggle("is-active", tag === button && activeTag !== "all"));
      filterPostItems({ animate: true, baseDelay: 35 });
    });
  });
  sortButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.postSort || "newest";
      sortButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      [...articleRows].sort((a, b) => {
        const key = mode === "updated" ? "updated" : "created";
        const aTime = new Date(a.dataset[key] || 0).getTime();
        const bTime = new Date(b.dataset[key] || 0).getTime();
        return mode === "oldest" ? aTime - bTime : bTime - aTime;
      }).forEach((row) => articleList?.appendChild(row));
      filterPostItems({ animate: true, baseDelay: 40 });
    });
  });
  animatePostRows(100);
}

function bindTimelineSearchForm(root = document) {
  const form = root.querySelector(".timeline-tools .obra-search");
  if (!form || form.dataset.submitBound === "true") return;
  form.dataset.submitBound = "true";
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.querySelector("[data-timeline-search]")?.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function bindRoutedTimelinePage(root = document) {
  const timelinePage = root.querySelector("[data-timeline-page]");
  if (!timelinePage || timelinePage.dataset.pjaxBound) return;
  timelinePage.dataset.pjaxBound = "true";
  const timelineArchive = timelinePage.querySelector("[data-timeline-archive]");
  const timelineSearch = timelinePage.querySelector("[data-timeline-search]");
  const backTopButton = timelinePage.querySelector("[data-timeline-top]");

  timelineSearch?.addEventListener("input", () => {
    const query = timelineSearch.value.trim().toLowerCase();
    timelineArchive?.querySelectorAll(".timeline-row").forEach((row) => {
      row.classList.toggle("is-hidden", query && !row.textContent.toLowerCase().includes(query));
    });
  });
  bindTimelineSearchForm(root);
  backTopButton?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  replayCopiedTimelineStats(root);
}

let routedReadingRailCleanup = null;

function cleanupRoutedReadingRail() {
  if (!routedReadingRailCleanup) return;
  routedReadingRailCleanup();
  routedReadingRailCleanup = null;
}

function bindRoutedArticlePage(root = document) {
  const articlePage = root.querySelector(".article-page");
  const readingRail = document.getElementById("reading-rail");
  if (!articlePage || !readingRail) {
    cleanupRoutedReadingRail();
    return;
  }
  if (readingRail.dataset.railBound) return;

  cleanupRoutedReadingRail();
  readingRail.dataset.railBound = "true";

  const readingRailSvg = readingRail.querySelector("#reading-rail-svg");
  const readingRailBase = readingRail.querySelector("#reading-rail-base");
  const readingRailProgress = readingRail.querySelector("#reading-rail-progress");
  const readingRailDots = readingRail.querySelector("#reading-rail-dots");
  const readingRailLabel = readingRail.querySelector("#reading-rail-label");
  const readingRailTitle = readingRail.querySelector("#reading-rail-title");
  const readingRailPercent = readingRail.querySelector("#reading-rail-percent");
  const readingRailToc = readingRail.querySelector("#reading-rail-toc");
  const readingRailPanelPercent = readingRail.querySelector("#reading-rail-panel-percent");
  const readingRailTop = readingRail.querySelector("#reading-rail-top");

  if (!readingRailSvg || !readingRailBase || !readingRailProgress || !readingRailDots || !readingRailLabel || !readingRailTitle || !readingRailPercent) {
    return;
  }

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const railSections = Array.from(document.querySelectorAll("[data-rail-title]:not(.article-hero)"))
    .map((node, index) => ({
      id: node.id || `rail-section-${index + 1}`,
      title: node.dataset.railTitle || node.textContent.trim(),
      level: Number(node.dataset.railLevel || 1),
      order: index,
      node,
    }))
    .filter((item) => item.node);

  if (!railSections.length) return;

  let railY = 0;
  let railBend = 0;
  let railBendVelocity = 0;
  let railScrollVelocity = 0;
  let railVisibleMix = 0;
  let railLastY = window.scrollY;
  let railLastTime = 0;
  let railActiveId = "";
  let railScrollTimer = 0;
  let railFrame = 0;
  const dotById = new Map();
  const tocLinkById = new Map();
  const railIndexById = new Map(railSections.map((item, index) => [item.id, index]));

  readingRailDots.replaceChildren();
  readingRailToc?.replaceChildren();

  function getRailTitle(item) {
    const heading = item.node.querySelector("h1, h2, [data-heading]");
    const text = (heading?.textContent || item.title || "").trim().replace(/\s+/g, " ");
    return text || "未命名";
  }

  function syncReadingRailToc(activeId) {
    if (!readingRailToc || !activeId) return;
    const activeIndex = railIndexById.get(activeId);
    if (typeof activeIndex !== "number") return;
    tocLinkById.forEach((link, id) => {
      const itemIndex = railIndexById.get(id);
      const distance = Math.min(4, Math.abs((itemIndex ?? activeIndex) - activeIndex));
      link.classList.toggle("is-current", id === activeId);
      link.dataset.tocDistance = String(distance);
    });
    const currentLink = tocLinkById.get(activeId);
    if (!currentLink) return;
    const targetTop = currentLink.offsetTop - (readingRailToc.clientHeight - currentLink.offsetHeight) / 2;
    readingRailToc.scrollTo({
      top: Math.max(0, targetTop),
      behavior: readingRail.matches(":hover") ? "smooth" : "auto",
    });
  }

  railSections.forEach((item, index) => {
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", "8");
    dot.setAttribute("cy", "0");
    dot.setAttribute("r", index === 0 ? "0.95" : "0.72");
    dot.classList.add("reading-rail-dot");
    if (index === 0 || index === railSections.length - 1) dot.classList.add("is-root");
    readingRailDots.appendChild(dot);
    dotById.set(item.id, dot);

    if (readingRailToc) {
      const link = document.createElement("a");
      link.href = `#${item.id}`;
      link.textContent = getRailTitle(item);
      link.dataset.tocLevel = String(item.level || 1);
      link.addEventListener("click", (event) => {
        event.preventDefault();
        item.node.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      readingRailToc.appendChild(link);
      tocLinkById.set(item.id, link);
    }
  });

  function getScrollMax() {
    return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }

  function syncRailHeight() {
    const article = document.querySelector(".article-shell");
    const articleHeight = article?.offsetHeight || document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const lengthMix = clamp(articleHeight / Math.max(1, viewportHeight * 4.8), 0, 1);
    const sectionMix = clamp((railSections.length - 4) * 12, 0, 54);
    const viewportLimit = Math.max(230, viewportHeight - 285);
    const targetHeight = clamp(Math.round(226 + lengthMix * 82 + sectionMix), 230, Math.min(360, viewportLimit));
    readingRail.style.setProperty("--rail-height", `${targetHeight}px`);
  }

  function markRailScrolling() {
    readingRail.classList.add("is-scrolling");
    window.clearTimeout(railScrollTimer);
    railScrollTimer = window.setTimeout(() => {
      readingRail.classList.remove("is-scrolling");
    }, 420);
  }

  function getDocumentTop(node) {
    return node.getBoundingClientRect().top + window.scrollY;
  }

  function getRailItems() {
    const maxScroll = getScrollMax();
    return railSections.map((item) => ({
      ...item,
      title: getRailTitle(item),
      ratio: clamp(getDocumentTop(item.node) / maxScroll, 0, 1),
    }));
  }

  function getActiveRailItem(items) {
    const readLine = window.scrollY + window.innerHeight * 0.42;
    let active = items[0];
    items.forEach((item) => {
      if (getDocumentTop(item.node) <= readLine) active = item;
    });
    return active;
  }

  function showReadingRail() {
    readingRail.classList.toggle("is-visible", window.scrollY >= 70);
  }

  function updateReadingRail(timestamp) {
    if (!document.body.contains(readingRail)) return;

    const height = Math.max(1, readingRail.clientHeight);
    const maxScroll = getScrollMax();
    const scrollRatio = clamp(window.scrollY / maxScroll, 0, 1);
    const readPercent = Math.round(scrollRatio * 100);
    const targetY = scrollRatio * height;
    const delta = Math.min(64, timestamp - railLastTime || 16);
    const ease = 1 - Math.exp(-delta / 130);

    railVisibleMix += ((readingRail.classList.contains("is-visible") ? 1 : 0) - railVisibleMix) * ease;
    railY += (targetY - railY) * Math.min(1, ease * 1.3);

    const currentScrollY = window.scrollY;
    const instantVelocity = ((currentScrollY - railLastY) / Math.max(1, delta)) * 1000;
    railLastY = currentScrollY;
    railScrollVelocity += (instantVelocity - railScrollVelocity) * Math.min(1, delta / 80);

    const bendTarget = Math.min(13, Math.abs(railScrollVelocity) * 0.012);
    const dt = Math.min(delta, 64) / 1000;
    railBendVelocity += (90 * (bendTarget - railBend) - 15 * railBendVelocity) * dt;
    railBend = Math.max(-4, railBend + railBendVelocity * dt);

    const wave = 10.4 + 0.6 * Math.sin((timestamp / 9000) * Math.PI * 2);
    const range = 46 + 1.8 * railBend;
    const edgeFade = Math.max(0, Math.min(1, railY / range, (height - railY) / range));
    const bendX = railVisibleMix * (wave + railBend) * edgeFade;
    const controlX = 8 + bendX;
    const top = Math.max(0, railY - range);
    const bottom = Math.min(height, railY + range);
    const path = `M8 0 L8 ${top} C8 ${railY - 0.45 * range},${controlX} ${railY - 0.3 * range},${controlX} ${railY} C${controlX} ${railY + 0.3 * range},8 ${railY + 0.45 * range},8 ${bottom} L8 ${height}`;

    readingRailSvg.setAttribute("viewBox", `0 0 56 ${height}`);
    readingRailBase.setAttribute("d", path);
    readingRailProgress.setAttribute("d", path);
    readingRailProgress.setAttribute("stroke-dashoffset", String(0.06 - railY / height));
    readingRail.style.setProperty("--rail-clip-top", readingRail.classList.contains("is-visible") ? "-2%" : `${readPercent}%`);
    readingRail.style.setProperty("--rail-clip-bottom", readingRail.classList.contains("is-visible") ? "-2%" : `${100 - readPercent}%`);
    readingRailLabel.style.setProperty("--rail-y", `${railY}px`);
    readingRailPercent.textContent = `${readPercent}%`;
    if (readingRailPanelPercent) readingRailPanelPercent.textContent = `${readPercent}%`;

    const railItems = getRailItems();
    railItems.forEach((item) => {
      const link = tocLinkById.get(item.id);
      if (link && link.textContent !== item.title) link.textContent = item.title;
    });

    const active = getActiveRailItem(railItems);
    if (active && active.id !== railActiveId) {
      railActiveId = active.id;
      readingRailTitle.textContent = active.title;
      dotById.forEach((dot, id) => {
        dot.classList.toggle("is-current", id === railActiveId);
        dot.setAttribute("r", id === railActiveId ? "2.05" : dot.classList.contains("is-root") ? "0.95" : "0.72");
      });
      syncReadingRailToc(railActiveId);
    }

    railItems.forEach((item) => {
      const dot = dotById.get(item.id);
      if (!dot) return;
      const dotY = item.ratio * height;
      const distance = Math.abs(dotY - railY) / range;
      const localBend = distance >= 1 ? 0 : bendX * Math.cos(distance * Math.PI / 2) ** 2;
      dot.setAttribute("cy", String(dotY));
      dot.setAttribute("cx", String(8 + localBend));
    });

    railLastTime = timestamp;
    railFrame = requestAnimationFrame(updateReadingRail);
  }

  const onScroll = () => {
    showReadingRail();
    markRailScrolling();
  };
  const onResize = () => {
    syncRailHeight();
    showReadingRail();
  };
  const onTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  readingRailTop?.addEventListener("click", onTop);

  syncRailHeight();
  showReadingRail();
  railFrame = requestAnimationFrame(updateReadingRail);

  routedReadingRailCleanup = () => {
    window.clearTimeout(railScrollTimer);
    window.cancelAnimationFrame(railFrame);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    readingRailTop?.removeEventListener("click", onTop);
    readingRail.dataset.railBound = "";
  };
}

function bindRoutedGenericInteractions(root = document) {
  root.querySelectorAll(".season-tabs button").forEach((button) => {
    if (button.dataset.pjaxBound) return;
    button.dataset.pjaxBound = "true";
    button.addEventListener("click", () => {
      root.querySelectorAll(".season-tabs button").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
    });
  });

  root.querySelectorAll("[data-theme-choice]").forEach((button) => {
    if (button.dataset.pjaxBound) return;
    button.dataset.pjaxBound = "true";
    button.addEventListener("click", () => {
      root.querySelectorAll("[data-theme-choice]").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      const choice = button.dataset.themeChoice;
      document.documentElement.dataset.theme = choice === "system"
        ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : choice;
    });
  });

  root.querySelectorAll("[data-local-form]").forEach((form) => {
    if (form.dataset.pjaxBound) return;
    form.dataset.pjaxBound = "true";
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const status = document.getElementById("message-status");
      if (status) status.textContent = "Saved in local preview.";
    });
  });
}

function bindRoutedContent(root = document, options = {}) {
  const previousSuppressed = routeInitialAnimationsSuppressed;
  routeInitialAnimationsSuppressed = options.animateInitial === false;
  try {
    renderIndexBackedCurrentPage(root);
    normalizeDetailLinks(root);
    renderArticleDetailPage(root);
    renderNoteDetailPage(root);
    renderCategoryPage(root.querySelector("[data-category-page]"));
    renderNoteCategoryPage(root.querySelector("[data-note-category-page]"));
    observeRouteReveals(root);
    bindRoutedPostsPage(root);
    bindRoutedTimelinePage(root);
    bindRoutedArticlePage(root);
    bindRoutedGenericInteractions(root);
  } finally {
    routeInitialAnimationsSuppressed = previousSuppressed;
  }
}

function getRouteStaggerNodes(root) {
  const selectors = [
    ".article-row",
    ".timeline-month",
    ".timeline-row",
    ".latest-note-paper",
    ".note-letter-row",
    ".note-category-list a",
    ".note-category-row",
    ".category-year-block",
    ".category-post-row",
    ".tag-chip",
    ".blank-page > *",
    ".page-frame > *",
    ".footer > *",
    ".reveal",
  ].join(",");
  const seen = new Set();
  const nodes = Array.from(root.querySelectorAll(selectors)).filter((node) => {
    if (seen.has(node) || node.closest(".main-nav")) return false;
    seen.add(node);
    return true;
  });
  if (nodes.length) return nodes.slice(0, 28);
  return Array.from(root.querySelectorAll("section, article, li, p, h1, h2")).slice(0, 16);
}

function staggerRouteContent(root) {
  runStaggerReveal(getRouteStaggerNodes(root), {
    baseDelay: 0,
    interval: 24,
    duration: 220,
  });
}

function finishRouteContentEntry(...nodes) {
  nodes.filter(Boolean).forEach((node) => {
    const cleanup = () => {
      node.classList.remove("route-content-enter");
      node.removeEventListener("animationend", cleanup);
    };
    node.addEventListener("animationend", cleanup, { once: true });
    window.setTimeout(cleanup, 240);
  });
}

function replaceRouteContent(payload, url, { push = true } = {}) {
  const currentMain = document.querySelector("body > main");
  const currentFooter = document.querySelector("body > footer.footer");
  const currentReadingRail = document.getElementById("reading-rail");
  payload.main.querySelector("[data-note-category-page]")?.removeAttribute("data-note-category-rendered");
  payload.main.querySelector("[data-note-category-page]")?.removeAttribute("data-note-category-rendered-for");
  payload.main.querySelector("[data-category-page]")?.removeAttribute("data-category-rendered");
  currentMain?.replaceWith(payload.main);
  if (payload.readingRail) {
    payload.readingRail.classList.remove("is-visible", "is-scrolling");
    payload.readingRail.removeAttribute("data-rail-bound");
    if (currentReadingRail) {
      currentReadingRail.replaceWith(payload.readingRail);
    } else {
      payload.main.insertAdjacentElement("beforebegin", payload.readingRail);
    }
  } else {
    currentReadingRail?.remove();
  }
  if (payload.footer) {
    currentFooter?.replaceWith(payload.footer);
  } else {
    currentFooter?.remove();
  }
  document.title = payload.title || document.title;
  if (push) {
    history.pushState({ pjax: true }, "", `${url.pathname}${url.search}${url.hash}`);
  }
  syncPrimaryActiveNav({ instant: false });
  const active = primaryNav?.querySelector(".nav-item.is-active");
  if (active) {
    moveNavActiveIndicator(active);
    moveNavHoverIndicator(active);
    moveNavActiveIcon(active);
  }
  window.scrollTo(0, 0);
  syncAmbientBackgroundMode({ rebuild: true });
  bindRoutedContent(document, { animateInitial: false });
  return {
    main: payload.main,
    footer: payload.footer,
  };
}

async function navigateWithPjax(url, options = {}) {
  const token = ++pjaxNavigationToken;
  closeFloatingMenus();
  clearRouteTransientAnimationState(siteChrome);
  setSiteChromeHidden(false);
  lockRouteLayoutHeight();
  document.body.classList.add("is-route-swapping");
  setRouteLoading(true, url);
  previewPrimaryActiveNav(url);
  document.querySelector("body > main")?.classList.add("route-content-exit");
  document.querySelector("body > footer.footer")?.classList.add("route-content-exit");
  document.getElementById("reading-rail")?.classList.add("route-content-exit");
  try {
    if (token !== pjaxNavigationToken) return;
    const payload = await renderRouteInFrame(url, token);
    if (token !== pjaxNavigationToken) return;
    const routeNodes = replaceRouteContent(payload, url, options);
    if (token !== pjaxNavigationToken) return;
    document.body.classList.remove("is-route-swapping");
    setRouteLoading(false);
    routeNodes.main?.classList.add("route-content-enter");
    routeNodes.footer?.classList.add("route-content-enter");
    finishRouteContentEntry(routeNodes.main, routeNodes.footer);
  } catch (error) {
    window.location.href = url.href;
  } finally {
    if (token === pjaxNavigationToken) {
      document.body.classList.remove("is-route-swapping");
      setRouteLoading(false);
      releaseRouteLayoutHeight();
      document.querySelector("body > main")?.classList.remove("route-content-exit");
      document.querySelector("body > footer.footer")?.classList.remove("route-content-exit");
      document.getElementById("reading-rail")?.classList.remove("route-content-exit");
    }
  }
}

document.addEventListener("click", handlePjaxLinkClick, true);

window.addEventListener("popstate", () => {
  navigateWithPjax(new URL(window.location.href), { push: false });
});

function floatingMenuIsOpen() {
  return Boolean(
    navMenu?.classList.contains("is-open")
    || visitorPopover?.classList.contains("is-open")
    || homeMegaPanel?.classList.contains("is-open")
    || postsMegaPanel?.classList.contains("is-open")
    || notesMegaPanel?.classList.contains("is-open")
    || timelineMegaPanel?.classList.contains("is-open")
  );
}

function setSiteChromeHidden(hidden) {
  if (!siteChrome) return;
  siteChrome.classList.toggle("is-hidden", hidden);
}

function updateSiteChromeForScroll() {
  chromeScrollTicking = false;
  const currentY = Math.max(0, window.scrollY);
  const delta = currentY - chromeLastScrollY;
  const routeLoading = document.body.classList.contains("is-route-loading");

  if (currentY < 48 || routeLoading || floatingMenuIsOpen()) {
    setSiteChromeHidden(false);
  } else if (delta > 9 && currentY > 118) {
    setSiteChromeHidden(true);
  } else if (delta < -6) {
    setSiteChromeHidden(false);
  }

  chromeLastScrollY = currentY;
}

window.addEventListener("scroll", () => {
  closeFloatingMenus();
  if (!chromeScrollTicking) {
    chromeScrollTicking = true;
    requestAnimationFrame(updateSiteChromeForScroll);
  }
}, { passive: true });

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeFloatingMenus();
  }
});

function closeFloatingMenus(target) {
  navMenu.classList.remove("is-open");
  navMenu.setAttribute("aria-hidden", "true");
  moreButton.setAttribute("aria-expanded", "false");
  visitorPopover.classList.remove("is-open");
  visitorPopover.setAttribute("aria-hidden", "true");
  if (!target || (!homeMegaPanel?.contains(target) && !homeMegaTrigger?.contains(target))) {
    closeHomeMega();
  }
  if (!target || (!postsMegaPanel?.contains(target) && !postsMegaTrigger?.contains(target))) {
    closePostsMega();
  }
  if (!target || (!notesMegaPanel?.contains(target) && !notesMegaTrigger?.contains(target))) {
    closeNotesMega();
  }
  if (!target || (!timelineMegaPanel?.contains(target) && !timelineMegaTrigger?.contains(target))) {
    closeTimelineMega();
  }
}

function targetWithinAny(target, ...nodes) {
  return nodes.some((node) => node && (node === target || node.contains(target)));
}

document.addEventListener("pointermove", (event) => {
  rememberMegaPointer(event);
  const target = event.target;
  if (homeMegaPanel?.classList.contains("is-open") && !targetWithinAny(target, homeMegaPanel, homeMegaTrigger)) {
    scheduleHomeMegaClose();
  }
  if (postsMegaPanel?.classList.contains("is-open")) {
    if (targetIsInsideMega(target, postsMegaPanel, postsMegaTrigger)) {
      window.clearTimeout(postsMegaCloseTimer);
    } else {
      schedulePostsMegaClose(event);
    }
  }
  if (notesMegaPanel?.classList.contains("is-open")) {
    if (targetIsInsideMega(target, notesMegaPanel, notesMegaTrigger)) {
      window.clearTimeout(notesMegaCloseTimer);
    } else {
      scheduleNotesMegaClose(event);
    }
  }
  if (timelineMegaPanel?.classList.contains("is-open") && !targetWithinAny(target, timelineMegaPanel, timelineMegaTrigger)) {
    scheduleTimelineMegaClose();
  }
}, { passive: true });

document.addEventListener("pointerout", (event) => {
  if (event.relatedTarget) return;
  closePostsMega();
  closeNotesMega();
}, { passive: true });

const postsPage = document.querySelector(".posts-page");

if (postsPage) {
  const searchInput = postsPage.querySelector("[data-post-search]");
  const tagButtons = Array.from(postsPage.querySelectorAll("[data-post-tag]"));
  const sortButtons = Array.from(postsPage.querySelectorAll("[data-post-sort]"));
  const postItems = Array.from(postsPage.querySelectorAll("[data-post-item]"));
  const articleList = postsPage.querySelector(".article-list");
  const articleRows = Array.from(postsPage.querySelectorAll(".article-row"));
  let activeTag = "all";

  function animatePostRows(baseDelay = 50) {
    runStaggerReveal(postItems.filter((item) => !item.classList.contains("is-hidden")), {
      baseDelay,
      interval: 56,
      duration: 640,
    });
  }

  function filterPostItems(options = {}) {
    const query = (searchInput?.value || "").trim().toLowerCase();

    postItems.forEach((item) => {
      const text = item.textContent.toLowerCase();
      const tags = (item.dataset.tags || "").toLowerCase();
      const matchesQuery = !query || text.includes(query) || tags.includes(query);
      const matchesTag = activeTag === "all" || tags.split(/\s+/).includes(activeTag);
      item.classList.toggle("is-hidden", !matchesQuery || !matchesTag);
    });

    if (options.animate) {
      animatePostRows(options.baseDelay);
    }
  }

  searchInput?.addEventListener("input", filterPostItems);

  tagButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeTag = (button.dataset.postTag || "all").toLowerCase();
      tagButtons.forEach((tag) => tag.classList.toggle("is-active", tag === button && activeTag !== "all"));
      filterPostItems({ animate: true, baseDelay: 40 });
    });
  });

  sortButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.postSort || "newest";
      sortButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      const sortedRows = [...articleRows].sort((a, b) => {
        const key = mode === "updated" ? "updated" : "created";
        const aTime = new Date(a.dataset[key] || 0).getTime();
        const bTime = new Date(b.dataset[key] || 0).getTime();
        return mode === "oldest" ? aTime - bTime : bTime - aTime;
      });
      sortedRows.forEach((row) => articleList?.appendChild(row));
      filterPostItems({ animate: true, baseDelay: 45 });
    });
  });

  animatePostRows(120);
}

const notesPage = document.querySelector(".notes-index");

if (notesPage) {
  runStaggerReveal(notesPage.querySelectorAll(".note-year-heading, .note-letter-row"), {
    baseDelay: 120,
    interval: 48,
    duration: 560,
  });
  renderNotesMegaRecent();

  function scrollNoteHashIntoView() {
    if (!window.location.hash) return;
    const target = notesPage.querySelector(window.location.hash);
    if (!target) return;
    window.setTimeout(() => {
      target.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 220);
  }

  window.addEventListener("hashchange", scrollNoteHashIntoView);
  scrollNoteHashIntoView();
}

const timelinePage = document.querySelector("[data-timeline-page]");

if (timelinePage) {
  const timelineArchive = timelinePage.querySelector("[data-timeline-archive]");
  const timelineCount = timelinePage.querySelector("[data-timeline-count]");
  const dayOfYearNode = timelinePage.querySelector("[data-timeline-day]");
  const yearProgressNode = timelinePage.querySelector("[data-timeline-year-progress]");
  const dayProgressNode = timelinePage.querySelector("[data-timeline-day-progress]");
  const totalWordsNode = timelinePage.querySelector("[data-timeline-total-words]");
  const timelineSearch = timelinePage.querySelector("[data-timeline-search]");
  const backTopButton = timelinePage.querySelector("[data-timeline-top]");
  const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
  const monthCodes = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const noteTone = {
    "一日笺": "心情：平静 / 天气：晴",
    "七日札": "心情：专注 / 天气：阴",
    "月痕录": "心情：疲惫 / 天气：雨",
    "岁时书": "心情：回望 / 天气：雪",
    "山河记": "心情：开心 / 天气：晴",
  };

  function buildTimelineEntries() {
    return buildIndexTimelineEntries();
  }

  let timelineEntries = buildTimelineEntries();

  function isLeapYear(year) {
    return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
  }

  function createNumberFlow(target, { minIntegerDigits = 1 } = {}) {
    if (!target) return { set() {}, resetFor() {} };
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    let currentText = "";
    let slots = [];

    function normalize(value) {
      const text = String(value);
      return /^\d+$/.test(text) ? text.padStart(minIntegerDigits, "0") : text;
    }

    function createRollDigitSlot(startDigit, nextDigit) {
      const digit = document.createElement("span");
      digit.className = "number-flow-digit";
      digit.style.setProperty("--nf-digit", startDigit);
      digit.dataset.digit = String(nextDigit);

      const ribbon = document.createElement("span");
      ribbon.className = "number-flow-ribbon";
      for (let index = 0; index <= 9; index += 1) {
        const item = document.createElement("span");
        item.textContent = String(index);
        ribbon.appendChild(item);
      }

      digit.appendChild(ribbon);
      return { digit, nextDigit };
    }

    function build(fromText, nextText, animate) {
      const flow = document.createElement("span");
      flow.className = "number-flow";
      if (!animate || prefersReducedMotion) flow.classList.add("is-instant");
      slots = [];

      nextText.split("").forEach((char, index) => {
        if (/\d/.test(char)) {
          const startChar = /\d/.test(fromText[index] || "") ? fromText[index] : "0";
          const slot = createRollDigitSlot(Number(startChar), Number(char));
          slots.push(slot);
          flow.appendChild(slot.digit);
        } else {
          const symbol = document.createElement("span");
          symbol.className = "number-flow-symbol";
          symbol.textContent = char;
          flow.appendChild(symbol);
        }
      });

      target.replaceChildren(flow);

      requestAnimationFrame(() => {
        slots.forEach((slot) => {
          slot.digit.style.setProperty("--nf-digit", slot.nextDigit);
        });
        flow.classList.remove("is-instant");
      });
    }

    function compatible(nextText) {
      const currentChars = currentText.split("");
      const nextChars = nextText.split("");
      return currentChars.length === nextChars.length
        && currentChars.every((char, index) => (/\d/.test(char) && /\d/.test(nextChars[index])) || char === nextChars[index]);
    }

    return {
      resetFor(value) {
        const nextText = normalize(value);
        const zeroText = nextText.replace(/\d/g, "0");
        currentText = zeroText;
        build(zeroText, zeroText, true);
      },
      set(value, options = {}) {
        const nextText = normalize(value);
        const animate = options.animate !== false;
        if (!currentText || !compatible(nextText)) {
          const fromText = (currentText || "0").padStart(nextText.length, "0").slice(-nextText.length);
          build(fromText, nextText, animate);
        } else {
          const flow = target.querySelector(".number-flow");
          if (!animate || prefersReducedMotion) flow?.classList.add("is-instant");
          let digitIndex = 0;
          nextText.split("").forEach((char) => {
            if (!/\d/.test(char)) return;
            const slot = slots[digitIndex];
            if (slot) {
              const nextDigit = Number(char);
              slot.nextDigit = nextDigit;
              slot.digit.dataset.digit = char;
              slot.digit.style.setProperty("--nf-digit", slot.nextDigit);
            }
            digitIndex += 1;
          });
          if (!animate || prefersReducedMotion) requestAnimationFrame(() => flow?.classList.remove("is-instant"));
        }
        currentText = nextText;
      },
    };
  }

  const dayOfYearFlow = createNumberFlow(dayOfYearNode);
  const yearProgressFlow = createNumberFlow(yearProgressNode);
  const totalWordsFlow = createNumberFlow(totalWordsNode);
  let dayProgressIntegerFlow = null;
  let dayProgressFractionFlow = null;

  if (dayProgressNode) {
    dayProgressNode.classList.add("timeline-flow-composite");
    const integerNode = document.createElement("span");
    const dotNode = document.createElement("span");
    const fractionNode = document.createElement("span");
    integerNode.className = "timeline-flow-integer";
    dotNode.className = "timeline-flow-dot";
    dotNode.textContent = ".";
    fractionNode.className = "timeline-flow-fraction";
    dayProgressNode.replaceChildren(integerNode, dotNode, fractionNode);
    dayProgressIntegerFlow = createNumberFlow(integerNode);
    dayProgressFractionFlow = createNumberFlow(fractionNode, { minIntegerDigits: 2 });
  }

  function getTimelineStats() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - start) / 86400000);
    const yearProgress = (dayOfYear / (isLeapYear(now.getFullYear()) ? 366 : 365)) * 100;
    const dayProgress = ((now.getSeconds() + 60 * (now.getMinutes() + 60 * now.getHours())) / 86400) * 100;
    const dayProgressInteger = Math.trunc(dayProgress);
    const dayProgressFraction = Math.floor((dayProgress - dayProgressInteger) * 100);
    return {
      dayOfYear,
      yearProgress: Math.round(Math.max(0, Math.min(100, yearProgress))),
      dayProgressInteger,
      dayProgressFraction,
      totalWords: getAllArticleWordCount(),
    };
  }

  function renderTimelineStats(stats, options = {}) {
    const animate = options.animate !== false;
    if (timelineCount) timelineCount.textContent = String(timelineEntries.length);
    dayOfYearFlow.set(stats.dayOfYear, { animate });
    yearProgressFlow.set(stats.yearProgress, { animate });
    dayProgressIntegerFlow?.set(stats.dayProgressInteger, { animate });
    dayProgressFractionFlow?.set(stats.dayProgressFraction, { animate });
    totalWordsFlow.set(stats.totalWords, { animate });
  }

  function updateTimelineStats(options = {}) {
    renderTimelineStats(getTimelineStats(), options);
  }

  function resetTimelineProgress(stats) {
    if (timelineCount) timelineCount.textContent = String(timelineEntries.length);
    dayOfYearFlow.set(stats.dayOfYear, { animate: false });
    yearProgressFlow.resetFor(stats.yearProgress);
    dayProgressIntegerFlow?.resetFor(stats.dayProgressInteger);
    dayProgressFractionFlow?.resetFor(stats.dayProgressFraction);
    totalWordsFlow.resetFor(stats.totalWords);
  }

  function replayTimelineProgress() {
    try {
      sessionStorage.removeItem(TIMELINE_PROGRESS_REPLAY_KEY);
    } catch {}
    const stats = getTimelineStats();
    resetTimelineProgress(stats);
    timelinePage.classList.add("is-replaying-progress");

    window.setTimeout(() => {
      yearProgressFlow.set(stats.yearProgress);
      dayProgressIntegerFlow?.set(stats.dayProgressInteger);
      dayProgressFractionFlow?.set(stats.dayProgressFraction);
      totalWordsFlow.set(stats.totalWords);
      window.setTimeout(() => timelinePage.classList.remove("is-replaying-progress"), TIMELINE_PROGRESS_REPLAY_DURATION);
    }, 110);
  }

  function createTimelineRow(entry) {
    const link = document.createElement("a");
    link.className = "timeline-row";
    link.href = entry.href;
    link.dataset.timelineSearch = `${entry.title} ${entry.meta} ${entry.kind}`.toLowerCase();

    const date = parsePostDate(entry.date);
    const day = document.createElement("span");
    day.className = "timeline-day";
    day.textContent = String(date.getDate()).padStart(2, "0");
    const title = document.createElement("strong");
    title.textContent = entry.title;
    const meta = document.createElement("em");
    meta.textContent = `${entry.meta} · ${entry.kind}`;
    link.append(day, title, meta);
    return link;
  }

  function createTimelineMonth(month, entries) {
    const block = document.createElement("section");
    block.className = "timeline-month-block";
    const heading = document.createElement("h3");
    heading.textContent = `${monthNames[month]} · ${monthCodes[month]}`;
    block.appendChild(heading);
    entries.forEach((entry) => block.appendChild(createTimelineRow(entry)));
    return block;
  }

  function renderTimeline(entries = timelineEntries) {
    if (!timelineArchive) return;
    timelineArchive.classList.add("is-visible");
    revealObserver.unobserve(timelineArchive);
    const byYear = entries.reduce((years, entry) => {
      const date = parsePostDate(entry.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      if (!years.has(year)) years.set(year, new Map());
      const months = years.get(year);
      if (!months.has(month)) months.set(month, []);
      months.get(month).push(entry);
      return years;
    }, new Map());

    timelineArchive.replaceChildren(...Array.from(byYear.entries()).map(([year, months]) => {
      const total = Array.from(months.values()).reduce((sum, list) => sum + list.length, 0);
      const block = document.createElement("section");
      block.className = "timeline-year-block reveal is-visible";
      const heading = document.createElement("header");
      heading.className = "timeline-year-heading";
      heading.innerHTML = `<h2>${year}</h2><span>鏈勾 ${total} 绡?/span>`;
      block.appendChild(heading);
      Array.from(months.entries())
        .sort((a, b) => b[0] - a[0])
        .forEach(([month, monthEntries]) => block.appendChild(createTimelineMonth(month, monthEntries)));
      return block;
    }));

    runStaggerReveal(timelineArchive.querySelectorAll(".timeline-year-heading, .timeline-month-block h3, .timeline-row"), {
      baseDelay: 70,
      interval: 24,
      duration: 520,
    });
  }

  window.__refreshIndexTimelinePage = () => {
    timelineEntries = buildTimelineEntries();
    renderTimeline(timelineEntries);
    updateTimelineStats({ animate: false });
  };

  function filterTimeline() {
    const query = (timelineSearch?.value || "").trim().toLowerCase();
    const filtered = query
      ? timelineEntries.filter((entry) => `${entry.title} ${entry.meta} ${entry.kind}`.toLowerCase().includes(query))
      : timelineEntries;
    renderTimeline(filtered);
  }

  timelineSearch?.addEventListener("input", filterTimeline);
  bindTimelineSearchForm(document);
  backTopButton?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("timeline:replay-progress", replayTimelineProgress);
  let shouldReplayTimelineProgress = false;
  try {
    shouldReplayTimelineProgress = sessionStorage.getItem(TIMELINE_PROGRESS_REPLAY_KEY) === "1";
  } catch {}

  resetTimelineProgress(getTimelineStats());
  window.setTimeout(replayTimelineProgress, shouldReplayTimelineProgress ? 180 : 140);
  window.setInterval(updateTimelineStats, 2000);
  renderTimeline();
}

loadFrontendIndexes();

const readingRail = document.getElementById("reading-rail");
const readingRailSvg = document.getElementById("reading-rail-svg");
const readingRailBase = document.getElementById("reading-rail-base");
const readingRailProgress = document.getElementById("reading-rail-progress");
const readingRailDots = document.getElementById("reading-rail-dots");
const readingRailLabel = document.getElementById("reading-rail-label");
const readingRailTitle = document.getElementById("reading-rail-title");
const readingRailPercent = document.getElementById("reading-rail-percent");
const readingRailToc = document.getElementById("reading-rail-toc");
const readingRailPanelPercent = document.getElementById("reading-rail-panel-percent");
const readingRailTop = document.getElementById("reading-rail-top");

if (readingRail && readingRailSvg && readingRailBase && readingRailProgress && readingRailDots) {
  const railSections = Array.from(document.querySelectorAll("[data-rail-title]:not(.article-hero)"))
    .map((node, index) => ({
      id: node.id || `rail-section-${index + 1}`,
      title: node.dataset.railTitle || node.textContent.trim(),
      level: Number(node.dataset.railLevel || 1),
      order: index,
      node,
    }))
    .filter((item) => item.node);

  let railY = 0;
  let railBend = 0;
  let railBendVelocity = 0;
  let railScrollVelocity = 0;
  let railVisibleMix = 0;
  let railLastY = window.scrollY;
  let railLastTime = 0;
  let railActiveId = "";
  let railScrollTimer = 0;

  const dotById = new Map();
  const tocLinkById = new Map();
  const railIndexById = new Map(railSections.map((item, index) => [item.id, index]));

  function syncReadingRailToc(activeId) {
    if (!readingRailToc || !activeId) return;
    const activeIndex = railIndexById.get(activeId);
    if (typeof activeIndex !== "number") return;
    tocLinkById.forEach((link, id) => {
      const itemIndex = railIndexById.get(id);
      const distance = Math.min(4, Math.abs((itemIndex ?? activeIndex) - activeIndex));
      link.classList.toggle("is-current", id === activeId);
      link.dataset.tocDistance = String(distance);
    });
    const currentLink = tocLinkById.get(activeId);
    if (!currentLink) return;
    const targetTop = currentLink.offsetTop - (readingRailToc.clientHeight - currentLink.offsetHeight) / 2;
    readingRailToc.scrollTo({
      top: Math.max(0, targetTop),
      behavior: readingRail.matches(":hover") ? "smooth" : "auto",
    });
  }

  function getRailTitle(item) {
    const heading = item.node.querySelector("h1, h2, [data-heading]");
    const text = (heading?.textContent || item.title || "").trim().replace(/\s+/g, " ");
    return text || "未命名";
  }

  railSections.forEach((item, index) => {
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", "8");
    dot.setAttribute("cy", "0");
    dot.setAttribute("r", index === 0 ? "0.95" : "0.72");
    dot.classList.add("reading-rail-dot");
    if (index === 0 || index === railSections.length - 1) {
      dot.classList.add("is-root");
    }
    readingRailDots.appendChild(dot);
    dotById.set(item.id, dot);

    if (readingRailToc) {
      const link = document.createElement("a");
      link.href = `#${item.id}`;
      link.textContent = getRailTitle(item);
      link.dataset.tocLevel = String(item.level || 1);
      link.addEventListener("click", (event) => {
        event.preventDefault();
        item.node.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      readingRailToc.appendChild(link);
      tocLinkById.set(item.id, link);
    }
  });

  readingRailTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getScrollMax() {
    return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }

  function syncRailHeight() {
    const article = document.querySelector(".article-shell");
    const articleHeight = article?.offsetHeight || document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const lengthMix = clamp(articleHeight / Math.max(1, viewportHeight * 4.8), 0, 1);
    const sectionMix = clamp((railSections.length - 4) * 12, 0, 54);
    const viewportLimit = Math.max(230, viewportHeight - 285);
    const targetHeight = clamp(Math.round(226 + lengthMix * 82 + sectionMix), 230, Math.min(360, viewportLimit));
    readingRail.style.setProperty("--rail-height", `${targetHeight}px`);
  }

  function markRailScrolling() {
    readingRail.classList.add("is-scrolling");
    window.clearTimeout(railScrollTimer);
    railScrollTimer = window.setTimeout(() => {
      readingRail.classList.remove("is-scrolling");
    }, 420);
  }

  function getDocumentTop(node) {
    return node.getBoundingClientRect().top + window.scrollY;
  }

  function getRailItems() {
    const maxScroll = getScrollMax();
    return railSections.map((item) => ({
      ...item,
      title: getRailTitle(item),
      ratio: clamp(getDocumentTop(item.node) / maxScroll, 0, 1),
    }));
  }

  function getActiveRailItem(items) {
    const readLine = window.scrollY + window.innerHeight * 0.42;
    let active = items[0];
    items.forEach((item) => {
      if (getDocumentTop(item.node) <= readLine) {
        active = item;
      }
    });
    return active;
  }

  function showReadingRail() {
    if (window.scrollY < 70) {
      readingRail.classList.remove("is-visible");
      return;
    }
    readingRail.classList.add("is-visible");
  }

  function updateReadingRail(timestamp) {
    const height = Math.max(1, readingRail.clientHeight);
    const maxScroll = getScrollMax();
    const scrollRatio = clamp(window.scrollY / maxScroll, 0, 1);
    const readPercent = Math.round(scrollRatio * 100);
    const targetY = scrollRatio * height;
    const delta = Math.min(64, timestamp - railLastTime || 16);
    const ease = 1 - Math.exp(-delta / 130);

    railVisibleMix += ((readingRail.classList.contains("is-visible") ? 1 : 0) - railVisibleMix) * ease;
    railY += (targetY - railY) * Math.min(1, ease * 1.3);

    const currentScrollY = window.scrollY;
    const instantVelocity = ((currentScrollY - railLastY) / Math.max(1, delta)) * 1000;
    railLastY = currentScrollY;
    railScrollVelocity += (instantVelocity - railScrollVelocity) * Math.min(1, delta / 80);

    const bendTarget = Math.min(13, Math.abs(railScrollVelocity) * 0.012);
    const dt = Math.min(delta, 64) / 1000;
    railBendVelocity += (90 * (bendTarget - railBend) - 15 * railBendVelocity) * dt;
    railBend = Math.max(-4, railBend + railBendVelocity * dt);

    const wave = 10.4 + 0.6 * Math.sin((timestamp / 9000) * Math.PI * 2);
    const range = 46 + 1.8 * railBend;
    const edgeFade = Math.max(0, Math.min(1, railY / range, (height - railY) / range));
    const bendX = railVisibleMix * (wave + railBend) * edgeFade;
    const controlX = 8 + bendX;
    const top = Math.max(0, railY - range);
    const bottom = Math.min(height, railY + range);
    const path = `M8 0 L8 ${top} C8 ${railY - 0.45 * range},${controlX} ${railY - 0.3 * range},${controlX} ${railY} C${controlX} ${railY + 0.3 * range},8 ${railY + 0.45 * range},8 ${bottom} L8 ${height}`;

    readingRailSvg.setAttribute("viewBox", `0 0 56 ${height}`);
    readingRailBase.setAttribute("d", path);
    readingRailProgress.setAttribute("d", path);
    readingRailProgress.setAttribute("stroke-dashoffset", String(0.06 - railY / height));
    readingRail.style.setProperty("--rail-clip-top", readingRail.classList.contains("is-visible") ? "-2%" : `${readPercent}%`);
    readingRail.style.setProperty("--rail-clip-bottom", readingRail.classList.contains("is-visible") ? "-2%" : `${100 - readPercent}%`);
    readingRailLabel.style.setProperty("--rail-y", `${railY}px`);
    readingRailPercent.textContent = `${readPercent}%`;
    if (readingRailPanelPercent) {
      readingRailPanelPercent.textContent = `${readPercent}%`;
    }

    const railItems = getRailItems();
    railItems.forEach((item) => {
      const link = tocLinkById.get(item.id);
      if (link && link.textContent !== item.title) {
        link.textContent = item.title;
      }
    });
    const active = getActiveRailItem(railItems);
    if (active && active.id !== railActiveId) {
      railActiveId = active.id;
      readingRailTitle.textContent = active.title;
      dotById.forEach((dot, id) => {
        dot.classList.toggle("is-current", id === railActiveId);
        dot.setAttribute("r", id === railActiveId ? "2.05" : dot.classList.contains("is-root") ? "0.95" : "0.72");
      });
      syncReadingRailToc(railActiveId);
    }

    railItems.forEach((item) => {
      const dot = dotById.get(item.id);
      if (!dot) return;
      const dotY = item.ratio * height;
      const distance = Math.abs(dotY - railY) / range;
      const localBend = distance >= 1 ? 0 : bendX * Math.cos(distance * Math.PI / 2) ** 2;
      dot.setAttribute("cy", String(dotY));
      dot.setAttribute("cx", String(8 + localBend));
    });

    railLastTime = timestamp;
    requestAnimationFrame(updateReadingRail);
  }

  window.addEventListener("scroll", () => {
    showReadingRail();
    markRailScrolling();
  }, { passive: true });
  window.addEventListener("resize", () => {
    syncRailHeight();
    showReadingRail();
  });
  window.addEventListener("load", syncRailHeight);
  syncRailHeight();
  showReadingRail();
  requestAnimationFrame(updateReadingRail);
}

const writerEditor = document.getElementById("writer-editor");
const writerArea = document.getElementById("writer-editable-area");

if (writerEditor && writerArea) {
  const storageKey = "bambooo-workbench-draft-v1";
  const editableNodes = Array.from(writerArea.querySelectorAll("[contenteditable][data-editor-field]"));
  const defaultFieldHtml = new Map(editableNodes.map((node) => [node.dataset.editorField, node.innerHTML]));
  const saveStatus = document.getElementById("writer-save-status");
  const wordCount = document.getElementById("writer-word-count");
  const blockCount = document.getElementById("writer-block-count");
  const updatedAt = document.getElementById("writer-updated-at");
  const sidebarUpdated = document.getElementById("sidebar-updated");
  const readTime = document.getElementById("writer-read-time");
  const toolbar = document.getElementById("writer-toolbar");
  const newDraft = document.getElementById("new-draft");
  const copyDraft = document.getElementById("copy-draft");
  let saveTimer = 0;

  function getDraftText() {
    return writerArea.innerText.replace(/\s+/g, " ").trim();
  }

  function countWords(text) {
    const cjkCount = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const latinCount = (text.replace(/[\u4e00-\u9fff]/g, " ").match(/[A-Za-z0-9]+/g) || []).length;
    return cjkCount + latinCount;
  }

  function formatTime(timestamp) {
    if (!timestamp) return "未保存";
    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${month}.${day} ${hour}:${minute}`;
  }

  function collectDraftFields() {
    return Object.fromEntries(editableNodes.map((node) => [node.dataset.editorField, node.innerHTML]));
  }

  function setStatus(text) {
    if (saveStatus) saveStatus.textContent = text;
  }

  function updateWriterStats(timestamp = 0) {
    const text = getDraftText();
    const words = countWords(text);
    const blocks = Array.from(writerArea.querySelectorAll("p, blockquote, .article-note span"))
      .filter((node) => node.textContent.trim()).length;
    if (wordCount) wordCount.textContent = String(words);
    if (blockCount) blockCount.textContent = String(blocks);
    if (readTime) readTime.textContent = `约 ${Math.max(1, Math.ceil(words / 500))} 分钟`;
    if (timestamp) {
      const time = formatTime(timestamp);
      if (updatedAt) updatedAt.textContent = `保存于 ${time}`;
      if (sidebarUpdated) sidebarUpdated.textContent = time;
    }
  }

  function saveDraft() {
    const timestamp = Date.now();
    localStorage.setItem(storageKey, JSON.stringify({
      fields: collectDraftFields(),
      updatedAt: timestamp,
    }));
    setStatus("已保存");
    updateWriterStats(timestamp);
  }

  function scheduleSave() {
    setStatus("保存中");
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(saveDraft, 460);
    updateWriterStats();
  }

  function loadDraft() {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      updateWriterStats();
      return;
    }
    try {
      const draft = JSON.parse(raw);
      if (draft?.fields) {
        editableNodes.forEach((node) => {
          const value = draft.fields[node.dataset.editorField];
          if (typeof value === "string") {
            node.innerHTML = value;
          }
        });
      }
      setStatus("已恢复");
      updateWriterStats(draft.updatedAt);
    } catch {
      setStatus("草稿读取失败");
      updateWriterStats();
    }
  }

  function resetDraft() {
    editableNodes.forEach((node) => {
      node.innerHTML = defaultFieldHtml.get(node.dataset.editorField) || "";
    });
    localStorage.removeItem(storageKey);
    setStatus("新草稿");
    updateWriterStats();
  }

  function copyText(text) {
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(text);
    }
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    document.execCommand("copy");
    field.remove();
    return Promise.resolve();
  }

  writerArea.addEventListener("input", scheduleSave);

  toolbar?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-command]");
    if (!button) return;
    event.preventDefault();
    const command = button.dataset.command;
    const value = button.dataset.value || null;
    document.execCommand(command, false, value);
    scheduleSave();
  });

  newDraft?.addEventListener("click", () => {
    if (window.confirm("清空当前草稿并恢复模板？")) {
      resetDraft();
    }
  });

  copyDraft?.addEventListener("click", () => {
    copyText(getDraftText()).then(() => {
      setStatus("已复制");
      window.setTimeout(() => setStatus("已保存"), 1200);
    }).catch(() => {
      setStatus("复制失败");
    });
  });

  loadDraft();
}

const badge = document.getElementById("typed-badge");
if (badge) {
  const words = ["AI Agents", "tiny tools", "writing systems"];
  let wordIndex = 0;
  let charIndex = words[0].length;
  let deleting = true;

  function typeLoop() {
    if (deleting) {
      charIndex -= 1;
      if (charIndex <= 1) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
      }
    } else {
      charIndex += 1;
      if (charIndex >= words[wordIndex].length) {
        deleting = true;
        setTimeout(typeLoop, 1400);
        return;
      }
    }
    badge.textContent = words[wordIndex].slice(0, Math.max(1, charIndex));
    setTimeout(typeLoop, deleting ? 45 : 72);
  }

  setTimeout(typeLoop, 1800);
}

document.querySelectorAll(".season-tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".season-tabs button").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
  });
});

document.querySelectorAll("[data-theme-choice]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-theme-choice]").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    const choice = button.dataset.themeChoice;
    if (choice === "system") {
      document.documentElement.dataset.theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      document.documentElement.dataset.theme = choice;
    }
  });
});

document.querySelectorAll("[data-local-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = document.getElementById("message-status");
    if (status) {
      status.textContent = "已在本地预览中记录。";
    }
  });
});
