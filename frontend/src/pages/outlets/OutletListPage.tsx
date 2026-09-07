import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { outletApi } from '@/api/outlets';
import type { OutletItem, CreateOutletPayload, UpdateOutletPayload } from '@/types/outlet';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { outletSchema, OutletFormData } from '@/validations/outlet';
import { Store, Plus, Edit2, CheckCircle2, Clock, Phone, Mail, FileText, AlertCircle, Check, X } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Card from '@/components/common/Card';
import LoadingState from '@/components/common/LoadingState';

export const OutletListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { hasPermission, activeOutletId, setActiveOutlet } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<OutletItem | null>(null);
  const [statusOutlet, setStatusOutlet] = useState<OutletItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch Outlets
  const { data: pagedOutlets, isLoading } = useQuery({
    queryKey: ['outlets'],
    queryFn: () => outletApi.getOutlets({ size: 50 }),
  });

  // Create Outlet Mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateOutletPayload) => outletApi.createOutlet(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outlets'] });
      queryClient.invalidateQueries({ queryKey: ['outlets-active'] });
      setIsAddModalOpen(false);
      resetAdd();
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setErrorMessage(axiosErr.response?.data?.message || 'Failed to create outlet');
    },
  });

  // Update Outlet Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOutletPayload }) =>
      outletApi.updateOutlet(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outlets'] });
      queryClient.invalidateQueries({ queryKey: ['outlets-active'] });
      setEditingOutlet(null);
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setErrorMessage(axiosErr.response?.data?.message || 'Failed to update outlet');
    },
  });

  // Status Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      outletApi.updateOutletStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outlets'] });
      queryClient.invalidateQueries({ queryKey: ['outlets-active'] });
      setStatusOutlet(null);
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      alert(axiosErr.response?.data?.message || 'Failed to update outlet status');
      setStatusOutlet(null);
    },
  });

  // Add Form
  const {
    register: registerAdd,
    handleSubmit: handleAddSubmit,
    reset: resetAdd,
    formState: { errors: addErrors },
  } = useForm<OutletFormData>({
    resolver: zodResolver(outletSchema),
  });

  // Edit Form
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<OutletFormData>({
    resolver: zodResolver(outletSchema),
  });

  const openEditModal = (outlet: OutletItem) => {
    setEditingOutlet(outlet);
    resetEdit({
      name: outlet.name,
      code: outlet.code,
      address: outlet.address || '',
      phone: outlet.phone || '',
      email: outlet.email || '',
      taxNumber: outlet.taxNumber || '',
      openingTime: outlet.openingTime || '',
      closingTime: outlet.closingTime || '',
    });
    setErrorMessage(null);
  };

  if (isLoading) {
    return <LoadingState message="Loading restaurant outlets..." />;
  }

  const outletsList = pagedOutlets?.content || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Outlet Management</h2>
          <p className="text-xs text-slate-500 mt-1">Multi-branch configuration, contact coordinates, and terminal locations</p>
        </div>
        {hasPermission('OUTLET_CREATE') && (
          <Button
            onClick={() => {
              setErrorMessage(null);
              setIsAddModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add New Outlet
          </Button>
        )}
      </div>

      {/* Outlets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {outletsList.map((outlet) => {
          const isCurrentActive = activeOutletId === outlet.id;

          return (
            <Card
              key={outlet.id}
              className={`flex flex-col justify-between transition-all ${
                isCurrentActive ? 'ring-2 ring-emerald-500 border-emerald-500' : 'hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{outlet.name}</h3>
                      <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {outlet.code}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {hasPermission('OUTLET_UPDATE') && (
                      <button
                        onClick={() => openEditModal(outlet)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Outlet"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  {outlet.address && (
                    <p className="text-slate-500 line-clamp-2">{outlet.address}</p>
                  )}
                  {outlet.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{outlet.phone}</span>
                    </div>
                  )}
                  {outlet.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{outlet.email}</span>
                    </div>
                  )}
                  {(outlet.openingTime || outlet.closingTime) && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {outlet.openingTime || '08:00'} - {outlet.closingTime || '23:00'}
                      </span>
                    </div>
                  )}
                  {outlet.taxNumber && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Tax ID: {outlet.taxNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setStatusOutlet(outlet)}
                  className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full border ${
                    outlet.active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {outlet.active ? (
                    <>
                      <Check className="w-3 h-3 mr-1" /> Active
                    </>
                  ) : (
                    <>
                      <X className="w-3 h-3 mr-1" /> Inactive
                    </>
                  )}
                </button>

                {isCurrentActive ? (
                  <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Selected Outlet
                  </span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveOutlet(outlet.id)}
                    disabled={!outlet.active}
                  >
                    Select Outlet
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal: Add Outlet */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Restaurant Outlet"
        description="Provision a new outlet location or operational branch"
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
              label="Outlet Name *"
              {...registerAdd('name')}
              error={addErrors.name?.message}
              placeholder="e.g. Uptown Food Court"
            />
            <Input
              label="Outlet Code (Uppercase) *"
              {...registerAdd('code')}
              error={addErrors.code?.message}
              placeholder="e.g. OUT-UPT-01"
            />
          </div>

          <Input
            label="Street Address"
            {...registerAdd('address')}
            placeholder="e.g. 450 Broadway Ave"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              {...registerAdd('phone')}
              placeholder="+1-555-0155"
            />
            <Input
              label="Contact Email"
              type="email"
              {...registerAdd('email')}
              error={addErrors.email?.message}
              placeholder="uptown@restomaster.io"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Opening Time"
              {...registerAdd('openingTime')}
              placeholder="08:00"
            />
            <Input
              label="Closing Time"
              {...registerAdd('closingTime')}
              placeholder="23:00"
            />
            <Input
              label="Tax Registration ID"
              {...registerAdd('taxNumber')}
              placeholder="TAX-US-991"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Create Outlet
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Outlet */}
      <Modal
        isOpen={!!editingOutlet}
        onClose={() => setEditingOutlet(null)}
        title={`Edit Outlet: ${editingOutlet?.name}`}
        description="Update contact information and operational schedule"
      >
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}
        {editingOutlet && (
          <form
            onSubmit={handleEditSubmit((data) =>
              updateMutation.mutate({ id: editingOutlet.id, payload: data })
            )}
            className="space-y-4"
          >
            <Input
              label="Outlet Name *"
              {...registerEdit('name')}
              error={editErrors.name?.message}
            />

            <Input
              label="Street Address"
              {...registerEdit('address')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                {...registerEdit('phone')}
              />
              <Input
                label="Contact Email"
                type="email"
                {...registerEdit('email')}
                error={editErrors.email?.message}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Opening Time"
                {...registerEdit('openingTime')}
              />
              <Input
                label="Closing Time"
                {...registerEdit('closingTime')}
              />
              <Input
                label="Tax Registration ID"
                {...registerEdit('taxNumber')}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outline" type="button" onClick={() => setEditingOutlet(null)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={updateMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Confirm: Toggle Outlet Status */}
      <ConfirmDialog
        isOpen={!!statusOutlet}
        onClose={() => setStatusOutlet(null)}
        onConfirm={() => {
          if (statusOutlet) {
            statusMutation.mutate({ id: statusOutlet.id, active: !statusOutlet.active });
          }
        }}
        title={`${statusOutlet?.active ? 'Deactivate' : 'Activate'} Outlet`}
        message={`Are you sure you want to ${
          statusOutlet?.active ? 'deactivate' : 'activate'
        } outlet ${statusOutlet?.name}? ${
          statusOutlet?.active ? 'Terminals tied to this outlet will be suspended.' : 'Terminals will be enabled.'
        }`}
        variant={statusOutlet?.active ? 'danger' : 'primary'}
        isLoading={statusMutation.isPending}
      />
    </div>
  );
};

export default OutletListPage;
