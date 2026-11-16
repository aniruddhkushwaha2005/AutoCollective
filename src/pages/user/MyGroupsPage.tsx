import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { GroupCard } from '../../components/GroupCard';

export const MyGroupsPage: React.FC = () => {
  const { db, currentUser } = useApp();
  if (!currentUser) return null;

  const joinedGroups = db.groups.filter((g) =>
    g.members.some((m) => m.userId === currentUser.id)
  );

  const cityOpenGroups = db.groups.filter(
    (g) =>
      g.city.toLowerCase() === currentUser.city.toLowerCase() &&
      !g.members.some((m) => m.userId === currentUser.id) &&
      g.status === 'Collecting Buyers' &&
      g.members.length < g.targetBuyers
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#17191D] font-display">My Buying Groups</h1>
          <p className="text-sm text-[#5A5F6B] mt-1">
            Monitor cohort progress, member count, negotiation status, and published quotations.
          </p>
        </div>
        <Link
          to="/groups"
          className="px-4 py-2 text-xs font-semibold text-[#176B50] bg-[#EBF3F0] rounded-lg hover:bg-[#DCEBE5] self-start sm:self-auto"
        >
          Browse All Platform Groups
        </Link>
      </div>

      {joinedGroups.length === 0 ? (
        <div className="bg-white border border-[#E4E4E0] rounded-xl p-10 text-center">
          <p className="text-base font-bold text-[#17191D]">You have not joined any groups yet</p>
          <p className="text-sm text-[#5A5F6B] mt-1">
            Explore open groups below or submit a new car request to create one automatically.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              to="/groups"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#176B50] rounded-lg"
            >
              Explore Open Groups
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {joinedGroups.map((grp) => (
            <GroupCard
              key={grp.id}
              group={grp}
              detailPath={`/dashboard/groups/${grp.id}`}
            />
          ))}
        </div>
      )}

      {cityOpenGroups.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-[#E4E4E0]">
          <div>
            <h2 className="text-lg font-bold text-[#17191D] font-display">
              Open Groups in {currentUser.city}
            </h2>
            <p className="text-xs text-[#5A5F6B]">
              Compatible cohorts currently accepting buyers in your city.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cityOpenGroups.map((grp) => (
              <GroupCard
                key={grp.id}
                group={grp}
                detailPath={`/dashboard/groups/${grp.id}`}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
