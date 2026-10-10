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

const whatsappUrl =
  'https://wa.me/919014822734?text=Hello%20NovaRestoMaster%2C%20I%20need%20assistance.';

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

      {/* Floating WhatsApp contact button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with NovaRestoMaster on WhatsApp"
        title="Chat with us on WhatsApp"
        className="fixed right-4 bottom-24 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-950/40 transition-transform hover:scale-105 hover:bg-[#20bd5a] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:ring-offset-slate-950 md:right-6 md:bottom-6"
      >
        <img src="/whatsapp.svg" alt="" className="h-full w-full rounded-full" />
      </a>

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
