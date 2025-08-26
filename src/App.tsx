import React, { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export default function IslandIntegrationSite() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  const logoSrc = `${import.meta.env.BASE_URL}logo.png`;

  const heroRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const springConfig = { stiffness: 100, damping: 30, mass: 1 } as const;
  const heroY = useSpring(useTransform(heroProgress, [0, 1], [0, 240]), springConfig);
  const heroScale = useSpring(useTransform(heroProgress, [0, 1], [1, 1.08]), springConfig);
  const heroOpacity = useSpring(useTransform(heroProgress, [0, 1], [1, 0.8]), springConfig);

  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(media.matches);
    const onChange = () => setReduceMotion(media.matches);
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setDark(saved === "dark");
  }, []);
  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const mailtoSubject = "Consultation Request";
  const mailtoBody = `Hi Island Integration,\n\nI'd like to discuss a project.\n\nName: \nPhone: \nLocation: \nDetails: \n`;
  const mailtoHref = `mailto:info@island-integration.com?subject=${encodeURIComponent(mailtoSubject)}&body=${encodeURIComponent(mailtoBody)}`;

  const services = [
    { title: "Lighting Control", desc: "Scene-based lighting, daylight automation, and keypad engravings for intuitive living." },
    { title: "Home Cinema", desc: "High-end projectors, immersive audio, and custom seating layouts for cinematic experiences." },
    { title: "Automated Shading", desc: "Motorized blinds and shades integrated with lighting and climate for comfort and efficiency." },
    { title: "Design", desc: "System design, rack layouts, and detailed planning tailored to your property." },
    { title: "Climate Control", desc: "Smart thermostats and HVAC integration for comfort and energy savings." },
    { title: "Multi-Room TV & Audio", desc: "Seamless entertainment in every room with centralized distribution." },
    { title: "Smart Home Security", desc: "Advanced surveillance, access control, and intercom systems for peace of mind." },
    { title: "WiFi & Networking", desc: "Enterprise-grade Wi-Fi, fiber, and resilient network infrastructure for fast, reliable connectivity." },
    { title: "System Support", desc: "Ongoing support, monitoring, and upgrades to keep everything running smoothly." },
  ] as const;

  const fadeUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  } as const;

  return (
    <div className={`font-sans scroll-smooth selection:bg-black selection:text-white ${dark ? 'bg-neutral-950 text-neutral-100' : 'bg-white text-neutral-900'}`}>
      <header className={`sticky top-0 z-50 backdrop-blur border-b ${dark ? 'bg-neutral-950/70 border-white/10' : 'bg-white/70 border-neutral-200/60'}`}>
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <a href="#home" className="flex items-center gap-3">
            <img src={logoSrc} alt="Island Integration logo" className="h-8 w-auto" />
            <span className="font-semibold tracking-wide">Island Integration</span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#services" className="hover:opacity-60">Services</a>
            <a href="#process" className="hover:opacity-60">Process</a>
            <a href="#contact" className="hover:opacity-60">Contact</a>
          </nav>

          <button aria-label="Toggle theme" onClick={() => setDark(d => !d)} className={`mr-2 hidden sm:inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs ${dark ? 'border-white/15 hover:bg-white/5' : 'border-neutral-300/70 hover:bg-neutral-100'}`}>
            {dark ? '🌙 Dark' : '☀️ Light'}
          </button>

          <button aria-label="Open menu" className="md:hidden rounded-lg border border-neutral-300 px-3 py-2" onClick={() => setOpen(true)}>
            <div className="h-0.5 w-5 bg-current mb-1" />
            <div className="h-0.5 w-5 bg-current" />
          </button>
        </div>

        {open && (
          <div className="md:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <nav className={`absolute right-0 top-0 h-full w-72 shadow-xl p-6 flex flex-col gap-4 ${dark ? 'bg-neutral-900 text-white' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={logoSrc} alt="Island Integration logo" className="h-6 w-auto" />
                  <span className="font-semibold">Island Integration</span>
                </div>
                <button aria-label="Close menu" className="rounded-md p-2 hover:bg-neutral-100" onClick={() => setOpen(false)}>✕</button>
              </div>
              <a onClick={() => setOpen(false)} href="#services" className="py-2">Services</a>
              <a onClick={() => setOpen(false)} href="#process" className="py-2">Process</a>
              <a onClick={() => setOpen(false)} href="#contact" className="py-2">Contact</a>
              <a onClick={() => setOpen(false)} href="tel:+12428209013" className="mt-4 rounded-full bg-neutral-900 text-white px-4 py-3 text-center">Call +1 (242) 820-9013</a>
            </nav>
          </div>
        )}
      </header>

      <section id="home" ref={heroRef} className="relative overflow-hidden">
        <motion.div style={{ y: reduceMotion ? 0 : heroY, opacity: heroOpacity, scale: reduceMotion ? 1 : heroScale }} className="absolute inset-0 -z-10 will-change-transform">
          <img loading="eager" src="https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=2000&auto=format&fit=crop" alt="Luxury smart home" className="h-full w-full object-cover" />
          <div className={`absolute inset-0 ${dark ? 'bg-gradient-to-t from-neutral-950 via-neutral-900/40 to-transparent' : 'bg-gradient-to-t from-white via-white/40 to-transparent'}`} />
        </motion.div>
        <div className="mx-auto max-w-7xl px-4 py-28 md:py-40">
          <motion.div variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: false, margin: "-80px" }} className="max-w-2xl">
            <div className="mb-6 flex items-center gap-3">
              <img src={logoSrc} alt="Island Integration logo" className="h-10 w-auto" />
              <span className="sr-only">Island Integration</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
              <span className={`bg-gradient-to-r bg-clip-text text-transparent ${dark ? 'from-white to-neutral-400' : 'from-neutral-900 to-neutral-600'}`}>Smart Homes & Luxury Integration</span>
              <span className="block text-neutral-500 text-xl md:text-2xl mt-4">Bahamas-based Control4, networking, AV, and security specialists.</span>
            </h1>
            <div className="mt-8 flex flex-col sm:flex-row items-start gap-4">
              <a href="#services" className="rounded-full border border-neutral-900 px-6 py-3">Our Services</a>
            </div>
            <p className="mt-8 text-sm text-neutral-600 max-w-lg">
              12+ years delivering seamless control, resilient networks, and beautiful audio/visual experiences across Nassau, New Providence, and the outer islands.
            </p>
          </motion.div>
        </div>
      </section>

      <section className={`border-y ${dark ? 'border-white/10 bg-neutral-900/30' : 'border-neutral-200/70 bg-neutral-50'}`}>
        <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-neutral-600">
          {["Control4 Partner", "Snap One / WattBox", "Luma Cameras", "Ubiquiti Networks"].map((t) => (
            <motion.div key={t} variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }} className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-neutral-900" />{t}
            </motion.div>
          ))}
        </div>
      </section>

      <section id="services" className="mx-auto max-w-7xl px-4 py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-4xl font-semibold">Services</h2>
            <div className={`h-1 w-24 bg-gradient-to-r rounded-full mt-3 ${dark ? 'from-white to-neutral-400' : 'from-neutral-900 to-neutral-500'}`} />
          </div>
          <a href="#contact" className="text-sm underline underline-offset-4">Request a site visit</a>
        </div>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <motion.div key={s.title} variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }} transition={{ delay: i * 0.05 }} className={`group rounded-2xl border backdrop-blur p-6 shadow-sm hover:shadow-lg transition relative overflow-hidden ${dark ? 'border-white/10 bg-white/5' : 'border-neutral-200/70 bg-white/70'}`}>
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-neutral-100 group-hover:bg-neutral-200 transition" />
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-neutral-100 text-neutral-900">
                  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6"><path d="M3 7a9 9 0 0 1 18 0M6 10a6 6 0 1 1 12 0M9 13a3 3 0 1 1 6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition text-xs text-neutral-500">Learn more →</div>
              </div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="process" className="mx-auto max-w-7xl px-4 py-20">
        <div>
          <h2 className="text-2xl md:text-4xl font-semibold">Our Process</h2>
          <div className={`h-1 w-24 bg-gradient-to-r rounded-full mt-3 ${dark ? 'from-white to-neutral-400' : 'from-neutral-900 to-neutral-500'}`} />
        </div>
        <ol className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
          {[
            { n: 1, t: "Consultation", d: "Site walk-through or plans review. We listen, measure, and define goals." },
            { n: 2, t: "Design & Estimate", d: "Clear scope, equipment list, and timeline with mobilization details." },
            { n: 3, t: "Installation", d: "Clean, labeled wiring; racks and devices documented and tested." },
            { n: 4, t: "Support", d: "Remote monitoring, on-site care, and upgrade paths." },
          ].map((step, i) => (
            <motion.li key={step.n} variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-neutral-200 p-5">
              <div className="text-xs text-neutral-500">Step {step.n}</div>
              <div className="mt-1 font-semibold">{step.t}</div>
              <p className="mt-2 text-neutral-600">{step.d}</p>
            </motion.li>
          ))}
        </ol>
      </section>

      <section id="contact" className="relative mx-auto max-w-7xl px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }}>
            <h2 className="text-2xl md:text-4xl font-semibold">Let’s plan your project</h2>
            <p className="mt-4 text-sm text-neutral-600 max-w-md">
              Call <a href="tel:+12428209013" className="underline">+1 (242) 820-9013</a> or message us. We typically reply same day.
            </p>
            <div className="mt-8 flex items-center gap-6">
              <div className={`h-28 w-28 rounded flex items-center justify-center text-[10px] ${dark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-200 text-neutral-500'}`}>
                QR Code
              </div>
              <div className="text-sm text-neutral-600">
                Scan to visit <span className="font-medium">island-integration.com</span><br />
                or email <a href="mailto:info@island-integration.com" className="underline">info@island-integration.com</a>
              </div>
            </div>
          </motion.div>

          <motion.form variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }} className={`rounded-2xl border p-6 shadow-sm ${dark ? 'border-white/10 bg-white/5' : 'border-neutral-200 bg-white'}`} onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 gap-4">
              <label className="text-sm">Name
                <input required className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${dark ? 'border-neutral-700 focus:ring-white/30 bg-neutral-900 text-white' : 'border-neutral-300 focus:ring-neutral-900'}`} />
              </label>
              <label className="text-sm">Email
                <input type="email" required className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${dark ? 'border-neutral-700 focus:ring-white/30 bg-neutral-900 text-white' : 'border-neutral-300 focus:ring-neutral-900'}`} />
              </label>
              <label className="text-sm">Phone
                <input className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${dark ? 'border-neutral-700 focus:ring-white/30 bg-neutral-900 text-white' : 'border-neutral-300 focus:ring-neutral-900'}`} />
              </label>
              <label className="text-sm">Message
                <textarea rows={4} className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${dark ? 'border-neutral-700 focus:ring-white/30 bg-neutral-900 text-white' : 'border-neutral-300 focus:ring-neutral-900'}`} placeholder="Tell us about your project..." />
              </label>
              <button className="mt-2 rounded-full bg-neutral-900 text-white px-6 py-3">Send</button>
              <p className="text-xs text-neutral-500">This demo form doesn’t send yet. We can wire it to Formspree or a Netlify/Vercel function.</p>
            </div>
          </motion.form>
        </div>
      </section>

      <footer className={`border-t ${dark ? 'border-white/10' : 'border-neutral-200/70'}`}>
        <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-neutral-600 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} Island Integration. Nassau, Bahamas.</div>
          <div className="flex items-center gap-6">
            <a href="#services" className="hover:underline">Services</a>
            <a href="#process" className="hover:underline">Process</a>
            <a href="#contact" className="hover:underline">Contact</a>
          </div>
        </div>
      </footer>

      <a href={mailtoHref} target="_top" rel="noopener noreferrer" className="hidden md:inline-flex fixed bottom-6 right-6 rounded-full bg-neutral-900 text-white px-5 py-3 shadow-lg" title="Email Island Integration">
        Book a Consultation
      </a>
      <a href="tel:+12428209013" className="md:hidden fixed bottom-6 right-6 rounded-full bg-neutral-900 text-white px-5 py-3 shadow-lg">Call Now</a>
    </div>
  );
}
