import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Utensils, ReceiptText, Heart, User } from 'lucide-react';
import { useCustomerFavoritesContext } from '@/context/CustomerFavoritesContext';

export const MobileBottomNav: React.FC = () => {
  const { favoriteIds } = useCustomerFavoritesContext();

  const navItems = [
    { label: 'Home', path: '/customer/home', icon: Home },
    { label: 'Menu', path: '/customer/menu', icon: Utensils },
    { label: 'Orders', path: '/customer/orders', icon: ReceiptText },
    { label: 'Favorites', path: '/customer/favorites', icon: Heart, badge: favoriteIds.length },
    { label: 'Profile', path: '/customer/profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 shadow-2xl safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-14 h-full relative transition-colors ${
                  isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] tracking-tight mt-1">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
