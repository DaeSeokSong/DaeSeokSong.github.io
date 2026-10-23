const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('[data-tabs]').forEach((group) => {
  const buttons = [...group.querySelectorAll('[role="tab"]')];
  const panels = [...group.querySelectorAll('[role="tabpanel"]')];

  function activate(button, moveFocus) {
    buttons.forEach((item) => {
      const selected = item === button;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel) => { panel.hidden = panel.id !== button.getAttribute('aria-controls'); });
    if (moveFocus) button.focus();
  }

  buttons.forEach((button) => button.addEventListener('click', () => activate(button, false)));

  group.querySelector('[role="tablist"]')?.addEventListener('keydown', (event) => {
    const current = buttons.indexOf(document.activeElement);
    if (current === -1) return;
    const keys = { ArrowRight: current + 1, ArrowLeft: current - 1, ArrowDown: current + 1, ArrowUp: current - 1, Home: 0, End: buttons.length - 1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    activate(buttons[(keys[event.key] + buttons.length) % buttons.length], true);
  });

  // deep links: #revolvernet, #cartridge, #expert-synapse
  const hashTabs = { '#revolvernet': 'rv-tab', '#cartridge': 'ct-tab', '#expert-synapse': 'es-tab' };
  function openFromHash() {
    const id = hashTabs[window.location.hash.toLowerCase()];
    const tab = id && document.getElementById(id);
    if (!tab || !group.contains(tab)) return;
    activate(tab, false);
    group.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
});

// architecture figures: switch between views of the same diagram
document.querySelectorAll('.fig').forEach((fig) => {
  const buttons = [...fig.querySelectorAll('[data-set-state]')];
  const title = fig.querySelector('.fig-title');
  const copy = fig.querySelector('.fig-copy');
  const label = fig.querySelector('.fig-state');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      fig.dataset.state = button.dataset.setState;
      buttons.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
      if (title) title.textContent = button.dataset.title;
      if (copy) copy.textContent = button.dataset.copy;
      if (label) label.textContent = button.dataset.label;
    });
  });
});

const revealItems = document.querySelectorAll('.reveal');
if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  revealItems.forEach((item) => revealObserver.observe(item));
}

const sectionLinks = [...document.querySelectorAll('nav a')];
const sections = sectionLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window) {
  const navigationObserver = new IntersectionObserver((entries) => {
    const current = entries.find((entry) => entry.isIntersecting);
    if (!current) return;
    sectionLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${current.target.id}`));
  }, { rootMargin: '-35% 0px -55% 0px' });
  sections.forEach((section) => navigationObserver.observe(section));
}

const copyButton = document.querySelector('#copy-email');
copyButton?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(copyButton.dataset.email);
    copyButton.textContent = 'Copied';
    window.setTimeout(() => { copyButton.textContent = 'Copy address'; }, 1600);
  } catch {
    window.location.href = `mailto:${copyButton.dataset.email}`;
  }
});

const yearEl = document.querySelector('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
