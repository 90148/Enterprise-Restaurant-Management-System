import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerProfile, OutletInfo, OrderType, Address } from '@/types/customer';
import { getCustomerProfile, saveCustomerProfile, getOutlets, getOutletById } from '@/services/customerService';

interface CustomerContextType {
  customer: CustomerProfile;
  updateProfile: (profile: Partial<CustomerProfile>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  activeOutlet: OutletInfo | null;
  outlets: OutletInfo[];
  setActiveOutletId: (outletId: string) => void;
  activeTable: string | null;
  setActiveTable: (tableNumber: string | null) => void;
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  isOutletModalOpen: boolean;
  setIsOutletModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isCallWaiterModalOpen: boolean;
  setIsCallWaiterModalOpen: (open: boolean) => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<CustomerProfile>(getCustomerProfile());
  const [outlets, setOutlets] = useState<OutletInfo[]>([]);
  const [activeOutlet, setActiveOutlet] = useState<OutletInfo | null>(null);
  const [activeTable, setActiveTableState] = useState<string | null>(() => {
    return localStorage.getItem('restomaster_active_table') || 'T-12';
  });
  const [orderType, setOrderTypeState] = useState<OrderType>(() => {
    return (localStorage.getItem('restomaster_order_type') as OrderType) || 'DINE_IN';
  });

  const [isOutletModalOpen, setIsOutletModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCallWaiterModalOpen, setIsCallWaiterModalOpen] = useState(false);

  useEffect(() => {
    getOutlets().then((loadedOutlets) => {
      setOutlets(loadedOutlets);
      const savedOutletId = localStorage.getItem('restomaster_active_outlet_id');
      const chosen = loadedOutlets.find((o) => o.id === savedOutletId) || loadedOutlets[0];
      if (chosen) {
        setActiveOutlet(chosen);
      }
    });
  }, []);

  const setActiveOutletId = async (outletId: string) => {
    const found = await getOutletById(outletId);
    if (found) {
      setActiveOutlet(found);
      localStorage.setItem('restomaster_active_outlet_id', outletId);
    }
  };

  const setActiveTable = (tableNumber: string | null) => {
    setActiveTableState(tableNumber);
    if (tableNumber) {
      localStorage.setItem('restomaster_active_table', tableNumber);
    } else {
      localStorage.removeItem('restomaster_active_table');
    }
  };

  const setOrderType = (type: OrderType) => {
    setOrderTypeState(type);
    localStorage.setItem('restomaster_order_type', type);
  };

  const updateProfile = (updates: Partial<CustomerProfile>) => {
    setCustomer((prev) => {
      const next = { ...prev, ...updates };
      saveCustomerProfile(next);
      return next;
    });
  };

  const addAddress = (addr: Omit<Address, 'id'>) => {
    const newAddr: Address = {
      ...addr,
      id: `addr-${Date.now()}`,
    };
    updateProfile({
      addresses: [...customer.addresses, newAddr],
    });
  };

  return (
    <CustomerContext.Provider
      value={{
        customer,
        updateProfile,
        addAddress,
        activeOutlet,
        outlets,
        setActiveOutletId,
        activeTable,
        setActiveTable,
        orderType,
        setOrderType,
        isOutletModalOpen,
        setIsOutletModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isCallWaiterModalOpen,
        setIsCallWaiterModalOpen,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomerContext = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomerContext must be used within a CustomerProvider');
  }
  return context;
};
