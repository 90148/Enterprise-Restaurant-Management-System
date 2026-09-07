import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleApi } from '@/api/roles';
import type { RoleItem, CreateRolePayload, UpdateRolePayload, PermissionItem } from '@/types/role';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRoleSchema, updateRoleSchema, CreateRoleFormData, UpdateRoleFormData } from '@/validations/role';
import { ShieldCheck, Plus, Edit2, Trash2, Users, Key, AlertCircle } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Badge from '@/components/common/Badge';
import Card from '@/components/common/Card';
import LoadingState from '@/components/common/LoadingState';

export const RoleListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch Roles
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: roleApi.getRoles,
  });

  // Fetch Grouped Permissions
  const { data: groupedPermissions = {} } = useQuery({
    queryKey: ['permissions-grouped'],
    queryFn: roleApi.getGroupedPermissions,
  });

  // Create Role Mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateRolePayload) => roleApi.createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsAddModalOpen(false);
      resetAddForm();
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setErrorMessage(axiosErr.response?.data?.message || 'Failed to create role');
    },
  });

  // Update Role Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      roleApi.updateRole(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setEditingRole(null);
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setErrorMessage(axiosErr.response?.data?.message || 'Failed to update role');
    },
  });

  // Delete Role Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => roleApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setDeletingRole(null);
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      alert(axiosErr.response?.data?.message || 'Failed to delete role');
      setDeletingRole(null);
    },
  });

  // Add Role Form
  const {
    register: registerAdd,
    handleSubmit: handleAddSubmit,
    reset: resetAddForm,
    formState: { errors: addErrors },
  } = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { permissionIds: [] },
  });

  // Edit Role Form
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    formState: { errors: editErrors },
  } = useForm<UpdateRoleFormData>({
    resolver: zodResolver(updateRoleSchema),
  });

  const openEditModal = (role: RoleItem) => {
    setEditingRole(role);
    resetEditForm({
      description: role.description || '',
      permissionIds: role.permissions.map((p) => p.id),
    });
    setErrorMessage(null);
  };

  if (isLoading) {
    return <LoadingState message="Loading roles and permission matrix..." />;
  }

  const isProtectedRole = (roleName: string) => {
    return ['ADMIN', 'MANAGER', 'CASHIER', 'WAITER', 'KITCHEN', 'INVENTORY'].includes(roleName);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Roles & Access Control</h2>
          <p className="text-xs text-slate-500 mt-1">Configure security profiles and fine-grained authority matrices</p>
        </div>
        {hasPermission('ROLE_CREATE') && (
          <Button
            onClick={() => {
              setErrorMessage(null);
              setIsAddModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Custom Role
          </Button>
        )}
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      {role.name}
                      {isProtectedRole(role.name) && (
                        <span className="text-[10px] font-semibold uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          System
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{role.description || 'No description provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {hasPermission('ROLE_UPDATE') && (
                    <button
                      onClick={() => openEditModal(role)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Permissions"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {hasPermission('ROLE_DELETE') && !isProtectedRole(role.name) && (
                    <button
                      onClick={() => setDeletingRole(role)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Delete Role"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Counts */}
              <div className="flex items-center gap-4 my-4 py-2 px-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    <strong className="text-slate-800">{role.userCount}</strong> assigned users
                  </span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    <strong className="text-slate-800">{role.permissions.length}</strong> permissions
                  </span>
                </div>
              </div>

              {/* Sample Permissions Pills */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Granted Authorities
                </span>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                  {role.permissions.slice(0, 8).map((p) => (
                    <Badge key={p.id} size="sm" variant="slate">
                      {p.name}
                    </Badge>
                  ))}
                  {role.permissions.length > 8 && (
                    <Badge size="sm" variant="blue">
                      +{role.permissions.length - 8} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal: Add Role */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Custom Operational Role"
        description="Define a new role and grant precise domain permissions"
        size="lg"
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
          <Input
            label="Role Identifier (Uppercase) *"
            {...registerAdd('name')}
            error={addErrors.name?.message}
            placeholder="e.g. FLOOR_LEAD, SHIFT_SUPERVISOR"
          />
          <Input
            label="Description"
            {...registerAdd('description')}
            error={addErrors.description?.message}
            placeholder="Role purpose and responsibility"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Permission Matrix</label>
            <div className="space-y-4 max-h-80 overflow-y-auto p-3 border border-slate-200 rounded-xl bg-slate-50/50">
              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <div key={category} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                    {category} Module
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {perms.map((p: PermissionItem) => (
                      <label
                        key={p.id}
                        className="flex items-start gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          value={p.id}
                          {...registerAdd('permissionIds')}
                          className="rounded text-emerald-600 focus:ring-emerald-500 mt-0.5 w-4 h-4"
                        />
                        <div>
                          <span className="font-semibold text-slate-800">{p.name}</span>
                          <p className="text-[11px] text-slate-500">{p.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Create Role
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Role */}
      <Modal
        isOpen={!!editingRole}
        onClose={() => setEditingRole(null)}
        title={`Edit Role: ${editingRole?.name}`}
        description="Update role description and assigned permissions"
        size="lg"
      >
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}
        {editingRole && (
          <form
            onSubmit={handleEditSubmit((data) =>
              updateMutation.mutate({ id: editingRole.id, payload: data })
            )}
            className="space-y-4"
          >
            <Input
              label="Description"
              {...registerEdit('description')}
              error={editErrors.description?.message}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Permission Matrix</label>
              {editingRole.name === 'ADMIN' ? (
                <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  The primary Administrator role retains all system permissions permanently.
                </p>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                        {category} Module
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {perms.map((p: PermissionItem) => (
                          <label
                            key={p.id}
                            className="flex items-start gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer text-xs"
                          >
                            <input
                              type="checkbox"
                              value={p.id}
                              {...registerEdit('permissionIds')}
                              className="rounded text-emerald-600 focus:ring-emerald-500 mt-0.5 w-4 h-4"
                            />
                            <div>
                              <span className="font-semibold text-slate-800">{p.name}</span>
                              <p className="text-[11px] text-slate-500">{p.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outline" type="button" onClick={() => setEditingRole(null)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={updateMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Confirm: Delete Role */}
      <ConfirmDialog
        isOpen={!!deletingRole}
        onClose={() => setDeletingRole(null)}
        onConfirm={() => {
          if (deletingRole) {
            deleteMutation.mutate(deletingRole.id);
          }
        }}
        title={`Delete Role: ${deletingRole?.name}`}
        message={`Are you sure you want to permanently delete role ${deletingRole?.name}? This action cannot be undone.`}
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default RoleListPage;
