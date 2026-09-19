import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin,
  Search,
  Bell,
  Heart,
  ShoppingBag,
  User,
  ChevronDown,
  Sparkles,
  UtensilsCrossed,
  BellRing,
  ExternalLink,
} from 'lucide-react';
import { useCustomerContext } from '@/context/CustomerContext';
import { useCustomerCartContext } from '@/context/CustomerCartContext';
import { useCustomerFavoritesContext } from '@/context/CustomerFavoritesContext';
import { useCustomerNotificationContext } from '@/context/CustomerNotificationContext';

export const CustomerHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    customer,
    activeOutlet,
    activeTable,
    orderType,
    setIsOutletModalOpen,
    setIsAuthModalOpen,
    setIsCallWaiterModalOpen,
  } = useCustomerContext();

  const { cartSummary, setIsCartOpen } = useCustomerCartContext();
  const { favoriteIds } = useCustomerFavoritesContext();
  const { unreadCount, setIsNotificationOpen } = useCustomerNotificationContext();

  const [headerSearch, setHeaderSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      navigate(`/customer/menu?search=${encodeURIComponent(headerSearch.trim())}`);
    } else {
      navigate('/customer/menu');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl transition-all">
      {/* Top Banner: Promotional / Outlet Status */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 text-slate-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full px-2">
          <Sparkles className="w-3.5 h-3.5 animate-spin text-slate-950" />
          <span>
            Feast in Luxury: Use code <strong className="underline tracking-wide">FEAST20</strong> for 20% off
            gourmet dine-in and online orders!
          </span>
          <span className="hidden sm:inline-block ml-auto text-[11px] font-normal opacity-90">
            • Fresh Farm Ingredients • 100% Chef-Crafted
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-6">
          <Link to="/customer/home" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
                  RestoMaster
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                  Dining
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide hidden sm:block">
                Grand Culinary Experience
              </p>
            </div>
          </Link>

          {/* Outlet Selector Trigger Pill */}
          <button
            type="button"
            onClick={() => setIsOutletModalOpen(true)}
            className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-full transition-all text-left group"
          >
            <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 transition-colors">
                  {activeOutlet ? activeOutlet.name : 'Select Outlet'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-300" />
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Open Now
                </span>
                <span>• {activeOutlet?.distanceKm || 1.8} km</span>
                {orderType === 'DINE_IN' && activeTable && (
                  <span className="text-amber-400 font-semibold">• Table {activeTable}</span>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Global Live Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden lg:flex flex-1 max-w-md relative items-center mx-4"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={headerSearch}
            onChange={(e) => setHeaderSearch(e.target.value)}
            placeholder="Search Hyderabadi biryani, butter chicken, wood-fired pizza..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/90 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-full text-xs text-slate-200 placeholder-slate-400 transition-all outline-none"
          />
        </form>

        {/* Action Controls & Navigation Items */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Menu Link */}
          <Link
            to="/customer/menu"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              location.pathname === '/customer/menu'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>Digital Menu</span>
          </Link>

          {/* Dine-In Waiter Assistance Button (Table Service) */}
          <button
            type="button"
            onClick={() => setIsCallWaiterModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-all"
            title="Call Waiter / Table Service"
          >
            <BellRing className="w-3.5 h-3.5 text-amber-400" />
            <span>Table Service</span>
          </button>

          {/* Favorites Button */}
          <Link
            to="/customer/favorites"
            className="relative p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-rose-400 transition-colors"
            title="Saved Favorites"
          >
            <Heart className="w-4 h-4" />
            {favoriteIds.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {favoriteIds.length}
              </span>
            )}
          </Link>

          {/* Notifications Button */}
          <button
            type="button"
            onClick={() => setIsNotificationOpen(true)}
            className="relative p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-amber-400 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Cart Button with Total */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-semibold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all active:scale-95"
            title="View Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4" />
              {cartSummary.itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-slate-950 text-amber-400 text-[10px] font-black flex items-center justify-center">
                  {cartSummary.itemCount}
                </span>
              )}
            </div>
            <span className="text-xs font-bold hidden sm:inline-block">
              {cartSummary.itemCount > 0 ? `₹${cartSummary.grandTotal}` : 'Cart'}
            </span>
          </button>

          {/* Customer Profile / Auth Trigger */}
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-full transition-colors"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              {customer.avatarUrl ? (
                <img src={customer.avatarUrl} alt={customer.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-3.5 h-3.5 text-amber-400" />
              )}
            </div>
            <span className="text-xs font-medium text-slate-200 hidden md:inline-block">
              {customer.name}
            </span>
          </button>

          {/* Staff POS & Admin Switcher */}
          <Link
            to="/dashboard"
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg transition-colors"
            title="Switch to Staff POS & Kitchen Admin"
          >
            <span>Staff POS</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Mobile Location & Search Secondary Bar */}
      <div className="md:hidden px-4 py-2 bg-slate-900 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsOutletModalOpen(true)}
          className="flex items-center gap-1.5 text-xs text-amber-400 font-medium truncate"
        >
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{activeOutlet?.name || 'Select Outlet'}</span>
          <ChevronDown className="w-3 h-3 shrink-0 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={() => setIsCallWaiterModalOpen(true)}
          className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 flex items-center gap-1 shrink-0"
        >
          <BellRing className="w-3 h-3" />
          <span>Call Waiter</span>
        </button>
      </div>
    </header>
  );
};
