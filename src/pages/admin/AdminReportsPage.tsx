import React from 'react';
import { Download } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { downloadCSV, formatINR } from '../../utils/formatters';

export const AdminReportsPage: React.FC = () => {
  const { db } = useApp();

  const citySummary = Array.from(
    new Set([...db.groups.map((g) => g.city), ...db.requests.map((r) => r.city)])
  ).map((city) => {
    const groups = db.groups.filter((g) => g.city === city);
    const requests = db.requests.filter((r) => r.city === city && r.status !== 'Cancelled');
    const offers = db.offers.filter((o) =>
      groups.some((g) => g.id === o.groupId && o.status === 'Published')
    );
    return {
      city,
      groupsCount: groups.length,
      requestsCount: requests.length,
      offersCount: offers.length,
    };
  });

  const avgDiscount =
    db.offers.length > 0
      ? Math.round(db.offers.reduce((acc, o) => acc + o.groupDiscount, 0) / db.offers.length)
      : 0;

  const avgOnRoad =
    db.offers.length > 0
      ? Math.round(
          db.offers.reduce((acc, o) => acc + o.finalOnRoadPrice, 0) / db.offers.length
        )
      : 0;

  const totalAgreedVolume = db.purchases
    .filter((p) => p.status !== 'Cancelled')
    .reduce((acc, p) => acc + p.agreedOnRoadPrice, 0);

  const handleExportGroupsCSV = () => {
    const rows = db.groups.map((g) => ({
      Code: g.code,
      Title: g.title,
      City: g.city,
      Fuel: g.fuelType,
      Transmission: g.transmission,
      Members: g.members.length,
      Target: g.targetBuyers,
      Status: g.status,
      ExpiresAt: g.expiresAt.slice(0, 10),
    }));
    downloadCSV('autocollective-groups-report.csv', rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#17191D] font-display">
            Reports & Analytics
          </h1>
          <p className="text-sm text-[#5A5F6B] mt-1">
            City demand distribution, average quotation discounts, and exportable cohort data.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportGroupsCSV}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640] self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Download Groups CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E4E4E0] rounded-xl p-5">
          <p className="text-xs font-medium text-[#6F7480]">Average Quoted Group Discount</p>
          <p className="text-2xl font-extrabold text-[#176B50] font-display mt-1 tabular-nums">
            {formatINR(avgDiscount)}
          </p>
          <p className="text-xs text-[#5A5F6B] mt-1">Across {db.offers.length} sample quotes</p>
        </div>

        <div className="bg-white border border-[#E4E4E0] rounded-xl p-5">
          <p className="text-xs font-medium text-[#6F7480]">Average Quoted On-Road Price</p>
          <p className="text-2xl font-extrabold text-[#17191D] font-display mt-1 tabular-nums">
            {formatINR(avgOnRoad)}
          </p>
          <p className="text-xs text-[#5A5F6B] mt-1">Weighted across active models</p>
        </div>

        <div className="bg-white border border-[#E4E4E0] rounded-xl p-5">
          <p className="text-xs font-medium text-[#6F7480]">Confirmed Purchase Volume</p>
          <p className="text-2xl font-extrabold text-[#17191D] font-display mt-1 tabular-nums">
            {formatINR(totalAgreedVolume)}
          </p>
          <p className="text-xs text-[#5A5F6B] mt-1">
            {db.purchases.filter((p) => p.status !== 'Cancelled').length} active purchase records
          </p>
        </div>
      </div>

      <section className="bg-white border border-[#E4E4E0] rounded-xl p-6">
        <h2 className="text-base font-bold text-[#17191D] font-display mb-4">
          Regional City Demand & Quotation Coverage
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E4E4E0] text-xs text-[#6F7480]">
                <th className="py-2.5 pr-4 font-semibold">City</th>
                <th className="py-2.5 pr-4 font-semibold text-right">Active Requests</th>
                <th className="py-2.5 pr-4 font-semibold text-right">Buying Groups</th>
                <th className="py-2.5 font-semibold text-right">Published Quotations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECECE8]">
              {citySummary.map((row) => (
                <tr key={row.city}>
                  <td className="py-3 pr-4 font-semibold text-[#17191D]">{row.city}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">{row.requestsCount}</td>
                  <td className="py-3 pr-4 text-right tabular-nums">{row.groupsCount}</td>
                  <td className="py-3 text-right tabular-nums font-semibold text-[#176B50]">
                    {row.offersCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
