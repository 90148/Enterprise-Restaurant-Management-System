import { useState, useEffect, useCallback } from 'react';
import { CustomerOrder, PaymentMethodType, TrackingStep, CustomerReview } from '@/types/customer';
import {
  getCustomerOrders,
  saveCustomerOrder,
  submitCustomerReview,
} from '@/services/customerService';
import { useCustomerContext } from '@/context/CustomerContext';
import { useCustomerCartContext } from '@/context/CustomerCartContext';
import { useCustomerNotificationContext } from '@/context/CustomerNotificationContext';

export const useCustomerOrders = () => {
  const { customer, activeOutlet, activeTable, orderType } = useCustomerContext();
  const { cartItems, cartSummary, clearCart, addItem } = useCustomerCartContext();
  const { addNotification } = useCustomerNotificationContext();

  const [orders, setOrders] = useState<CustomerOrder[]>(() => getCustomerOrders());
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<CustomerOrder | null>(null);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<CustomerOrder | null>(null);
  const [feedbackOrder, setFeedbackOrder] = useState<CustomerOrder | null>(null);

  const refreshOrders = useCallback(() => {
    setOrders(getCustomerOrders());
  }, []);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const activeOrders = orders.filter(
    (o) => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'SERVED' && o.orderStatus !== 'CANCELLED'
  );

  const completedOrders = orders.filter(
    (o) => o.orderStatus === 'DELIVERED' || o.orderStatus === 'SERVED'
  );

  const generateTrackingTimeline = (): TrackingStep[] => {
    const now = new Date();
    const timeStr = (minsOffset: number) => {
      const d = new Date(now.getTime() + minsOffset * 60000);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return [
      {
        status: 'PLACED',
        title: 'Order Placed',
        description: 'Your order was successfully received by the restaurant.',
        timestamp: timeStr(0),
        isCompleted: true,
        isCurrent: false,
      },
      {
        status: 'ACCEPTED',
        title: 'Order Confirmed',
        description: 'Chef has accepted your ticket and assigned kitchen station.',
        timestamp: timeStr(2),
        isCompleted: true,
        isCurrent: false,
      },
      {
        status: 'KOT_GENERATED',
        title: 'KOT Dispatched',
        description: 'Kitchen Order Ticket routed to preparation display.',
        timestamp: timeStr(4),
        isCompleted: true,
        isCurrent: false,
      },
      {
        status: 'PREPARING',
        title: 'Cooking in Progress',
        description: 'Our chefs are crafting your gourmet meal with fresh ingredients.',
        timestamp: timeStr(10),
        isCompleted: false,
        isCurrent: true,
      },
      {
        status: 'READY',
        title: 'Order Ready',
        description: 'Dishes plated, quality-checked, and packed for pickup/serving.',
        timestamp: timeStr(20),
        isCompleted: false,
        isCurrent: false,
      },
      {
        status: orderType === 'DELIVERY' ? 'DELIVERED' : 'SERVED',
        title: orderType === 'DELIVERY' ? 'Delivered to Doorstep' : 'Served at Table',
        description: 'Enjoy your exquisite culinary experience!',
        timestamp: timeStr(30),
        isCompleted: false,
        isCurrent: false,
      },
    ];
  };

  const placeOrder = (paymentMethod: PaymentMethodType, instructions?: string): CustomerOrder => {
    const orderNumber = `RM-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const estDelivery = new Date(now.getTime() + 25 * 60000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const defaultAddress = customer.addresses.find((a) => a.isDefault) || customer.addresses[0];

    const newOrder: CustomerOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      outletId: activeOutlet?.id || 'out-001',
      outletName: activeOutlet?.name || 'Chennai Central Flagship',
      outletAddress: activeOutlet?.address || '14, Khader Nawaz Khan Road',
      outletPhone: activeOutlet?.phone || '+91 44 2833 4900',
      orderType,
      tableNumber: orderType === 'DINE_IN' ? activeTable || 'T-12' : undefined,
      deliveryAddress: orderType === 'DELIVERY' ? defaultAddress : undefined,
      items: [...cartItems],
      subtotal: cartSummary.subtotal,
      discountAmount: cartSummary.discountAmount,
      taxAmount: cartSummary.taxAmount,
      serviceChargeAmount: cartSummary.serviceChargeAmount,
      deliveryFee: cartSummary.deliveryFee,
      grandTotal: cartSummary.grandTotal,
      paymentMethod,
      paymentStatus: 'COMPLETED',
      orderStatus: 'PREPARING',
      createdAt: new Date().toISOString(),
      estimatedDeliveryTime: estDelivery,
      trackingTimeline: generateTrackingTimeline(),
      specialInstructions: instructions,
    };

    saveCustomerOrder(newOrder);
    refreshOrders();
    clearCart();

    addNotification({
      title: 'Order Placed Successfully! 🎉',
      message: `Order #${orderNumber} has been received. Estimated prep time: 20-25 mins.`,
      type: 'ORDER',
      orderId: newOrder.id,
      actionUrl: `/customer/orders`,
    });

    setActiveTrackingOrder(newOrder);
    return newOrder;
  };

  const reorder = (order: CustomerOrder) => {
    order.items.forEach((item) => {
      addItem(item.foodItem, item.customization, item.quantity);
    });
    addNotification({
      title: 'Items Added to Cart! 🛒',
      message: `${order.items.length} items from order #${order.orderNumber} re-added.`,
      type: 'INFO',
    });
  };

  const rateOrder = (review: CustomerReview) => {
    submitCustomerReview(review);
    refreshOrders();
    setFeedbackOrder(null);
    addNotification({
      title: 'Thank You for Your Feedback! ⭐',
      message: 'Your dining review helps our master chefs continuously elevate your experience.',
      type: 'INFO',
    });
  };

  return {
    orders,
    activeOrders,
    completedOrders,
    placeOrder,
    activeTrackingOrder,
    setActiveTrackingOrder,
    selectedReceiptOrder,
    setSelectedReceiptOrder,
    feedbackOrder,
    setFeedbackOrder,
    reorder,
    rateOrder,
    refreshOrders,
  };
};
