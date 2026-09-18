/* ============================================================
   ShipIt landing — entrance motion (vanilla, no dependencies)

   Two one-time effects, both opt-in and both no-ops without JS:

   1. Hero entrance — a staggered opacity/blur reveal of the
      eyebrow, headline words, lede, actions and micro-proof.
      The hidden state itself comes from the inline head script
      in index.html, which adds .lp-motion before first paint and
      only when motion is allowed; this module splits the headline
      into word groups, schedules the delays and starts the reveal.
   2. Section rhythm — each landing section's blocks rise 12px and
      fade in on first intersection (450ms, 60ms per sibling).
      Blocks already in view on load are left untouched.

   Robustness:
   - Nothing runs unless .lp-motion is present, so reduced-motion
     and no-JS visitors see the full page immediately.
   - The head script removes .lp-motion on a timeout if this file
     never starts, so a missing script cannot hide the hero.
   - IntersectionObserver and matchMedia are feature-detected.
   - Every effect cleans up after itself: one pass, no loops.
   - No console output, no globals, no dependencies.
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;
  if (!root.classList.contains("lp-motion")) return;

  var reduceQuery = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;
  if (reduceQuery && reduceQuery.matches) {
    root.classList.remove("lp-motion");
    return;
  }

  try {
    heroEntrance();
  } catch (error) {
    root.classList.remove("lp-motion");
  }

  try {
    sectionRhythm();
  } catch (error) {
    /* Sections stay visible; nothing to undo. */
  }

  try {
    metricsCountUp();
  } catch (error) {
    /* Numerals stay at their exact final values. */
  }

  function metricsCountUp() {
    var bands = document.querySelectorAll(".lp-metrics");
    if (!bands.length || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      for (var e = 0; e < entries.length; e++) {
        var entry = entries[e];
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        var values = entry.target.querySelectorAll("[data-count-to]");
        for (var v = 0; v < values.length; v++) countValue(values[v]);
      }
    }, { threshold: 0.2 });

    for (var b = 0; b < bands.length; b++) observer.observe(bands[b]);
  }

  function countValue(element) {
    var end = parseInt(element.getAttribute("data-count-to"), 10);
    if (isNaN(end)) return;
    var duration = 900;
    var started = 0;

    function exact() {
      element.textContent = String(end);
    }

    window.requestAnimationFrame(function step(now) {
      if (!started) started = now;
      var progress = Math.min((now - started) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      if (progress < 1) {
        element.textContent = String(Math.round(end * eased));
        window.requestAnimationFrame(step);
      } else {
        exact();
      }
    });

    /* Whatever happens to the frame loop, the end state is exact. */
    window.setTimeout(exact, duration + 400);
  }

  function heroEntrance() {
    var hero = document.querySelector(".lp-hero");
    if (!hero) {
      root.classList.remove("lp-motion");
      return;
    }

    var eyebrow = hero.querySelector(".eyebrow");
    var title = hero.querySelector("h1");
    var lede = hero.querySelector(".lp-hero-lede");
    var actions = hero.querySelector(".hero-actions");

    var words = title ? splitWords(title) : [];
    if (words.length) root.classList.add("lp-motion-words");

    var schedule = [];
    if (eyebrow) schedule.push(eyebrow);
    if (words.length) schedule = schedule.concat(words);
    else if (title) schedule.push(title);
    if (lede) schedule.push(lede);
    if (actions) schedule.push(actions);

    var i;
    for (i = 0; i < schedule.length; i++) {
      schedule[i].style.setProperty("--lp-delay", (i * 45) + "ms");
    }

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        root.classList.add("lp-go");
      });
    });

    var total = (schedule.length - 1) * 45 + 500 + 120;
    window.setTimeout(function () {
      root.classList.remove("lp-motion", "lp-go", "lp-motion-words");
      for (i = 0; i < schedule.length; i++) {
        schedule[i].style.removeProperty("--lp-delay");
      }
    }, total);
  }

  function splitWords(element) {
    if (typeof document.createTreeWalker !== "function") return [];
    var walker = document.createTreeWalker(element, 3, null, false);
    var nodes = [];
    var node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && /\S/.test(node.nodeValue)) nodes.push(node);
    }
    var words = [];
    for (var n = 0; n < nodes.length; n++) {
      var parts = nodes[n].nodeValue.split(/(\s+)/);
      var fragment = document.createDocumentFragment();
      for (var p = 0; p < parts.length; p++) {
        var part = parts[p];
        if (!part) continue;
        if (/^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(part));
        } else {
          var span = document.createElement("span");
          span.className = "lp-word";
          span.textContent = part;
          fragment.appendChild(span);
          words.push(span);
        }
      }
      nodes[n].parentNode.replaceChild(fragment, nodes[n]);
    }
    return words;
  }

  function sectionRhythm() {
    if (!("IntersectionObserver" in window)) return;
    var sections = document.querySelectorAll("#main-content > section");
    if (!sections.length) return;

    var viewport = window.innerHeight || document.documentElement.clientHeight || 0;
    var observer = new IntersectionObserver(onIntersect, {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0
    });

    for (var s = 0; s < sections.length; s++) {
      var blocks = sectionBlocks(sections[s]);
      for (var b = 0; b < blocks.length; b++) {
        var block = blocks[b];
        var rect = block.getBoundingClientRect();
        if (rect.top < viewport * 0.96 && rect.bottom > 0) continue;
        block.classList.add("lp-rise");
        observer.observe(block);
      }
    }

    function onIntersect(entries) {
      for (var e = 0; e < entries.length; e++) {
        if (!entries[e].isIntersecting) continue;
        reveal(entries[e].target);
      }
    }

    function reveal(block) {
      observer.unobserve(block);
      var parent = block.parentNode;
      var index = parent ? Array.prototype.indexOf.call(parent.children, block) : 0;
      if (index < 0) index = 0;
      block.style.setProperty("--lp-delay", (index * 60) + "ms");
      block.classList.add("lp-in");
      window.setTimeout(function () {
        block.classList.remove("lp-rise", "lp-in");
        block.style.removeProperty("--lp-delay");
      }, 450 + index * 60 + 150);
    }
  }

  function sectionBlocks(section) {
    var children = section.children;
    var shell = null;
    for (var c = 0; c < children.length; c++) {
      if (children[c].classList && children[c].classList.contains("shell")) {
        shell = children[c];
        break;
      }
    }
    var host = shell || section;
    return Array.prototype.slice.call(host.children);
  }
})();
