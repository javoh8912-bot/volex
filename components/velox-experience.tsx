'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Menu, Search, X } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type Car = { id: string; name: string; category: string; image: string; description: string; year: string }
const cars: Car[] = [
  { id: 'aura', name: 'AURA GT', category: 'GRAND TOURER', image: 'photo-1503376780353-7e6692767b70', description: 'A fictional study in effortless distance. A sculpted grand tourer shaped around the quiet thrill of the open road.', year: 'CONCEPT' },
  { id: 'nox', name: 'NOX R', category: 'ELECTRIC', image: 'photo-1492144534655-ae79c964c9d7', description: 'A fictional electric performance concept: precise, immediate, and built to make every arrival feel considered.', year: 'CONCEPT' },
  { id: 'sol', name: 'SOL 01', category: 'ROADSTER', image: 'photo-1503736334956-4c8f8e92946d', description: 'A fictional open-cockpit roadster celebrating the elemental connection between driver, machine, and landscape.', year: 'CONCEPT' },
]
const navItems = ['Home', 'Collection', 'Models', 'Experience', 'About', 'Contact']
const imageUrl = (id: string, width = 1000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`

export default function VeloxExperience() {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [filter, setFilter] = useState('ALL')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('featured')
  const [selected, setSelected] = useState<Car | null>(null)
  const [formState, setFormState] = useState('')
  const [cursor, setCursor] = useState({ x: 0, y: 0 })

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.timeline({ defaults: { ease: 'power3.out' } })
          .fromTo('.hero-eyebrow', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .6 })
          .fromTo('.hero h1', { y: 55, opacity: 0, clipPath: 'inset(0 0 100% 0)' }, { y: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 1 }, '-=.15')
          .fromTo('.hero-copy>p, .hero-copy>.button-light', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .65, stagger: .12 }, '-=.35')
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => { 
          gsap.fromTo(element, { y: 38, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85, delay: Number(element.dataset.revealDelay ?? 0), ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 88%', toggleActions: 'play none none reverse' } })
        })
        gsap.utils.toArray<HTMLElement>('[data-image-reveal]').forEach((element) => {
          gsap.fromTo(element, { clipPath: 'inset(12% 12% 12% 12%)', scale: 1.08 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.2, ease: 'power3.inOut', scrollTrigger: { trigger: element, start: 'top 82%', toggleActions: 'play none none reverse' } })
        })
        gsap.utils.toArray<HTMLElement>('[data-count]').forEach((element) => {
          const target = Number(element.dataset.count)
          const counter = { value: 0 }
          gsap.to(counter, { value: target, duration: 1.8, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 85%', toggleActions: 'play none none reverse' }, onUpdate: () => { element.textContent = `${Math.round(counter.value)}${element.dataset.suffix ?? ''}` } })
        })
        gsap.to('.hero-visual img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true } })
      }
      const sections = gsap.utils.toArray<HTMLElement>('main section[id]')
      sections.forEach((section) => ScrollTrigger.create({ trigger: section, start: 'top 45%', end: 'bottom 45%', onToggle: (self) => self.isActive && setActive(section.id) }))
    }, root)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenuOpen(false); setSelected(null); if (location.hash.startsWith('#model-')) history.replaceState(null, '', '#collection') } }
    window.addEventListener('keydown', onKey)
    const onPop = () => { const id = location.hash.replace('#model-', ''); setSelected(cars.find((car) => car.id === id) ?? null) }
    window.addEventListener('popstate', onPop)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('popstate', onPop) }
  }, [])

  const visibleCars = useMemo(() => {
    const result = cars.filter((car) => (filter === 'ALL' || car.category === filter) && `${car.name} ${car.category}`.toLowerCase().includes(query.toLowerCase()))
    return sort === 'name' ? [...result].sort((a, b) => a.name.localeCompare(b.name)) : result
  }, [filter, query, sort])
  const goTo = useCallback((id: string) => { setMenuOpen(false); setSelected(null); history.pushState(null, '', `#${id}`); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }, [])
  const openCar = (car: Car) => { setSelected(car); history.pushState(null, '', `#model-${car.id}`); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const closeCar = () => { setSelected(null); history.pushState(null, '', '#collection'); document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' }) }

  return (
    <main ref={root} className="velox" onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}>
      <div className="cursor-glow" style={{ left: cursor.x, top: cursor.y }} aria-hidden="true" />
      <header className="site-header">
        <a className="wordmark" href="#home" onClick={(e) => { e.preventDefault(); goTo('home') }}>VELOX<span>®</span></a>
        <nav className="desktop-nav" aria-label="Main navigation">{navItems.map((item) => <a key={item} className={active === item.toLowerCase() ? 'active' : ''} href={`#${item.toLowerCase()}`} onClick={(e) => { e.preventDefault(); goTo(item.toLowerCase()) }}><span>{item}</span><span className="nav-hover">{item}</span></a>)}</nav>
        <a className="header-cta" href="#contact" onClick={(e) => { e.preventDefault(); goTo('contact') }}>ENQUIRE <ArrowUpRight size={13} /></a>
        <button className="menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </header>
      {menuOpen && <div className="mobile-menu"><span className="eyebrow">NAVIGATION / 01—06</span>{navItems.map((item, i) => <a key={item} href={`#${item.toLowerCase()}`} onClick={(e) => { e.preventDefault(); goTo(item.toLowerCase()) }}><small>0{i + 1}</small>{item}<ArrowUpRight /></a>)}<p>ENGINEERED FOR THE FEELING.</p></div>}

      {selected ? <section className="detail-view" aria-labelledby="detail-title"><button className="back-link" onClick={closeCar}><ArrowLeft size={16} /> BACK TO COLLECTION</button><div className="detail-photo"><Image src={imageUrl(selected.image, 1800)} alt={`${selected.name} fictional concept vehicle`} fill priority sizes="100vw" /></div><div className="detail-content"><div><span className="eyebrow">{selected.category} / {selected.year}</span><h1 id="detail-title">{selected.name}</h1><p>{selected.description}</p><span className="fictional-tag">FICTIONAL CONCEPT — NOT A PRODUCTION VEHICLE</span></div><a className="button-outline" href="#contact" onClick={(e) => { e.preventDefault(); setSelected(null); goTo('contact') }}>MAKE AN ENQUIRY <ArrowUpRight size={16} /></a></div></section> : <>
        <section id="home" className="hero section-dark">
          <div className="hero-visual"><Image src="/velox-hero.png" alt="Midnight-black grand touring concept on a dramatic coastal road" fill priority sizes="100vw" /></div><div className="hero-shade" />
          <div className="hero-copy"><span className="eyebrow hero-eyebrow"><i /> INDEPENDENT AUTOMOTIVE CULTURE — EST. 2024</span><h1>MOVE<br /><em>WITHOUT</em><br />COMPROMISE.</h1><p>A new perspective on the art of going further.</p><a href="#collection" className="button-light" onClick={(e) => { e.preventDefault(); goTo('collection') }}>DISCOVER THE COLLECTION <ArrowRight size={15} /></a></div>
          <div className="hero-wordmark" aria-hidden="true">VELOX</div><div className="hero-meta"><span>01 / 06 — THE BEGINNING</span><span>SCROLL TO EXPLORE <ArrowDown size={14} /></span></div><div className="hero-index">V / 01</div>
        </section>

        <section id="collection" className="collection section-light"><div className="section-top" data-reveal><span className="eyebrow">01 — THE COLLECTION</span><span className="section-note">A STUDY IN MOVEMENT, FORM & FEELING.</span></div><div className="section-heading" data-reveal><h2>DESIGNED TO<br /><em>LEAVE A MARK.</em></h2><p>Three imagined expressions of the road ahead. Every VELOX model is a fictional design concept—not a real vehicle or available specification.</p></div>
          <div className="collection-toolbar" data-reveal><div className="filters" role="group" aria-label="Filter vehicles by category">{['ALL', 'GRAND TOURER', 'ELECTRIC', 'ROADSTER'].map((item) => <button key={item} className={filter === item ? 'filter-active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="collection-tools"><label className="search-box"><Search size={14} /><input aria-label="Search vehicles" placeholder="SEARCH MODELS" value={query} onChange={(e) => setQuery(e.target.value)} /></label><label className="sort-label">SORT <select aria-label="Sort vehicles" value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">FEATURED</option><option value="name">NAME A—Z</option></select></label></div></div>
          <div className="car-grid">{visibleCars.map((car, index) => <article className="car-card" key={car.id} data-reveal data-reveal-delay={index * 0.14}><button className="car-image" data-image-reveal onClick={() => openCar(car)} aria-label={`View ${car.name} details`}><Image src={imageUrl(car.image, 1000)} alt={`${car.name} fictional automotive concept`} fill sizes="(max-width: 700px) 100vw, 50vw" /><span className="card-number">0{index + 1} / 03</span><span className="card-arrow"><ArrowUpRight /></span></button><div className="car-info"><div><span className="eyebrow">{car.category} · {car.year}</span><h3>{car.name}</h3></div><button className="text-link" onClick={() => openCar(car)}>VIEW DETAILS <ArrowRight size={14} /></button></div><p className="fictional-note">FICTIONAL DESIGN CONCEPT</p></article>)}</div>{visibleCars.length === 0 && <p className="empty-state">NO MODELS MATCH THAT SEARCH.</p>}
        </section>

        <section id="models" className="manifesto section-dark"><div className="manifesto-image" data-image-reveal><Image src={imageUrl('photo-1492144534655-ae79c964c9d7', 1800)} alt="Sculpted silhouette of a performance car in soft studio light" fill sizes="100vw" /></div><div className="manifesto-overlay" /><div className="manifesto-copy" data-reveal><span className="eyebrow">02 — THE VELOX POINT OF VIEW</span><h2>THE ROAD<br />IS NOT A<br /><em>DESTINATION.</em></h2><p>It is a feeling. A breath held through the bend. The quiet between departure and arrival. We exist for the moments that make the miles matter.</p><a className="text-link light-link" href="#experience" onClick={(e) => { e.preventDefault(); goTo('experience') }}>OUR PHILOSOPHY <ArrowRight size={14} /></a></div><div className="manifesto-caption">FORM FOLLOWS FEELING / 001</div></section>

        <section id="experience" className="experience section-light"><div className="section-top" data-reveal><span className="eyebrow">03 — BEYOND THE MACHINE</span><span className="section-note">A DIFFERENT KIND OF AUTOMOTIVE EXPERIENCE.</span></div><div className="experience-grid"><div className="experience-intro" data-reveal><h2>MORE THAN<br /><em>THE DRIVE.</em></h2><p>VELOX is an independent creative studio exploring the culture, craft, and emotion around the automobile. No showrooms. No sales floor. Just a point of view.</p><a className="text-link" href="#about" onClick={(e) => { e.preventDefault(); goTo('about') }}>GET TO KNOW US <ArrowRight size={14} /></a></div><div className="experience-photo" data-image-reveal><Image src={imageUrl('photo-1500530855697-b586d89ba3ee', 1100)} alt="An empty mountain road disappearing into the landscape" fill sizes="(max-width: 700px) 100vw, 55vw" /><span className="photo-label">THE LONG WAY HOME / 35° 41′ N</span></div></div><div className="stats-row" data-reveal><div><span className="stat-number" data-count="3" data-suffix="">0</span><span>FICTIONAL CONCEPTS</span></div><div><span className="stat-number" data-count="1" data-suffix="">0</span><span>INDEPENDENT PERSPECTIVE</span></div><div><span className="stat-number" data-count="100" data-suffix="%">0%</span><span>MADE FOR THE FEELING</span></div></div></section>

        <section id="about" className="about section-dark"><div className="about-copy" data-reveal><span className="eyebrow">04 — AN INDEPENDENT SPIRIT</span><h2>BUILT ON<br /><em>CURIOSITY.</em></h2><p>VELOX is a fictional automotive brand and design exercise. We imagine what comes next by looking closer at what makes driving matter now: the details, the rituals, the people, the places in between.</p><p className="about-small">NO CLAIMS. NO COMPROMISES. JUST THE OPEN ROAD.</p></div><div className="about-visual" data-image-reveal><Image src={imageUrl('photo-1519608487953-e999c86e7455', 1200)} alt="Dusk settling over an atmospheric mountain landscape" fill sizes="(max-width: 700px) 100vw, 50vw" /><span className="about-coordinate">46° 51′ 08.4″ N<br />09° 31′ 02.1″ E</span></div></section>

        <section id="contact" className="contact section-light"><div className="section-top" data-reveal><span className="eyebrow">05 — START A CONVERSATION</span><span className="section-note">NO SALES PIPELINE. JUST A HUMAN ON THE OTHER SIDE.</span></div><div className="contact-layout"><div data-reveal><h2>LET’S TALK<br /><em>ABOUT THE ROAD.</em></h2><p>Curious about the concepts, the studio, or just want to talk cars? We’d love to hear from you.</p><a className="contact-email" href="mailto:hello@velox.studio">HELLO@VELOX.STUDIO <ArrowUpRight size={16} /></a></div><form className="inquiry-form" onSubmit={(e) => { e.preventDefault(); const form = e.currentTarget; if (!form.reportValidity()) return; setFormState('Thanks for reaching out. This demo form does not send messages; email hello@velox.studio to get in touch.'); form.reset() }}><label>YOUR NAME<input required name="name" placeholder="Name" /></label><label>EMAIL ADDRESS<input required type="email" name="email" placeholder="you@example.com" /></label><label>WHAT’S ON YOUR MIND?<textarea required name="message" rows={3} placeholder="Tell us a little about it..." /></label><button type="submit" className="button-dark">SEND AN ENQUIRY <ArrowRight size={15} /></button>{formState && <p className="form-feedback" role="status">{formState}</p>}<p className="form-disclaimer">DEMONSTRATION FORM — MESSAGES ARE NOT TRANSMITTED.</p></form></div></section>

        <footer className="site-footer"><a className="footer-wordmark" href="#home" onClick={(e) => { e.preventDefault(); goTo('home') }}>VELOX</a><p>INDEPENDENT AUTOMOTIVE CULTURE.<br />A FICTIONAL DESIGN EXERCISE.</p><div className="footer-links"><a href="#collection" onClick={(e) => { e.preventDefault(); goTo('collection') }}>COLLECTION</a><a href="#about" onClick={(e) => { e.preventDefault(); goTo('about') }}>ABOUT</a><a href="mailto:hello@velox.studio">CONTACT</a></div><span className="copyright">© 2025 VELOX STUDIO</span></footer>
      </>}
    </main>
  )
}
