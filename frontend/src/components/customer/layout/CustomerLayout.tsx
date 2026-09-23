import React from 'react';
import { Outlet } from 'react-router-dom';
import { CustomerHeader } from './CustomerHeader';
import { CustomerFooter } from './CustomerFooter';
import { MobileBottomNav } from './MobileBottomNav';
import { OutletSelectorModal } from '../common/OutletSelectorModal';
import { NotificationDrawer } from '../common/NotificationDrawer';
import { CustomerAuthModal } from '../common/CustomerAuthModal';
import { CartDrawer } from '../cart/CartDrawer';
import { MiniCart } from '../cart/MiniCart';
import { CustomizationModal } from '../menu/CustomizationModal';
import { CallWaiterModal } from '../dinein/CallWaiterModal';

export const CustomerLayout: React.FC = () => {
  return (
    <div className="w-full min-h-screen min-w-0 overflow-x-hidden bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Top Header Navigation */}
      <CustomerHeader />

      {/* Main Routed Page Content */}
      <main className="flex-1 pb-24 md:pb-12">
        <Outlet />
      </main>

      {/* Footer */}
      <CustomerFooter />

      {/* Mobile App Style Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Floating Mini Cart Indicator */}
      <MiniCart />

      {/* Modals & Drawers Managed by Context */}
      <OutletSelectorModal />
      <NotificationDrawer />
      <CustomerAuthModal />
      <CartDrawer />
      <CustomizationModal />
      <CallWaiterModal />
    </div>
  );
};

export default CustomerLayout;
