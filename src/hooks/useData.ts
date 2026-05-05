import { useMemo } from "react";
import { useFilters } from "@/contexts/FilterContext";
import { useDataContext } from "@/contexts/DataContext";

// ==================
// TYPES
// ==================
export interface AksesRecord {
  siteId: string;
  namaLokasi: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  tahun: string;
  lat: number | null;
  lng: number | null;
  teknologi: string;
  downloadMbps: number;
  uploadMbps: number;
  utilitas: string;
  layananMandiri: string;
  layananGanda: string;
  aksesMandiri: string;
  bantuanGandaUSO: string;
  rekomendasi: string;
  skema: string;
  bandwidth: number;
  penyedia: string;
  tools: string;
  downloadAP2: number;
  uploadAP2: number;
}

export interface BumdesRecord {
  no: number;
  status: string;
  namaBumdes: string;
  alamat: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  lat: number | null;
  lng: number | null;
  isp: string;
  bandwidth: number;
  totalPelanggan: number;
  statusPKS: string;
  warningLevel: string;
  expiryDate: string | null;
  daysLeft: number | null;
}

// ==================
// FILTERED DATA (HOOK)
// ==================
export function useFilteredAkses() {
  const { filters } = useFilters();
  const { aksesData } = useDataContext();

  return useMemo(() => {
  return aksesData.filter((r: AksesRecord) => {
    if (filters.provinsi !== "Semua" && r.provinsi !== filters.provinsi) return false;
    if (filters.kabupaten !== "Semua" && r.kabupaten !== filters.kabupaten) return false;
    if (filters.kecamatan !== "Semua" && r.kecamatan !== filters.kecamatan) return false;

    // 👇 TAMBAH INI
    if (filters.tahun !== "Semua" && r.tahun !== filters.tahun) return false;

    return true;
  });
}, [filters, aksesData]);

}

export function useFilteredBumdes() {
  const { filters } = useFilters();
  const { bumdesData } = useDataContext();

  return useMemo(() => {
    return bumdesData.filter((r: BumdesRecord) => {

      if (filters.provinsi !== "Semua" && r.provinsi !== filters.provinsi) return false;
      if (filters.kabupaten !== "Semua" && r.kabupaten !== filters.kabupaten) return false;
      if (filters.kecamatan !== "Semua" && r.kecamatan !== filters.kecamatan) return false;
if (
  filters.status !== "Semua" &&
  r.status?.trim().toLowerCase() !== filters.status?.trim().toLowerCase()
) return false;
      if (
        filters.isp !== "Semua" &&
        r.isp?.trim().toLowerCase() !== filters.isp?.trim().toLowerCase()
      ) return false;
      if (filters.statusWarning) {
        const level = r.warningLevel?.toLowerCase();

        if (filters.statusWarning === "perluPerhatian") {
          if (!(level === "warning" || level === "expired")) return false;
        } else {
          if (level !== filters.statusWarning.toLowerCase()) return false;
        }
      }

      return true;
    });
  }, [filters, bumdesData]);
}

// ==================
// RAW DATA (HOOK)
// ==================
export function useAllAksesData() {
  const { aksesData } = useDataContext();
  return aksesData;
}

export function useAllBumdesData() {
  const { bumdesData } = useDataContext();
  return bumdesData;
}

// ==================
// HELPERS (BUKAN HOOK)
// ==================
export function getUniqueValues(data: any[], field: string): string[] {
  const vals = new Set(
    data
      .map((r) => r[field]?.toString().trim())
      .filter(Boolean)
  );
  return Array.from(vals).sort();
}

export function getKabupatenByProvinsi(data: any[], provinsi: string): string[] {
  const vals = new Set(
    data
      .filter((r) => provinsi === "Semua" || r.provinsi === provinsi)
      .map((r) => r.kabupaten)
      .filter(Boolean)
  );
  return Array.from(vals).sort();
}

export function getKecamatanByKabupaten(data: any[], kabupaten: string): string[] {
  const vals = new Set(
    data
      .filter((r) => kabupaten === "Semua" || r.kabupaten === kabupaten)
      .map((r) => r.kecamatan)
      .filter(Boolean)
  );
  return Array.from(vals).sort();
}
