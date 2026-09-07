import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/api/users';
import { roleApi } from '@/api/roles';
import { outletApi } from '@/api/outlets';
import type { UserItem, CreateUserPayload, UpdateUserPayload } from '@/types/user';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, updateUserSchema, CreateUserFormData, UpdateUserFormData } from '@/validations/user';
import { UserPlus, Search, Edit2, Trash2, Shield, Store, Check, X, AlertCircle } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DataTable, { Column } from '@/components/common/DataTable';
import Pagination from '@/components/common/Pagination';
import Badge from '@/components/common/Badge';

export const UserListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [statusUser, setStatusUser] = useState<UserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch users query
  const { data: pagedUsers, isLoading } = useQuery({
    queryKey: ['users', search, activeFilter, page],
    queryFn: () =>
      userApi.getUsers({
        search: search || undefined,
        active: activeFilter ? activeFilter === 'true' : undefined,
        page,
        size: pageSize,
      }),
  });

  // Fetch roles and outlets for select dropdowns
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: roleApi.getRoles,
  });

  const { data: activeOutlets = [] } = useQuery({
    queryKey: ['outlets-active'],
    queryFn: outletApi.getActiveOutlets,
  });

  // Create User Mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => userApi.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsAddModalOpen(false);
      resetAddForm();
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setErrorMessage(axiosErr.response?.data?.message || 'Failed to create user');
    },
  });

  // Update User Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      userApi.updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingUser(null);
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setErrorMessage(axiosErr.response?.data?.message || 'Failed to update user');
    },
  });

  // Toggle Status Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      userApi.updateUserStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setStatusUser(null);
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      alert(axiosErr.response?.data?.message || 'Failed to update user status');
      setStatusUser(null);
    },
  });

  // Delete User Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => userApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeletingUser(null);
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      alert(axiosErr.response?.data?.message || 'Failed to delete user');
      setDeletingUser(null);
    },
  });

  // Form handling for Add User
  const {
    register: registerAdd,
    handleSubmit: handleAddSubmit,
    reset: resetAddForm,
    formState: { errors: addErrors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { roles: [] },
  });

  // Form handling for Edit User
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    formState: { errors: editErrors },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
  });

  const openEditModal = (user: UserItem) => {
    setEditingUser(user);
    resetEditForm({
      email: user.email,
      fullName: user.fullName,
      phone: user.phone || '',
      outletId: user.outletId || '',
      roles: user.roles,
    });
    setErrorMessage(null);
  };

  const columns: Column<UserItem>[] = [
    {
      key: 'user',
      header: 'User & Credentials',
      render: (u) => (
        <div>
          <span className="font-semibold text-slate-800">{u.fullName}</span>
          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] text-slate-700">
              @{u.username}
            </span>
            <span>•</span>
            <span>{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'roles',
      header: 'Roles',
      render: (u) => (
        <div className="flex flex-wrap gap-1">
          {u.roles.map((r) => (
            <Badge key={r} variant={r === 'ADMIN' ? 'purple' : 'blue'} size="sm">
              <Shield className="w-3 h-3 mr-1" />
              {r}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'outlet',
      header: 'Assigned Outlet',
      render: (u) =>
        u.outletName ? (
          <span className="inline-flex items-center text-xs text-slate-700 font-medium">
            <Store className="w-3.5 h-3.5 mr-1 text-slate-400" />
            {u.outletName}
          </span>
        ) : (
          <span className="text-xs text-slate-400 italic">All Outlets</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (u) => (
        <button
          onClick={() => setStatusUser(u)}
          className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
            u.active
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
          }`}
        >
          {u.active ? (
            <>
              <Check className="w-3 h-3 mr-1" /> Active
            </>
          ) : (
            <>
              <X className="w-3 h-3 mr-1" /> Inactive
            </>
          )}
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (u) => (
        <div className="flex items-center justify-end gap-2">
          {hasPermission('USER_UPDATE') && (
            <button
              onClick={() => openEditModal(u)}
              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Edit User"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {hasPermission('USER_DELETE') && (
            <button
              onClick={() => setDeletingUser(u)}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Delete User"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">User Management</h2>
          <p className="text-xs text-slate-500 mt-1">Manage restaurant personnel, role access, and terminal security</p>
        </div>
        {hasPermission('USER_CREATE') && (
          <Button
            onClick={() => {
              setErrorMessage(null);
              setIsAddModalOpen(true);
            }}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Add New User
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name, username, or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(0);
            }}
            options={[
              { label: 'All Statuses', value: '' },
              { label: 'Active Only', value: 'true' },
              { label: 'Inactive Only', value: 'false' },
            ]}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={pagedUsers?.content || []}
          isLoading={isLoading}
          keyExtractor={(u) => u.id}
          emptyTitle="No users found"
          emptyDescription="Try adjusting your search criteria or add a new user."
        />
        {pagedUsers && (
          <Pagination
            currentPage={pagedUsers.page}
            totalPages={pagedUsers.totalPages}
            totalElements={pagedUsers.totalElements}
            pageSize={pagedUsers.size}
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}
      </div>

      {/* Modal: Add New User */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New User"
        description="Provision credentials and operational roles for new restaurant staff"
      >
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}
        <form
          onSubmit={handleAddSubmit((data) => createMutation.mutate(data))}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              {...registerAdd('fullName')}
              error={addErrors.fullName?.message}
              placeholder="e.g. John Doe"
            />
            <Input
              label="Username *"
              {...registerAdd('username')}
              error={addErrors.username?.message}
              placeholder="e.g. johndoe"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address *"
              type="email"
              {...registerAdd('email')}
              error={addErrors.email?.message}
              placeholder="john@restomaster.io"
            />
            <Input
              label="Initial Password *"
              type="password"
              {...registerAdd('password')}
              error={addErrors.password?.message}
              placeholder="••••••••"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              {...registerAdd('phone')}
              error={addErrors.phone?.message}
              placeholder="+1-555-0123"
            />
            <Select
              label="Assigned Outlet"
              {...registerAdd('outletId')}
              options={[
                { label: 'All Outlets (Global Staff)', value: '' },
                ...activeOutlets.map((o) => ({ label: `${o.name} (${o.code})`, value: o.id })),
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Assign Operational Roles *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {roles.map((r) => (
                <label
                  key={r.id}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700"
                >
                  <input
                    type="checkbox"
                    value={r.name}
                    {...registerAdd('roles')}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>{r.name}</span>
                </label>
              ))}
            </div>
            {addErrors.roles && <p className="mt-1 text-xs text-rose-600">{addErrors.roles.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit User */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit User Profile"
        description={`Updating credentials and permissions for @${editingUser?.username}`}
      >
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}
        {editingUser && (
          <form
            onSubmit={handleEditSubmit((data) =>
              updateMutation.mutate({ id: editingUser.id, payload: data })
            )}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                {...registerEdit('fullName')}
                error={editErrors.fullName?.message}
              />
              <Input
                label="Email Address *"
                type="email"
                {...registerEdit('email')}
                error={editErrors.email?.message}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                {...registerEdit('phone')}
                error={editErrors.phone?.message}
              />
              <Select
                label="Assigned Outlet"
                {...registerEdit('outletId')}
                options={[
                  { label: 'All Outlets (Global Staff)', value: '' },
                  ...activeOutlets.map((o) => ({ label: `${o.name} (${o.code})`, value: o.id })),
                ]}
              />
            </div>

            <Input
              label="Reset Password (Leave blank to keep unchanged)"
              type="password"
              {...registerEdit('password')}
              placeholder="••••••••"
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Assigned Roles *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {roles.map((r) => (
                  <label
                    key={r.id}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700"
                  >
                    <input
                      type="checkbox"
                      value={r.name}
                      {...registerEdit('roles')}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>{r.name}</span>
                  </label>
                ))}
              </div>
              {editErrors.roles && <p className="mt-1 text-xs text-rose-600">{editErrors.roles.message}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                type="button"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={updateMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Confirm: Toggle Status */}
      <ConfirmDialog
        isOpen={!!statusUser}
        onClose={() => setStatusUser(null)}
        onConfirm={() => {
          if (statusUser) {
            statusMutation.mutate({ id: statusUser.id, active: !statusUser.active });
          }
        }}
        title={`${statusUser?.active ? 'Deactivate' : 'Activate'} User Account`}
        message={`Are you sure you want to ${
          statusUser?.active ? 'deactivate' : 'activate'
        } ${statusUser?.fullName} (@${statusUser?.username})? ${
          statusUser?.active
            ? 'The user will immediately be blocked from logging in or using terminals.'
            : 'The user will regain terminal access.'
        }`}
        variant={statusUser?.active ? 'danger' : 'primary'}
        isLoading={statusMutation.isPending}
      />

      {/* Confirm: Delete User */}
      <ConfirmDialog
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={() => {
          if (deletingUser) {
            deleteMutation.mutate(deletingUser.id);
          }
        }}
        title="Delete User"
        message={`Are you sure you want to permanently delete user @${deletingUser?.username}? This action cannot be undone.`}
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default UserListPage;
