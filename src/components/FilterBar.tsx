import { useFilters } from "@/contexts/FilterContext";
import { useAllAksesData, getUniqueValues, getKabupatenByProvinsi, getKecamatanByKabupaten } from "@/hooks/useData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export function FilterBar() {
  const { filters, setFilters, resetFilters } = useFilters();
  const aksesData = useAllAksesData();
  const filteredByTahun =
    filters.tahun === "Semua"
      ? aksesData
      : aksesData.filter((d) => String(d.tahun) === filters.tahun);
  const provinsiList = getUniqueValues(filteredByTahun, "provinsi");
  const kabupatenList = getKabupatenByProvinsi(filteredByTahun, filters.provinsi);
  const kecamatanList = getKecamatanByKabupaten(filteredByTahun, filters.kabupaten);
  const tahunList = getUniqueValues(aksesData, "tahun");
  // console.log("DATA TAHUN:", aksesData.slice(0,5));

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-card p-4 shadow-sm border border-border">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Provinsi</label>
        <Select
          value={filters.provinsi}
          onValueChange={(v) => setFilters({ provinsi: v, kabupaten: "Semua", kecamatan: "Semua" })}
        >
          <SelectTrigger className="w-[180px] h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semua">Semua Provinsi</SelectItem>
            {provinsiList.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Kabupaten</label>
        <Select
          value={filters.kabupaten}
          onValueChange={(v) => setFilters({ kabupaten: v, kecamatan: "Semua" })}
        >
          <SelectTrigger className="w-[180px] h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semua">Semua Kabupaten</SelectItem>
            {kabupatenList.map((k) => (
              <SelectItem key={k} value={k}>{k}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Kecamatan</label>
        <Select
          value={filters.kecamatan}
          onValueChange={(v) => setFilters({ kecamatan: v })}
        >
          <SelectTrigger className="w-[180px] h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semua">Semua Kecamatan</SelectItem>
            {kecamatanList.map((k) => (
              <SelectItem key={k} value={k}>{k}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Tahun
        </label>
          <Select
            value={filters.tahun}
            onValueChange={(v) =>
              setFilters({
                tahun: v,
                provinsi: "Semua",
                kabupaten: "Semua",
                kecamatan: "Semua",
              })
            }
          >
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semua">Semua Tahun</SelectItem>
            {tahunList.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>    

      <Button variant="ghost" size="sm" onClick={resetFilters} className="mt-4 text-xs text-muted-foreground">
        <RotateCcw className="mr-1 h-3 w-3" /> Reset
      </Button>
    </div>
  );
}
