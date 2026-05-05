import { DashboardLayout } from "@/components/DashboardLayout";
import { FilterBar } from "@/components/FilterBar";
import { StatCard } from "@/components/StatCard";
import { useFilteredAkses, useAllAksesData } from "@/hooks/useData";
import { Wifi, MapPin, Signal, Radio, Search, Download, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { useFilters } from "@/contexts/FilterContext";
import { useMap } from "react-leaflet";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const ACCENT = "hsl(168,96%,28%)";
const PRIMARY = "hsl(232,48%,34%)";
const SECONDARY = "hsl(199,76%,55%)";
const WARNING = "hsl(38,92%,50%)";
const DESTRUCTIVE = "hsl(0,84%,60%)";
const PURPLE = "hsl(270,60%,55%)";
const NEUTRAL = "hsl(0,0%,64%)";

const UTIL_MAP_COLORS: Record<string, string> = {
  Tinggi: "#16a34a",   // hijau
  Sedang: "#f59e0b",   // kuning
  Rendah: "#dc2626",   // merah
};

const UTIL_COLORS: Record<string, string> = { Tinggi: ACCENT, Sedang: WARNING, Rendah: DESTRUCTIVE };
const REKOM_COLORS: Record<string, string> = { Berlanjut: ACCENT, "Migrasi FO": SECONDARY, "Terminasi/Relokasi": DESTRUCTIVE };
const QUALITY_COLORS: Record<string, string> = { Baik: ACCENT, Lambat: WARNING, "Tidak Ada Akses": DESTRUCTIVE, "Tidak Diketahui": NEUTRAL };

function getQuality(r: { downloadMbps: number; uploadMbps: number }): string {
  if (r.downloadMbps >= 5) return "Baik";
  if (r.downloadMbps > 0) return "Lambat";
  return "Tidak Ada Akses";
}

function FitBounds({ data }: { data: any[] }) {
  const map = useMap();

  useEffect(() => {
    if (!data.length) return;

    const bounds: [number, number][] = data.map(
      (r) => [r.lat, r.lng]
    );

    map.fitBounds(bounds, { padding: [50, 50] });
  }, [data, map]);

  return null;
}

export default function AksesInternetPage() {
  const { filters } = useFilters();

  const data = useFilteredAkses();
  const allAkses = useAllAksesData();
  const [search, setSearch] = useState("");
  const [tableFilters, setTableFilters] = useState({
    teknologi: "Semua",
    utilitas: "Semua",
    kualitas: "Semua",
    rekomendasi: "Semua",
    skema: "Semua",
    tools: "Semua",
    aiMandiri: "Semua",
    aiGanda: "Semua",
    bantuanUSO: "Semua",
    tindakLanjut: "Semua",
    pelaksanaan: "Semua",
    lat: "Semua",
    lng: "Semua",
  });
  const [page, setPage] = useState(0);
  const perPage = 25;

  const resetFilters = () => {
    setTableFilters({
      teknologi: "Semua",
      utilitas: "Semua",
      kualitas: "Semua",
      rekomendasi: "Semua",
      skema: "Semua",
      tools: "Semua",
      aiMandiri: "Semua",
      aiGanda: "Semua",
      bantuanUSO: "Semua",
      tindakLanjut: "Semua",
      pelaksanaan: "Semua",
      lat: "Semua",
      lng: "Semua",
    });
    setSearch("");
    setPage(0);
  };

  const stats = useMemo(() => {
    const total = data.length;
    const tinggi = data.filter((r) => r.utilitas === "Tinggi").length;
    const sedang = data.filter((r) => r.utilitas === "Sedang").length;
    const rendah = data.filter((r) => r.utilitas === "Rendah").length;

    // Avg bandwidth, download, upload
    const bwCount: Record<number, number> = {};

    data.forEach((r) => {
      bwCount[r.bandwidth] = (bwCount[r.bandwidth] || 0) + 1;
    });

    const modeBw =
      total > 0
        ? Number(
            Object.entries(bwCount).sort((a, b) => b[1] - a[1])[0][0]
          )
        : 0;
    const avgDl =
      total > 0
        ? data.reduce((s, r) => s + ((r.downloadMbps + r.downloadAP2) / 2), 0) / total
        : 0;

    const avgUl =
      total > 0
        ? data.reduce((s, r) => s + ((r.uploadMbps + r.uploadAP2) / 2), 0) / total
        : 0;

    // YoY simulated comparisons
    // ===================================
    // REAL YEAR OVER YEAR COMPARISON
    // ===================================

    const selectedYear = filters.tahun;
    const showComparison = selectedYear !== "Semua";

    const prevYear = Number(selectedYear) - 1;

    const prevData = allAkses.filter(
      (r) => String(r.tahun) === String(prevYear)
    );

    const hasPrevData = prevData.length > 0;

    const prevTotal = hasPrevData ? prevData.length : 0;

    const prevBwCount: Record<number, number> = {};

    prevData.forEach((r) => {
      prevBwCount[r.bandwidth] = (prevBwCount[r.bandwidth] || 0) + 1;
    });

    const prevModeBw =
      hasPrevData
        ? Number(
            Object.entries(prevBwCount).sort((a, b) => b[1] - a[1])[0][0]
          )
        : 0;

const prevAvgDl =
  hasPrevData
    ? prevData.reduce(
        (s, r) => s + ((r.downloadMbps + r.downloadAP2) / 2),
        0
      ) / prevData.length
    : 0;

const prevAvgUl =
  hasPrevData
    ? prevData.reduce(
        (s, r) => s + ((r.uploadMbps + r.uploadAP2) / 2),
        0
      ) / prevData.length
    : 0;

const changePctTotal =
  showComparison && prevTotal > 0
    ? ((total - prevTotal) / prevTotal) * 100
    : null;

const changePctBw =
  showComparison && prevModeBw > 0
    ? ((modeBw - prevModeBw) / prevModeBw) * 100
    : null;

const changePctDl =
  showComparison && prevAvgDl > 0
    ? ((avgDl - prevAvgDl) / prevAvgDl) * 100
    : null;

const changePctUl =
  showComparison && prevAvgUl > 0
    ? ((avgUl - prevAvgUl) / prevAvgUl) * 100
    : null;

    // 🔥 AVG SPEED PER TOOLS
    const toolsMap: Record<string, any> = {};

    data.forEach((r) => {
      const rawTool = r.tools?.trim();

      // skip kosong / dash / null
      if (!rawTool || rawTool === "-" || rawTool.toLowerCase() === "null") return;

      const t = rawTool.toLowerCase();

      if (!toolsMap[t]) {
        toolsMap[t] = {
          dl1: 0,
          ul1: 0,
          dl2: 0,
          ul2: 0,
          count: 0,
        };
      }

      toolsMap[t].dl1 += r.downloadMbps;
      toolsMap[t].ul1 += r.uploadMbps;
      toolsMap[t].dl2 += r.downloadAP2;
      toolsMap[t].ul2 += r.uploadAP2;
      toolsMap[t].count += 1;
    });

    const toolsSpeedData = Object.entries(toolsMap).map(([name, v]) => ({
      name:
        name === "nperf"
          ? "Nperf"
          : name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
      "Download AP1": +(v.dl1 / v.count).toFixed(2),
      "Upload AP1": +(v.ul1 / v.count).toFixed(2),
      "Download AP2": +(v.dl2 / v.count).toFixed(2),
      "Upload AP2": +(v.ul2 / v.count).toFixed(2),
    }));

    const lokasiPerKab = Object.entries(
      data.reduce((acc, r) => {
        const kab = r.kabupaten?.trim();

        // skip kalau kosong atau "-"
        if (!kab || kab === "-") return acc;

        acc[kab] = (acc[kab] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([name, value]) => ({
        name,
        value: Number(value),
      }))
      .sort((a, b) => b.value - a.value);

    const penyediaMap: Record<string, number> = {};

    data.forEach((r) => {
      const p = r.penyedia?.trim();

      // skip kalau kosong, "-", atau "Tidak Diketahui"
      if (!p || p === "-" || p === "Tidak Diketahui") return;

      penyediaMap[p] = (penyediaMap[p] || 0) + 1;
    });

    const penyediaData = Object.entries(penyediaMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);      
    
    // Quality distribution
    const qualMap: Record<string, number> = {};
    data.forEach((r) => { const q = getQuality(r); qualMap[q] = (qualMap[q] || 0) + 1; });
    const qualData = Object.entries(qualMap).map(([name, value]) => ({ name, value, pct: total > 0 ? ((value / total) * 100).toFixed(1) : "0" }));

    // Quality by utilitas (stacked)
    const qualByUtil: Record<string, Record<string, number>> = { Tinggi: {}, Sedang: {}, Rendah: {} };
    data.forEach((r) => {
      const q = getQuality(r);
      if (!qualByUtil[r.utilitas]) qualByUtil[r.utilitas] = {};
      qualByUtil[r.utilitas][q] = (qualByUtil[r.utilitas][q] || 0) + 1;
    });
    const qualByUtilData = Object.entries(qualByUtil).map(([name, v]) => ({
      name, Baik: v.Baik || 0, Lambat: v.Lambat || 0, "Tidak Ada Akses": v["Tidak Ada Akses"] || 0,
    }));

    // Technology
    const techMap: Record<string, number> = {};

    data.forEach((r) => {
      // ❗ skip kalau kosong
      if (!r.teknologi || r.teknologi.trim() === "") return;

      techMap[r.teknologi] = (techMap[r.teknologi] || 0) + 1;
    });

    const techData = Object.entries(techMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // const techMap: Record<string, number> = {};
    // data.forEach((r) => { techMap[r.teknologi] = (techMap[r.teknologi] || 0) + 1; });
    // const techData = Object.entries(techMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    // Kabupaten + utilitas
    const kabMap: Record<string, { tinggi: number; sedang: number; rendah: number }> = {};
    data.forEach((r) => {
      if (!kabMap[r.kabupaten]) kabMap[r.kabupaten] = { tinggi: 0, sedang: 0, rendah: 0 };
      if (r.utilitas === "Tinggi") kabMap[r.kabupaten].tinggi++;
      else if (r.utilitas === "Sedang") kabMap[r.kabupaten].sedang++;
      else kabMap[r.kabupaten].rendah++;
    });
    const kabData = Object.entries(kabMap)
      .map(([name, v]) => ({ name, ...v, total: v.tinggi + v.sedang + v.rendah }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Rekomendasi wilker
    const rekomMap: Record<string, number> = {};
    data.forEach((r) => { rekomMap[r.rekomendasi] = (rekomMap[r.rekomendasi] || 0) + 1; });
    const rekomData = Object.entries(rekomMap).map(([name, value]) => ({ name, value }));

    // Rekomendasi x Utilitas
    const rekomUtil: Record<string, Record<string, number>> = {};
    data.forEach((r) => {
      if (!rekomUtil[r.rekomendasi]) rekomUtil[r.rekomendasi] = {};
      rekomUtil[r.rekomendasi][r.utilitas] = (rekomUtil[r.rekomendasi][r.utilitas] || 0) + 1;
    });
    const rekomUtilData = Object.entries(rekomUtil).map(([name, v]) => ({
      name, Tinggi: v.Tinggi || 0, Sedang: v.Sedang || 0, Rendah: v.Rendah || 0,
    }));

    // Top 5 Kabupaten Prioritas (by Terminasi/Relokasi + Migrasi FO)
    const kabPrioritas: Record<string, { terminasi: number; migrasi: number }> = {};
    data.forEach((r) => {
      if (!kabPrioritas[r.kabupaten]) kabPrioritas[r.kabupaten] = { terminasi: 0, migrasi: 0 };
      if (r.rekomendasi === "Terminasi/Relokasi") kabPrioritas[r.kabupaten].terminasi++;
      if (r.rekomendasi === "Migrasi FO") kabPrioritas[r.kabupaten].migrasi++;
    });
    const kabPrioritasData = Object.entries(kabPrioritas)
      .map(([name, v]) => ({ name, ...v, total: v.terminasi + v.migrasi }))
      .filter((k) => k.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Komposisi kualitas di utilitas rendah
    const rendahQualMap: Record<string, number> = {};
    data.filter((r) => r.utilitas === "Rendah").forEach((r) => {
      const q = getQuality(r);
      rendahQualMap[q] = (rendahQualMap[q] || 0) + 1;
    });
    const rendahQualData = Object.entries(rendahQualMap).map(([name, value]) => ({ name, value }));

    // Services
    const aksesMandiriAda = data.filter((r) => r.aksesMandiri === "Ada").length;
    const aksesMandiriTidak = data.length - aksesMandiriAda;
    // const aksesMandiriTidak = data.filter((r) => r.aksesMandiri === "Tidak Ada").length;
    const layananGandaYa = data.filter((r) => r.layananAiGanda === "Ya").length;
    const layananGandaTidak = data.filter((r) => r.layananAiGanda !== "Ya").length;
    const layananMandiriYa = data.filter((r) => r.layananAiMandiri === "Ya").length;
    const bantuanUSOYa = data.filter((r) => r.bantuanGandaUSO === "Ada").length;
    const bantuanUSOTidak = data.filter((r) => r.bantuanGandaUSO !== "Ada").length;


    const aksesMandiriPct = total > 0 ? ((aksesMandiriAda / total) * 100).toFixed(1) : "0";

    // Skema distribution
    const skemaMap: Record<string, number> = {};
    data.forEach((r) => {
      const s = r.skema?.includes("BMN") ? "BMN" : r.skema?.includes("Sewa") ? "Sewa Layanan" : r.skema || "Lainnya";
      skemaMap[s] = (skemaMap[s] || 0) + 1;
    });
    const skemaData = Object.entries(skemaMap).map(([name, value]) => ({ name, value, pct: total > 0 ? ((value / total) * 100).toFixed(1) : "0" }));

    // ISP / Penyedia Layanan - we don't have ISP in akses data, skip or use skema
    // Bandwidth distribution
    const bwRanges = [
      { name: "< 10 Mbps", min: 0, max: 10 },
      { name: "10-50 Mbps", min: 10, max: 50 },
      { name: "50-100 Mbps", min: 50, max: 100 },
      { name: "> 100 Mbps", min: 100, max: Infinity },
    ];
    const bwData = bwRanges.map((range) => ({
      name: range.name,
      value: data.filter((r) => r.bandwidth >= range.min && r.bandwidth < range.max).length,
    }));

    
    // Avg BW/DL/UL by utilitas
    const avgByUtil = ["Tinggi", "Sedang", "Rendah"].map((util) => {
      const subset = data.filter((r) => r.utilitas === util);
      const cnt = subset.length || 1;
      return {
        name: util,
        Bandwidth: +(subset.reduce((s, r) => s + r.bandwidth, 0) / cnt).toFixed(2),
        Download: +(subset.reduce((s, r) => s + r.downloadMbps, 0) / cnt).toFixed(2),
        Upload: +(subset.reduce((s, r) => s + r.uploadMbps, 0) / cnt).toFixed(2),
      };
    });

    const resetFilters = () => {
      setTableFilters({
        teknologi: "Semua",
        utilitas: "Semua",
        kualitas: "Semua",
        rekomendasi: "Semua",
        skema: "Semua",
        tools: "Semua",
        aiMandiri: "Semua",
        aiGanda: "Semua",
        bantuanUSO: "Semua",
        tindakLanjut: "Semua",
        pelaksanaan: "Semua",
        lat: "Semua",
        lng: "Semua",
      });

      setPage(0); 
    };

    type MapPoint = {
      lat: number;
      lng: number;
      namaLokasi: string;
      kabupaten: string;
      utilitas: string;
      downloadMbps: number;
    };

    const mapData: MapPoint[] = data.filter(
      (d): d is MapPoint =>
        d.lat !== null && d.lng !== null
    );
    
    return {
      total, tinggi, sedang, rendah,
      modeBw, avgDl, avgUl,
      changePctTotal, changePctBw, changePctDl, changePctUl,
      qualData, qualByUtilData,
      techData, kabData, rekomData, rekomUtilData,
      kabPrioritasData, rendahQualData,
      aksesMandiriAda, aksesMandiriTidak, aksesMandiriPct,
      bantuanUSOYa, bantuanUSOTidak,
      lokasiPerKab, penyediaData,
      layananGandaYa, layananGandaTidak, layananMandiriYa,
      skemaData, bwData, avgByUtil, toolsSpeedData,
      mapData,
    };
  }, [data, allAkses]);

  const filtered = data.filter((r) => {
    const keyword = search.toLowerCase();
    const kualitas = getQuality(r);

    const matchSearch =
      r.namaLokasi.toLowerCase().includes(keyword) ||
      r.provinsi.toLowerCase().includes(keyword) ||
      r.kabupaten.toLowerCase().includes(keyword) ||
      r.kecamatan.toLowerCase().includes(keyword);

    const matchFilter =
      (tableFilters.teknologi === "Semua" || r.teknologi === tableFilters.teknologi) &&
      (tableFilters.utilitas === "Semua" || r.utilitas === tableFilters.utilitas) &&
      (tableFilters.kualitas === "Semua" || kualitas === tableFilters.kualitas) &&
      (tableFilters.rekomendasi === "Semua" || r.rekomendasi === tableFilters.rekomendasi) &&
      (tableFilters.skema === "Semua" || r.skema === tableFilters.skema) &&
      (tableFilters.tools === "Semua" || r.tools === tableFilters.tools) &&
      (tableFilters.aiMandiri === "Semua" || r.layananAiMandiri === tableFilters.aiMandiri) &&
      (tableFilters.aiGanda === "Semua" || r.layananAiGanda === tableFilters.aiGanda) &&
      (tableFilters.bantuanUSO === "Semua" || r.bantuanGandaUSO === tableFilters.bantuanUSO) &&
      (tableFilters.tindakLanjut === "Semua" || r.tindakLanjut === tableFilters.tindakLanjut) &&
      (tableFilters.pelaksanaan === "Semua" || r.pelaksanaan === tableFilters.pelaksanaan);

    return matchSearch && matchFilter;
  });
  
  const totalPages = Math.ceil(filtered.length / perPage);
  const pageData = filtered.slice(page * perPage, (page + 1) * perPage);
  
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Monitoring Akses Internet - Wilayah Kerja IV Surabaya</h1>
            <p className="text-sm text-muted-foreground">Data Monitoring & Evaluasi Penyediaan Layanan Akses Internet BAKTI KOMDIGI</p>
          </div>
        </div>

        <FilterBar />

        {/* Stats Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Lokasi Layanan Termonitoring" value={stats.total} icon={Wifi} change={
          stats.changePctTotal !== null
            ? +stats.changePctTotal.toFixed(1)
            : undefined
        } variant="accent" />
                  <StatCard title="Rata-rata Bandwidth" value={`${stats.modeBw.toFixed(2)} Mbps`} icon={Activity} change={
          stats.changePctBw !== null
            ? +stats.changePctBw.toFixed(1)
            : undefined
        } variant="primary" />
                  <StatCard title="Rata-rata Download" value={`${stats.avgDl.toFixed(2)} Mbps`} icon={Download} change={
          stats.changePctDl !== null
            ? +stats.changePctDl.toFixed(1)
            : undefined
        } variant="secondary" />
                  <StatCard title="Rata-rata Upload" value={`${stats.avgUl.toFixed(2)} Mbps`} icon={TrendingUp} change={
          stats.changePctUl !== null
            ? +stats.changePctUl.toFixed(1)
            : undefined
        } variant="warning" />
                </div>

        {/* Utilitas count cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard title="Lokasi Utilitas Tinggi" value={stats.tinggi} icon={Signal} variant="accent" />
          <StatCard title="Lokasi Utilitas Sedang" value={stats.sedang} icon={Signal} variant="secondary" />
          <StatCard title="Lokasi Utilitas Rendah" value={stats.rendah} icon={Signal} variant="warning" />
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">
              Peta Sebaran Lokasi berdasarkan Utilitas
            </CardTitle>
            <CardDescription>
              Visualisasi lokasi layanan akses internet
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="h-[420px] rounded-xl overflow-hidden relative">
              <MapContainer
                center={[-2.5, 118]} // tengah Indonesia
                zoom={5}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitBounds data={stats.mapData} />
                {stats.mapData.map((r, i) => (
                  <CircleMarker
                    key={i}
                    center={[r.lat, r.lng]}
                    radius={4}
                    fillOpacity={0.6}
                    stroke={false}
                    fillColor={UTIL_MAP_COLORS[r.utilitas] || "#999"}
                  >
                    <LeafletTooltip direction="top" offset={[-5, 0]} opacity={1}>
                      <div className="text-xs">
                        <b>{r.namaLokasi}</b><br />
                        {r.kabupaten}<br />
                        Utilitas: {r.utilitas}<br />
                        {/* DL: {r.downloadMbps} Mbps */}
                      </div>
                    </LeafletTooltip>
                  </CircleMarker>
                ))}
              </MapContainer>
              <div className="absolute bottom-3 left-3 z-[9999] bg-white p-3 rounded-lg shadow text-xs pointer-events-auto">
                <div className="font-semibold mb-1">Utilitas</div>

                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-600" />
                  <span>Tinggi</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Sedang</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-600" />
                  <span>Rendah</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Persentase Kualitas + Persentase Utilitas */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Persentase Kualitas Akses Internet</CardTitle>
              <CardDescription>Berdasarkan kecepatan download</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="45%" height={200}>
                  <PieChart>
                    <Pie data={stats.qualData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} strokeWidth={2}>
                      {stats.qualData.map((q) => <Cell key={q.name} fill={QUALITY_COLORS[q.name] || NEUTRAL} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {stats.qualData.map((q) => (
                    <div key={q.name}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: QUALITY_COLORS[q.name] || NEUTRAL }} />
                          <span className="text-muted-foreground">{q.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{q.value}</span>
                          <Badge variant="outline" className="text-[10px]">{q.pct}%</Badge>
                        </div>
                      </div>
                      <Progress value={Number(q.pct)} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Persentase Utilitas</CardTitle>
              <CardDescription>Distribusi tingkat pemanfaatan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="45%" height={200}>
                  <PieChart>
                    <Pie data={[
                      { name: "Tinggi", value: stats.tinggi },
                      { name: "Sedang", value: stats.sedang },
                      { name: "Rendah", value: stats.rendah },
                    ]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} strokeWidth={2}>
                      <Cell fill={UTIL_COLORS.Tinggi} />
                      <Cell fill={UTIL_COLORS.Sedang} />
                      <Cell fill={UTIL_COLORS.Rendah} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 flex-1">
                  {[
                    { label: "Tinggi", value: stats.tinggi, color: UTIL_COLORS.Tinggi },
                    { label: "Sedang", value: stats.sedang, color: UTIL_COLORS.Sedang },
                    { label: "Rendah", value: stats.rendah, color: UTIL_COLORS.Rendah },
                  ].map((u) => (
                    <div key={u.label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: u.color }} />
                          <span className="text-muted-foreground">{u.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{u.value}</span>
                          <Badge variant="outline" className="text-[10px]">{data.length > 0 ? ((u.value / data.length) * 100).toFixed(1) : 0}%</Badge>
                        </div>
                      </div>
                      <Progress value={data.length > 0 ? (u.value / data.length) * 100 : 0} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* SIDE BY SIDE: Kabupaten & Penyedia */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* ================= KABUPATEN ================= */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">
                Jumlah Lokasi per Kabupaten
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="h-[385px] overflow-y-auto pr-2">
                <div style={{ height: Math.max(stats.lokasiPerKab.length * 25, 385) }}>
                  
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.lokasiPerKab}
                      layout="vertical"
                      margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />

                      <XAxis type="number" tick={{ fontSize: 11 }} />

                      <YAxis
                        dataKey="name"
                        type="category"
                        width={110} // SAMAKAN
                        tick={{ fontSize: 12 }}
                        interval={0}
                        tickMargin={8}
                        tickFormatter={(value) =>
                          value.length > 14 ? value.slice(0, 14) + "…" : value
                        }
                      />

                      <Tooltip />

                      <Bar
                        dataKey="value"
                        fill={PRIMARY}
                        radius={[0, 6, 6, 0]}
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>

                </div>
              </div>
            </CardContent>
          </Card>

          {/* ================= PENYEDIA ================= */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">
                Distribusi Penyedia Layanan
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="h-[385px] overflow-y-auto pr-2">
                <div style={{ height: Math.max(stats.penyediaData.length * 25, 385) }}>
                  
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.penyediaData}
                      layout="vertical"
                      margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />

                      <XAxis type="number" tick={{ fontSize: 11 }} />

                      <YAxis
                        dataKey="name"
                        type="category"
                        width={140} // SAMAKAN
                        tick={{ fontSize: 12 }}
                        interval={0}
                        tickMargin={8}
                        tickFormatter={(value) =>
                          value.length > 14 ? value.slice(0, 14) + "…" : value
                        }
                      />

                      <Tooltip />

                      <Bar
                        dataKey="value"
                        fill={ACCENT}
                        radius={[0, 6, 6, 0]}
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>

                </div>
              </div>
            </CardContent>
          </Card>

        </div>
        
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">
              Rata-rata Kecepatan per Tools (AP1 vs AP2)
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.toolsSpeedData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                />

                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) => `${value} Mbps`}
                />

                <Legend wrapperStyle={{ fontSize: "14px" }} />
                <Bar dataKey="Download AP1" fill={ACCENT} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Upload AP1" fill={SECONDARY} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Download AP2" fill={PRIMARY} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Upload AP2" fill={WARNING} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Kualitas berdasarkan Utilitas */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Kualitas Internet berdasarkan Utilitas</CardTitle>
            <CardDescription>Distribusi kualitas akses per tingkat utilitas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.qualByUtilData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={70} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Baik" fill={QUALITY_COLORS.Baik} stackId="a" />
                <Bar dataKey="Lambat" fill={QUALITY_COLORS.Lambat} stackId="a" />
                <Bar dataKey="Tidak Ada Akses" fill={QUALITY_COLORS["Tidak Ada Akses"]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Jumlah Lokasi per Kab + Utilitas */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Jumlah Lokasi menurut Kabupaten dan Utilitas</CardTitle>
            <CardDescription>Top 10 kabupaten berdasarkan jumlah lokasi & utilitas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={stats.kabData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={130} />
                <Tooltip />
                <Legend />
                <Bar dataKey="tinggi" name="Tinggi" fill={UTIL_COLORS.Tinggi} stackId="a" />
                <Bar dataKey="sedang" name="Sedang" fill={UTIL_COLORS.Sedang} stackId="a" />
                <Bar dataKey="rendah" name="Rendah" fill={UTIL_COLORS.Rendah} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rekomendasi Wilker + Top Kabupaten Prioritas */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Jumlah Lokasi menurut Rekomendasi Wilker</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.rekomData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {stats.rekomData.map((r) => <Cell key={r.name} fill={REKOM_COLORS[r.name] || SECONDARY} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Top 5 Kabupaten Prioritas</CardTitle>
              <CardDescription>Berdasarkan rekomendasi Terminasi/Relokasi & Migrasi FO</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.kabPrioritasData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="terminasi" name="Terminasi/Relokasi" fill={DESTRUCTIVE} stackId="a" />
                  <Bar dataKey="migrasi" name="Migrasi FO" fill={SECONDARY} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ================= REKOMENDASI ================= */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">
                Distribusi Rekomendasi Wilker
              </CardTitle>
            </CardHeader>

            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.rekomUtilData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />

                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={140}
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip />
                  <Legend />

                  <Bar dataKey="Tinggi" stackId="a" fill={UTIL_COLORS.Tinggi} />
                  <Bar dataKey="Sedang" stackId="a" fill={UTIL_COLORS.Sedang} />
                  <Bar dataKey="Rendah" stackId="a" fill={UTIL_COLORS.Rendah} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* ================= KUALITAS UTILITAS RENDAH ================= */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">
                Komposisi Kualitas (Utilitas Rendah)
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-4">

                {/* PIE */}
                <ResponsiveContainer width="50%" height={220}>
                  <PieChart>
                    <Pie
                      data={stats.rendahQualData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={40}
                    >
                      {stats.rendahQualData.map((q) => (
                        <Cell key={q.name} fill={QUALITY_COLORS[q.name] || NEUTRAL} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                {/* LEGEND CUSTOM */}
                <div className="space-y-2 flex-1">
                  {stats.rendahQualData.map((q) => (
                    <div key={q.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded"
                          style={{ backgroundColor: QUALITY_COLORS[q.name] || NEUTRAL }}
                        />
                        <span className="text-muted-foreground">{q.name}</span>
                      </div>
                      <span className="font-semibold">{q.value}</span>
                    </div>
                  ))}
                </div>

              </div>
            </CardContent>
          </Card>

        </div>

        {/* Teknologi + Skema */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Teknologi Akses Internet</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={stats.techData}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />

                  <XAxis type="number" tick={{ fontSize: 11 }} />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    tick={{ fontSize: 12 }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    fill={PRIMARY}
                    radius={[0, 6, 6, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Persentase Skema/Status Layanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={220}>
                  <PieChart>
                    <Pie data={stats.skemaData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} strokeWidth={2}>
                      {stats.skemaData.map((_, i) => <Cell key={i} fill={[PRIMARY, ACCENT, SECONDARY, WARNING][i % 4]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 flex-1">
                  {stats.skemaData.map((s, i) => (
                    <div key={s.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: [PRIMARY, ACCENT, SECONDARY, WARNING][i % 4] }} />
                        <span className="text-muted-foreground">{s.name}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{s.pct}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Akses Mandiri, Bantuan Ganda USO, Layanan AI Ganda */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Akses Mandiri" value={`${stats.aksesMandiriPct}%`} icon={Radio} variant="accent" subtitle={`${stats.aksesMandiriAda} dari ${data.length} lokasi`} />
          <StatCard title="Layanan AI Mandiri" value={stats.layananMandiriYa} icon={Radio} variant="primary" />
          <StatCard title="Layanan AI Ganda" value={stats.layananGandaYa} icon={Radio} variant="secondary" />
          <StatCard title="Bantuan Ganda USO" value={stats.bantuanUSOYa} icon={MapPin} variant="warning" />
        </div>

        {/* Stacked bars for Akses Mandiri / Bantuan USO / Layanan Ganda */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Akses Mandiri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 flex-1 rounded-full overflow-hidden bg-muted flex">
                    <div className="h-full bg-accent" style={{ width: `${stats.aksesMandiriPct}%` }} />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Ada: {stats.aksesMandiriAda} ({stats.aksesMandiriPct}%)</span>
                  <span>Tidak: {stats.aksesMandiriTidak}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Bantuan Ganda USO</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(() => {
                  const pct = data.length > 0 ? ((stats.bantuanUSOYa / data.length) * 100).toFixed(1) : "0";
                  return (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="h-4 flex-1 rounded-full overflow-hidden bg-muted flex">
                          <div className="h-full" style={{ width: `${pct}%`, backgroundColor: WARNING }} />
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Ada: {stats.bantuanUSOYa} ({pct}%)</span>
                        <span>Tidak: {stats.bantuanUSOTidak}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Layanan AI Ganda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(() => {
                  const pct = data.length > 0 ? ((stats.layananGandaYa / data.length) * 100).toFixed(1) : "0";
                  return (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="h-4 flex-1 rounded-full overflow-hidden bg-muted flex">
                          <div className="h-full" style={{ width: `${pct}%`, backgroundColor: SECONDARY }} />
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Ya: {stats.layananGandaYa} ({pct}%)</span>
                        <span>Tidak: {stats.layananGandaTidak}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rata-rata BW/DL/UL per Utilitas */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Rata-rata Bandwidth, Download (AP1), dan Upload (AP1) Berdasarkan Utilitas</CardTitle>
          </CardHeader>
          <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.avgByUtil}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />

              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === "Bandwidth") {
                    return [`${value} Mbps`, name];
                  }

                  return [`${value} Mbps`, name];
                }}
              />

              <Legend />

              <Bar dataKey="Bandwidth" fill={PRIMARY} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Download" fill={ACCENT} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Upload" fill={SECONDARY} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bandwidth Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Distribusi Bandwidth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.bwData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill={ACCENT} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detail Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Detail Lokasi Layanan</CardTitle>
                <CardDescription>{filtered.length.toLocaleString("id-ID")} lokasi ditemukan</CardDescription>
              </div>
              <div className="flex items-center gap-2">

                {/* SEARCH */}
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari lokasi, provinsi, kabupaten, kecamatan ..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(0);
                    }}
                    className="pl-9 h-9 text-xs"
                  />
                </div>

                {/* RESET FILTER BUTTON */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="h-9 text-xs"
                >
                  Reset Filter
                </Button>

              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>

                  <TableHead>Lokasi</TableHead>
                  <TableHead>Provinsi</TableHead>
                  <TableHead>Kabupaten</TableHead>
                  <TableHead>Kecamatan</TableHead>

                  {/* Teknologi */}
                  <TableHead>
                    <select
                      className="text-xs border rounded px-1"
                      value={tableFilters.teknologi}
                      onChange={(e)=>setTableFilters({...tableFilters, teknologi:e.target.value})}
                    >
                      <option value="Semua">Teknologi</option>
                      {[...new Set(data.map(d=>d.teknologi))].map(v=>
                        <option key={v}>{v}</option>
                      )}
                    </select>
                  </TableHead>

                  <TableHead>BW</TableHead>
                  <TableHead>Download</TableHead>
                  <TableHead>Upload</TableHead>

                  {/* Utilitas */}
                  <TableHead>
                    <select
                      className="text-xs border rounded px-1"
                      value={tableFilters.utilitas}
                      onChange={(e)=>setTableFilters({...tableFilters, utilitas:e.target.value})}
                    >
                      <option value="Semua">Utilitas</option>
                      {[...new Set(data.map(d=>d.utilitas))].map(v=>
                        <option key={v}>{v}</option>
                      )}
                    </select>
                  </TableHead>

                  {/* Kualitas */}
                  <TableHead>
                    <select
                      className="text-xs border rounded px-1"
                      value={tableFilters.kualitas}
                      onChange={(e)=>setTableFilters({...tableFilters, kualitas:e.target.value})}
                    >
                      <option value="Semua">Kualitas</option>
                      <option value="Baik">Baik</option>
                      <option value="Lambat">Lambat</option>
                      <option value="Tidak Ada Akses">Tidak Ada Akses</option>
                    </select>
                  </TableHead>

                  {/* Rekomendasi */}
                  <TableHead>
                    <select
                      className="text-xs border rounded px-1"
                      value={tableFilters.rekomendasi}
                      onChange={(e)=>setTableFilters({...tableFilters, rekomendasi:e.target.value})}
                    >
                      <option value="Semua">Rekomendasi</option>
                      {[...new Set(data.map(d=>d.rekomendasi))].map(v=>
                        <option key={v}>{v}</option>
                      )}
                    </select>
                  </TableHead>

                  {/* Skema */}
                  <TableHead>
                    <select
                      className="text-xs border rounded px-1"
                      value={tableFilters.skema}
                      onChange={(e)=>setTableFilters({...tableFilters, skema:e.target.value})}
                    >
                      <option value="Semua">Skema</option>
                      {[...new Set(data.map(d=>d.skema))].map(v=>
                        <option key={v}>{v}</option>
                      )}
                    </select>
                  </TableHead>

                  {/* Tools */}
                  <TableHead>
                    <select
                      className="text-xs border rounded px-1"
                      value={tableFilters.tools}
                      onChange={(e)=>setTableFilters({...tableFilters, tools:e.target.value})}
                    >
                      <option value="Semua">Tools</option>
                      {[...new Set(data.map(d=>d.tools))].map(v=>
                        <option key={v}>{v}</option>
                      )}
                    </select>
                  </TableHead>

                  {/* AI Mandiri */}
                  <TableHead>
                    <select
                      className="text-xs border rounded px-1"
                      value={tableFilters.aiMandiri}
                      onChange={(e)=>setTableFilters({...tableFilters, aiMandiri:e.target.value})}
                    >
                      <option value="Semua">AI Mandiri</option>
                      <option value="Ya">Ya</option>
                      <option value="Tidak">Tidak</option>
                    </select>
                  </TableHead>

                  {/* AI Ganda */}
                  <TableHead>
                    <select
                      className="text-xs border rounded px-1"
                      value={tableFilters.aiGanda}
                      onChange={(e)=>setTableFilters({...tableFilters, aiGanda:e.target.value})}
                    >
                      <option value="Semua">AI Ganda</option>
                      <option value="Ya">Ya</option>
                      <option value="Tidak">Tidak</option>
                    </select>
                  </TableHead>

                  {/* Bantuan USO */}
                  <TableHead>
                    <select
                      className="text-xs border rounded px-1"
                      value={tableFilters.bantuanUSO}
                      onChange={(e)=>setTableFilters({...tableFilters, bantuanUSO:e.target.value})}
                    >
                      <option value="Semua">Bantuan USO</option>
                      <option value="Ada">Ada</option>
                      <option value="Tidak Ada">Tidak Ada</option>
                    </select>
                  </TableHead>

                  <TableHead>
                    <select
                      className="text-xs border rounded px-1"
                      value={tableFilters.tindakLanjut}
                      onChange={(e)=>
                        setTableFilters({
                          ...tableFilters,
                          tindakLanjut:e.target.value
                        })
                      }
                    >
                      <option value="Semua">Tindak Lanjut</option>
                      {[...new Set(data.map(d => d.tindakLanjut))].map(v => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </TableHead>

                  <TableHead>
                    <select
                      className="text-xs border rounded px-1"
                      value={tableFilters.pelaksanaan}
                      onChange={(e)=>
                        setTableFilters({
                          ...tableFilters,
                          pelaksanaan:e.target.value
                        })
                      }
                    >
                      <option value="Semua">Pelaksanaan</option>
                      {[...new Set(data.map(d => d.pelaksanaan))].map(v => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </TableHead>

                  <TableHead>Link Laporan</TableHead>

                </TableRow>
              </TableHeader>

              <TableBody>
                {pageData.map((r, i) => (
                  <TableRow key={i}>

                    <TableCell>{r.namaLokasi}</TableCell>
                    <TableCell>{r.provinsi}</TableCell>
                    <TableCell>{r.kabupaten}</TableCell>
                    <TableCell>{r.kecamatan}</TableCell>

                    <TableCell>{r.teknologi}</TableCell>
                    <TableCell>{r.bandwidth}</TableCell>
                    <TableCell>{r.downloadMbps}</TableCell>
                    <TableCell>{r.uploadMbps}</TableCell>

                    {/* UTILITAS */}
                    <TableCell>
                      <Badge variant={
                        r.utilitas==="Tinggi"?"default":
                        r.utilitas==="Sedang"?"secondary":"destructive"
                      }>
                        {r.utilitas}
                      </Badge>
                    </TableCell>

                    {/* KUALITAS */}
                    <TableCell>
                      <Badge
                        className="text-[12px] px-2 py-0.5 whitespace-nowrap"
                        variant={
                          getQuality(r) === "Baik"
                            ? "default"
                            : getQuality(r) === "Lambat"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {getQuality(r)}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      {r.rekomendasi}
                    </TableCell>
                    <TableCell className="text-center">
                      {r.skema}
                    </TableCell>

                    <TableCell className="text-center">
                      {r.tools}
                    </TableCell>
                    <TableCell className="text-center">
                      {r.layananAiMandiri}
                    </TableCell>
                    <TableCell className="text-center">
                      {r.layananAiGanda}
                    </TableCell>
                    <TableCell className="text-center">
                      {r.bantuanGandaUSO}
                    </TableCell>
                    <TableCell className="text-center">
                      {r.tindakLanjut}
                    </TableCell>
                    <TableCell className="text-center">
                      {r.pelaksanaan}
                    </TableCell>
                    {/* LINK */}
                    <TableCell>
                      {r.linkLaporan ? (
                        <a href={r.linkLaporan} target="_blank"
                          className="text-blue-600 underline">
                          Lihat
                        </a>
                      ) : "-"}
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>

              </Table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-muted-foreground">Halaman {page + 1} dari {totalPages}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Sebelumnya</Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Berikutnya</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}