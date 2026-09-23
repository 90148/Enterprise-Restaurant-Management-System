import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/routes/ProtectedRoute';
import RoleBasedRoute from '@/routes/RoleBasedRoute';
import AppLayout from '@/layouts/AppLayout';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import UserListPage from '@/pages/users/UserListPage';
import RoleListPage from '@/pages/roles/RoleListPage';
import PermissionMatrixPage from '@/pages/roles/PermissionMatrixPage';
import OutletListPage from '@/pages/outlets/OutletListPage';
import FloorTableManagementPage from '@/pages/tables/FloorTableManagementPage';
import MenuItemListPage from '@/pages/menu/MenuItemListPage';
import RecipeListPage from '@/pages/menu/RecipeListPage';
import { PosPage } from '@/pages/pos/PosPage';
import { OrderListPage } from '@/pages/orders/OrderListPage';
import { KitchenDisplayPage } from '@/pages/kitchen/KitchenDisplayPage';
import { BillingListPage } from '@/pages/billing/BillingListPage';
import { InventoryListPage } from '@/pages/inventory/InventoryListPage';
import { PurchaseOrderListPage } from '@/pages/purchases/PurchaseOrderListPage';
import { RefundListPage } from '@/pages/refunds/RefundListPage';
import SalesReportPage from '@/pages/reports/SalesReportPage';
import SettingsPage from '@/pages/settings/SettingsPage';

// Customer Experience
import { CustomerProvider } from '@/context/CustomerContext';
import { CustomerCartProvider } from '@/context/CustomerCartContext';
import { CustomerFavoritesProvider } from '@/context/CustomerFavoritesContext';
import { CustomerNotificationProvider } from '@/context/CustomerNotificationContext';
import CustomerLayout from '@/components/customer/layout/CustomerLayout';
import CustomerHomePage from '@/pages/customer/CustomerHomePage';
import CustomerMenuPage from '@/pages/customer/CustomerMenuPage';
import CustomerCheckoutPage from '@/pages/customer/CustomerCheckoutPage';
import CustomerOrdersPage from '@/pages/customer/CustomerOrdersPage';
import CustomerFavoritesPage from '@/pages/customer/CustomerFavoritesPage';
import CustomerOffersPage from '@/pages/customer/CustomerOffersPage';
import CustomerProfilePage from '@/pages/customer/CustomerProfilePage';
import CustomerPortalManagerPage from '@/pages/admin/CustomerPortalManagerPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <CustomerProvider>
            <CustomerCartProvider>
              <CustomerFavoritesProvider>
                <CustomerNotificationProvider>
                  <Routes>
                    {/* Customer Experience Routes (Public / Guest Friendly) */}
                    <Route path="/customer" element={<CustomerLayout />}>
                      <Route index element={<Navigate to="/customer/home" replace />} />
                      <Route path="home" element={<CustomerHomePage />} />
                      <Route path="menu" element={<CustomerMenuPage />} />
                      <Route path="checkout" element={<CustomerCheckoutPage />} />
                      <Route path="orders" element={<CustomerOrdersPage />} />
                      <Route path="favorites" element={<CustomerFavoritesPage />} />
                      <Route path="offers" element={<CustomerOffersPage />} />
                      <Route path="profile" element={<CustomerProfilePage />} />
                    </Route>

                    {/* Public Auth Route */}
                    <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />

              {/* User Management */}
              <Route
                path="users"
                element={
                  <RoleBasedRoute requiredPermission="USER_VIEW">
                    <UserListPage />
                  </RoleBasedRoute>
                }
              />

              {/* Role & Permission Management */}
              <Route
                path="roles"
                element={
                  <RoleBasedRoute requiredPermission="ROLE_VIEW">
                    <RoleListPage />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="permissions"
                element={
                  <RoleBasedRoute requiredPermission="ROLE_VIEW">
                    <PermissionMatrixPage />
                  </RoleBasedRoute>
                }
              />

              {/* Outlet Management */}
              <Route
                path="outlets"
                element={
                  <RoleBasedRoute requiredPermission="OUTLET_VIEW">
                    <OutletListPage />
                  </RoleBasedRoute>
                }
              />

              {/* Floor & Table Management */}
              <Route
                path="tables"
                element={
                  <RoleBasedRoute requiredPermission="OUTLET_VIEW">
                    <FloorTableManagementPage />
                  </RoleBasedRoute>
                }
              />

              {/* Menu & Recipe Management */}
              <Route
                path="menu/items"
                element={
                  <RoleBasedRoute requiredPermission="MENU_VIEW">
                    <MenuItemListPage />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="recipes"
                element={
                  <RoleBasedRoute requiredPermission="MENU_VIEW">
                    <RecipeListPage />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="customer-management"
                element={
                  <RoleBasedRoute requiredPermission="MENU_VIEW">
                    <CustomerPortalManagerPage />
                  </RoleBasedRoute>
                }
              />

              {/* POS & Order Management */}
              <Route
                path="pos"
                element={
                  <RoleBasedRoute requiredPermission="ORDER_CREATE">
                    <PosPage />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="orders"
                element={
                  <RoleBasedRoute requiredPermission="ORDER_VIEW">
                    <OrderListPage />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="kitchen"
                element={
                  <RoleBasedRoute requiredPermission="KITCHEN_VIEW">
                    <KitchenDisplayPage />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="billing"
                element={
                  <RoleBasedRoute requiredPermission="BILL_VIEW">
                    <BillingListPage />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="inventory"
                element={
                  <RoleBasedRoute requiredPermission="INVENTORY_VIEW">
                    <InventoryListPage />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="purchases"
                element={
                  <RoleBasedRoute requiredPermission="INVENTORY_UPDATE">
                    <PurchaseOrderListPage />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="refunds"
                element={
                  <RoleBasedRoute requiredPermission="PAYMENT_REFUND">
                    <RefundListPage />
                  </RoleBasedRoute>
                }
              />

              {/* Reports & Analytics */}
              <Route
                path="reports/sales"
                element={
                  <RoleBasedRoute requiredPermission="REPORT_VIEW">
                    <SalesReportPage />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="reports"
                element={<Navigate to="/reports/sales" replace />}
              />

              {/* Preferences & Settings */}
              <Route
                path="settings/preferences"
                element={
                  <RoleBasedRoute requiredPermission="SETTINGS_VIEW">
                    <SettingsPage />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="settings"
                element={<Navigate to="/settings/preferences" replace />}
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* Global Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
                </CustomerNotificationProvider>
              </CustomerFavoritesProvider>
            </CustomerCartProvider>
          </CustomerProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
