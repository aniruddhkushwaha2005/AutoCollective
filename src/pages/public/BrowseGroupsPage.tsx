import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, PlusCircle } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { GroupCard } from '../../components/GroupCard';
import { Pagination } from '../../components/Pagination';

export const BrowseGroupsPage: React.FC = () => {
  const { db } = useApp();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState(searchParams.get('model') || 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'progress' | 'newest' | 'expiring'>('progress');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const cities = useMemo(
    () => Array.from(new Set(db.groups.map((g) => g.city))).sort(),
    [db.groups]
  );

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = db.groups.filter((grp) => {
      const model = db.models.find((m) => m.id === grp.modelId);
      const matchesQ =
        !q ||
        grp.title.toLowerCase().includes(q) ||
        grp.code.toLowerCase().includes(q) ||
        grp.city.toLowerCase().includes(q) ||
        (model?.name.toLowerCase().includes(q) ?? false);
      const matchesCity = cityFilter === 'all' || grp.city === cityFilter;
      const matchesModel = modelFilter === 'all' || grp.modelId === modelFilter;
      const matchesStatus = statusFilter === 'all' || grp.status === statusFilter;
      return matchesQ && matchesCity && matchesModel && matchesStatus;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'progress') {
        return b.members.length / b.targetBuyers - a.members.length / a.targetBuyers;
      }
      if (sortBy === 'expiring') {
        return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [db.groups, db.models, search, cityFilter, modelFilter, statusFilter, sortBy]);

  const paginatedGroups = filteredGroups.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#17191D] font-display">
            Browse Group Deals
          </h1>
          <p className="text-sm text-[#5A5F6B] mt-1.5">
            Join an open city buying group matching your exact car variant, or start a new request
            if none matches yet.
          </p>
        </div>
        <Link
          to="/dashboard/requests/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640] transition-colors whitespace-nowrap self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Start New Car Request</span>
        </Link>
      </div>

      {/* Filter & Sort Controls */}
      <div className="bg-white border border-[#E4E4E0] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#6F7480] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search code, model, city..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg focus:outline-none focus:border-[#176B50]"
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
          aria-label="Filter by car model"
          value={modelFilter}
          onChange={(e) => {
            setModelFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
        >
          <option value="all">All Car Models</option>
          {db.models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by group status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
        >
          <option value="all">All Statuses</option>
          <option value="Collecting Buyers">Collecting Buyers</option>
          <option value="Ready for Negotiation">Ready for Negotiation</option>
          <option value="Negotiating">Negotiating</option>
          <option value="Offer Received">Offer Received</option>
          <option value="Deal Completed">Deal Completed</option>
          <option value="Expired">Expired</option>
        </select>

        <select
          aria-label="Sort buying groups"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'progress' | 'newest' | 'expiring')}
          className="px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg"
        >
          <option value="progress">Sort: Most Filled First</option>
          <option value="expiring">Sort: Expiring Soon</option>
          <option value="newest">Sort: Recently Created</option>
        </select>
      </div>

      {paginatedGroups.length === 0 ? (
        <div className="bg-white border border-[#E4E4E0] rounded-xl p-10 text-center">
          <h2 className="text-lg font-bold text-[#17191D]">No matching buying groups found</h2>
          <p className="text-sm text-[#5A5F6B] mt-1">
            Submit a car request and AutoCollective will automatically create a dedicated group for
            your city and variant.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCityFilter('all');
                setModelFilter('all');
                setStatusFilter('all');
              }}
              className="px-4 py-2 text-sm font-medium border border-[#D8D8D2] rounded-lg"
            >
              Clear Filters
            </button>
            <Link
              to="/dashboard/requests/new"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#176B50] rounded-lg"
            >
              Create Car Request
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalItems={filteredGroups.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};
