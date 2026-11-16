import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { RequestStatus } from '../../types';
import { formatDate, formatINR } from '../../utils/formatters';
import { StatusBadge } from '../../components/StatusBadge';
import { Pagination } from '../../components/Pagination';

const REQUEST_STATUSES: RequestStatus[] = [
  'Pending Match',
  'Matched to Group',
  'Negotiating',
  'Offer Received',
  'Purchase Confirmed',
  'Cancelled',
];

export const AdminRequestsPage: React.FC = () => {
  const { db, adminUpdateRequestStatus } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const cities = useMemo(
    () => Array.from(new Set(db.requests.map((r) => r.city))).sort(),
    [db.requests]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return db.requests.filter((r) => {
      const model = db.models.find((m) => m.id === r.modelId);
      const matchQ =
        !q ||
        r.applicantName.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        (model?.name.toLowerCase().includes(q) ?? false);
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchCity = cityFilter === 'all' || r.city === cityFilter;
      return matchQ && matchStatus && matchCity;
    });
  }, [db.requests, db.models, search, statusFilter, cityFilter]);

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#17191D] font-display">
          Request Management
        </h1>
        <p className="text-sm text-[#5A5F6B] mt-1">
          Inspect submitted customer requests, verify matched groups, and update workflow statuses.
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
            placeholder="Search buyer, car, city..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
          />
        </div>

        <select
          aria-label="Filter by city"
          value={cityFilter}
          onChange={(e) => {
            setCityFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
        >
          <option value="all">All Cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
        >
          <option value="all">All Statuses</option>
          {REQUEST_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-[#E4E4E0] rounded-xl p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E4E4E0] text-xs text-[#6F7480]">
                <th className="py-3 pr-4 font-semibold">Buyer</th>
                <th className="py-3 pr-4 font-semibold">Vehicle</th>
                <th className="py-3 pr-4 font-semibold">City & Timeline</th>
                <th className="py-3 pr-4 font-semibold text-right">Budget</th>
                <th className="py-3 pr-4 font-semibold">Group</th>
                <th className="py-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECECE8]">
              {paginated.map((req) => {
                const model = db.models.find((m) => m.id === req.modelId);
                const variant = model?.variants.find((v) => v.id === req.variantId);
                const group = db.groups.find((g) => g.id === req.groupId);
                return (
                  <tr key={req.id} className="hover:bg-[#F8F8F6]/70">
                    <td className="py-3.5 pr-4">
                      <p className="font-semibold text-[#17191D]">{req.applicantName}</p>
                      <p className="text-xs text-[#5A5F6B] tabular-nums">{req.phone}</p>
                    </td>
                    <td className="py-3.5 pr-4">
                      <p className="font-medium text-[#17191D]">{model?.name}</p>
                      <p className="text-xs text-[#5A5F6B]">
                        {variant?.name} · {req.preferredColor}
                      </p>
                    </td>
                    <td className="py-3.5 pr-4 text-xs text-[#5A5F6B]">
                      <p className="text-[#17191D] font-medium">{req.city}</p>
                      <p>{req.timeline}</p>
                    </td>
                    <td className="py-3.5 pr-4 text-right font-semibold tabular-nums">
                      {formatINR(req.budget)}
                    </td>
                    <td className="py-3.5 pr-4 text-xs">
                      {group ? (
                        <Link
                          to={`/groups/${group.id}`}
                          className="font-mono font-semibold text-[#176B50] hover:underline"
                        >
                          {group.code}
                        </Link>
                      ) : (
                        <span className="text-[#6F7480]">Unmatched</span>
                      )}
                      <p className="text-[11px] text-[#6F7480] tabular-nums">
                        {formatDate(req.createdAt)}
                      </p>
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="inline-flex flex-col items-end gap-1.5">
                        <StatusBadge status={req.status} />
                        <select
                          aria-label={`Change status for ${req.applicantName}`}
                          value={req.status}
                          onChange={(e) =>
                            adminUpdateRequestStatus(req.id, e.target.value as RequestStatus)
                          }
                          className="text-xs px-2 py-1 bg-[#F8F8F6] border border-[#D8D8D2] rounded"
                        >
                          {REQUEST_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
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
    </div>
  );
};
