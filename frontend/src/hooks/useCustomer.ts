import { useCustomerContext } from '@/context/CustomerContext';

export const useCustomer = () => {
  return useCustomerContext();
};
