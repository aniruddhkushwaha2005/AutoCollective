import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ArrowRight, Check } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { formatINR, formatINRLakhs } from '../../utils/formatters';
import { CarImageFrame } from '../../components/CarImageFrame';

export const ExploreCarsPage: React.FC = () => {
  const { db } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [fuelFilter, setFuelFilter] = useState('all');
  const [selectedModelId, setSelectedModelId] = useState<string>(
    searchParams.get('model') || ''
  );

  const filteredModels = useMemo(() => {
    return db.models.filter((model) => {
      const brand = db.brands.find((b) => b.id === model.brandId);
      const q = search.trim().toLowerCase();
      const matchesQuery =
        !q ||
        model.name.toLowerCase().includes(q) ||
        (brand?.name.toLowerCase().includes(q) ?? false) ||
        model.bodyType.toLowerCase().includes(q);
      const matchesBrand = brandFilter === 'all' || model.brandId === brandFilter;
      const matchesFuel =
        fuelFilter === 'all' || model.variants.some((v) => v.fuelType === fuelFilter);
      return matchesQuery && matchesBrand && matchesFuel;
    });
  }, [db.models, db.brands, search, brandFilter, fuelFilter]);

  const activeModel =
    db.models.find((m) => m.id === selectedModelId) || filteredModels[0] || null;

  const handleSelectModel = (id: string) => {
    setSelectedModelId(id);
    setSearchParams({ model: id });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#17191D] font-display">
            Explore Cars & Variants
          </h1>
          <p className="text-sm text-[#5A5F6B] mt-1.5">
            Compare Indian SUV trims, powertrains, and ex-showroom prices before starting a group
            request.
          </p>
        </div>
        <Link
          to="/dashboard/requests/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640] transition-colors whitespace-nowrap self-start md:self-auto"
        >
          <span>Start Custom Car Request</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E4E4E0] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#6F7480] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search car model, brand, body style..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg focus:outline-none focus:border-[#176B50]"
          />
        </div>

        <select
          aria-label="Filter by brand"
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg focus:outline-none focus:border-[#176B50]"
        >
          <option value="all">All Brands</option>
          {db.brands
            .filter((b) => b.isActive)
            .map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
        </select>

        <select
          aria-label="Filter by fuel type"
          value={fuelFilter}
          onChange={(e) => setFuelFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-[#F8F8F6] border border-[#D8D8D2] rounded-lg focus:outline-none focus:border-[#176B50]"
        >
          <option value="all">All Fuel Types</option>
          <option value="Petrol">Petrol</option>
          <option value="Diesel">Diesel</option>
          <option value="CNG">CNG</option>
          <option value="Electric">Electric</option>
        </select>
      </div>

      {filteredModels.length === 0 ? (
        <div className="bg-white border border-[#E4E4E0] rounded-xl p-10 text-center">
          <p className="text-base font-bold text-[#17191D]">No car models match your filter</p>
          <p className="text-sm text-[#5A5F6B] mt-1">
            Reset filters or submit a custom car request directly.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setBrandFilter('all');
              setFuelFilter('all');
            }}
            className="mt-4 px-4 py-2 text-sm font-semibold text-[#176B50] border border-[#176B50] rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModels.map((model) => {
              const brand = db.brands.find((b) => b.id === model.brandId);
              const minPrice =
                model.variants.length > 0
                  ? Math.min(...model.variants.map((v) => v.exShowroomPrice))
                  : 0;
              const maxPrice =
                model.variants.length > 0
                  ? Math.max(...model.variants.map((v) => v.exShowroomPrice))
                  : 0;
              const activeGroupsForModel = db.groups.filter(
                (g) => g.modelId === model.id && g.status !== 'Expired'
              ).length;
              const isSelected = activeModel?.id === model.id;

              return (
                <article
                  key={model.id}
                  className={`bg-white border rounded-xl overflow-hidden flex flex-col transition-all ${
                    isSelected
                      ? 'border-[#176B50] ring-1 ring-[#176B50]'
                      : 'border-[#E4E4E0]'
                  }`}
                >
                  <CarImageFrame
                    imageKey={model.imageKey}
                    alt={model.name}
                    className="w-full h-48"
                  />
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#6F7480]">
                        <span>
                          {brand?.name} · {model.bodyType}
                        </span>
                        <span className="tabular-nums">
                          {activeGroupsForModel} active{' '}
                          {activeGroupsForModel === 1 ? 'group' : 'groups'}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-[#17191D] font-display mt-1.5">
                        {model.name}
                      </h2>
                      <p className="text-sm text-[#5A5F6B] mt-2 line-clamp-2 leading-relaxed">
                        {model.description}
                      </p>
                      <p className="text-sm font-bold text-[#17191D] mt-3 tabular-nums">
                        {formatINRLakhs(minPrice)} – {formatINRLakhs(maxPrice)}
                        <span className="text-xs font-normal text-[#6F7480]"> (Ex-showroom)</span>
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#ECECE8] flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectModel(model.id)}
                        className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg border border-[#D8D8D2] bg-[#F8F8F6] text-[#17191D] hover:bg-[#EFECE6] transition-colors"
                      >
                        {isSelected ? 'Viewing Variants' : `View ${model.variants.length} Variants`}
                      </button>
                      <Link
                        to={`/groups?model=${model.id}`}
                        className="px-3 py-2 text-xs font-semibold rounded-lg bg-[#176B50] text-white hover:bg-[#125640] transition-colors whitespace-nowrap"
                      >
                        Find Groups
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Selected Model Variant Breakdown */}
          {activeModel && (
            <section className="bg-white border border-[#E4E4E0] rounded-xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#ECECE8]">
                <div>
                  <p className="text-xs font-semibold text-[#176B50]">Variant Specifications</p>
                  <h2 className="text-2xl font-extrabold text-[#17191D] font-display mt-0.5">
                    {activeModel.name}
                  </h2>
                  <p className="text-sm text-[#5A5F6B] mt-1">
                    Popular colours: {activeModel.popularColors.join(', ')}
                  </p>
                </div>
                <Link
                  to={`/dashboard/requests/new?brandId=${activeModel.brandId}&modelId=${activeModel.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#176B50] rounded-lg hover:bg-[#125640] transition-colors whitespace-nowrap self-start"
                >
                  <span>Request This Model</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E4E4E0] text-xs text-[#6F7480]">
                      <th className="py-3 pr-4 font-semibold">Variant</th>
                      <th className="py-3 pr-4 font-semibold">Powertrain</th>
                      <th className="py-3 pr-4 font-semibold">Key Features</th>
                      <th className="py-3 pr-4 font-semibold text-right">Ex-Showroom</th>
                      <th className="py-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECECE8]">
                    {activeModel.variants.map((variant) => (
                      <tr key={variant.id} className="hover:bg-[#F8F8F6]/70">
                        <td className="py-3.5 pr-4">
                          <p className="font-semibold text-[#17191D]">{variant.name}</p>
                          <p className="text-xs text-[#5A5F6B]">
                            {variant.fuelType} · {variant.transmission}
                          </p>
                        </td>
                        <td className="py-3.5 pr-4 text-xs text-[#5A5F6B]">
                          <p className="text-[#17191D] font-medium">{variant.engineSpec}</p>
                          <p>{variant.mileage}</p>
                        </td>
                        <td className="py-3.5 pr-4">
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#5A5F6B]">
                            {variant.keyFeatures.slice(0, 3).map((feat) => (
                              <span key={feat} className="inline-flex items-center gap-1">
                                <Check className="w-3 h-3 text-[#176B50]" />
                                {feat}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 pr-4 text-right font-bold text-[#17191D] tabular-nums whitespace-nowrap">
                          {formatINR(variant.exShowroomPrice)}
                        </td>
                        <td className="py-3.5 text-right">
                          <Link
                            to={`/dashboard/requests/new?brandId=${activeModel.brandId}&modelId=${activeModel.id}&variantId=${variant.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#176B50] bg-[#EBF3F0] rounded-lg hover:bg-[#DCEBE5] transition-colors whitespace-nowrap"
                          >
                            <span>Select Trim</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};
