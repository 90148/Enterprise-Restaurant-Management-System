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
          <Routes>
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

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* Global Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
