import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import floorApi from '@/api/floors';
import tableApi from '@/api/tables';
import type { Floor, CreateFloorFormData, UpdateFloorFormData } from '@/types/floor';
import type { RestaurantTable, TableStatus, TablePositionUpdate } from '@/types/table';
import type { TableFormValues } from '@/validations/table';

// Components
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import StatCard from '@/components/common/StatCard';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';

import FloorModal from './FloorModal';
import TableModal from './TableModal';
import TableStatusModal from './TableStatusModal';
import FloorPlanCanvas from './FloorPlanCanvas';

import {
  Grid,
  List,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Move,
  Layers,
  CheckCircle2,
  Utensils,
  Calendar,
  Receipt,
} from 'lucide-react';
import { clsx } from 'clsx';

export const FloorTableManagementPage: React.FC = () => {
  const { activeOutletId, hasPermission } = useAuth();
  const queryClient = useQueryClient();

  // State
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'canvas' | 'table'>('canvas');
  const [isEditLayoutMode, setIsEditLayoutMode] = useState(false);
  const [localPositions, setLocalPositions] = useState<Record<string, { posX: number; posY: number }>>({});

  // Filter state for table view
  const [tableSearch, setTableSearch] = useState('');
  const [tableStatusFilter, setTableStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusTable, setStatusTable] = useState<RestaurantTable | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'floor' | 'table';
    id: string;
    name: string;
  }>({
    isOpen: false,
    type: 'table',
    id: '',
    name: '',
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Queries
  const {
    data: floors = [],
    isLoading: isFloorsLoading,
    isError: isFloorsError,
    refetch: refetchFloors,
  } = useQuery({
    queryKey: ['floors', activeOutletId],
    queryFn: () => floorApi.getFloorsByOutlet(activeOutletId!),
    enabled: Boolean(activeOutletId),
  });

  const {
    data: allTables = [],
    isLoading: isTablesLoading,
    isError: isTablesError,
    refetch: refetchTables,
  } = useQuery({
    queryKey: ['tables', activeOutletId],
    queryFn: () => tableApi.getTables({ outletId: activeOutletId! }),
    enabled: Boolean(activeOutletId),
  });

  const {
    data: stats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['table-stats', activeOutletId],
    queryFn: () => tableApi.getTableStats(activeOutletId!),
    enabled: Boolean(activeOutletId),
  });

  // Automatically select the first floor if none selected
  const activeFloor = useMemo(() => {
    if (floors.length === 0) return null;
    if (!selectedFloorId) return floors[0];
    return floors.find((f) => f.id === selectedFloorId) || floors[0];
  }, [floors, selectedFloorId]);

  // Tables for the active floor
  const floorTables = useMemo(() => {
    if (!activeFloor) return [];
    return allTables
      .filter((t) => t.floorId === activeFloor.id)
      .map((t) => {
        const local = localPositions[t.id];
        return local ? { ...t, posX: local.posX, posY: local.posY } : t;
      });
  }, [allTables, activeFloor, localPositions]);

  // Filtered tables for list view
  const filteredListTables = useMemo(() => {
    return allTables.filter((t) => {
      const matchSearch =
        !tableSearch ||
        t.tableNumber.toLowerCase().includes(tableSearch.toLowerCase()) ||
        t.floorName.toLowerCase().includes(tableSearch.toLowerCase());
      const matchStatus = tableStatusFilter === 'ALL' || t.status === tableStatusFilter;
      const matchFloor = !selectedFloorId || t.floorId === selectedFloorId;
      return matchSearch && matchStatus && matchFloor;
    });
  }, [allTables, tableSearch, tableStatusFilter, selectedFloorId]);

  // Mutations
  const createFloorMutation = useMutation({
    mutationFn: (data: CreateFloorFormData) => floorApi.createFloor(data),
    onSuccess: (newFloor) => {
      queryClient.invalidateQueries({ queryKey: ['floors', activeOutletId] });
      setSelectedFloorId(newFloor.id);
      setIsFloorModalOpen(false);
      setSuccessMessage(`Floor "${newFloor.name}" created successfully!`);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to create floor');
    },
  });

  const updateFloorMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFloorFormData }) =>
      floorApi.updateFloor(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['floors', activeOutletId] });
      setIsFloorModalOpen(false);
      setEditingFloor(null);
      setSuccessMessage(`Floor "${updated.name}" updated successfully!`);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to update floor');
    },
  });

  const deleteFloorMutation = useMutation({
    mutationFn: (id: string) => floorApi.deleteFloor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floors', activeOutletId] });
      setSelectedFloorId(null);
      setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      setSuccessMessage('Floor deleted successfully!');
    },
    onError: (err: any) => {
      setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      setErrorMessage(err.response?.data?.message || 'Failed to delete floor');
    },
  });

  const createTableMutation = useMutation({
    mutationFn: (data: TableFormValues) =>
      tableApi.createTable({
        floorId: data.floorId,
        tableNumber: data.tableNumber,
        capacity: data.capacity,
        shape: data.shape,
        posX: data.posX,
        posY: data.posY,
      }),
    onSuccess: (newTable) => {
      queryClient.invalidateQueries({ queryKey: ['tables', activeOutletId] });
      queryClient.invalidateQueries({ queryKey: ['table-stats', activeOutletId] });
      queryClient.invalidateQueries({ queryKey: ['floors', activeOutletId] });
      setIsTableModalOpen(false);
      setSuccessMessage(`Table "${newTable.tableNumber}" created successfully!`);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to create table');
    },
  });

  const updateTableMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TableFormValues }) =>
      tableApi.updateTable(id, {
        floorId: data.floorId,
        tableNumber: data.tableNumber,
        capacity: data.capacity,
        shape: data.shape,
        posX: data.posX,
        posY: data.posY,
        active: data.active,
      }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['tables', activeOutletId] });
      queryClient.invalidateQueries({ queryKey: ['floors', activeOutletId] });
      setIsTableModalOpen(false);
      setEditingTable(null);
      setSuccessMessage(`Table "${updated.tableNumber}" updated successfully!`);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to update table');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TableStatus }) =>
      tableApi.updateTableStatus(id, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['tables', activeOutletId] });
      queryClient.invalidateQueries({ queryKey: ['table-stats', activeOutletId] });
      setIsStatusModalOpen(false);
      setStatusTable(null);
      setSuccessMessage(`Table ${updated.tableNumber} status switched to ${updated.status}!`);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to update table status');
    },
  });

  const updatePositionsMutation = useMutation({
    mutationFn: (positions: TablePositionUpdate[]) => tableApi.updateTablePositions(positions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', activeOutletId] });
      setLocalPositions({});
      setIsEditLayoutMode(false);
      setSuccessMessage('Layout positions saved successfully!');
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to save table positions');
    },
  });

  const deleteTableMutation = useMutation({
    mutationFn: (id: string) => tableApi.deleteTable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', activeOutletId] });
      queryClient.invalidateQueries({ queryKey: ['table-stats', activeOutletId] });
      queryClient.invalidateQueries({ queryKey: ['floors', activeOutletId] });
      setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      setSuccessMessage('Table deleted successfully!');
    },
    onError: (err: any) => {
      setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
      setErrorMessage(err.response?.data?.message || 'Failed to delete table');
    },
  });

  // Position change handler in Canvas
  const handlePositionChange = (tableId: string, posX: number, posY: number) => {
    setLocalPositions((prev) => ({
      ...prev,
      [tableId]: { posX, posY },
    }));
  };

  const handleSavePositions = async () => {
    const updates: TablePositionUpdate[] = Object.entries(localPositions).map(([id, pos]) => ({
      id,
      posX: pos.posX,
      posY: pos.posY,
    }));
    if (updates.length === 0) {
      setIsEditLayoutMode(false);
      return;
    }
    await updatePositionsMutation.mutateAsync(updates);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.type === 'floor') {
      await deleteFloorMutation.mutateAsync(deleteConfirm.id);
    } else {
      await deleteTableMutation.mutateAsync(deleteConfirm.id);
    }
  };

  const handleRefresh = () => {
    refetchFloors();
    refetchTables();
    refetchStats();
    setSuccessMessage('Refreshed floor and table data!');
  };

  if (!activeOutletId) {
    return (
      <div className="p-8">
        <EmptyState
          title="No Active Outlet Selected"
          description="Please switch to an active outlet from the top navigation bar to view floors and tables."
        />
      </div>
    );
  }

  if (isFloorsLoading || isTablesLoading) {
    return (
      <div className="p-8">
        <LoadingState message="Loading restaurant floors and dining tables..." />
      </div>
    );
  }

  if (isFloorsError || isTablesError) {
    return (
      <div className="p-8">
        <ErrorState
          title="Failed to Load Floor Data"
          message="An error occurred while communicating with the server."
          onRetry={handleRefresh}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Alert Banners */}
      {errorMessage && (
        <div className="p-4 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex justify-between items-center shadow-lg">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-white font-bold text-sm ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex justify-between items-center shadow-lg">
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-white font-bold text-sm ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-black tracking-wide flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-emerald-500" />
            Floor & Table Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor real-time table statuses, design room layouts, and manage dining floor zones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('canvas')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                viewMode === 'canvas'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <Grid className="w-3.5 h-3.5" />
              Floor Plan
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                viewMode === 'table'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <List className="w-3.5 h-3.5" />
              List View
            </button>
          </div>

          {viewMode === 'canvas' && hasPermission('OUTLET_UPDATE') && (
            <Button
              variant={isEditLayoutMode ? 'primary' : 'outline'}
              size="sm"
              onClick={() => {
                if (isEditLayoutMode && Object.keys(localPositions).length > 0) {
                  handleSavePositions();
                } else {
                  setIsEditLayoutMode(!isEditLayoutMode);
                }
              }}
              isLoading={updatePositionsMutation.isPending}
              className="flex items-center gap-1.5"
            >
              <Move className="w-3.5 h-3.5" />
              {isEditLayoutMode ? 'Finish & Save Layout' : 'Edit Layout Mode'}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            title="Refresh tables"
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>

          {hasPermission('OUTLET_UPDATE') && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingFloor(null);
                  setIsFloorModalOpen(true);
                }}
                className="flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Floor
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingTable(null);
                  setIsTableModalOpen(true);
                }}
                className="flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Table
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <StatCard
          title="Total Tables"
          value={stats?.totalTables ?? allTables.length}
          icon={<Grid className="w-5 h-5 text-indigo-400" />}
        />
        <StatCard
          title="Available"
          value={stats?.availableTables ?? 0}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        />
        <StatCard
          title="Occupied"
          value={stats?.occupiedTables ?? 0}
          icon={<Utensils className="w-5 h-5 text-rose-400" />}
        />
        <StatCard
          title="Reserved"
          value={stats?.reservedTables ?? 0}
          icon={<Calendar className="w-5 h-5 text-blue-400" />}
        />
        <StatCard
          title="Billing"
          value={stats?.billingTables ?? 0}
          icon={<Receipt className="w-5 h-5 text-amber-400" />}
        />
      </div>

      {/* Floor Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {floors.map((floor) => {
            const isSelected = activeFloor?.id === floor.id;
            return (
              <div key={floor.id} className="flex items-center group">
                <button
                  type="button"
                  onClick={() => setSelectedFloorId(floor.id)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all',
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                  )}
                >
                  <span>{floor.name}</span>
                  <span
                    className={clsx(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                      isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-700 text-slate-300'
                    )}
                  >
                    {floor.tableCount}
                  </span>
                </button>

                {isSelected && hasPermission('OUTLET_UPDATE') && (
                  <div className="flex items-center ml-1 bg-slate-800 border border-slate-700 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFloor(floor);
                        setIsFloorModalOpen(true);
                      }}
                      className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
                      title="Edit Floor"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirm({
                          isOpen: true,
                          type: 'floor',
                          id: floor.id,
                          name: floor.name,
                        });
                      }}
                      className="p-1 hover:bg-rose-900/60 rounded text-slate-400 hover:text-rose-300"
                      title="Delete Floor"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {viewMode === 'table' && (
          <div className="flex items-center gap-3">
            <div className="w-48">
              <Input
                placeholder="Search tables..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
              />
            </div>
            <div className="w-40">
              <Select
                options={[
                  { value: 'ALL', label: 'All Statuses' },
                  { value: 'AVAILABLE', label: 'Available' },
                  { value: 'OCCUPIED', label: 'Occupied' },
                  { value: 'RESERVED', label: 'Reserved' },
                  { value: 'BILLING', label: 'Billing' },
                ]}
                value={tableStatusFilter}
                onChange={(e) => setTableStatusFilter(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {viewMode === 'canvas' ? (
        activeFloor ? (
          <FloorPlanCanvas
            floor={activeFloor}
            tables={floorTables}
            isEditLayoutMode={isEditLayoutMode}
            onTableClick={(table) => {
              setStatusTable(table);
              setIsStatusModalOpen(true);
            }}
            onPositionChange={handlePositionChange}
            onSavePositions={handleSavePositions}
            isSavingPositions={updatePositionsMutation.isPending}
            onAddTableClick={() => {
              setEditingTable(null);
              setIsTableModalOpen(true);
            }}
          />
        ) : (
          <EmptyState
            title="No Floors Created"
            description="Create your first dining floor area (e.g. Main Dining Room) to start placing tables."
            actionText="Create First Floor"
            onAction={() => {
              setEditingFloor(null);
              setIsFloorModalOpen(true);
            }}
          />
        )
      ) : (
        /* Tabular List View */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Table No</th>
                  <th className="px-5 py-3.5">Floor / Area</th>
                  <th className="px-5 py-3.5">Capacity</th>
                  <th className="px-5 py-3.5">Shape</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Coordinates</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredListTables.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-500">
                      No tables matching your search filters.
                    </td>
                  </tr>
                ) : (
                  filteredListTables.map((table) => (
                    <tr key={table.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4 font-bold text-white text-sm">
                        {table.tableNumber}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-300">
                        {table.floorName}
                      </td>
                      <td className="px-5 py-4 font-medium">
                        {table.capacity} Guests
                      </td>
                      <td className="px-5 py-4 font-medium uppercase text-slate-400">
                        {table.shape}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={table.status} />
                      </td>
                      <td className="px-5 py-4 font-mono text-[11px] text-slate-400">
                        X: {table.posX}, Y: {table.posY}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setStatusTable(table);
                              setIsStatusModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                          >
                            Status
                          </button>
                          {hasPermission('OUTLET_UPDATE') && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingTable(table);
                                  setIsTableModalOpen(true);
                                }}
                                className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                                title="Edit Table"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteConfirm({
                                    isOpen: true,
                                    type: 'table',
                                    id: table.id,
                                    name: table.tableNumber,
                                  });
                                }}
                                className="p-1 hover:bg-rose-900/40 rounded text-slate-400 hover:text-rose-400"
                                title="Delete Table"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {isFloorModalOpen && (
        <FloorModal
          isOpen={isFloorModalOpen}
          onClose={() => {
            setIsFloorModalOpen(false);
            setEditingFloor(null);
          }}
          onSubmit={async (data) => {
            if (editingFloor) {
              await updateFloorMutation.mutateAsync({
                id: editingFloor.id,
                data: {
                  name: data.name,
                  floorNumber: data.floorNumber,
                  active: data.active,
                },
              });
            } else {
              await createFloorMutation.mutateAsync({
                outletId: activeOutletId!,
                name: data.name,
                floorNumber: data.floorNumber,
                active: data.active,
              });
            }
          }}
          floor={editingFloor}
          isLoading={createFloorMutation.isPending || updateFloorMutation.isPending}
        />
      )}

      {isTableModalOpen && (
        <TableModal
          isOpen={isTableModalOpen}
          onClose={() => {
            setIsTableModalOpen(false);
            setEditingTable(null);
          }}
          onSubmit={async (data) => {
            if (editingTable) {
              await updateTableMutation.mutateAsync({
                id: editingTable.id,
                data,
              });
            } else {
              await createTableMutation.mutateAsync(data);
            }
          }}
          table={editingTable}
          floors={floors}
          defaultFloorId={activeFloor?.id}
          isLoading={createTableMutation.isPending || updateTableMutation.isPending}
        />
      )}

      {isStatusModalOpen && (
        <TableStatusModal
          isOpen={isStatusModalOpen}
          onClose={() => {
            setIsStatusModalOpen(false);
            setStatusTable(null);
          }}
          table={statusTable}
          onUpdateStatus={async (newStatus) => {
            if (statusTable) {
              await updateStatusMutation.mutateAsync({
                id: statusTable.id,
                status: newStatus,
              });
            }
          }}
          isLoading={updateStatusMutation.isPending}
        />
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleDeleteConfirm}
        title={deleteConfirm.type === 'floor' ? 'Delete Floor Area' : 'Delete Dining Table'}
        message={
          deleteConfirm.type === 'floor'
            ? `Are you sure you want to delete floor "${deleteConfirm.name}"? This operation cannot be undone and will fail if tables still exist on this floor.`
            : `Are you sure you want to delete table "${deleteConfirm.name}"? This operation cannot be undone.`
        }
        confirmText="Delete"
        variant="danger"
        isLoading={deleteFloorMutation.isPending || deleteTableMutation.isPending}
      />
    </div>
  );
};

export default FloorTableManagementPage;
