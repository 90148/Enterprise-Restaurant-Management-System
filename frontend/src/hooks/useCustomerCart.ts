import { useCustomerCartContext } from '@/context/CustomerCartContext';

export const useCustomerCart = () => {
  return useCustomerCartContext();
};
