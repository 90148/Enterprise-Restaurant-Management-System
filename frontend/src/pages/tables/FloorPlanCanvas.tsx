import React, { useState } from 'react';
import type { RestaurantTable, TableShape, TableStatus } from '@/types/table';
import type { Floor } from '@/types/floor';
import Button from '@/components/common/Button';
import { clsx } from 'clsx';
import { Users, Move, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface FloorPlanCanvasProps {
  floor: Floor;
  tables: RestaurantTable[];
  isEditLayoutMode: boolean;
  onTableClick: (table: RestaurantTable) => void;
  onPositionChange?: (tableId: string, posX: number, posY: number) => void;
  onSavePositions?: () => Promise<void>;
  isSavingPositions?: boolean;
  onAddTableClick: () => void;
}

export const FloorPlanCanvas: React.FC<FloorPlanCanvasProps> = ({
  floor,
  tables,
  isEditLayoutMode,
  onTableClick,
  onPositionChange,
  onSavePositions,
  isSavingPositions = false,
  onAddTableClick,
}) => {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Status-based styling
  const getStatusStyle = (status: TableStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          border: 'border-emerald-500/80 hover:border-emerald-400',
          bg: 'bg-emerald-950/40 hover:bg-emerald-900/50',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          glow: 'shadow-emerald-950/50',
          chair: 'bg-emerald-600/40 border-emerald-500/40',
        };
      case 'OCCUPIED':
        return {
          border: 'border-rose-500/80 hover:border-rose-400',
          bg: 'bg-rose-950/40 hover:bg-rose-900/50',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          glow: 'shadow-rose-950/50',
          chair: 'bg-rose-600/40 border-rose-500/40',
        };
      case 'RESERVED':
        return {
          border: 'border-blue-500/80 hover:border-blue-400',
          bg: 'bg-blue-950/40 hover:bg-blue-900/50',
          badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          glow: 'shadow-blue-950/50',
          chair: 'bg-blue-600/40 border-blue-500/40',
        };
      case 'BILLING':
        return {
          border: 'border-amber-500/80 hover:border-amber-400 animate-pulse',
          bg: 'bg-amber-950/40 hover:bg-amber-900/50',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          glow: 'shadow-amber-950/50',
          chair: 'bg-amber-600/40 border-amber-500/40',
        };
      default:
        return {
          border: 'border-slate-700',
          bg: 'bg-slate-800',
          badgeBg: 'bg-slate-700 text-slate-300 border-slate-600',
          glow: '',
          chair: 'bg-slate-700 border-slate-600',
        };
    }
  };

  const getShapeDimensions = (shape: TableShape) => {
    switch (shape) {
      case 'ROUND':
        return { width: 130, height: 130, rounded: 'rounded-full' };
      case 'RECTANGLE':
        return { width: 190, height: 120, rounded: 'rounded-2xl' };
      case 'SQUARE':
      default:
        return { width: 130, height: 130, rounded: 'rounded-2xl' };
    }
  };

  const handleNudge = (tableId: string, currentX: number, currentY: number, dx: number, dy: number) => {
    if (!onPositionChange) return;
    const newX = Math.max(20, currentX + dx);
    const newY = Math.max(20, currentY + dy);
    onPositionChange(tableId, newX, newY);
  };

  // Find boundaries to give canvas sufficient room
  const maxX = Math.max(800, ...tables.map((t) => (t.posX || 0) + 240));
  const maxY = Math.max(600, ...tables.map((t) => (t.posY || 0) + 200));

  return (
    <div className="relative flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Canvas Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/70 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {floor.name} (Level {floor.floorNumber})
          </span>
          <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md font-medium">
            {tables.length} {tables.length === 1 ? 'Table' : 'Tables'}
          </span>
        </div>

        {/* Legend */}
        <div className="hidden md:flex items-center gap-4 text-[11px] font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-300">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-300">Reserved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-300">Billing</span>
          </div>
        </div>

        {isEditLayoutMode && onSavePositions && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-amber-400 font-medium">Layout Edit Mode Enabled</span>
            <Button
              size="sm"
              variant="primary"
              onClick={onSavePositions}
              isLoading={isSavingPositions}
              className="flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Save Layout
            </Button>
          </div>
        )}
      </div>

      {/* Blueprint Canvas Area */}
      <div
        className="relative w-full overflow-auto p-8"
        style={{
          minHeight: '620px',
          backgroundImage:
            'radial-gradient(circle, rgba(71, 85, 105, 0.25) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundColor: '#090d16',
        }}
      >
        <div
          className="relative transition-all"
          style={{ width: `${maxX}px`, height: `${maxY}px` }}
        >
          {tables.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mb-4">
                <Move className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">No Tables Configured Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                There are currently no dining tables mapped to this floor area. Click below to add your first table.
              </p>
              <Button variant="primary" size="sm" onClick={onAddTableClick}>
                + Add Table to {floor.name}
              </Button>
            </div>
          ) : (
            tables.map((table) => {
              const style = getStatusStyle(table.status);
              const { width, height, rounded } = getShapeDimensions(table.shape);
              const isSelected = selectedTableId === table.id;

              return (
                <div
                  key={table.id}
                  style={{
                    position: 'absolute',
                    left: `${table.posX || 50}px`,
                    top: `${table.posY || 50}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                  }}
                  onClick={() => {
                    if (isEditLayoutMode) {
                      setSelectedTableId(table.id);
                    } else {
                      onTableClick(table);
                    }
                  }}
                  className={clsx(
                    'group select-none cursor-pointer transition-all duration-150',
                    isSelected && isEditLayoutMode ? 'z-30 ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900' : 'z-10'
                  )}
                >
                  {/* Chairs Decoration for Square / Rectangle */}
                  {table.shape !== 'ROUND' && (
                    <>
                      {/* Top Chairs */}
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex gap-3">
                        <span className={clsx('w-6 h-2 rounded-t-sm border', style.chair)} />
                        {table.capacity >= 6 && (
                          <span className={clsx('w-6 h-2 rounded-t-sm border', style.chair)} />
                        )}
                      </div>
                      {/* Bottom Chairs */}
                      <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex gap-3">
                        <span className={clsx('w-6 h-2 rounded-b-sm border', style.chair)} />
                        {table.capacity >= 6 && (
                          <span className={clsx('w-6 h-2 rounded-b-sm border', style.chair)} />
                        )}
                      </div>
                      {/* Left Chair */}
                      <div className="absolute -left-2.5 top-1/2 -translate-y-1/2">
                        <span className={clsx('w-2 h-6 rounded-l-sm border block', style.chair)} />
                      </div>
                      {/* Right Chair */}
                      <div className="absolute -right-2.5 top-1/2 -translate-y-1/2">
                        <span className={clsx('w-2 h-6 rounded-r-sm border block', style.chair)} />
                      </div>
                    </>
                  )}

                  {/* Main Table Body */}
                  <div
                    className={clsx(
                      'w-full h-full flex flex-col items-center justify-center p-2.5 border-2 shadow-lg backdrop-blur-md transition-all',
                      rounded,
                      style.border,
                      style.bg,
                      style.glow,
                      'hover:scale-105 active:scale-95'
                    )}
                  >
                    <span className="text-sm font-black text-white tracking-wider">
                      {table.tableNumber}
                    </span>

                    <div className="flex items-center gap-1 text-[11px] text-slate-300 font-semibold mt-0.5">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>{table.capacity}</span>
                    </div>

                    <span
                      className={clsx(
                        'text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border mt-1',
                        style.badgeBg
                      )}
                    >
                      {table.status}
                    </span>
                  </div>

                  {/* Edit Mode Position Controls */}
                  {isEditLayoutMode && isSelected && (
                    <div
                      className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 rounded-lg p-1 flex items-center gap-1 shadow-2xl z-40"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleNudge(table.id, table.posX, table.posY, -20, 0)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                        title="Move Left"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNudge(table.id, table.posX, table.posY, 0, -20)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNudge(table.id, table.posX, table.posY, 0, 20)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNudge(table.id, table.posX, table.posY, 20, 0)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                        title="Move Right"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] text-slate-400 font-mono px-1 border-l border-slate-800">
                        {table.posX},{table.posY}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default FloorPlanCanvas;
