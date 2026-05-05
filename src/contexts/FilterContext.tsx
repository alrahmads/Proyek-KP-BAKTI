import { createContext, useContext, useState, ReactNode } from "react";

interface FilterState {
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  tahun: string; // dipakai akses internet
  status: string;
  statusWarning: string | null;
  isp: string;
  kabupatenChart: string | null;
}

interface FilterContextType {
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
}

const defaultFilters: FilterState = {
  provinsi: "Semua",
  kabupaten: "Semua",
  kecamatan: "Semua",

  // 🔥 INI KUNCI
  tahun: "2025",

  status: "Semua",
  statusWarning: null,
  isp: "Semua",
  kabupatenChart: null,
};

const FilterContext = createContext<FilterContextType>({
  filters: defaultFilters,
  setFilters: () => {},
  resetFilters: () => {},
});

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<FilterState>(defaultFilters);

  const setFilters = (partial: Partial<FilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  };

  const resetFilters = () => setFiltersState(defaultFilters);

  return (
    <FilterContext.Provider value={{ filters, setFilters, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export const useFilters = () => useContext(FilterContext);