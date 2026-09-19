import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronLeft, ChevronRight, ArrowRight, Clock } from 'lucide-react';

interface Slide {
  id: string;
  tag: string;
  headline: string;
  subheadline: string;
  promoCode?: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  accentColor: string;
}

const HERO_SLIDES: Slide[] = [
  {
    id: 'slide-1',
    tag: "Royal Chef's Special",
    headline: 'Awadhi & Hyderabadi Dum Biryani Festival',
    subheadline: 'Sealed in clay handis, slow-simmered over charcoal embers with saffron, kewra, and succulent prime meats.',
    promoCode: 'FEAST20',
    ctaText: 'Discover Biryanis',
    ctaLink: '/customer/menu?category=biryani',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80',
    accentColor: 'from-amber-500/30 to-orange-600/20',
  },
  {
    id: 'slide-2',
    tag: 'Artisanal Hearth Baked',
    headline: 'Wood-Fired Truffle Sourdough Pizzas',
    subheadline: 'Hand-stretched 48-hour fermented dough, San Marzano tomato coulis, wild porcini, and fresh buffalo burrata.',
    promoCode: 'WELCOME100',
    ctaText: 'Explore Pizzas',
    ctaLink: '/customer/menu?category=pizzas',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
    accentColor: 'from-rose-500/30 to-amber-600/20',
  },
  {
    id: 'slide-3',
    tag: 'Heritage Grand Feast',
    headline: 'Maharaja Royal Thali & Charcoal Kebabs',
    subheadline: 'An imperial 9-course gastronomic banquet featuring Dal Bukhara, Paneer Lababdar, and saffron rasmalai.',
    promoCode: 'WEEKEND50',
    ctaText: 'Order Thali Combo',
    ctaLink: '/customer/menu?category=combos',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    accentColor: 'from-emerald-500/30 to-amber-600/20',
  },
];

export const HeroBanner: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentIdx];

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
      <div className="relative h-[340px] sm:h-[400px] md:h-[440px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            {/* Background Photography with Dark Vignette Gradient */}
            <img
              src={slide.imageUrl}
              alt={slide.headline}
              className="w-full h-full object-cover brightness-[0.45] contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.accentColor}`} />

            {/* Slide Content Overlay */}
            <div className="absolute inset-0 p-6 sm:p-10 md:p-12 flex flex-col justify-end max-w-2xl">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="space-y-3 sm:space-y-4"
              >
                {/* Tag Pill & Promo Code */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    {slide.tag}
                  </span>
                  {slide.promoCode && (
                    <span className="px-3 py-1 bg-slate-900/80 text-white border border-slate-700 rounded-full text-xs font-mono font-semibold flex items-center gap-1">
                      Code: <strong className="text-amber-400">{slide.promoCode}</strong>
                    </span>
                  )}
                  <span className="hidden sm:inline-flex items-center gap-1 text-slate-300 text-xs">
                    <Clock className="w-3 h-3 text-amber-400" />
                    20 Min Fresh Delivery
                  </span>
                </div>

                {/* Headline */}
                <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight drop-shadow-md">
                  {slide.headline}
                </h1>

                {/* Subheadline */}
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed max-w-xl">
                  {slide.subheadline}
                </p>

                {/* Action CTA Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <Link
                    to={slide.ctaLink}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center gap-2 group"
                  >
                    <span>{slide.ctaText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/customer/menu"
                    className="px-4 py-2.5 sm:px-5 sm:py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold rounded-xl border border-slate-700 transition-all backdrop-blur-md"
                  >
                    View All 30+ Dishes
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Navigation Arrows */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/60 hover:bg-slate-900 border border-slate-700 text-white flex items-center justify-center backdrop-blur-md transition-all opacity-80 hover:opacity-100 hover:scale-105"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/60 hover:bg-slate-900 border border-slate-700 text-white flex items-center justify-center backdrop-blur-md transition-all opacity-80 hover:opacity-100 hover:scale-105"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Indicator Dots */}
        <div className="absolute bottom-4 right-6 flex items-center gap-2 z-10">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIdx(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === currentIdx ? 'w-8 bg-amber-400' : 'w-2 bg-slate-600 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
