import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { outletApi } from '@/api/outlets';
import { LogOut, User as UserIcon, Store, ChevronDown } from 'lucide-react';
import Button from '@/components/common/Button';

export const Navbar: React.FC = () => {
  const { user, logout, activeOutletId, setActiveOutlet } = useAuth();

  const { data: activeOutlets = [] } = useQuery({
    queryKey: ['outlets-active'],
    queryFn: outletApi.getActiveOutlets,
  });

  const currentOutlet = activeOutlets.find((o) => o.id === activeOutletId);
  const displayName = currentOutlet?.name || user?.outletName || 'Select Outlet';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 z-10">
      {/* Active Outlet Selector */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <Store className="w-4 h-4 text-emerald-600 mr-2" />
          <select
            value={activeOutletId || ''}
            onChange={(e) => setActiveOutlet(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-800 pr-6 focus:outline-none appearance-none cursor-pointer"
          >
            {activeOutlets.length === 0 && <option value="">{displayName}</option>}
            {activeOutlets.map((outlet) => (
              <option key={outlet.id} value={outlet.id}>
                {outlet.name} ({outlet.code})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time Active</span>
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-right">
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-800">{user?.fullName || user?.username || 'User'}</p>
            <p className="text-[10px] text-slate-500 uppercase">{user?.roles?.join(', ') || 'Staff'}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
            <UserIcon className="w-4 h-4" />
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          leftIcon={<LogOut className="w-3.5 h-3.5" />}
          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
        >
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
