import React from 'react';
import { X, MapPin, Clock, Users, Star, CheckCircle, Navigation } from 'lucide-react';
import { useCustomerContext } from '@/context/CustomerContext';

export const OutletSelectorModal: React.FC = () => {
  const {
    outlets,
    activeOutlet,
    setActiveOutletId,
    isOutletModalOpen,
    setIsOutletModalOpen,
  } = useCustomerContext();

  if (!isOutletModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              <span>Select Dining Outlet</span>
            </h3>
            <p className="text-xs text-slate-400">
              Menu availability, delivery time, and table capacity vary by location.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOutletModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Outlets List */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {outlets.map((outlet) => {
            const isSelected = activeOutlet?.id === outlet.id;
            return (
              <div
                key={outlet.id}
                onClick={() => {
                  setActiveOutletId(outlet.id);
                  setIsOutletModalOpen(false);
                }}
                className={`group relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-slate-700">
                    <img
                      src={outlet.imageUrl}
                      alt={outlet.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                        {outlet.name}
                      </h4>
                      {isSelected && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{outlet.address}, {outlet.city}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {outlet.rating} ({outlet.reviewCount})
                      </span>
                      <span className="flex items-center gap-1">
                        <Navigation className="w-3.5 h-3.5 text-blue-400" />
                        {outlet.distanceKm} km away
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        {outlet.openingHours}
                      </span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <Users className="w-3.5 h-3.5 text-purple-400" />
                        {outlet.availableTables} tables available
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sm:text-right shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all shadow ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                        : 'bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-white'
                    }`}
                  >
                    {isSelected ? 'Currently Selected' : 'Select Outlet'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Need table reservation assistance? Call concierge: +91 44 2833 4900</span>
          <button
            type="button"
            onClick={() => setIsOutletModalOpen(false)}
            className="text-amber-400 hover:underline font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
