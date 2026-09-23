import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, ShieldCheck, Award, Heart, Phone, Mail, MapPin, Clock } from 'lucide-react';

export const CustomerFooter: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs mt-20">
      {/* Top Value Badges */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Michelin Recommended</h4>
              <p className="text-[11px] text-slate-400">Award-winning executive culinary master chefs</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">100% Farm Fresh</h4>
              <p className="text-[11px] text-slate-400">Strict hygiene & artisanal grade ingredients</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Freshly Plated</h4>
              <p className="text-[11px] text-slate-400">Cooked to order within 20 minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Crafted with Love</h4>
              <p className="text-[11px] text-slate-400">Over 50,000+ satisfied food connoisseurs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Locations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <span className="font-serif text-lg font-bold text-white tracking-tight">RestoMaster</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            A harmonious fusion of royal culinary traditions, clay tandoor perfection, wood-fired hearths, and seamless modern dining technology.
          </p>
          <div className="pt-2 flex items-center gap-3 text-slate-400">
            <span className="text-[11px]">Certified FSSAI Lic. #10022022000841</span>
          </div>
        </div>

        <div>
          <h5 className="text-white font-semibold mb-3 text-sm">Explore Menu</h5>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/customer/menu?category=biryani" className="hover:text-amber-400 transition-colors">
                Royal Dum Biryanis
              </Link>
            </li>
            <li>
              <Link to="/customer/menu?category=starters" className="hover:text-amber-400 transition-colors">
                Tandoor & Charcoal Kebabs
              </Link>
            </li>
            <li>
              <Link to="/customer/menu?category=pizzas" className="hover:text-amber-400 transition-colors">
                Wood-Fired Gourmet Pizzas
              </Link>
            </li>
            <li>
              <Link to="/customer/menu?category=mains" className="hover:text-amber-400 transition-colors">
                North Indian Makhani Curries
              </Link>
            </li>
            <li>
              <Link to="/customer/menu?category=desserts" className="hover:text-amber-400 transition-colors">
                Artisanal Desserts & Shakes
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-semibold mb-3 text-sm">Our Grand Outlets</h5>
          <ul className="space-y-2.5 text-xs">
            <li className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>Chennai Central: 14, Khader Nawaz Khan Rd</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>Downtown Bistro: 108, Anna Salai</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>Cyber City Hub: Phoenix MarketCity</span>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-semibold mb-3 text-sm">Guest Concierge</h5>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>+91 9014822734</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>dsp.trend@restomaster.com</span>
            </li>
            <li className="pt-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[11px] transition-colors"
              >
                <span>Staff & Management Portal</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800/60 py-4 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} RestoMaster Dining Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/customer/offers" className="hover:text-amber-400 transition-colors">
              Special Offers
            </Link>
            <Link to="/customer/orders" className="hover:text-amber-400 transition-colors">
              Order History
            </Link>
            <Link to="/customer/profile" className="hover:text-amber-400 transition-colors">
              Privacy & Preferences
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
