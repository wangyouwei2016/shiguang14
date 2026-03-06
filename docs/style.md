import React, { useEffect, useState } from 'react';

export default function WabiSabiTemplate() {
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navigation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#3A3731] font-sans selection:bg-[#C9BDB1] selection:text-[#F5F3EF] overflow-x-hidden">
      {/* Import Fonts */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:wght@300;400;500&family=Inter:wght@300;400;500&display=swap');

          .font-serif { font-family: 'Noto Serif', serif; }
          .font-sans { font-family: 'Inter', sans-serif; }

          /* Custom Texture Classes */
          .texture-paper {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
          }

          .texture-grain {
            background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(58, 55, 49, 0.03) 10px, rgba(58, 55, 49, 0.03) 20px);
          }
        `}
      </style>

      {/* Global Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 texture-paper opacity-60 mix-blend-multiply"></div>

      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out border-b ${
          scrolled
            ? 'bg-[#F5F3EF]/90 backdrop-blur-md py-4 border-[#3A3731]/10'
            : 'bg-transparent py-8 border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="font-serif text-xl tracking-widest uppercase">Wabi-Sabi Studio</div>
          <div className="hidden md:flex gap-12 text-sm tracking-widest text-[#7A7772]">
            {['Works', 'Philosophy', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="hover:text-[#3A3731] transition-colors duration-500 relative group"
              >
                {item}
                <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-[#3A3731] transition-all duration-500 group-hover:w-full"></span>
              </a>
            ))}
          </div>
          {/* Mobile Menu Icon Placeholder */}
          <button className="md:hidden text-[#3A3731]" aria-label="Menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F3EF] to-[#E8E5DF] opacity-50 z-[-1]"></div>

        <div className="text-center px-6 max-w-4xl relative z-10">
          <p className="text-[#7A7772] text-sm md:text-base tracking-[0.2em] uppercase mb-6">
            Imperfection is beauty
          </p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light leading-tight tracking-tight mb-8 text-[#3A3731]">
            Finding Peace <br/>
            <span className="italic text-[#7A7772]/80">in the</span> Incomplete
          </h1>
          <div className="w-[1px] h-24 bg-[#3A3731]/30 mx-auto mt-12 animate-pulse"></div>
        </div>
      </header>

      {/* Philosophy Section */}
      <section id="philosophy" className="py-32 px-6 md:px-12 bg-[#F5F3EF] relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1 space-y-8">
            <h2 className="font-serif text-4xl md:text-5xl text-[#3A3731] mb-8">
              The Art of <br/> Transience
            </h2>
            <p className="text-[#7A7772] text-lg leading-loose font-light max-w-md">
              We embrace the aesthetic of things in flux. Our designs are not merely built; they are cultivated to age gracefully, honoring the natural cycle of growth and decay.
            </p>
            <p className="text-[#7A7772] text-lg leading-loose font-light max-w-md">
              By removing the unnecessary, we allow the essential to speak.
            </p>
          </div>
          <div className="order-1 lg:order-2 relative group">
            <div className="absolute inset-0 border border-[#3A3731]/10 transform translate-x-4 translate-y-4 transition-transform duration-700 group-hover:translate-x-2 group-hover:translate-y-2"></div>
            <div className="relative aspect-[4/5] bg-[#E8E5DF] overflow-hidden texture-grain shadow-2xl shadow-[#3A3731]/5">
              {/* Abstract Shape representing stone/clay */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#C9BDB1] rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-t from-[#D5D0C8]/50 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Selected Works Gallery */}
      <section id="works" className="py-32 px-6 md:px-12 bg-[#E8E5DF]/30 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-[#3A3731]/10 pb-8">
            <h2 className="font-serif text-3xl md:text-4xl text-[#3A3731]">Selected Works</h2>
            <span className="text-[#7A7772] tracking-widest text-sm mt-4 md:mt-0">2023 — 2025</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-y-24">
            {/* Project 1 */}
            <div className="group cursor-pointer">
              <div className="aspect-[3/4] overflow-hidden bg-[#D5D0C8] relative mb-6">
                <div className="absolute inset-0 bg-[#A89C94] opacity-20 group-hover:opacity-0 transition-opacity duration-700"></div>
                <div className="absolute inset-0 flex items-center justify-center text-[#3A3731]/20 font-serif italic text-4xl transform scale-105 group-hover:scale-100 transition-transform duration-1000">
                  Ceramics
                </div>
              </div>
              <h3 className="font-serif text-xl text-[#3A3731] mb-2 group-hover:translate-x-2 transition-transform duration-500">Earth & Fire</h3>
              <p className="text-[#7A7772] text-sm tracking-wide">Brand Identity</p>
            </div>

            {/* Project 2 - Offset */}
            <div className="group cursor-pointer lg:translate-y-16">
              <div className="aspect-[4/3] overflow-hidden bg-[#D1CCC4] relative mb-6">
                 <div className="absolute inset-0 bg-[#8C857E] opacity-20 group-hover:opacity-0 transition-opacity duration-700"></div>
                 <div className="absolute inset-0 flex items-center justify-center text-[#3A3731]/20 font-serif italic text-4xl transform scale-105 group-hover:scale-100 transition-transform duration-1000">
                  Interiors
                </div>
              </div>
              <h3 className="font-serif text-xl text-[#3A3731] mb-2 group-hover:translate-x-2 transition-transform duration-500">Silent Spaces</h3>
              <p className="text-[#7A7772] text-sm tracking-wide">Art Direction</p>
            </div>

            {/* Project 3 */}
            <div className="group cursor-pointer">
              <div className="aspect-[3/4] overflow-hidden bg-[#C9BDB1] relative mb-6">
                <div className="absolute inset-0 bg-[#7A7772] opacity-20 group-hover:opacity-0 transition-opacity duration-700"></div>
                <div className="absolute inset-0 flex items-center justify-center text-[#3A3731]/20 font-serif italic text-4xl transform scale-105 group-hover:scale-100 transition-transform duration-1000">
                  Textiles
                </div>
              </div>
              <h3 className="font-serif text-xl text-[#3A3731] mb-2 group-hover:translate-x-2 transition-transform duration-500">Woven Time</h3>
              <p className="text-[#7A7772] text-sm tracking-wide">Photography</p>
            </div>
          </div>
        </div>
      </section>

      {/* Materiality / Features */}
      <section className="py-32 px-6 md:px-12 relative z-10 border-t border-[#3A3731]/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-3xl text-center mb-20 text-[#3A3731]">Material Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: 'Paper', color: '#F5F3EF' },
              { name: 'Clay', color: '#C9BDB1' },
              { name: 'Stone', color: '#7A7772' },
              { name: 'Wood', color: '#5C554B' }
            ].map((material) => (
              <div key={material.name} className="flex flex-col items-center group">
                <div
                  className="w-full aspect-square rounded-sm shadow-inner mb-6 transition-transform duration-700 group-hover:rotate-3"
                  style={{ backgroundColor: material.color }}
                >
                    {/* Add grain overlay to swatches */}
                    <div className="w-full h-full opacity-20 texture-paper"></div>
                </div>
                <span className="font-serif text-lg text-[#3A3731]">{material.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#E8E5DF] py-20 px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <h2 className="font-serif text-3xl md:text-5xl text-[#3A3731] mb-8">Let's create something<br/>quietly beautiful.</h2>
          <a href="mailto:hello@wabisabi.studio" className="text-[#7A7772] hover:text-[#3A3731] transition-colors duration-300 text-lg tracking-widest border-b border-[#7A7772]/30 pb-1 mb-20">
            hello@wabisabi.studio
          </a>

          <div className="w-full flex flex-col md:flex-row justify-between items-center text-xs tracking-[0.2em] text-[#7A7772] uppercase">
            <div className="mb-4 md:mb-0">© 2025 Wabi-Sabi Studio</div>
            <div className="flex gap-8">
              <a href="#instagram" className="hover:text-[#3A3731] transition-colors">Instagram</a>
              <a href="#pinterest" className="hover:text-[#3A3731] transition-colors">Pinterest</a>
              <a href="#arena" className="hover:text-[#3A3731] transition-colors">Are.na</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
