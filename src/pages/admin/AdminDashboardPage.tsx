import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { formatDateTime, formatINR } from '../../utils/formatters';
import { StatusBadge } from '../../components/StatusBadge';

export const AdminDashboardPage: React.FC = () => {
  const { db } = useApp();

  const totalUsers = db.users.filter((u) => u.role === 'user').length;
  const totalRequests = db.requests.length;
  const activeGroups = db.groups.filter(
    (g) => g.status !== 'Expired' && g.status !== 'Deal Completed'
  ).length;
  const readyForNeg = db.groups.filter((g) => g.status === 'Ready for Negotiation').length;
  const publishedOffers = db.offers.filter((o) => o.status === 'Published').length;
  const completedPurchases = db.purchases.filter((p) => p.status === 'Delivered').length;
  const activePurchases = db.purchases.filter((p) => p.status !== 'Cancelled').length;

  const statusDistribution = [
    'Collecting Buyers',
    'Ready for Negotiation',
    'Negotiating',
    'Offer Received',
    'Deal Completed',
    'Expired',
  ].map((st) => ({
    label: st,
    count: db.groups.filter((g) => g.status === st).length,
  }));

  const maxGroupStatus = Math.max(1, ...statusDistribution.map((s) => s.count));

  const modelDemand = db.models.map((m) => ({
    name: m.name,
    requestsCount: db.requests.filter((r) => r.modelId === m.id && r.status !== 'Cancelled').length,
    groupsCount: db.groups.filter((g) => g.modelId === m.id).length,
  }));
  const maxDemand = Math.max(1, ...modelDemand.map((d) => d.requestsCount + d.groupsCount));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#17191D] font-display">Admin Dashboard</h1>
          <p className="text-sm text-[#5A5F6B] mt-1">
            Platform operations overview across buyer cohorts, dealerships, and purchase records.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/groups"
            className="px-3.5 py-2 text-xs font-semibold text-[#176B50] bg-[#EBF3F0] rounded-lg hover:bg-[#DCEBE5]"
          >
            Manage Groups
          </Link>
          <Link
            to="/admin/offers"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640]"
          >
            Publish Offer
          </Link>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Buyers', value: totalUsers, to: '/admin/users' },
          { label: 'Car Requests', value: totalRequests, to: '/admin/requests' },
          { label: 'Active Groups', value: activeGroups, to: '/admin/groups' },
          { label: 'Ready to Negotiate', value: readyForNeg, to: '/admin/groups' },
          { label: 'Published Offers', value: publishedOffers, to: '/admin/offers' },
          {
            label: 'Purchases (Done)',
            value: `${activePurchases} (${completedPurchases})`,
            to: '/admin/purchases',
          },
        ].map((kpi) => (
          <Link
            key={kpi.label}
            to={kpi.to}
            className="bg-white border border-[#E4E4E0] rounded-xl p-4 hover:border-[#176B50]/50 transition-colors"
          >
            <p className="text-xs text-[#6F7480] font-medium">{kpi.label}</p>
            <p className="text-2xl font-extrabold text-[#17191D] font-display mt-1.5 tabular-nums">
              {kpi.value}
            </p>
          </Link>
        ))}
      </section>

      {/* Visual Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-6 bg-white border border-[#E4E4E0] rounded-xl p-6">
          <h2 className="text-base font-bold text-[#17191D] font-display mb-4">
            Groups by Lifecycle Stage
          </h2>
          <div className="space-y-3">
            {statusDistribution.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#17191D]">{item.label}</span>
                  <span className="font-mono font-semibold text-[#5A5F6B] tabular-nums">
                    {item.count}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#EFECE6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#176B50] rounded-full"
                    style={{ width: `${Math.round((item.count / maxGroupStatus) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-6 bg-white border border-[#E4E4E0] rounded-xl p-6">
          <h2 className="text-base font-bold text-[#17191D] font-display mb-4">
            Demand by Car Model (Requests + Groups)
          </h2>
          <div className="space-y-3">
            {modelDemand.map((item) => {
              const score = item.requestsCount + item.groupsCount;
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#17191D]">{item.name}</span>
                    <span className="text-[#5A5F6B] tabular-nums">
                      {item.requestsCount} req · {item.groupsCount} grp
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#EFECE6] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#17191D] rounded-full"
                      style={{ width: `${Math.round((score / maxDemand) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Action Queue & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 bg-white border border-[#E4E4E0] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#17191D] font-display">
              Groups Requiring Negotiation / Action
            </h2>
            <Link
              to="/admin/groups"
              className="text-xs font-semibold text-[#176B50] inline-flex items-center gap-1"
            >
              <span>All groups</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-[#ECECE8]">
            {db.groups.slice(0, 5).map((grp) => (
              <div
                key={grp.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <p className="text-sm font-semibold text-[#17191D]">{grp.title}</p>
                  <p className="text-xs text-[#5A5F6B] tabular-nums">
                    {grp.code} · {grp.members.length}/{grp.targetBuyers} buyers · {grp.city}
                  </p>
                </div>
                <StatusBadge status={grp.status} />
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-5 bg-white border border-[#E4E4E0] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#17191D] font-display">Recent Activities</h2>
            <Link to="/admin/reports" className="text-xs font-semibold text-[#176B50]">
              Reports
            </Link>
          </div>
          <div className="space-y-3">
            {db.activities.slice(0, 6).map((act) => (
              <div key={act.id} className="pb-3 border-b border-[#ECECE8] last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-[#17191D]">{act.action}</p>
                  <span className="text-[11px] text-[#6F7480] tabular-nums">
                    {formatDateTime(act.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-[#5A5F6B] mt-0.5">{act.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Latest Quotations Snapshot */}
      <section className="bg-white border border-[#E4E4E0] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#17191D] font-display">
            Latest Dealership Quotations
          </h2>
          <Link to="/admin/offers" className="text-xs font-semibold text-[#176B50]">
            Manage All Offers
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E4E4E0] text-xs text-[#6F7480]">
                <th className="py-2.5 pr-4 font-semibold">Dealership</th>
                <th className="py-2.5 pr-4 font-semibold">Group</th>
                <th className="py-2.5 pr-4 font-semibold text-right">Discount</th>
                <th className="py-2.5 pr-4 font-semibold text-right">On-Road Price</th>
                <th className="py-2.5 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECECE8]">
              {db.offers.slice(0, 5).map((o) => {
                const dealer = db.dealers.find((d) => d.id === o.dealerId);
                const group = db.groups.find((g) => g.id === o.groupId);
                return (
                  <tr key={o.id}>
                    <td className="py-3 pr-4 font-medium text-[#17191D]">{dealer?.name}</td>
                    <td className="py-3 pr-4 text-xs text-[#5A5F6B]">{group?.code}</td>
                    <td className="py-3 pr-4 text-right text-xs font-semibold text-[#176B50] tabular-nums">
                      -{formatINR(o.groupDiscount)}
                    </td>
                    <td className="py-3 pr-4 text-right font-bold tabular-nums">
                      {formatINR(o.finalOnRoadPrice)}
                    </td>
                    <td className="py-3 text-right">
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
