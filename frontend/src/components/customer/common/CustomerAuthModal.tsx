import React, { useState } from 'react';
import { X, User, Phone, Mail, Check, Sparkles } from 'lucide-react';
import { useCustomerContext } from '@/context/CustomerContext';

export const CustomerAuthModal: React.FC = () => {
  const { customer, updateProfile, isAuthModalOpen, setIsAuthModalOpen } = useCustomerContext();

  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [email, setEmail] = useState(customer.email);
  const [isSaved, setIsSaved] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || 'Guest Diner',
      phone: phone.trim() || '+91 98765 43210',
      email: email.trim() || 'guest@restomaster.com',
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setIsAuthModalOpen(false);
    }, 600);
  };

  const selectPreset = (presetName: string, presetEmail: string, presetDiet: ('VEG' | 'NON_VEG')[]) => {
    setName(presetName);
    setEmail(presetEmail);
    updateProfile({
      name: presetName,
      email: presetEmail,
      dietaryPreferences: presetDiet,
    });
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Customer Profile</h3>
              <p className="text-[11px] text-slate-400">Personalize your dining & receipt records</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Fast Switch Demo Profiles */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Quick Demo Profiles:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => selectPreset('Surya', 'surya@restomaster.com', ['NON_VEG'])}
                className="flex-1 py-1.5 px-2 text-[11px] bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-200 rounded border border-slate-700 transition-colors text-center"
              >
                Surya (Feast)
              </button>
              <button
                type="button"
                onClick={() => selectPreset('Priya', 'priya.veg@restomaster.com', ['VEG'])}
                className="flex-1 py-1.5 px-2 text-[11px] bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-200 rounded border border-slate-700 transition-colors text-center"
              >
                Priya (Veg)
              </button>
              <button
                type="button"
                onClick={() => selectPreset('Chef Vikram', 'vikram.chef@restomaster.com', ['NON_VEG'])}
                className="flex-1 py-1.5 px-2 text-[11px] bg-slate-800 hover:bg-blue-500/20 hover:text-blue-300 text-slate-200 rounded border border-slate-700 transition-colors text-center"
              >
                Vikram (VIP)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Guest / Customer Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
                placeholder="e.g. Surya V."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number (For Order Tracking)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email (For Digital Invoices)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 focus:border-amber-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
                placeholder="surya@example.com"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Profile Updated!</span>
                </>
              ) : (
                <span>Save & Continue Dining</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
