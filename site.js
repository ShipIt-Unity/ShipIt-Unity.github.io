const siteConfig = window.SHIPIT_SITE || {};
const assetStoreUrl = typeof siteConfig.assetStoreUrl === "string"
  ? siteConfig.assetStoreUrl.trim()
  : "";
const supportEmail = typeof siteConfig.supportEmail === "string"
  ? siteConfig.supportEmail.trim()
  : "";
const hasAssetStoreUrl = /^https:\/\//i.test(assetStoreUrl);

document.querySelectorAll("[data-store-link]").forEach(link => {
  if (hasAssetStoreUrl) {
    link.href = assetStoreUrl;
    link.target = "_blank";
    link.rel = "noopener";
  } else {
    link.href = "store.html";
  }
});

document.querySelectorAll("[data-store-label]").forEach(label => {
  label.textContent = hasAssetStoreUrl ? "View on Unity Asset Store" : "Asset Store listing";
});

document.querySelectorAll("[data-store-ready]").forEach(element => {
  element.hidden = !hasAssetStoreUrl;
});

document.querySelectorAll("[data-store-pending]").forEach(element => {
  element.hidden = hasAssetStoreUrl;
});

if (supportEmail) {
  document.querySelectorAll("[data-support-link]").forEach(link => {
    link.href = `mailto:${supportEmail}`;
  });
}

document.querySelectorAll(".mobile-nav a").forEach(link => {
  link.addEventListener("click", () => {
    const menu = link.closest(".mobile-nav");
    if (menu) menu.open = false;
  });
});

document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  document.querySelectorAll(".mobile-nav[open]").forEach(menu => {
    menu.open = false;
  });
});

const toast = document.createElement("div");
toast.className = "toast";
toast.setAttribute("role", "status");
toast.setAttribute("aria-live", "polite");
document.body.appendChild(toast);

let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2200);
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {}
  }

  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  if (!copied) throw new Error("Clipboard unavailable");
}

document.querySelectorAll("pre").forEach((pre, index) => {
  if (pre.closest(".code-block")) return;

  const wrapper = document.createElement("div");
  wrapper.className = "code-block";
  pre.parentNode.insertBefore(wrapper, pre);
  wrapper.appendChild(pre);

  const button = document.createElement("button");
  button.className = "copy-button";
  button.type = "button";
  button.textContent = "Copy";
  button.setAttribute("aria-label", `Copy code example ${index + 1}`);
  wrapper.appendChild(button);

  button.addEventListener("click", async () => {
    button.disabled = true;
    try {
      await copyText(pre.textContent);
      button.textContent = "Copied";
      showToast("Code copied to clipboard.");
    } catch {
      button.textContent = "Copy failed";
      showToast("Clipboard access was unavailable.");
    } finally {
      setTimeout(() => {
        button.textContent = "Copy";
        button.disabled = false;
      }, 1600);
    }
  });
});

document.querySelectorAll(".doc-page table").forEach(table => {
  if (table.closest(".table-wrap")) return;
  const wrapper = document.createElement("div");
  wrapper.className = "table-wrap";
  table.parentNode.insertBefore(wrapper, table);
  wrapper.appendChild(table);
});

const docsNav = document.querySelector(".docs-sidebar details");
const docsBreakpoint = window.matchMedia("(min-width: 841px)");

function syncDocsNav() {
  if (!docsNav) return;
  docsNav.open = docsBreakpoint.matches;
}

syncDocsNav();
docsBreakpoint.addEventListener("change", syncDocsNav);

const docsSearchInput = document.querySelector("#docs-search");
const docsSearchResults = document.querySelector("#docs-search-results");
const docsSections = [...document.querySelectorAll(".doc-page main > section[id]")];

if (docsSearchInput && docsSearchResults && docsSections.length) {
  docsSearchInput.addEventListener("input", () => {
    const query = docsSearchInput.value.trim().toLowerCase();
    docsSearchResults.replaceChildren();

    if (query.length < 2) {
      docsSearchResults.hidden = true;
      return;
    }

    const matches = docsSections
      .filter(section => section.textContent.toLowerCase().includes(query))
      .slice(0, 8);

    if (!matches.length) {
      const empty = document.createElement("p");
      empty.className = "docs-search-empty";
      empty.textContent = "No matching documentation sections.";
      docsSearchResults.appendChild(empty);
      docsSearchResults.hidden = false;
      return;
    }

    matches.forEach(section => {
      const link = document.createElement("a");
      link.href = `#${section.id}`;
      link.textContent = section.querySelector("h2")?.textContent || section.id;
      link.addEventListener("click", () => {
        docsSearchInput.value = "";
        docsSearchResults.hidden = true;
      });
      docsSearchResults.appendChild(link);
    });

    docsSearchResults.hidden = false;
  });

  docsSearchInput.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    docsSearchInput.value = "";
    docsSearchResults.hidden = true;
  });
}

const sectionLinks = [...document.querySelectorAll(".docs-sidebar a[href^='#']")];
const observedSections = sectionLinks
  .map(link => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window && observedSections.length) {
  const observer = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

    if (!visible.length) return;
    const activeId = `#${visible[0].target.id}`;
    sectionLinks.forEach(link => {
      if (link.getAttribute("href") === activeId) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }, { rootMargin: "-16% 0px -72% 0px" });

  observedSections.forEach(section => observer.observe(section));
}
