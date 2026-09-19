import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  ReceiptText,
  ShieldCheck,
  Check,
  Building2,
  Sparkles,
} from 'lucide-react';
import { useCustomerContext } from '@/context/CustomerContext';
import { DietaryPreference } from '@/types/customer';

export const CustomerProfilePage: React.FC = () => {
  const {
    customer,
    updateProfile,
    activeOutlet,
    setIsOutletModalOpen,
    setIsAuthModalOpen,
  } = useCustomerContext();

  const [dietaryPrefs, setDietaryPrefs] = useState<DietaryPreference[]>(
    customer.dietaryPreferences || []
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleDietary = (pref: DietaryPreference) => {
    const next = dietaryPrefs.includes(pref)
      ? dietaryPrefs.filter((p) => p !== pref)
      : [...dietaryPrefs, pref];
    setDietaryPrefs(next);
    updateProfile({ dietaryPreferences: next });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-amber-500/20 border-2 border-amber-500/40 shrink-0 flex items-center justify-center shadow-lg">
          {customer.avatarUrl ? (
            <img src={customer.avatarUrl} alt={customer.name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-amber-400" />
          )}
        </div>

        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {customer.name}
              </h1>
              <p className="text-xs text-amber-400 font-semibold flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                Royal Connoisseur Member
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Edit Profile
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 pt-2">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              {customer.phone}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              {customer.email}
            </span>
          </div>
        </div>
      </div>

      {/* Preferences & Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Preferred Outlet */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Preferred Dining Outlet</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsOutletModalOpen(true)}
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              Change
            </button>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <h4 className="text-sm font-bold text-white">{activeOutlet?.name || 'Chennai Central'}</h4>
            <p className="text-xs text-slate-400">{activeOutlet?.address}</p>
            <p className="text-xs text-emerald-400 pt-1">
              ● Open today ({activeOutlet?.openingHours})
            </p>
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Dietary Preferences</span>
            </h3>
            {savedSuccess && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Saved
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { key: 'VEG', label: 'Vegetarian Only' },
              { key: 'NON_VEG', label: 'Non-Vegetarian' },
              { key: 'SPICY', label: 'Loves Spicy Food 🌶' },
              { key: 'GLUTEN_FREE', label: 'Gluten-Sensitive' },
            ].map((d) => {
              const isSelected = dietaryPrefs.includes(d.key as any);
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => toggleDietary(d.key as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Saved Delivery Addresses */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>Saved Delivery Addresses</span>
          </h3>
          <Link
            to="/customer/checkout"
            className="text-xs text-amber-400 hover:underline font-semibold"
          >
            Manage at Checkout
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {customer.addresses.map((addr) => (
            <div
              key={addr.id}
              className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-slate-800 text-amber-400 text-[10px] font-bold rounded uppercase">
                  {addr.label}
                </span>
                {addr.isDefault && (
                  <span className="text-[10px] text-emerald-400 font-semibold">Default</span>
                )}
              </div>
              <h4 className="text-xs font-bold text-white pt-1">{addr.street}</h4>
              {addr.apartment && <p className="text-[11px] text-slate-400">{addr.apartment}</p>}
              <p className="text-[10px] text-slate-500">
                {addr.city} - {addr.pincode}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <Link
          to="/customer/orders"
          className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-2xl flex items-center gap-3 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ReceiptText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Order History</h4>
            <p className="text-[10px] text-slate-400">View past tickets & receipts</p>
          </div>
        </Link>

        <Link
          to="/customer/favorites"
          className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-2xl flex items-center gap-3 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Saved Delicacies</h4>
            <p className="text-[10px] text-slate-400">Quick 1-click reordering</p>
          </div>
        </Link>

        <Link
          to="/dashboard"
          className="p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-2xl flex items-center gap-3 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Staff Management</h4>
            <p className="text-[10px] text-slate-400">Switch to POS / KDS portal</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default CustomerProfilePage;
