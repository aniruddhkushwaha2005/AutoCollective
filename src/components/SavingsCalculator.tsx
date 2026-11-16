import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, Info } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { formatINR } from '../utils/formatters';

const GROUP_SIZES = [3, 5, 8, 10] as const;

const TIMELINE_FACTORS: Record<string, { label: string; factor: number }> = {
  'Immediate (Within 15 Days)': { label: 'Immediate (Within 15 Days)', factor: 0.92 },
  'Within 30 Days': { label: 'Within 30 Days', factor: 1.0 },
  '1 - 2 Months': { label: '1 - 2 Months', factor: 1.05 },
  '2 - 3 Months': { label: '2 - 3 Months', factor: 1.08 },
};

export const SavingsCalculator: React.FC = () => {
  const { db } = useApp();

  const [selectedModelId, setSelectedModelId] = useState(db.models[0]?.id || '');
  const selectedModel = db.models.find((m) => m.id === selectedModelId) || db.models[0];

  const [selectedVariantId, setSelectedVariantId] = useState(
    selectedModel?.variants[1]?.id || selectedModel?.variants[0]?.id || ''
  );
  const selectedVariant =
    selectedModel?.variants.find((v) => v.id === selectedVariantId) ||
    selectedModel?.variants[0];

  const [groupSize, setGroupSize] = useState<number>(5);
  const [timeline, setTimeline] = useState<string>('Within 30 Days');

  // Compute historical discount benchmark from published sample offers in db
  const historicalBenchmark = useMemo(() => {
    const published = db.offers.filter((o) => o.status === 'Published' && o.exShowroomPrice > 0);
    if (published.length === 0) {
      return { avgRate: 0.032, minRate: 0.028, maxRate: 0.036, sampleCount: 0 };
    }
    const rates = published.map((o) => o.groupDiscount / o.exShowroomPrice);
    const avgRate = rates.reduce((sum, r) => sum + r, 0) / rates.length;
    return {
      avgRate,
      minRate: Math.min(...rates),
      maxRate: Math.max(...rates),
      sampleCount: published.length,
    };
  }, [db.offers]);

  const calculation = useMemo(() => {
    const exShowroom = selectedVariant?.exShowroomPrice || 1500000;
    const estRto = Math.round(exShowroom * 0.1);
    const estInsurance = Math.round(exShowroom * 0.036);
    const estAccessories = 12000;
    const standardOnRoad = exShowroom + estRto + estInsurance + estAccessories;

    // Group size multiplier relative to standard 5-buyer cohort
    const sizeMultiplier =
      groupSize <= 3 ? 0.72 : groupSize === 5 ? 1.0 : groupSize === 8 ? 1.18 : 1.28;
    const timelineMultiplier = TIMELINE_FACTORS[timeline]?.factor ?? 1.0;

    // Historical discount scaled by cohort size and timeline
    const lowDiscount = Math.round(
      (exShowroom * historicalBenchmark.minRate * sizeMultiplier * timelineMultiplier) / 500
    ) * 500;
    const highDiscount = Math.round(
      (exShowroom * historicalBenchmark.maxRate * sizeMultiplier * timelineMultiplier) / 500
    ) * 500;
    const midpointDiscount = Math.round((lowDiscount + highDiscount) / 2);

    // Typical insurance + accessory transparency optimization seen in sample quotes (~12% of insurance/accessories)
    const packageOptimization = Math.round((estInsurance * 0.12 + estAccessories * 0.25) / 500) * 500;
    const totalEstimatedLow = lowDiscount + Math.round(packageOptimization * 0.6);
    const totalEstimatedHigh = highDiscount + packageOptimization;

    const estimatedCollectiveOnRoadLow = Math.max(0, standardOnRoad - totalEstimatedHigh);
    const estimatedCollectiveOnRoadHigh = Math.max(0, standardOnRoad - totalEstimatedLow);

    return {
      exShowroom,
      estRto,
      estInsurance,
      estAccessories,
      standardOnRoad,
      lowDiscount,
      highDiscount,
      midpointDiscount,
      packageOptimization,
      totalEstimatedLow,
      totalEstimatedHigh,
      estimatedCollectiveOnRoadLow,
      estimatedCollectiveOnRoadHigh,
      effectivePct: ((midpointDiscount / exShowroom) * 100).toFixed(1),
    };
  }, [selectedVariant, groupSize, timeline, historicalBenchmark]);

  const handleModelChange = (nextModelId: string) => {
    setSelectedModelId(nextModelId);
    const m = db.models.find((item) => item.id === nextModelId);
    if (m && m.variants.length > 0) {
      setSelectedVariantId(m.variants[1]?.id || m.variants[0].id);
    }
  };

  if (!selectedModel || !selectedVariant) return null;

  const matchingGroupsCount = db.groups.filter(
    (g) => g.modelId === selectedModel.id && g.status !== 'Expired'
  ).length;

  return (
    <section
      aria-labelledby="savings-calculator-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14"
    >
      <div className="bg-white border border-[#E4E4E0] rounded-xl overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-[#ECECE8] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold text-[#176B50] inline-flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Historical Benchmark Estimator</span>
            </p>
            <h2
              id="savings-calculator-heading"
              className="text-2xl sm:text-3xl font-extrabold text-[#17191D] font-display mt-1.5"
            >
              Potential Savings Calculator
            </h2>
            <p className="text-sm text-[#5A5F6B] mt-1.5">
              Estimate potential collective savings based on historical sample dealership quotations
              ({historicalBenchmark.sampleCount} published quotes averaging{' '}
              <span className="font-semibold text-[#17191D] tabular-nums">
                {(historicalBenchmark.avgRate * 100).toFixed(1)}%
              </span>{' '}
              off ex-showroom).
            </p>
          </div>
          <Link
            to={`/groups?model=${selectedModel.id}`}
            className="text-xs font-semibold text-[#176B50] hover:underline whitespace-nowrap"
          >
            {matchingGroupsCount} active {selectedModel.name}{' '}
            {matchingGroupsCount === 1 ? 'group' : 'groups'} available
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Controls */}
          <div className="lg:col-span-6 p-6 sm:p-8 space-y-5 border-b lg:border-b-0 lg:border-r border-[#ECECE8]">
            <div>
              <label
                htmlFor="calc-model"
                className="block text-xs font-semibold text-[#17191D] mb-1.5"
              >
                Car Model
              </label>
              <select
                id="calc-model"
                value={selectedModel.id}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg focus:outline-none focus:border-[#176B50]"
              >
                {db.models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.bodyType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="calc-variant"
                className="block text-xs font-semibold text-[#17191D] mb-1.5"
              >
                Variant / Trim
              </label>
              <select
                id="calc-variant"
                value={selectedVariant.id}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg focus:outline-none focus:border-[#176B50]"
              >
                {selectedModel.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} — {formatINR(v.exShowroomPrice)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-[#17191D]">Target Group Size</span>
                <span className="text-xs font-mono font-semibold text-[#176B50] tabular-nums">
                  {groupSize} buyers
                </span>
              </div>
              <div
                role="group"
                aria-label="Select target group size"
                className="grid grid-cols-4 gap-2"
              >
                {GROUP_SIZES.map((size) => {
                  const active = groupSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setGroupSize(size)}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors tabular-nums ${
                        active
                          ? 'bg-[#176B50] text-white border-[#176B50]'
                          : 'bg-[#F8F8F6] text-[#17191D] border-[#D8D8D2] hover:bg-[#EFECE6]'
                      }`}
                    >
                      {size} Buyers
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="calc-timeline"
                className="block text-xs font-semibold text-[#17191D] mb-1.5"
              >
                Expected Purchase Timeline
              </label>
              <select
                id="calc-timeline"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg focus:outline-none focus:border-[#176B50]"
              >
                {Object.values(TIMELINE_FACTORS).map((tf) => (
                  <option key={tf.label} value={tf.label}>
                    {tf.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex items-start gap-2 text-xs text-[#5A5F6B] leading-relaxed">
              <Info className="w-4 h-4 text-[#6F7480] shrink-0 mt-0.5" aria-hidden="true" />
              <p>
                Illustrative estimate derived from historical sample quotations. Final discounts and
                on-road charges depend on participating authorized dealerships and city RTO slabs;
                savings are not guaranteed.
              </p>
            </div>
          </div>

          {/* Right Live Breakdown */}
          <div className="lg:col-span-6 p-6 sm:p-8 bg-[#F8F8F6]/60 flex flex-col justify-between space-y-6">
            <div>
              <p className="text-xs font-semibold text-[#6F7480]">
                Estimated Collective Savings Range ({groupSize}-Buyer Cohort)
              </p>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#176B50] font-display mt-1.5 tabular-nums">
                {formatINR(calculation.totalEstimatedLow)} –{' '}
                {formatINR(calculation.totalEstimatedHigh)}
              </p>
              <p className="text-xs text-[#5A5F6B] mt-1 tabular-nums">
                Approx. {calculation.effectivePct}% historical group discount on ex-showroom plus
                insurance & accessory quote transparency
              </p>

              <div className="mt-6 pt-5 border-t border-[#E4E4E0] space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#5A5F6B]">Variant Ex-Showroom</span>
                  <span className="font-semibold text-[#17191D] tabular-nums">
                    {formatINR(calculation.exShowroom)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A5F6B]">Estimated RTO & Insurance + Accessories</span>
                  <span className="font-medium text-[#17191D] tabular-nums">
                    {formatINR(
                      calculation.estRto + calculation.estInsurance + calculation.estAccessories
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A5F6B]">Estimated Individual On-Road Baseline</span>
                  <span className="font-medium text-[#5A5F6B] line-through tabular-nums">
                    {formatINR(calculation.standardOnRoad)}
                  </span>
                </div>
                <div className="flex justify-between text-[#176B50] font-semibold">
                  <span>Historical Group Discount Estimate</span>
                  <span className="tabular-nums">
                    - {formatINR(calculation.lowDiscount)} to {formatINR(calculation.highDiscount)}
                  </span>
                </div>
                <div className="flex justify-between text-[#176B50] font-medium text-xs">
                  <span>Est. Insurance & Accessory Optimization</span>
                  <span className="tabular-nums">
                    Up to - {formatINR(calculation.packageOptimization)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-[#D8D8D2] text-base font-bold text-[#17191D]">
                  <span>Estimated Collective On-Road Range</span>
                  <span className="tabular-nums">
                    {formatINR(calculation.estimatedCollectiveOnRoadLow)} –{' '}
                    {formatINR(calculation.estimatedCollectiveOnRoadHigh)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={`/dashboard/requests/new?brandId=${selectedModel.brandId}&modelId=${selectedModel.id}&variantId=${selectedVariant.id}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640] transition-colors whitespace-nowrap"
              >
                <span>Start Request for This Variant</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={`/groups?model=${selectedModel.id}`}
                className="px-4 py-3 text-sm font-semibold text-[#17191D] bg-white border border-[#D8D8D2] rounded-lg hover:bg-[#EFECE6] transition-colors whitespace-nowrap"
              >
                View Matching Groups
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
