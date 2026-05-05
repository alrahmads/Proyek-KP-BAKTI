import { useFilters } from "@/contexts/FilterContext";
import {
  useAllBumdesData,
  getUniqueValues,
  getKabupatenByProvinsi,
  getKecamatanByKabupaten,
} from "@/hooks/useData";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export function FilterBarBumdes() {
  const { filters, setFilters, resetFilters } = useFilters();
  const bumdesData = useAllBumdesData();

  // =========================
  // LIST DROPDOWN
  // =========================
  const provinsiList = getUniqueValues(bumdesData, "provinsi");
  const kabupatenList = getKabupatenByProvinsi(bumdesData, filters.provinsi);
  const kecamatanList = getKecamatanByKabupaten(bumdesData, filters.kabupaten);
  const ispList = getUniqueValues(bumdesData, "isp");
  const statusList = getUniqueValues(bumdesData, "status");

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-card p-4 shadow-sm border border-border">

      {/* PROVINSI */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Provinsi
        </label>
        <Select
          value={filters.provinsi}
          onValueChange={(v) =>
            setFilters({
              provinsi: v,
              kabupaten: "Semua",
              kecamatan: "Semua",
              statusWarning: null, // reset KPI
            })
          }
        >
          <SelectTrigger className="w-[180px] h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semua">Semua Provinsi</SelectItem>
            {provinsiList.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KABUPATEN */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Kabupaten
        </label>
        <Select
          value={filters.kabupaten}
          onValueChange={(v) =>
            setFilters({
              kabupaten: v,
              kecamatan: "Semua",
              statusWarning: null,
            })
          }
        >
          <SelectTrigger className="w-[180px] h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semua">Semua Kabupaten</SelectItem>
            {kabupatenList.map((k) => (
              <SelectItem key={k} value={k}>
                {k}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KECAMATAN */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Kecamatan
        </label>
        <Select
          value={filters.kecamatan}
          onValueChange={(v) =>
            setFilters({
              kecamatan: v,
              statusWarning: null,
            })
          }
        >
          <SelectTrigger className="w-[180px] h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semua">Semua Kecamatan</SelectItem>
            {kecamatanList.map((k) => (
              <SelectItem key={k} value={k}>
                {k}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ISP */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          ISP
        </label>
        <Select
          value={filters.isp}
          onValueChange={(v) =>
            setFilters({
              isp: v,
              statusWarning: null,
            })
          }
        >
          <SelectTrigger className="w-[160px] h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semua">Semua ISP</SelectItem>
            {ispList.map((i) => (
              <SelectItem key={i} value={i}>
                {i}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* STATUS LAYANAN */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Status Layanan
        </label>
        <Select
          value={filters.status}
          onValueChange={(v) =>
            setFilters({
              status: v,
              statusWarning: null, // penting!
            })
          }
        >
          <SelectTrigger className="w-[180px] h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semua">Semua Status</SelectItem>
            {statusList.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* RESET */}
      <Button
        variant="ghost"
        size="sm"
        onClick={resetFilters}
        className="mt-4 text-xs text-muted-foreground"
      >
        <RotateCcw className="mr-1 h-3 w-3" />
        Reset
      </Button>
    </div>
  );
}