import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { roleApi } from '@/api/roles';
import type { PermissionItem } from '@/types/role';
import Card from '@/components/common/Card';
import LoadingState from '@/components/common/LoadingState';
import Badge from '@/components/common/Badge';
import { Key } from 'lucide-react';

export const PermissionMatrixPage: React.FC = () => {
  const { data: grouped = {}, isLoading } = useQuery({
    queryKey: ['permissions-grouped'],
    queryFn: roleApi.getGroupedPermissions,
  });

  if (isLoading) {
    return <LoadingState message="Loading permissions repository..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Permission Matrix Reference</h2>
        <p className="text-xs text-slate-500 mt-1">
          Complete inventory of system security authorities across functional modules
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([category, perms]) => (
          <Card key={category} title={`${category} Module Authorities`}>
            <div className="divide-y divide-slate-100">
              {perms.map((p: PermissionItem) => (
                <div key={p.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-slate-100 text-slate-600 rounded-md mt-0.5">
                      <Key className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-900">{p.name}</span>
                      <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>
                    </div>
                  </div>
                  <Badge variant="slate" size="sm">
                    {p.category}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PermissionMatrixPage;
