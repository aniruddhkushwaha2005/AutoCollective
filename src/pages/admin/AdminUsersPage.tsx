import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/StatusBadge';
import { Pagination } from '../../components/Pagination';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { UserRole } from '../../types';

export const AdminUsersPage: React.FC = () => {
  const { db, currentUser, adminToggleUserActive, adminUpdateUserRole } = useApp();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [pendingToggleUserId, setPendingToggleUserId] = useState<string | null>(null);
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    userId: string;
    role: UserRole;
  } | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.users.filter((u) => {
      const matchQ =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q);
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus =
        statusFilter === 'all' || (statusFilter === 'active' ? u.isActive : !u.isActive);
      return matchQ && matchRole && matchStatus;
    });
  }, [db.users, search, roleFilter, statusFilter]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#17191D] font-display">User Management</h1>
        <p className="text-sm text-[#5A5F6B] mt-1">
          Inspect registered buyers, manage active status, and assign administrative access.
        </p>
      </div>

      <div className="bg-white border border-[#E4E4E0] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#6F7480] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, email, city..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
          />
        </div>

        <select
          aria-label="Filter by role"
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
        >
          <option value="all">All Roles</option>
          <option value="user">Buyers</option>
          <option value="admin">Admins</option>
        </select>

        <select
          aria-label="Filter by account status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-white border border-[#E4E4E0] rounded-xl p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E4E4E0] text-xs text-[#6F7480]">
                <th className="py-3 pr-4 font-semibold">User</th>
                <th className="py-3 pr-4 font-semibold">City & Phone</th>
                <th className="py-3 pr-4 font-semibold">Role</th>
                <th className="py-3 pr-4 font-semibold">Status</th>
                <th className="py-3 pr-4 font-semibold">Joined</th>
                <th className="py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECECE8]">
              {paginated.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="hover:bg-[#F8F8F6]/70">
                    <td className="py-3.5 pr-4">
                      <p className="font-semibold text-[#17191D]">{u.name}</p>
                      <p className="text-xs text-[#5A5F6B]">{u.email}</p>
                    </td>
                    <td className="py-3.5 pr-4 text-xs text-[#5A5F6B]">
                      <p className="text-[#17191D]">{u.city}</p>
                      <p className="tabular-nums">{u.phone}</p>
                    </td>
                    <td className="py-3.5 pr-4 text-xs font-semibold uppercase text-[#17191D]">
                      {u.role}
                    </td>
                    <td className="py-3.5 pr-4">
                      <StatusBadge status={u.isActive ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="py-3.5 pr-4 text-xs text-[#6F7480] tabular-nums">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="py-3.5 text-right space-x-2 whitespace-nowrap">
                      {!isSelf ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setPendingRoleChange({
                                userId: u.id,
                                role: u.role === 'admin' ? 'user' : 'admin',
                              })
                            }
                            className="px-2.5 py-1.5 text-xs font-medium border border-[#D8D8D2] rounded-md hover:bg-[#F4F4F0]"
                          >
                            {u.role === 'admin' ? 'Set Buyer' : 'Make Admin'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingToggleUserId(u.id)}
                            className={`px-2.5 py-1.5 text-xs font-semibold rounded-md border ${
                              u.isActive
                                ? 'text-red-700 border-red-200 hover:bg-red-50'
                                : 'text-[#176B50] border-[#BFE0D4] hover:bg-[#EBF3F0]'
                            }`}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-[#6F7480]">Current Session</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={page}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>

      <ConfirmDialog
        open={Boolean(pendingToggleUserId)}
        title="Change User Account Status?"
        description="Toggling account status controls whether this user can sign in and participate in buying groups."
        confirmLabel="Confirm Status Change"
        onConfirm={() => {
          if (pendingToggleUserId) adminToggleUserActive(pendingToggleUserId);
          setPendingToggleUserId(null);
        }}
        onCancel={() => setPendingToggleUserId(null)}
      />

      <ConfirmDialog
        open={Boolean(pendingRoleChange)}
        title="Change User Role?"
        description="Changing a user role grants or revokes access to the AutoCollective administration console."
        confirmLabel="Update Role"
        onConfirm={() => {
          if (pendingRoleChange) {
            adminUpdateUserRole(pendingRoleChange.userId, pendingRoleChange.role);
          }
          setPendingRoleChange(null);
        }}
        onCancel={() => setPendingRoleChange(null)}
      />
    </div>
  );
};
