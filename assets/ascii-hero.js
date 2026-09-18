/* ============================================================
   ShipIt landing — ASCII hero scene (vanilla, no dependencies)
   Draws a p=2, q=3 torus knot as ASCII characters from
   " .:-=+*#%@" on the ink canvas.

   Colour: the scene renders in the accent of its context. It reads
   --accent from its parent element, so the umbrella hero is neutral
   white and the same script renders product green inside a
   .ctx-product section — no fork, no config. It falls back to the
   toolkit green if the variable is missing, and re-reads the colour
   when the context changes.

   Behaviour:
   - DPR capped at 2, canvas sized from the .lp-hero parent
   - slow idle rotation plus gentle pointer parallax (lerped)
   - pauses when the tab is hidden or the hero leaves the viewport
   - prefers-reduced-motion renders one static frame
   - no console output, no globals, no build step

   Loaded with defer from index.html; if the file is missing the
   hero simply renders its static copy.
   ============================================================ */
(function () {
  "use strict";

  var canvas = document.querySelector("[data-ascii-hero]");
  if (!canvas || !canvas.parentElement) return;

  var hero = canvas.parentElement;
  var ctx = null;
  try { ctx = canvas.getContext("2d"); } catch (error) { ctx = null; }
  if (!ctx) return;

  var CHARS = " .:-=+*#%@";
  var P = 2;                        // torus knot wraps around the axis
  var Q = 3;                        // torus knot winds through the hole
  var SEGMENTS = 132;
  var TUBES = 10;
  var TUBE_RADIUS = 0.4;
  var PERSPECTIVE = 5;
  var FRAME_MS = 1000 / 45;         // gentle scene, 45 fps is plenty
  var POINTER_EASE = 0.05;

  var pointCount = SEGMENTS * TUBES;
  var base = new Float32Array(pointCount * 3);
  var px = new Float32Array(pointCount);
  var py = new Float32Array(pointCount);
  var pz = new Float32Array(pointCount);
  var order = [];
  var n, i, j, k = 0;
  for (i = 0; i < pointCount; i++) order.push(i);

  for (i = 0; i < SEGMENTS; i++) {
    var u = (i / SEGMENTS) * Math.PI * 2;
    for (j = 0; j < TUBES; j++) {
      var v = (j / TUBES) * Math.PI * 2;
      var r = 2 + Math.cos(Q * u);
      var x = r * Math.cos(P * u);
      var y = r * Math.sin(P * u);
      var z = -Math.sin(Q * u);
      var nx = Math.cos(P * u) * Math.cos(v);
      var ny = Math.sin(P * u) * Math.cos(v);
      var nz = Math.sin(v);
      base[k] = x + TUBE_RADIUS * nx;
      base[k + 1] = y + TUBE_RADIUS * ny;
      base[k + 2] = z + TUBE_RADIUS * nz;
      k += 3;
    }
  }

  var heroWidth = 0;
  var heroHeight = 0;
  var dpr = 1;
  var time = 0;
  var last = 0;
  var raf = 0;
  var running = false;
  var inView = true;
  var target = { x: 0, y: 0 };
  var pointer = { x: 0, y: 0 };
  var reduceQuery = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;
  var reduced = !!(reduceQuery && reduceQuery.matches);

  var accent = { r: 85, g: 214, b: 154 };          // toolkit green fallback
  var accentBright = { r: 162, g: 232, b: 199 };   // fallback mixed toward white

  function parseColor(value) {
    if (!value) return null;
    var text = value.trim();
    var hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
    if (hex) {
      var h = hex[1];
      if (h.length === 3) {
        h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
      }
      return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16)
      };
    }
    var rgb = /^rgba?\(\s*([0-9.]+)[,\s]+([0-9.]+)[,\s]+([0-9.]+)/i.exec(text);
    if (rgb) {
      return {
        r: Math.round(parseFloat(rgb[1])),
        g: Math.round(parseFloat(rgb[2])),
        b: Math.round(parseFloat(rgb[3]))
      };
    }
    return null;
  }

  function readAccent() {
    if (!window.getComputedStyle) return;
    var styles = window.getComputedStyle(hero);
    var next = parseColor(styles.getPropertyValue("--accent")) ||
               parseColor(styles.getPropertyValue("--brand"));
    if (!next) return;
    if (next.r === accent.r && next.g === accent.g && next.b === accent.b) return;
    accent = next;
    accentBright = {
      r: Math.round(next.r + (255 - next.r) * 0.45),
      g: Math.round(next.g + (255 - next.g) * 0.45),
      b: Math.round(next.b + (255 - next.b) * 0.45)
    };
  }

  function measure() {
    var rect = hero.getBoundingClientRect();
    var w = Math.max(1, Math.round(rect.width));
    var h = Math.max(1, Math.round(rect.height));
    var nextDpr = Math.min(window.devicePixelRatio || 1, 2);
    if (w === heroWidth && h === heroHeight && nextDpr === dpr) return;
    heroWidth = w;
    heroHeight = h;
    dpr = nextDpr;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rotate(angleX, angleY, angleZ) {
    var cosX = Math.cos(angleX), sinX = Math.sin(angleX);
    var cosY = Math.cos(angleY), sinY = Math.sin(angleY);
    var cosZ = Math.cos(angleZ), sinZ = Math.sin(angleZ);
    var zMin = 1e9, zMax = -1e9;
    for (var index = 0, p = 0; index < pointCount; index++, p += 3) {
      var x = base[p], y = base[p + 1], z = base[p + 2];
      var y1 = y * cosX - z * sinX;
      var z1 = y * sinX + z * cosX;
      var x1 = x * cosY + z1 * sinY;
      var z2 = -x * sinY + z1 * cosY;
      px[index] = x1 * cosZ - y1 * sinZ;
      py[index] = x1 * sinZ + y1 * cosZ;
      pz[index] = z2;
      if (z2 < zMin) zMin = z2;
      if (z2 > zMax) zMax = z2;
    }
    return { min: zMin, max: zMax };
  }

  function drawParticles() {
    var count = 44;
    var index;
    for (index = 0; index < count; index++) {
      var phase = index * 2.399963;
      var speed = 0.4 + (index % 5) * 0.07;
      var fx = Math.sin(time * 0.31 * speed + phase) * 0.5 + 0.5;
      var fy = Math.cos(time * 0.23 * speed + phase * 1.3) * 0.5 + 0.5;
      var x = fx * heroWidth + pointer.x * 24;
      var y = fy * heroHeight + pointer.y * 18;
      var twinkle = Math.sin(time * 1.1 + phase * 3.1) * 0.5 + 0.5;
      var alpha = 0.05 + twinkle * 0.12;
      ctx.fillStyle = "rgba(" + accent.r + "," + accent.g + "," + accent.b + "," + alpha.toFixed(3) + ")";
      ctx.fillText(CHARS.charAt(2 + ((index * 3) % 6)), x, y);
    }
  }

  function draw() {
    if (heroWidth < 2 || heroHeight < 2) measure();
    ctx.clearRect(0, 0, heroWidth, heroHeight);

    var zRange = rotate(
      time * 0.16 + pointer.y * 0.55,
      time * 0.22 + pointer.x * 0.55,
      time * 0.08
    );

    var scale = Math.min(heroHeight * 0.20, heroWidth * 0.16);
    var centerX = heroWidth * (heroWidth >= 900 ? 0.68 : 0.5);
    var centerY = heroHeight * (heroWidth >= 900 ? 0.40 : 0.46);
    var charSize = Math.max(10, Math.min(22, Math.min(heroWidth, heroHeight) * 0.028));
    var range = Math.max(0.6, zRange.max - zRange.min);

    order.sort(function (a, b) { return pz[a] - pz[b]; });

    ctx.font = charSize.toFixed(1) + "px ui-monospace, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (var s = 0; s < order.length; s++) {
      var index = order[s];
      var factor = PERSPECTIVE / (PERSPECTIVE + pz[index]);
      var sx = centerX + px[index] * scale * factor;
      var sy = centerY + py[index] * scale * factor;
      if (sx < -40 || sx > heroWidth + 40 || sy < -40 || sy > heroHeight + 40) continue;

      var depth = (pz[index] - zRange.min) / range;
      var charIndex = (depth * (CHARS.length - 1)) | 0;
      if (charIndex < 0) charIndex = 0;
      else if (charIndex > CHARS.length - 1) charIndex = CHARS.length - 1;
      var character = CHARS.charAt(charIndex);
      if (character === " ") continue;

      var alpha = 0.08 + depth * 0.72;
      var red = (accent.r + (accentBright.r - accent.r) * depth) | 0;
      var green = (accent.g + (accentBright.g - accent.g) * depth) | 0;
      var blue = (accent.b + (accentBright.b - accent.b) * depth) | 0;
      ctx.fillStyle = "rgba(" + red + "," + green + "," + blue + "," + alpha.toFixed(3) + ")";
      ctx.fillText(character, sx, sy);
    }

    drawParticles();
  }

  function frame(now) {
    raf = 0;
    if (!running) return;
    if (!last) last = now;
    var elapsed = now - last;
    if (elapsed >= FRAME_MS - 2) {
      last = now;
      time += Math.min(elapsed, 100) * 0.001;
      pointer.x += (target.x - pointer.x) * POINTER_EASE;
      pointer.y += (target.y - pointer.y) * POINTER_EASE;
      draw();
    }
    raf = window.requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduced || !inView || document.hidden) return;
    readAccent();
    running = true;
    last = 0;
    raf = window.requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (raf) {
      window.cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  function sync() {
    if (reduced || !inView || document.hidden) stop();
    else start();
  }

  document.addEventListener("visibilitychange", sync);

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      sync();
    }, { rootMargin: "80px" }).observe(hero);
  }

  if (window.ResizeObserver) {
    new ResizeObserver(function () {
      readAccent();
      measure();
      if (reduced) draw();
    }).observe(hero);
  } else {
    window.addEventListener("resize", function () {
      readAccent();
      measure();
      if (reduced) draw();
    });
  }

  hero.addEventListener("pointermove", function (event) {
    if (reduced) return;
    var rect = hero.getBoundingClientRect();
    target.x = (event.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
    target.y = (event.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
  }, { passive: true });

  hero.addEventListener("pointerleave", function () {
    target.x = 0;
    target.y = 0;
  }, { passive: true });

  if (reduceQuery) {
    var onReduceChange = function () {
      reduced = reduceQuery.matches;
      if (reduced) {
        stop();
        time = 0.9;
        pointer.x = 0;
        pointer.y = 0;
        draw();
      } else {
        sync();
      }
    };
    if (reduceQuery.addEventListener) reduceQuery.addEventListener("change", onReduceChange);
    else if (reduceQuery.addListener) reduceQuery.addListener(onReduceChange);
  }

  if ("MutationObserver" in window) {
    new MutationObserver(function () {
      readAccent();
      if (reduced) draw();
    }).observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "data-product"],
      subtree: true
    });
  }

  readAccent();
  measure();
  if (reduced) {
    time = 0.9;
    draw();
  } else {
    start();
  }
})();
