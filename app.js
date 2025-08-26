// Reveal animation
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Parallax
const hero = document.getElementById('hero-layer');
const onScroll = () => {
  const y = window.scrollY;
  hero.style.transform = `translateY(${Math.min(y*0.15,240)}px) scale(${1 + Math.min(y/4000,0.08)})`;
  hero.style.opacity = `${Math.max(1 - y/1200, 0.8)}`;
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Services grid with robust image resolver
const services = [
  { title: "Lighting Control", base: "lighting", desc: "Scene-based lighting, daylight automation, and keypad engravings for intuitive living." },
  { title: "Home Cinema", base: "cinema", desc: "High-end projectors, immersive audio, and custom seating layouts for cinematic experiences." },
  { title: "Automated Shading", base: "shading", desc: "Motorized blinds and shades integrated with lighting and climate for comfort and efficiency." },
  { title: "Design", base: "design", desc: "System design, rack layouts, and detailed planning tailored to your property." },
  { title: "Climate Control", base: "climate", desc: "Smart thermostats and HVAC integration for comfort and energy savings." },
  { title: "Multi-Room TV & Audio", base: "multiroom", desc: "Seamless entertainment in every room with centralized distribution." },
  { title: "Smart Home Security", base: "security", desc: "Advanced surveillance, access control, and intercom systems for peace of mind." },
  { title: "WiFi & Networking", base: "wifi", desc: "Enterprise-grade Wi-Fi, fiber, and resilient network infrastructure for fast, reliable connectivity." },
  { title: "System Support", base: "support", desc: "Ongoing support, monitoring, and upgrades to keep everything running smoothly." },
];
function iconFor(title){
  const base='h-6 w-6';
  switch(title){
    case 'Lighting Control': return `<svg viewBox="0 0 24 24" fill="none" class="${base}" aria-label="Lighting icon"><path d="M9 18h6M10 21h4M8 10a4 4 0 1 1 8 0c0 2-1.5 3-2 4-.3.6-.3 1-.3 1H10.3s0-.4-.3-1c-.5-1-2-2-2-4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
    case 'Home Cinema': return `<svg viewBox="0 0 24 24" fill="none" class="${base}" aria-label="Home cinema icon"><rect x="3" y="6" width="18" height="10" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M8 20h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
    case 'Automated Shading': return `<svg viewBox="0 0 24 24" fill="none" class="${base}" aria-label="Shading icon"><path d="M3 5h18M3 9h18M3 13h18M5 17h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
    case 'Design': return `<svg viewBox="0 0 24 24" fill="none" class="${base}" aria-label="Design icon"><path d="M4 7h12v12H4V7Z" stroke="currentColor" stroke-width="1.5"/><path d="M8 11l8-8 4 4-8 8H8v-4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
    case 'Climate Control': return `<svg viewBox="0 0 24 24" fill="none" class="${base}" aria-label="Climate icon"><path d="M12 3v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="16" r="4.5" stroke="currentColor" stroke-width="1.5"/></svg>`;
    case 'Multi-Room TV & Audio': return `<svg viewBox="0 0 24 24" fill="none" class="${base}" aria-label="Audio icon"><path d="M5 15V9l4-3v12l-4-3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M14 9a4 4 0 0 1 0 6M17 7a7 7 0 0 1 0 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
    case 'Smart Home Security': return `<svg viewBox="0 0 24 24" fill="none" class="${base}" aria-label="Security icon"><path d="M12 3l7 3v5c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
    case 'WiFi & Networking': return `<svg viewBox="0 0 24 24" fill="none" class="${base}" aria-label="Wi-Fi icon"><path d="M2.5 8.5A16 16 0 0 1 21.5 8.5M5 11.5a11.5 11.5 0 0 1 14 0M7.5 14.5a7 7 0 0 1 9 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="18" r="1.5" fill="currentColor"/></svg>`;
    case 'System Support': return `<svg viewBox="0 0 24 24" fill="none" class="${base}" aria-label="Support icon"><circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M12 5v4M12 15v4M5 12h4M15 12h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
    default: return `<svg viewBox="0 0 24 24" fill="none" class="${base}" aria-label="Service icon"><path d="M3 12l9-7 9 7v7a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2v-7Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
  }
}
function resolveServiceImage(base, cb) {
  const exts = ["avif", "webp", "jpg", "png"];
  let i = 0;
  function tryNext() {
    if (i >= exts.length) return cb(null);
    const ext = exts[i++];
    const url = `public/services/${base}.${ext}`;
    const test = new Image();
    test.onload = () => cb(url);
    test.onerror = tryNext;
    test.src = url;
  }
  tryNext();
}
const grid = document.getElementById('services-grid');
services.forEach((s) => {
  const card = document.createElement('div');
  card.className = "group rounded-2xl border backdrop-blur p-0 shadow-sm hover:shadow-lg transition relative overflow-hidden border-neutral-200/70 bg-white/70 reveal";
  const media = document.createElement('div');
  media.className = "aspect-[4/3] w-full overflow-hidden";
  const img = document.createElement('img');
  img.alt = `${s.title} photo`;
  img.className = "h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]";
  img.src = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
  resolveServiceImage(s.base, (url) => { if (url) img.src = url; else img.remove(); });
  media.appendChild(img);
  const body = document.createElement('div');
  body.className = "p-6";
  body.innerHTML = `<div class="p-2 rounded-xl bg-neutral-100 text-neutral-900 w-fit">${iconFor(s.title)}</div><h3 class="mt-4 font-semibold">${s.title}</h3><p class="mt-2 text-sm text-neutral-600">${s.desc}</p>`;
  card.appendChild(media); card.appendChild(body); grid.appendChild(card);
});
