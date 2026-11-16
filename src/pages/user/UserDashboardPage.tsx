import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell, FilePlus2, Scale, Users } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { formatDate, formatINR } from '../../utils/formatters';
import { StatusBadge } from '../../components/StatusBadge';
import { GroupCard } from '../../components/GroupCard';

export const UserDashboardPage: React.FC = () => {
  const { db, currentUser } = useApp();
  if (!currentUser) return null;

  const myRequests = db.requests.filter((r) => r.userId === currentUser.id);
  const myGroups = db.groups.filter((g) =>
    g.members.some((m) => m.userId === currentUser.id)
  );
  const myGroupIds = new Set(myGroups.map((g) => g.id));
  const myOffers = db.offers.filter(
    (o) => o.status === 'Published' && myGroupIds.has(o.groupId)
  );
  const myPurchases = db.purchases.filter((p) => p.userId === currentUser.id);
  const myNotifications = db.notifications
    .filter((n) => n.userId === currentUser.id)
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section className="bg-white border border-[#E4E4E0] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#176B50]">Buyer Overview</p>
          <h1 className="text-2xl font-extrabold text-[#17191D] font-display mt-1">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-sm text-[#5A5F6B] mt-1">
            Primary city: {currentUser.city} · Manage your car requests, active cohorts, and
            dealership quotations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link
            to="/dashboard/requests/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640]"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>Submit Car Request</span>
          </Link>
          <Link
            to="/groups"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#17191D] border border-[#D8D8D2] rounded-lg hover:bg-[#F4F4F0]"
          >
            <Users className="w-4 h-4" />
            <span>Explore Groups</span>
          </Link>
        </div>
      </section>

      {/* Metrics Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'My Car Requests',
            value: myRequests.length,
            sub: `${myRequests.filter((r) => r.status !== 'Cancelled').length} active`,
            to: '/dashboard/requests',
          },
          {
            label: 'Joined Groups',
            value: myGroups.length,
            sub: `${myGroups.filter((g) => g.status === 'Offer Received').length} with offers`,
            to: '/dashboard/groups',
          },
          {
            label: 'Dealer Offers',
            value: myOffers.length,
            sub: 'Published sample quotes',
            to: '/dashboard/offers',
          },
          {
            label: 'Purchase Records',
            value: myPurchases.length,
            sub: myPurchases[0]?.status || 'No confirmed intent yet',
            to: '/dashboard/purchases',
          },
        ].map((stat) => (
          <Link
            key={stat.label}
            to={stat.to}
            className="bg-white border border-[#E4E4E0] rounded-xl p-5 hover:border-[#176B50]/50 transition-colors"
          >
            <p className="text-xs font-medium text-[#6F7480]">{stat.label}</p>
            <p className="text-2xl font-extrabold text-[#17191D] font-display mt-1 tabular-nums">
              {stat.value}
            </p>
            <p className="text-xs text-[#5A5F6B] mt-1 truncate">{stat.sub}</p>
          </Link>
        ))}
      </section>

      {/* Active Groups */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#17191D] font-display">My Active Groups</h2>
          <Link
            to="/dashboard/groups"
            className="text-xs font-semibold text-[#176B50] hover:underline inline-flex items-center gap-1"
          >
            <span>All groups</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {myGroups.length === 0 ? (
          <div className="bg-white border border-[#E4E4E0] rounded-xl p-8 text-center">
            <p className="text-sm font-semibold text-[#17191D]">
              You have not joined any buying groups yet
            </p>
            <p className="text-xs text-[#5A5F6B] mt-1">
              Browse active city groups or submit a request to be matched automatically.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link
                to="/groups"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#176B50] rounded-lg"
              >
                Browse Groups
              </Link>
              <Link
                to="/dashboard/requests/new"
                className="px-4 py-2 text-xs font-semibold border border-[#D8D8D2] rounded-lg"
              >
                Create Request
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myGroups.slice(0, 3).map((grp) => (
              <GroupCard
                key={grp.id}
                group={grp}
                detailPath={`/dashboard/groups/${grp.id}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recent Requests & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 bg-white border border-[#E4E4E0] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#17191D] font-display">Recent Car Requests</h2>
            <Link
              to="/dashboard/requests"
              className="text-xs font-semibold text-[#176B50] hover:underline"
            >
              Manage all
            </Link>
          </div>

          {myRequests.length === 0 ? (
            <p className="text-sm text-[#5A5F6B] py-6 text-center">
              No car requests submitted yet.
            </p>
          ) : (
            <div className="divide-y divide-[#ECECE8]">
              {myRequests.slice(0, 4).map((req) => {
                const model = db.models.find((m) => m.id === req.modelId);
                const variant = model?.variants.find((v) => v.id === req.variantId);
                return (
                  <div
                    key={req.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#17191D]">
                        {model?.name} · {variant?.name}
                      </p>
                      <p className="text-xs text-[#5A5F6B] mt-0.5 tabular-nums">
                        {req.city} · Budget {formatINR(req.budget)} · {formatDate(req.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="lg:col-span-5 bg-white border border-[#E4E4E0] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#17191D] font-display inline-flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#176B50]" />
              <span>Notifications</span>
            </h2>
            <Link
              to="/dashboard/notifications"
              className="text-xs font-semibold text-[#176B50] hover:underline"
            >
              View all
            </Link>
          </div>

          {myNotifications.length === 0 ? (
            <p className="text-sm text-[#5A5F6B] py-6 text-center">No notifications right now.</p>
          ) : (
            <div className="space-y-3">
              {myNotifications.map((n) => (
                <Link
                  key={n.id}
                  to={n.linkTo}
                  className={`block p-3 rounded-lg border text-xs transition-colors ${
                    n.isRead
                      ? 'bg-[#F8F8F6] border-[#ECECE8] text-[#5A5F6B]'
                      : 'bg-[#EBF3F0]/60 border-[#BFE0D4] text-[#17191D]'
                  }`}
                >
                  <p className="font-semibold text-[#17191D]">{n.title}</p>
                  <p className="mt-0.5 text-[#5A5F6B] line-clamp-2">{n.message}</p>
                </Link>
              ))}
            </div>
          )}

          {myOffers.length > 1 && (
            <Link
              to="/dashboard/compare"
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-[#176B50] bg-[#EBF3F0] rounded-lg hover:bg-[#DCEBE5]"
            >
              <Scale className="w-4 h-4" />
              <span>Compare Available Offers</span>
            </Link>
          )}
        </section>
      </div>
    </div>
  );
};
