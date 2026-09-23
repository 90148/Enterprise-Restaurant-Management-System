import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Grid,
  UtensilsCrossed,
  ShoppingBag,
  Clock,
  ChefHat,
  Receipt,
  CreditCard,
  RotateCcw,
  Boxes,
  Truck,
  BookOpen,
  BarChart3,
  Settings,
  Users,
  ShieldAlert,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { clsx } from 'clsx';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  permission?: string;
  role?: string;
}

export const Sidebar: React.FC = () => {
  const { hasPermission, hasRole } = useAuth();

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'POS Register', path: '/pos', icon: <ShoppingBag className="w-5 h-5" />, permission: 'ORDER_CREATE' },
    { name: 'Live Orders', path: '/orders', icon: <Clock className="w-5 h-5" />, permission: 'ORDER_VIEW' },
    { name: 'Kitchen (KDS)', path: '/kitchen', icon: <ChefHat className="w-5 h-5" />, permission: 'KITCHEN_VIEW' },
    { name: 'Floor & Tables', path: '/tables', icon: <Grid className="w-5 h-5" />, permission: 'OUTLET_VIEW' },
    { name: 'Billing', path: '/billing', icon: <Receipt className="w-5 h-5" />, permission: 'BILL_VIEW' },
    { name: 'Payments', path: '/payments', icon: <CreditCard className="w-5 h-5" />, permission: 'PAYMENT_CREATE' },
    { name: 'Refunds', path: '/refunds', icon: <RotateCcw className="w-5 h-5" />, permission: 'PAYMENT_REFUND' },
    { name: 'Menu Items', path: '/menu/items', icon: <UtensilsCrossed className="w-5 h-5" />, permission: 'MENU_VIEW' },
    { name: 'Customer Portal Hub', path: '/customer-management', icon: <Sparkles className="w-5 h-5 text-amber-400" />, permission: 'MENU_VIEW' },
    { name: 'Recipes', path: '/recipes', icon: <BookOpen className="w-5 h-5" />, permission: 'MENU_VIEW' },
    { name: 'Inventory', path: '/inventory', icon: <Boxes className="w-5 h-5" />, permission: 'INVENTORY_VIEW' },
    { name: 'Purchasing', path: '/purchases', icon: <Truck className="w-5 h-5" />, permission: 'INVENTORY_UPDATE' },
    { name: 'Reports', path: '/reports/sales', icon: <BarChart3 className="w-5 h-5" />, permission: 'REPORT_VIEW' },
    { name: 'Outlets', path: '/outlets', icon: <Store className="w-5 h-5" />, permission: 'OUTLET_VIEW' },
    { name: 'Users', path: '/users', icon: <Users className="w-5 h-5" />, permission: 'USER_VIEW' },
    { name: 'Roles & RBAC', path: '/roles', icon: <ShieldAlert className="w-5 h-5" />, role: 'ADMIN' },
    { name: 'Settings', path: '/settings/preferences', icon: <Settings className="w-5 h-5" />, permission: 'SETTINGS_VIEW' },
  ];

  // Filter items based on active user's permissions
  const filteredNavItems = navItems.filter((item) => {
    if (item.role && !hasRole(item.role)) return false;
    if (item.permission && !hasPermission(item.permission)) return false;
    return true;
  });

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-lg">
          R
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide">RESTOMASTER</h1>
          <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Enterprise POS</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors',
                isActive
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Customer Experience Portal Trigger */}
      <div className="px-3 py-2 border-t border-slate-800">
        <a
          href="/customer/home"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/20 transition-all text-amber-300 group"
          title="Open Customer Dining Experience in a new tab"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="leading-tight text-left">
              <span className="text-xs font-semibold block text-white">Customer App</span>
              <span className="text-[10px] text-amber-400/80">Digital Dining Experience</span>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
        </a>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
        <span>v1.0.0 (Phase 10)</span>
        <span className="text-emerald-400">Online</span>
      </div>
    </aside>
  );
};

export default Sidebar;
