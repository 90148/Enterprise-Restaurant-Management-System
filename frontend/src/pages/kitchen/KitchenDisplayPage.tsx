import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getActiveTickets,
  getKitchenStats,
  updateTicketStatus,
  updateTicketItemStatus,
  recallLastBumpedTicket,
} from '@/api/kot';
import { KotTicket, KotStats, KitchenStation, KotStatus } from '@/types/kot';
import { OrderItemStatus } from '@/types/order';
import { KotPrintModal } from './KotPrintModal';
import { Button } from '@/components/common/Button';
import {
  ChefHat,
  Clock,
  RotateCcw,
  RefreshCw,
  Printer,
  AlertTriangle,
  CheckCircle2,
  Utensils,
  Flame,
  Coffee,
  Pizza,
  Wine,
  Volume2,
  VolumeX,
} from 'lucide-react';

const STATIONS: { id: KitchenStation; label: string; icon: React.ReactNode }[] = [
  { id: 'ALL', label: 'All Stations', icon: <Utensils className="w-4 h-4" /> },
  { id: 'MAIN_KITCHEN', label: 'Main Kitchen', icon: <ChefHat className="w-4 h-4" /> },
  { id: 'PIZZA', label: 'Pizza & Oven', icon: <Pizza className="w-4 h-4" /> },
  { id: 'BAR', label: 'Bar & Drinks', icon: <Wine className="w-4 h-4" /> },
  { id: 'DESSERT', label: 'Dessert & Bakery', icon: <Coffee className="w-4 h-4" /> },
];

