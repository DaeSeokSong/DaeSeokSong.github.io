document.querySelectorAll('[data-tabs]').forEach((group) => {
  const buttons = [...group.querySelectorAll('[role="tab"]')];
  const panels = [...group.querySelectorAll('[role="tabpanel"]')];
  buttons.forEach((button) => button.addEventListener('click', () => {
    buttons.forEach((item) => item.setAttribute('aria-selected', String(item === button)));
    panels.forEach((panel) => { panel.hidden = panel.id !== button.getAttribute('aria-controls'); });
  }));
});

const chambers = [...document.querySelectorAll('.chamber')];
const cylinder = document.querySelector('#cylinder');
const trigger = document.querySelector('#trigger-button');
const demoTitle = document.querySelector('#demo-title');
const demoCopy = document.querySelector('#demo-copy');
const demoState = document.querySelector('#demo-state');
let activeChamber = 0;

function selectChamber(index) {
  activeChamber = index;
  chambers.forEach((chamber, chamberIndex) => chamber.classList.toggle('is-active', chamberIndex === index));
  const selected = chambers[index];
  demoTitle.textContent = selected.dataset.title;
  demoCopy.textContent = selected.dataset.copy;
  demoState.textContent = index === 2 ? 'open_slot.planned' : `role_${index === 0 ? 'a' : 'b'}.selected`;
  cylinder.style.transform = `rotate(${index * 120}deg)`;
  chambers.forEach((chamber) => { chamber.style.transform = `rotate(${-index * 120}deg)`; });
}

chambers.forEach((chamber, index) => chamber.addEventListener('click', () => selectChamber(index)));
trigger?.addEventListener('click', () => selectChamber((activeChamber + 1) % chambers.length));

const revealItems = document.querySelectorAll('.reveal');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

document.querySelector('#year').textContent = new Date().getFullYear();
