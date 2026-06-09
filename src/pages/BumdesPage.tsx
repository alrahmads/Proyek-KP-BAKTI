import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { useFilteredBumdes } from "@/hooks/useData";
import { Building2, AlertTriangle, CheckCircle, XCircle, Clock, Users, FileText, ExternalLink} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Progress } from "@/components/ui/progress";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { useFilters } from "@/contexts/FilterContext";
import { FilterBarBumdes } from "@/components/FilterBarBumdes";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const ACCENT = "hsl(168,96%,28%)";
const PRIMARY = "hsl(232,48%,34%)";
const SECONDARY = "hsl(199,76%,55%)";
const WARNING = "hsl(38,92%,50%)";
const DESTRUCTIVE = "hsl(0,84%,60%)";
const NEUTRAL = "hsl(0,0%,64%)";

const WARNING_BADGE = {
  Aktif: "default",
  Warning: "outline",
  Expired: "destructive",
  "Tidak Diketahui": "outline",
};

export default function BumdesPage() {
  const { filters, setFilters } = useFilters();
  const [search, setSearch] = useState("");

  const tableRef = useRef<HTMLDivElement>(null);

  const scrollToTable = () => {
    tableRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCardClick = (type: string) => {
    scrollToTable();

    if (type === "warning") {
      setFilters({
        statusWarning:
          filters.statusWarning === "Warning" ? null : "Warning",
      });
    }

    if (type === "perluPerhatian") {
      setFilters({
        statusWarning:
          filters.statusWarning === "perluPerhatian" ? null : "perluPerhatian",
      });
    }
  };

  const data = useFilteredBumdes();
  
  const isValidLink = (link: any) => {
    return typeof link === "string" && link.startsWith("http");
  };

  const getPergantianISP = (history: any[]) => {
    return history.find((h) => isValidLink(h.pergantianIsp))?.pergantianIsp || "";
  };

  const parseDate = (val: any) => {
    if (!val) return null;

    // handle format DD/MM/YYYY
    if (typeof val === "string" && val.includes("/")) {
      const [day, month, year] = val.split("/");
      return new Date(`${year}-${month}-${day}`);
    }

    const date = new Date(val);
    return isNaN(date.getTime()) ? null : date;
  };

  const getLatestDate = (b: any) => {
    const dates = [
      parseDate(b.pks),
      parseDate(b.perpanjanganPks1),
      parseDate(b.perpanjanganPks2),
    ].filter(Boolean);

    if (dates.length === 0) return new Date(0);

    return new Date(Math.max(...dates.map((d) => d.getTime())));
  };

  const latestBumdesData = useMemo(() => {
    const grouped: Record<string, any[]> = {};

    data.forEach((item) => {
      const key = item.namaBumdes?.trim().toLowerCase();

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    return Object.values(grouped).map((group) => {
      return group.sort((a, b) => {
        return getLatestDate(b).getTime() - getLatestDate(a).getTime();
      })[0]; // ambil paling baru
    });
  }, [data]);

  const getLatestPksDate = (b: any) => {
    const dates = [
      parseDate(b.pks),
      parseDate(b.perpanjanganPks1),
      parseDate(b.perpanjanganPks2),
    ].filter((d) => d !== null);

    if (dates.length === 0) return null;

    return new Date(Math.max(...dates.map((d) => d!.getTime())));
  };

  const groupedHistory = useMemo(() => {
    const grouped: Record<string, any[]> = {};

    data.forEach((item) => {
      const key = item.namaBumdes?.trim().toLowerCase();

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    return grouped;
  }, [data]);

  const sortedData = [...latestBumdesData].sort((a, b) => {
    const aDays = a.daysLeft ?? Number.POSITIVE_INFINITY;
    const bDays = b.daysLeft ?? Number.POSITIVE_INFINITY;
    return aDays - bDays;
  });

  const filteredSearchData = sortedData.filter((b) => {
    const keyword = search.toLowerCase();

    return Object.values(b)
      .filter(Boolean)
      .some((val) =>
        val.toString().toLowerCase().includes(keyword)
      );
  });

  const filteredDocumentData = latestBumdesData.filter((b) => {
    const keyword = search.toLowerCase().trim();

    return [
      b.namaBumdes,
      b.picBumdes,
      b.picIsp,
    ]
      .filter((val) => val !== null && val !== undefined)
      .some((val) =>
        val.toString().toLowerCase().includes(keyword)
      );
  });

  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [openHistoryKey, setOpenHistoryKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"earlywarning" | "documents">("earlywarning");
  const isValid = (val: any) => {
  return typeof val === "string" && val.startsWith("http");
};
  const getDocStatus = (b: any) => {
      const bumdesDocs = [
        { key: "suratPeminatanBumdes" },
        { key: "perdesPendirian" },
        { key: "strukturBumdes" },
        { key: "npwpBumdes" },
        { key: "ktpDirekturBumdes" },
        { key: "nibBumdes" },
        { key: "apbdes" },
        { key: "logoBumdes" },
      ];

      const ispDocs = [
        { key: "suratPeminatanIsp" },
        { key: "aktaIsp" },
        { key: "skKemenkumham" },
        { key: "nibIsp" },
        { key: "izinTelekom" },
        { key: "jartaplok" },
        { key: "ulo" },
        { key: "npwpIsp" },
        { key: "logoIsp" },
        { key: "ktpDirekturIsp" },
        { key: "companyProfile" },
        { key: "dokumenRKUB" },
        { key: "pergantianIsp"},
      ];

      const pksDocs = [
        { key: "dokumenPks" },

        { key: "suratPerpanjanganPks1" },
        { key: "dokumenPerpanjanganPks1" },

        { key: "suratPerpanjanganPks2" },
        { key: "dokumenPerpanjanganPks2" },
      ];

      const checkSection = (docs: any[]) =>
        docs.every((d) => isValid(b[d.key]));

      const bumdesComplete = checkSection(bumdesDocs);
      const ispComplete = checkSection(ispDocs);
      const pksComplete = checkSection(pksDocs);

      const totalSections = 3;
      let doneSections = 0;

      if (bumdesComplete) doneSections++;
      if (ispComplete) doneSections++;
      if (pksComplete) doneSections++;

      const percent = (doneSections / totalSections) * 100;

      if (percent === 100) return "Lengkap";
      if (percent >= 70) return "Hampir Lengkap";
      if (percent >= 30) return "Sebagian";
      return "Belum Lengkap";
    };
  
  const getDocProgress = (b: any) => {
  const isValid = (val: any) =>
    typeof val === "string" && val.startsWith("http");

  const allDocs = [
    "suratPeminatanBumdes",
    "perdesPendirian",
    "strukturBumdes",
    "npwpBumdes",
    "ktpDirekturBumdes",
    "nibBumdes",
    "apbdes",
    "logoBumdes",

    "suratPeminatanIsp",
    "aktaIsp",
    "skKemenkumham",
    "nibIsp",
    "izinTelekom",
    "jartaplok",
    "ulo",
    "npwpIsp",
    "logoIsp",
    "ktpDirekturIsp",
    "companyProfile",
    "dokumenRKUB",
    "pergantianIsp",

    "dokumenPks",
    "suratPerpanjanganPks1",
    "dokumenPerpanjanganPks1",
    "suratPerpanjanganPks2",
    "dokumenPerpanjanganPks2",
  ];

  const filled = allDocs.filter((key) => isValid(b[key])).length;

  return Math.round((filled / allDocs.length) * 100);
};

  const stats = useMemo(() => {
    const total = latestBumdesData.length;
    const serving = latestBumdesData.filter((b) => b.status === "Serving").length;
    const assessment = latestBumdesData.filter((b) => b.status === "Assessment").length;
    const tidakLanjutPKS = latestBumdesData.filter(
      (b) => b.status === "Tidak Lanjut PKS"
    ).length;
    const tidakDiketahui = latestBumdesData.filter(
      (b) =>
        !b.status || // null, undefined, ""
        b.status.trim() === "" ||
        b.status === "Tidak Diketahui"
    ).length;
    const totalPelanggan = latestBumdesData.reduce((s, b) => s + b.totalPelanggan, 0);
    const validBandwidthData = latestBumdesData.filter(
      (b) => typeof b.kapasitasBandwidth === "number" && !isNaN(b.kapasitasBandwidth) && b.kapasitasBandwidth > 0
    );
    const totalBandwidth = validBandwidthData.reduce(
      (s, b) => s + b.kapasitasBandwidth,
      0
    );
    const avgBandwidth =
      validBandwidthData.length > 0
        ? totalBandwidth / validBandwidthData.length
        : 0;
    
    const pksLe30 = latestBumdesData.filter((b) => {
      const d = Number(b.daysLeft);
        return b.daysLeft !== null && b.daysLeft >= 0 && b.daysLeft <= 30;
    }).length;

    const perluPerhatian = latestBumdesData.filter((b) => {
      const d = Number(b.daysLeft);
      return b.warningLevel === "Warning" || b.warningLevel === "Expired";
    }).length;

    const aktifCount = latestBumdesData.filter((b) => b.warningLevel === "Aktif").length;
    const warningOnly = latestBumdesData.filter((b) => b.warningLevel === "Warning").length;
    const expiredCount = latestBumdesData.filter((b) => b.warningLevel === "Expired").length;

    const warningPctData = [
      {
        name: "Aktif",
        value: aktifCount,
        pct: total > 0 ? ((aktifCount / total) * 100).toFixed(1) : "0",
        color: ACCENT,
      },
      {
        name: "Warning",
        value: warningOnly,
        pct: total > 0 ? ((warningOnly / total) * 100).toFixed(1) : "0",
        color: WARNING,
      },
      {
        name: "Expired",
        value: expiredCount,
        pct: total > 0 ? ((expiredCount / total) * 100).toFixed(1) : "0",
        color: DESTRUCTIVE,
      },
    ];

    // Status layanan
    const statusData = [
      { name: "Serving", value: serving },
      { name: "Assessment", value: assessment },
      { name: "Tidak Lanjut PKS", value: tidakLanjutPKS },
      { name: "Tidak Diketahui", value: tidakDiketahui },
    ];
    const STATUS_COLORS = [ACCENT, WARNING, DESTRUCTIVE, NEUTRAL];

    // By kabupaten
    const kabMap: Record<string, number> = {};
    latestBumdesData.forEach((b) => { if (b.kabupaten) kabMap[b.kabupaten] = (kabMap[b.kabupaten] || 0) + 1; });
    const kabData = Object.entries(kabMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    // By ISP
    const ispMap: Record<string, number> = {};
    latestBumdesData.forEach((b) => { if (b.isp) ispMap[b.isp.trim()] = (ispMap[b.isp.trim()] || 0) + 1; });
    const ispData = Object.entries(ispMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    // Pelanggan
    const semuaPelanggan = [...latestBumdesData]
      .sort((a, b) => b.totalPelanggan - a.totalPelanggan);

    return {
      total, serving, assessment, totalPelanggan, avgBandwidth, pksLe30,
      perluPerhatian, warningPctData, statusData, STATUS_COLORS,
      kabData, ispData, semuaPelanggan
    };
  }, [data]);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const highlightId = params.get("highlight");

  // ✅ TARUH DI SINI
  useEffect(() => {
    if (!highlightId) return;

    setTimeout(() => {
      const el = document.getElementById(`row-${highlightId}`);
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 300);
  }, [highlightId]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Program Konektivitas Mandiri - Wilayah Kerja IV Surabaya</h1>
          <p className="text-sm text-muted-foreground">Data Monitoring Program Konektivitas Mandiri BAKTI KOMDIGI</p>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-2">
          {[
            { key: "earlywarning" as const, label: "Early Warning" },
            { key: "documents" as const, label: "Kelengkapan Dokumen" },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.key)}
              className="text-xs"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* FILTER DROPDOWN */}
        <div className="mb-4">
          <FilterBarBumdes />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 items-stretch">

          <div onClick={() => handleCardClick("warning")} className="cursor-pointer h-full">
            <StatCard
              className="h-full"
              title="PKS ≤ 30 Hari"
              value={stats.pksLe30}
              icon={AlertTriangle}
              variant="warning"
              subtitle={`dari ${stats.total} total`}
            />
          </div>

          <div onClick={scrollToTable} className="cursor-pointer h-full">
            <StatCard
              className="h-full"
              title="Mitra Konektivitas Mandiri"
              value={stats.total}
              icon={Building2}
              variant="primary"
            />
          </div>

          <div onClick={scrollToTable} className="cursor-pointer h-full">
            <StatCard
              className="h-full"
              title="Total Pelanggan"
              value={stats.totalPelanggan.toLocaleString("id-ID")}
              icon={Users}
              variant="accent"
            />
          </div>

          <div onClick={scrollToTable} className="cursor-pointer h-full">
            <StatCard
              className="h-full"
              title="Rata-rata Bandwidth"
              value={`${stats.avgBandwidth.toFixed(2)} Mbps`}
              icon={Clock}
              variant="secondary"
            />
          </div>

          <div onClick={() => handleCardClick("perluPerhatian")} className="cursor-pointer h-full">
            <StatCard
              className="h-full"
              title="Perlu Perhatian"
              value={stats.perluPerhatian}
              icon={AlertTriangle}
              variant="warning"
            />
          </div>

        </div>

        {activeTab === "earlywarning" && (
          <>
            {/* Status Layanan + Warning Pie */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold">Persentase Status Layanan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="50%" height={200}>
                      <PieChart>
                        <Pie data={stats.statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} strokeWidth={2}
                          onClick={(data: any) => {
                            const name = data?.name || data?.payload?.name;
                            if (!name) return;

                            setFilters({
                              status: filters.status === name ? "Semua" : name,
                            });
                          }}>
                          {stats.statusData.map((_, i) => <Cell key={i} fill={stats.STATUS_COLORS[i]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3 flex-1">
                      {stats.statusData.map((s, i) => (
                        <div key={s.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: stats.STATUS_COLORS[i] }} />
                            <span className="text-muted-foreground">{s.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{s.value}</span>
                            <Badge variant="outline" className="text-[10px]">{stats.total > 0 ? ((s.value / stats.total) * 100).toFixed(0) : 0}%</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold">Persentase Status Warning</CardTitle>
                  <CardDescription>Distribusi masa kontrak Mitra Konektivitas Mandiri</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.warningPctData.map((w) => (
                      <div key={w.name} className="cursor-pointer"
                        onClick={() => {
                          const name = w.name;

                          setFilters({
                            statusWarning: filters.statusWarning === name ? null : name,
                          });
                        }}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: w.color }} />
                            <span className="font-medium">{w.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{w.value}</span>
                            <Badge variant="outline" className="text-[10px]">{w.pct}%</Badge>
                          </div>
                        </div>
                        <Progress value={Number(w.pct)} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ISP + Kabupaten */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold">Mitra Konektivitas Mandiri per ISP</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] overflow-y-auto">
                    <ResponsiveContainer
                      width="100%"
                      height={Math.max(stats.ispData.length * 25, 300)}
                    >
                    <BarChart data={stats.ispData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" width={120} interval={0} 
                        tick={({ x, y, payload }) => (
                          <text
                            x={x}
                            y={y}
                            textAnchor="end"
                            fontSize={12}
                            alignmentBaseline="middle"
                          >
                            {payload.value}
                          </text>
                        )}
                      />
                      <Tooltip />
                      <Bar dataKey="value" fill={SECONDARY} radius={[0, 6, 6, 0]}
                        onClick={(data: any) => {
                          const name = data?.name || data?.payload?.name;
                          if (!name) return;

                          setFilters({
                            isp: filters.isp === name ? "Semua" : name,
                          });
                        }}/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold">Mitra Konektivitas Mandiri per Kabupaten</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <div style={{ minWidth: Math.max(stats.kabData.length * 50, 300) }}>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.kabData} margin={{left: -20, right: 20, top: 10}}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-15} textAnchor="end" height={35} interval={0} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="value" fill={PRIMARY} radius={[6, 6, 0, 0]}
                            onClick={(data: any) => {
                              const name = data?.name || data?.payload?.name;
                              if (!name) return;

                              setFilters({
                                kabupaten: filters.kabupaten === name ? "Semua" : name,
                              });
                            }}/>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Pelanggan */}
            {stats.semuaPelanggan.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold">Mitra Konektivitas Mandiri Berdasarkan Total Pelanggan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-y-auto max-h-[320px] space-y-3 pr-2">
                    {stats.semuaPelanggan.map((b, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">{i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{b.namaBumdes}</p>
                          <p className="text-xs text-muted-foreground">{b.kabupaten} — {b.isp}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">{b.totalPelanggan.toLocaleString("id-ID")}</p>
                          <p className="text-[10px] text-muted-foreground">pelanggan</p>
                        </div>
                        <Progress value={(b.totalPelanggan / stats.semuaPelanggan[0].totalPelanggan) * 100} className="w-24 h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detail Table (always visible at bottom) */}
          <div ref={tableRef}> 
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-4">
                  
                  {/* KIRI: Judul */}
                  <div>
                    <CardTitle className="text-base font-bold">
                      Detail Semua Mitra Konektivitas Mandiri
                    </CardTitle>
                    <CardDescription>
                      Data lengkap {filteredSearchData.length} Mitra Konektivitas Mandiri
                    </CardDescription>
                  </div>

                  {/* KANAN: Search */}
                  <input
                    type="text"
                    placeholder="Cari..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64 border rounded-md px-3 py-2 text-sm"
                  />
                  
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[11px]">No</TableHead>
                        <TableHead className="text-[11px]">Status Warning</TableHead>
                        <TableHead className="text-[11px]">Masa Kontrak</TableHead>
                        <TableHead className="text-[11px]">Tgl Perpanjangan</TableHead>
                        <TableHead className="text-[11px]">Nama Mitra Konektivitas Mandiri</TableHead>
                        <TableHead className="text-[11px]">Kabupaten</TableHead>
                        <TableHead className="text-[11px]">Provinsi</TableHead>
                        <TableHead className="text-[11px]">ISP</TableHead>
                        <TableHead className="text-[11px]">Kapasitas Bandwidth</TableHead>
                        <TableHead className="text-[11px]">Pelanggan</TableHead>
                        <TableHead className="text-[11px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSearchData.map((b, i) => {
                        const keyName = b.namaBumdes?.trim().toLowerCase();
                        const history = groupedHistory[keyName] || [];

                        const isExpanded = expandedRow === keyName;

                        return (
                          <>
                            <TableRow
                              id={`row-${b.no}`}
                              key={`${b.no}-${b.namaBumdes}-${i}`}
                              onClick={() =>
                                setExpandedRow(isExpanded ? null : keyName)
                              }
                              className={cn("cursor-pointer",
                                b.warningLevel === "Expired" && "bg-destructive/5",
                                b.warningLevel === "Warning" && "bg-yellow-50",
                                b.warningLevel === "Aktif" && "bg-green-50"
                              )}
                            >
                              {/* No */}
                              <TableCell className="text-xs">{i + 1}</TableCell>

                              {/* Warning */}
                              <TableCell>
                                <Badge
                                  variant={WARNING_BADGE[b.warningLevel] || "outline"}
                                  className={cn("text-[10px]",
                                    b.warningLevel === "Warning" && "bg-yellow-300 text-yellow-800 border-yellow-300",
                                    b.warningLevel === "Aktif" && "bg-green-300 text-green-800 border-green-300",
                                    b.warningLevel === "Expired" && "bg-red-300 text-red-800 border-red-300"
                                  )}
                                >
                                  {b.warningLevel}
                                </Badge>
                              </TableCell>

                              {/* Masa Kontrak */}
                              <TableCell className="text-xs">
                                {b.daysLeft !== null ? (
                                  <span
                                    className={cn(
                                      b.daysLeft < 0
                                        ? "text-destructive"
                                        : b.daysLeft <= 30
                                        ? "text-orange-500"
                                        : "text-green-600"
                                    )}
                                  >
                                    {b.daysLeft < 0
                                      ? `${Math.abs(b.daysLeft)} hari lalu`
                                      : `${b.daysLeft} hari lagi`}
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </TableCell>

                              {/* Tgl Perpanjangan */}
                              <TableCell className="text-xs">
                                {b.effectiveExpiryDate
                                  ? new Date(b.effectiveExpiryDate).toLocaleDateString("id-ID")
                                  : "-"}
                              </TableCell>

                              {/* Nama */}
                              <TableCell className="text-xs font-medium max-w-[200px]">
                                {b.namaBumdes}
                              </TableCell>

                              {/* Kabupaten */}
                              <TableCell className="text-xs">{b.kabupaten}</TableCell>

                              {/* Provinsi */}
                              <TableCell className="text-xs">{b.provinsi}</TableCell>

                              {/* ISP */}
                              <TableCell className="text-xs">
                                <div className="flex flex-col">
                                  <span>{b.isp}</span>

                                  {history.length > 1 && (
                                    <span className="text-[10px] text-blue-500">
                                      ▶ klik lihat histori
                                    </span>
                                  )}
                                </div>
                              </TableCell>

                              {/* Bandwidth */}
                              <TableCell className="text-xs">{b.kapasitasBandwidth} Mbps</TableCell>

                              {/* Pelanggan */}
                              <TableCell className="text-xs font-semibold">
                                {(b.totalPelanggan ?? 0).toLocaleString("id-ID")}
                              </TableCell>

                              {/* Status */}
                              <TableCell>
                                <Badge
                                  variant={b.status === "Serving" ? "default" : "secondary"}
                                  className="text-[10px]"
                                >
                                  {b.status || "-"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                            {/* 🔽 ROW HISTORI (MUNCUL SAAT DIKLIK) */}
                            {isExpanded && history.length > 1 && (
                              <TableRow className="bg-gray-50">
                                <TableCell colSpan={11}>
                                  <div className="p-3 space-y-2">
                                    <div className="text-sm font-semibold">
                                      Histori ISP
                                    </div>
                                    {history.map((h, idx) => {
                                      const isAktif = h.isp === b.isp;

                                      return (
                                        <div
                                          key={idx}
                                          className="text-xs flex justify-between items-center border-b pb-1"
                                        >
                                          <div className="flex items-center gap-2">
                                            <span>{h.isp}</span>

                                            <span
                                              className={cn(
                                                "text-[10px] px-2 py-[1px] rounded",
                                                isAktif
                                                  ? "bg-green-200 text-green-800"
                                                  : "bg-gray-200 text-gray-700"
                                              )}
                                            >
                                              {isAktif ? "Aktif" : "Lama"}
                                            </span>
                                          </div>

                                          <span className="text-muted-foreground">
                                            {(() => {
                                              const d = getLatestPksDate(h);
                                              return d
                                                ? d.toLocaleDateString("id-ID")
                                                : "-";
                                            })()}
                                          </span>
                                        </div>
                                      );
                                    })}

                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
          </>
        )}

        {activeTab === "documents" && (
          <>
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-4">

                  {/* KIRI: Icon + Judul */}
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base font-bold">
                      Kelengkapan Dokumen Mitra Konektivitas Mandiri
                    </CardTitle>
                  </div>

                  {/* KANAN: Search */}
                  <input
                    type="text"
                    placeholder="Cari dokumen..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64 border rounded-md px-3 py-2 text-sm"
                  />

                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead></TableHead>
                        <TableHead className="text-[11px] font-bold">No</TableHead>
                        <TableHead className="text-[11px] font-bold">Nama Mitra Konektivitas Mandiri</TableHead>
                        <TableHead className="text-[11px] font-bold">PIC BUMDes</TableHead>
                        <TableHead className="text-[11px] font-bold">PIC ISP</TableHead>
                        <TableHead className="text-[11px] font-bold">Status Berkas</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {filteredDocumentData.map((latest, i) => {
                        const key = latest.namaBumdes?.trim().toLowerCase();
                        const history = groupedHistory[key] || [];
                        const pergantianLink = getPergantianISP(history);

                        const isOpen = expandedRow === i;
                        const progress = getDocProgress(latest);

                        return (
                          <>
                            {/* ROW UTAMA */}
                            <TableRow
                              key={`${latest.no}-${latest.namaBumdes}-${i}`}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() =>
                                setExpandedRow(isOpen ? null : i)
                              }
                            >
                              <TableCell className="text-xs">
                                {isOpen ? "▼" : "▶"}
                              </TableCell>

                              <TableCell className="text-xs">{i + 1}</TableCell>

                              <TableCell className="text-xs font-medium">
                                {latest.namaBumdes}
                              </TableCell>

                              <TableCell className="text-xs">
                                {latest.picBumdes || "-"}
                              </TableCell>

                              <TableCell className="text-xs">
                                {latest.picIsp || "-"}
                              </TableCell>

                              <TableCell>
                                <div className="flex flex-col gap-1">

                                  <div className="flex items-center gap-2">
                                    <Badge className="text-[10px]" variant="outline">
                                      {getDocStatus(latest)}
                                    </Badge>

                                    <span className="text-[10px] text-muted-foreground">
                                      {progress}%
                                    </span>
                                  </div>

                                  <Progress value={progress} className="h-1 w-24" />

                                </div>
                              </TableCell>
                            </TableRow>

                            {/* EXPAND ROW */}
                            {isOpen && (
                              <TableRow>
                                <TableCell colSpan={6} className="bg-muted/30">
                                  <div className="p-4 space-y-4">

                                    <div className="text-sm font-semibold">
                                      Kelengkapan Dokumen — {latest.namaBumdes} (ISP Aktif)
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                      {/* ================= BUMDES ================= */}
                                      <div className="border rounded-lg p-3 bg-white">
                                        <p className="text-xs font-semibold mb-2 flex items-center gap-2">
                                          📁 Berkas BUMDes
                                        </p>

                                        <div className="space-y-2 text-xs">

                                          {[
                                            { label: "Surat Peminatan BUMDes", link: latest.suratPeminatanBumdes },
                                            { label: "Perdes Pendirian BUMDes", link: latest.perdesPendirian },
                                            { label: "Struktur BUMDes", link: latest.strukturBumdes },
                                            { label: "NPWP BUMDes", link: latest.npwpBumdes },
                                            { label: "KTP Direktur BUMDes", link: latest.ktpDirekturBumdes },
                                            { label: "NIB BUMDes", link: latest.nibBumdes },
                                            { label: "PerDes APBDes", link: latest.apbdes },
                                            { label: "Logo BUMDes", link: latest.logoBumdes },
                                          ].map((doc, idx) => (
                                            <div key={idx} className="flex justify-between items-center border rounded px-2 py-1">
                                              <span>{doc.label}</span>

                                              <div className="flex items-center gap-2">
                                                {isValidLink(doc.link) ? (
                                                  <>
                                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                                    <a href={doc.link} target="_blank">
                                                      <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                  </>
                                                ) : (
                                                  <>
                                                    <XCircle className="h-3 w-3 text-red-500" />
                                                    <span className="text-[10px] text-red-500">Belum</span>
                                                  </>
                                                )}
                                              </div>
                                            </div>
                                          ))}

                                        </div>
                                      </div>

                                      {/* ================= ISP ================= */}
                                      <div className="border rounded-lg p-3 bg-white">
                                        <p className="text-xs font-semibold mb-2 flex items-center gap-2">
                                          🌐 Berkas ISP
                                        </p>

                                        <div className="space-y-2 text-xs">

                                          {[
                                            { label: "Surat Peminatan ISP", link: latest.suratPeminatanIsp },
                                            { label: "Akta Pendirian ISP", link: latest.aktaIsp },
                                            { label: "SK Kemenkumham ISP", link: latest.skKemenkumham },
                                            { label: "NIB ISP", link: latest.nibIsp },
                                            { label: "Izin Penyelenggara Telekomunikasi ISP", link: latest.izinTelekom },
                                            { label: "Jartaplok ISP", link: latest.jartaplok },
                                            { label: "ULO ISP", link: latest.ulo },
                                            { label: "NPWP ISP", link: latest.npwpIsp },
                                            { label: "Logo ISP", link: latest.logoIsp },
                                            { label: "KTP Direktur ISP", link: latest.ktpDirekturIsp },
                                            { label: "Company Profile", link: latest.companyProfile },
                                            { label: "Dokumen RFI/RKUB", link: latest.dokumenRKUB },
                                            ...(isValidLink(pergantianLink)
                                              ? [{ label: "Dokumen Pergantian ISP", link: pergantianLink }]
                                              : []),
                                          ].map((doc, idx) => (
                                            <div key={idx} className="flex justify-between items-center border rounded px-2 py-1">
                                              <span>{doc.label}</span>

                                              <div className="flex items-center gap-2">
                                                {isValidLink(doc.link) ? (
                                                  <>
                                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                                    <a href={doc.link} target="_blank">
                                                      <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                  </>
                                                ) : (
                                                  <>
                                                    <XCircle className="h-3 w-3 text-red-500" />
                                                    <span className="text-[10px] text-red-500">Belum</span>
                                                  </>
                                                )}
                                              </div>
                                            </div>
                                          ))}

                                        </div>
                                      </div>

                                      {/* ================= PKS ================= */}
                                      <div className="border rounded-lg p-3 bg-white">
                                        <p className="text-xs font-semibold mb-2 flex items-center gap-2">
                                          📑 Berkas PKS
                                        </p>

                                        <div className="space-y-2 text-xs">

                                          {[
                                            { label: "Dokumen PKS", link: latest.dokumenPks },

                                            { label: "Surat Permohonan Perpanjangan PKS I", link: latest.suratPerpanjanganPks1 },
                                            { label: "Dokumen Perpanjangan PKS I", link: latest.dokumenPerpanjanganPks1 },

                                            { label: "Surat Permohonan Perpanjangan PKS II", link: latest.suratPerpanjanganPks2 },
                                            { label: "Dokumen Perpanjangan PKS II", link: latest.dokumenPerpanjanganPks2 },
                                          ].map((doc, idx) => (
                                            <div key={idx} className="flex justify-between items-center border rounded px-2 py-1">
                                              <span>{doc.label}</span>

                                              <div className="flex items-center gap-2">
                                                {isValidLink(doc.link) ? (
                                                  <>
                                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                                    <a href={doc.link} target="_blank">
                                                      <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                  </>
                                                ) : (
                                                  <>
                                                    <XCircle className="h-3 w-3 text-red-500" />
                                                    <span className="text-[10px] text-red-500">Belum</span>
                                                  </>
                                                )}
                                              </div>
                                            </div>
                                          ))}

                                        </div>
                                      </div>

                                    </div>

                                    {/* ================= HISTORI DATA (BUMDES + ISP + PKS) ================= */}
                                    <div className="mt-4">
                                      <p className="text-sm font-semibold mb-3">Histori Data</p>

                                      <div className="space-y-6">

                                        {groupedHistory[latest.namaBumdes?.trim().toLowerCase()]
                                          ?.filter((h) => h.isp !== latest.isp)
                                          .map((h, idx) => {
                                            const historyKey = `${latest.namaBumdes}-${idx}`;
                                            const isOpenHistory = openHistoryKey === historyKey;

                                            return (
                                              <div key={idx} className="border rounded-lg bg-muted/20">

                                                {/* HEADER (KLIKABLE) */}
                                                <div
                                                  onClick={() =>
                                                    setOpenHistoryKey(isOpenHistory ? null : historyKey)
                                                  }
                                                  className="flex justify-between items-center p-3 cursor-pointer hover:bg-muted"
                                                >
                                                  <p className="text-xs font-semibold">
                                                    ISP Lama — {h.isp}
                                                  </p>

                                                  <span className="text-[10px] px-2 py-[1px] rounded bg-gray-200 text-gray-700">
                                                    {isOpenHistory ? "Tutup" : "Lihat"}
                                                  </span>
                                                </div>

                                                {/* ISI (MUNCUL SAAT DIKLIK) */}
                                                {isOpenHistory && (
                                                  <div className="p-4 border-t">

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                                      {/* ===== BUMDES ===== */}
                                                      <div className="border rounded-lg p-3 bg-white">
                                                        <p className="text-xs font-semibold mb-2">📁 Berkas BUMDes</p>
                                                        <div className="space-y-2 text-xs">
                                                          {[
                                                            { label: "Surat Peminatan BUMDes", link: h.suratPeminatanBumdes },
                                                            { label: "Perdes Pendirian BUMDes", link: h.perdesPendirian },
                                                            { label: "Struktur BUMDes", link: h.strukturBumdes },
                                                            { label: "NPWP BUMDes", link: h.npwpBumdes },
                                                            { label: "KTP Direktur BUMDes", link: h.ktpDirekturBumdes },
                                                            { label: "NIB BUMDes", link: h.nibBumdes },
                                                            { label: "PerDes APBDes", link: h.apbdes },
                                                            { label: "Logo BUMDes", link: h.logoBumdes },
                                                          ].map((doc, i) => (
                                                            <div key={i} className="flex justify-between items-center border rounded px-2 py-1">
                                                              <span>{doc.label}</span>
                                                              <div className="flex items-center gap-2">
                                                                {isValidLink(doc.link) ? (
                                                                  <>
                                                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                                                    <a href={doc.link} target="_blank">
                                                                      <ExternalLink className="h-3 w-3" />
                                                                    </a>
                                                                  </>
                                                                ) : (
                                                                  <>
                                                                    <XCircle className="h-3 w-3 text-red-500" />
                                                                    <span className="text-[10px] text-red-500">Belum</span>
                                                                  </>
                                                                )}
                                                              </div>
                                                            </div>
                                                          ))}
                                                        </div>
                                                      </div>

                                                      {/* ===== ISP ===== */}
                                                      <div className="border rounded-lg p-3 bg-white">
                                                        <p className="text-xs font-semibold mb-2">🌐 Berkas ISP</p>
                                                        <div className="space-y-2 text-xs">
                                                          {[
                                                            { label: "Surat Peminatan ISP", link: h.suratPeminatanIsp },
                                                            { label: "Akta Pendirian ISP", link: h.aktaIsp },
                                                            { label: "SK Kemenkumham ISP", link: h.skKemenkumham },
                                                            { label: "NIB ISP", link: h.nibIsp },
                                                            { label: "Izin Penyelenggara Telekomunikasi ISP", link: h.izinTelekom },
                                                            { label: "Jartaplok ISP", link: h.jartaplok },
                                                            { label: "ULO ISP", link: h.ulo },
                                                            { label: "NPWP ISP", link: h.npwpIsp },
                                                            { label: "Logo ISP", link: h.logoIsp },
                                                            { label: "KTP Direktur ISP", link: h.ktpDirekturIsp },
                                                            { label: "Company Profile", link: h.companyProfile },
                                                            { label: "Dokumen RFI/RKUB", link: h.dokumenRKUB },
                                                          ].map((doc, i) => (
                                                            <div key={i} className="flex justify-between items-center border rounded px-2 py-1">
                                                              <span>{doc.label}</span>
                                                              <div className="flex items-center gap-2">
                                                                {isValidLink(doc.link) ? (
                                                                  <>
                                                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                                                    <a href={doc.link} target="_blank">
                                                                      <ExternalLink className="h-3 w-3" />
                                                                    </a>
                                                                  </>
                                                                ) : (
                                                                  <>
                                                                    <XCircle className="h-3 w-3 text-red-500" />
                                                                    <span className="text-[10px] text-red-500">Belum</span>
                                                                  </>
                                                                )}
                                                              </div>
                                                            </div>
                                                          ))}
                                                        </div>
                                                      </div>

                                                      {/* ===== PKS ===== */}
                                                      <div className="border rounded-lg p-3 bg-white">
                                                        <p className="text-xs font-semibold mb-2">📑 Berkas PKS</p>
                                                        <div className="space-y-2 text-xs">
                                                          {[
                                                            { label: "Dokumen PKS", link: h.dokumenPks },
                                                            { label: "Surat Permohonan Perpanjangan PKS I", link: h.suratPerpanjanganPks1 },
                                                            { label: "Dokumen Perpanjangan PKS I", link: h.dokumenPerpanjanganPks1 },
                                                            { label: "Surat Permohonan Perpanjangan PKS II", link: h.suratPerpanjanganPks2 },
                                                            { label: "Dokumen Perpanjangan PKS II", link: h.dokumenPerpanjanganPks2 },
                                                          ].map((doc, i) => (
                                                            <div key={i} className="flex justify-between items-center border rounded px-2 py-1">
                                                              <span>{doc.label}</span>
                                                              <div className="flex items-center gap-2">
                                                                {isValidLink(doc.link) ? (
                                                                  <>
                                                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                                                    <a href={doc.link} target="_blank">
                                                                      <ExternalLink className="h-3 w-3" />
                                                                    </a>
                                                                  </>
                                                                ) : (
                                                                  <>
                                                                    <XCircle className="h-3 w-3 text-red-500" />
                                                                    <span className="text-[10px] text-red-500">Belum</span>
                                                                  </>
                                                                )}
                                                              </div>
                                                            </div>
                                                          ))}
                                                        </div>
                                                      </div>

                                                    </div>

                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}

                                        </div>
                                      </div>

                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-[11px] text-muted-foreground mt-4 bg-muted/50 p-3 rounded-lg">
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}