export const KitchenDisplayPage: React.FC = () => {
  const { user } = useAuth();
  const outletId = user?.outletId || '';

  const [selectedStation, setSelectedStation] = useState<KitchenStation>('ALL');
  const [tickets, setTickets] = useState<KotTicket[]>([]);
  const [stats, setStats] = useState<KotStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [printTicket, setPrintTicket] = useState<KotTicket | null>(null);

  const prevTicketCount = useRef<number>(0);

  // Play audio chime using Web Audio API on new incoming ticket
  const playAlertSound = useCallback(() => {
    if (!audioEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio playback prevented or unsupported', e);
    }
  }, [audioEnabled]);

  const loadData = useCallback(async (silent = false) => {
    if (!outletId) return;
    if (!silent) setIsRefreshing(true);

    try {
      const [ticketData, statsData] = await Promise.all([
        getActiveTickets(outletId, selectedStation),
        getKitchenStats(outletId),
      ]);

      if (ticketData.length > prevTicketCount.current && prevTicketCount.current > 0) {
        playAlertSound();
      }
      prevTicketCount.current = ticketData.length;

      setTickets(ticketData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load KDS data', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [outletId, selectedStation, playAlertSound]);

  useEffect(() => {
    loadData();
    // Auto-refresh poll every 10 seconds for real-time kitchen responsiveness
    const interval = setInterval(() => {
      loadData(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Status advancement bump
  const handleBumpStatus = async (ticket: KotTicket) => {
    let nextStatus: KotStatus = 'PREPARING';
    if (ticket.status === 'NEW') nextStatus = 'PREPARING';
    else if (ticket.status === 'PREPARING') nextStatus = 'READY';
    else if (ticket.status === 'READY') nextStatus = 'SERVED';

    try {
      await updateTicketStatus(ticket.id, { status: nextStatus });
      await loadData(true);
    } catch (err) {
      console.error('Failed to bump ticket status', err);
    }
  };

  // Toggle individual item status
  const handleToggleItemStatus = async (itemId: string, currentStatus: OrderItemStatus) => {
    const nextStatus: OrderItemStatus = currentStatus === 'READY' ? 'PREPARING' : 'READY';
    try {
      await updateTicketItemStatus(itemId, { status: nextStatus });
      await loadData(true);
    } catch (err) {
      console.error('Failed to update item status', err);
    }
  };

  // Recall last bumped ticket
  const handleRecall = async () => {
    try {
      await recallLastBumpedTicket(outletId);
      await loadData(true);
    } catch (err) {
      alert('No recently bumped tickets available to recall');
    }
  };

  const getElapsedTimeMinutes = (createdAt: string): number => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  const getTimerBadgeClass = (elapsedMins: number) => {
    if (elapsedMins >= 15) {
      return 'bg-rose-900/60 border-rose-500/80 text-rose-300 animate-pulse';
    }
    if (elapsedMins >= 8) {
      return 'bg-amber-900/50 border-amber-500/80 text-amber-300';
    }
    return 'bg-emerald-900/40 border-emerald-500/60 text-emerald-300';
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 -m-6 p-6 select-none">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 shadow-lg shadow-amber-500/20 text-slate-950">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-wide text-white uppercase">
                Kitchen Display System (KDS)
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-900/60 text-emerald-400 border border-emerald-700/50">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Active bump bar & station routing • {outletId ? 'Downtown Outlet' : 'Select Outlet'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2.5 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              audioEnabled
                ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle notification chime"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{audioEnabled ? 'Sound On' : 'Muted'}</span>
          </button>

          <Button
            size="sm"
            variant="outline"
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
            onClick={handleRecall}
          >
            <RotateCcw className="w-4 h-4 mr-1.5 text-amber-400" />
            Recall Last
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
            onClick={() => loadData()}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Today's KOTs</p>
          <p className="text-2xl font-black text-white mt-1">{stats?.totalToday ?? 0}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active On Board</p>
          <p className="text-2xl font-black text-blue-400 mt-1">{stats?.activeTickets ?? tickets.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Preparing</p>
          <p className="text-2xl font-black text-amber-400 mt-1">{stats?.preparingTickets ?? 0}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ready to Serve</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{stats?.readyTickets ?? 0}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Delayed (&gt;15m)</span>
          </p>
          <p className={`text-2xl font-black mt-1 ${(stats?.delayedTickets || 0) > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
            {stats?.delayedTickets ?? 0}
          </p>
        </div>
      </div>

      {/* Station Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
        {STATIONS.map((station) => {
          const isSelected = selectedStation === station.id;
          return (
            <button
              key={station.id}
              onClick={() => setSelectedStation(station.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
              }`}
            >
              {station.icon}
              <span>{station.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tickets Grid */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500">
          <RefreshCw className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
          <p className="text-sm font-semibold">Loading kitchen tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-24 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 text-center p-6">
          <ChefHat className="w-16 h-16 text-slate-700 mb-4" />
          <h3 className="text-lg font-bold text-slate-300">All Caught Up, Chef!</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            There are no pending tickets for station &ldquo;{selectedStation}&rdquo;. New orders from POS will appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tickets.map((ticket) => {
            const elapsedMins = getElapsedTimeMinutes(ticket.createdAt);
            const isDelayed = elapsedMins >= 15;

            return (
              <div
                key={ticket.id}
                className={`flex flex-col justify-between bg-slate-900 rounded-2xl border-2 transition-all shadow-xl overflow-hidden ${
                  isDelayed
                    ? 'border-rose-600 shadow-rose-950/40'
                    : ticket.status === 'READY'
                    ? 'border-emerald-600 shadow-emerald-950/30'
                    : ticket.status === 'PREPARING'
                    ? 'border-amber-500/80 shadow-amber-950/20'
                    : 'border-slate-800'
                }`}
              >
                {/* Ticket Top Header */}
                <div className="p-4 border-b border-slate-800/80 bg-slate-900/90">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-white tracking-wide">
                          {ticket.kotNumber}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-slate-800 text-slate-300">
                          R{ticket.roundNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {ticket.orderNumber}
                      </p>
                    </div>

                    {/* Timer Badge */}
                    <div
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-black ${getTimerBadgeClass(
                        elapsedMins
                      )}`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{elapsedMins}m</span>
                    </div>
                  </div>

                  {/* Destination / Table / Guest Info */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    {ticket.tableNumber ? (
                      <span className="font-extrabold text-blue-400 bg-blue-950/60 border border-blue-800 px-2 py-0.5 rounded">
                        Table {ticket.tableNumber} {ticket.floorName ? `• ${ticket.floorName}` : ''}
                      </span>
                    ) : (
                      <span className="font-extrabold text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded uppercase">
                        {ticket.orderType}
                      </span>
                    )}
                    <span className="text-slate-400 font-medium truncate max-w-[120px]">
                      {ticket.serverName || ticket.customerName || 'Server'}
                    </span>
                  </div>

                  {/* Ticket-Level Notes Callout */}
                  {ticket.notes && (
                    <div className="mt-2.5 p-2 rounded-lg bg-amber-950/40 border border-amber-600/60 text-amber-300 text-xs font-semibold flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>{ticket.notes}</span>
                    </div>
                  )}
                </div>

                {/* Items List */}
                <div className="p-4 flex-1 divide-y divide-slate-800/60 overflow-y-auto max-h-72">
                  {ticket.items.map((item) => {
                    const isItemReady = item.status === 'READY' || item.status === 'SERVED';
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleItemStatus(item.id, item.status)}
                        className={`py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3 cursor-pointer group transition-opacity ${
                          isItemReady ? 'opacity-40 line-through text-slate-500' : 'text-slate-100'
                        }`}
                        title="Click to mark item ready / toggle"
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black flex-shrink-0 ${
                              isItemReady
                                ? 'bg-slate-800 text-slate-400'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                            }`}
                          >
                            {item.quantity}
                          </span>
                          <div>
                            <p className="font-bold text-sm tracking-wide leading-tight group-hover:text-amber-300 transition-colors">
                              {item.itemName}
                            </p>
                            {item.modifiersSummary && (
                              <p className="text-[11px] text-amber-400 font-medium mt-0.5">
                                + {item.modifiersSummary}
                              </p>
                            )}
                            {item.notes && (
                              <p className="text-[11px] text-rose-400 font-bold mt-0.5 flex items-center gap-1">
                                * {item.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Item Status Toggle Indicator */}
                        <div className="flex-shrink-0 pt-0.5">
                          {isItemReady ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-700 group-hover:border-slate-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bump Bar Footer */}
                <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 px-2.5"
                    onClick={() => setPrintTicket(ticket)}
                    title="Print KOT Slip"
                  >
                    <Printer className="w-4 h-4" />
                  </Button>

                  {ticket.status === 'NEW' && (
                    <button
                      onClick={() => handleBumpStatus(ticket)}
                      className="flex-1 py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>Start Cooking</span>
                    </button>
                  )}

                  {ticket.status === 'PREPARING' && (
                    <button
                      onClick={() => handleBumpStatus(ticket)}
                      className="flex-1 py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Ready</span>
                    </button>
                  )}

                  {ticket.status === 'READY' && (
                    <button
                      onClick={() => handleBumpStatus(ticket)}
                      className="flex-1 py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Utensils className="w-4 h-4" />
                      <span>Serve / Clear</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 80mm Thermal Slip Print Modal */}
      {printTicket && (
        <KotPrintModal
          ticket={printTicket}
          onClose={() => setPrintTicket(null)}
        />
      )}
    </div>
  );
};
