import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { useAllAksesData, useAllBumdesData } from "@/hooks/useData";
import { Wifi, Building2, AlertTriangle, Users, TrendingUp, Globe, Signal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { useMemo } from "react";

const ACCENT = "hsl(175,96%,30%)";
const PRIMARY = "hsl(232,48%,32%)";
const SECONDARY = "hsl(199,76%,55%)";
const WARNING = "hsl(38,92%,50%)";
const DESTRUCTIVE = "hsl(0,84%,60%)";
const NEUTRAL = "hsl(0,0%,64%)";

export default function OverviewPage() {
  const allAkses = useAllAksesData();   // 
  const allBumdes = useAllBumdesData(); // 

  const getLatestDate = (b: any) => {
    const dates = [b.pks, b.perpanjanganPks1, b.perpanjanganPks2]
      .map((d) => new Date(d))
      .filter((d) => !isNaN(d.getTime()));

    if (dates.length === 0) return new Date(0);

    return new Date(Math.max(...dates.map((d) => d.getTime())));
  };

  const latestBumdesData = useMemo(() => {
    const grouped: Record<string, any[]> = {};

    allBumdes.forEach((item) => {
      const key = item.namaBumdes?.trim().toLowerCase();

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    return Object.values(grouped).map((group) =>
      [...group].sort(
        (a, b) => getLatestDate(b).getTime() - getLatestDate(a).getTime()
      )[0]
    );
  }, [allBumdes]);

  const stats = useMemo(() => {
    const totalAkses = allAkses.length;
    const totalBumdes = latestBumdesData.length;
    const servingBumdes = latestBumdesData.filter(
      (b) => b.status === "Serving"
    ).length;
    const warningBumdes = latestBumdesData.filter(
      (b) =>
        b.warningLevel === "Warning" ||
        b.warningLevel === "Expired"
    ).length;
    // const totalPelanggan = allBumdes.reduce((s, b) => s + b.totalPelanggan, 0);
    const totalPelanggan = latestBumdesData.reduce((s, b) => s + (b.totalPelanggan || 0), 0);
    const tinggi = allAkses.filter((r) => r.utilitas === "Tinggi").length;
    const sedang = allAkses.filter((r) => r.utilitas === "Sedang").length;
    const rendah = allAkses.filter((r) => r.utilitas === "Rendah").length;
    const utilData = [
      { name: "Tinggi", value: tinggi, color: ACCENT },
      { name: "Sedang", value: sedang, color: WARNING },
      { name: "Rendah", value: rendah, color: DESTRUCTIVE },
    ];

    // 🔵 Akses per Provinsi
    const provAksesMap: Record<string, number> = {};
    allAkses.forEach((r) => {
      provAksesMap[r.provinsi] = (provAksesMap[r.provinsi] || 0) + 1;
    });

    const provAksesData = Object.entries(provAksesMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // 🟢 BUMDes per Provinsi
    const provBumdesMap: Record<string, number> = {};
    latestBumdesData.forEach((r) => {
      provBumdesMap[r.provinsi] = (provBumdesMap[r.provinsi] || 0) + 1;
    });

    const provBumdesData = Object.entries(provBumdesMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const provCount: Record<string, { akses: number; bumdes: number }> = {};
    allAkses.forEach((r) => {
      if (!provCount[r.provinsi]) provCount[r.provinsi] = { akses: 0, bumdes: 0 };
      provCount[r.provinsi].akses++;
    });
    latestBumdesData.forEach((r) => {
      if (r.provinsi) {
        if (!provCount[r.provinsi]) provCount[r.provinsi] = { akses: 0, bumdes: 0 };
        provCount[r.provinsi].bumdes++;
      }
    });
    const provData = Object.entries(provCount)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.akses - a.akses);

    const warnMap: Record<string, number> = {};
    latestBumdesData.forEach((b) => { warnMap[b.warningLevel] = (warnMap[b.warningLevel] || 0) + 1; });
    const warnData = Object.entries(warnMap).map(([name, value]) => ({ name, value }));

    const techMap: Record<string, number> = {};

    allAkses.forEach((r) => {
      // ❗ skip kalau kosong
      if (!r.teknologi || r.teknologi.trim() === "") return;

      techMap[r.teknologi] = (techMap[r.teknologi] || 0) + 1;
    });

    const techData = Object.entries(techMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const ispMap: Record<string, number> = {};
    latestBumdesData.forEach((b) => {
      if (b.isp) ispMap[b.isp.trim()] = (ispMap[b.isp.trim()] || 0) + 1;
    });
    const ispData = Object.entries(ispMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { totalAkses, totalBumdes, servingBumdes, warningBumdes, totalPelanggan, utilData, provData, provAksesData, provBumdesData, warnData, techData, ispData, tinggi, sedang, rendah };
  }, [allAkses, latestBumdesData]); // ✅ dependency array yang benar

  // ... sisa JSX tidak berubah

  const WARN_COLORS: Record<string, string> = {
    Aktif: ACCENT, Warning: WARNING, Expired: DESTRUCTIVE, "Tidak Diketahui": NEUTRAL,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Overview Dashboard - Wilayah Kerja IV Surabaya</h1>
          <p className="text-sm text-muted-foreground">Ringkasan Data Program Penyediaan Akses Internet BAKTI KOMDIGI & Program Konektivitas Mandiri</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard title="Total Lokasi Internet Termonitoring" value={stats.totalAkses} icon={Wifi} variant="accent" />
          <StatCard title="Total Mitra Konektivitas Mandiri" value={stats.totalBumdes} icon={Building2} variant="primary" />
          <StatCard title="Mitra Konektivitas Mandiri (Serving)" value={stats.servingBumdes} icon={Globe} variant="secondary" />
          <StatCard title="Mitra Konektivitas Mandiri (Perlu Perhatian)" value={stats.warningBumdes} icon={AlertTriangle} variant="warning" />
          <StatCard title="Total Pelanggan" value={stats.totalPelanggan} icon={Users} variant="accent" subtitle="Dari semua Mitra Konektivitas Mandiri" />
        </div>

        {/* Row: Utilitas + Warning */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Distribusi Utilitas Layanan Internet</CardTitle>
              <CardDescription>Tingkat pemanfaatan lokasi layanan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ResponsiveContainer width="55%" height={220}>
                  <PieChart>
                    <Pie data={stats.utilData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50} strokeWidth={2}>
                      {stats.utilData.map((u) => <Cell key={u.name} fill={u.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => v.toLocaleString("id-ID")} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 flex-1">
                  {stats.utilData.map((u) => (
                    <div key={u.name}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: u.color }} />
                          <span className="text-muted-foreground">{u.name}</span>
                        </div>
                        <span className="font-bold">{u.value.toLocaleString("id-ID")}</span>
                      </div>
                      <Progress value={(u.value / stats.totalAkses) * 100} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Status Early Warning Mitra Konektivitas Mandiri</CardTitle>
              <CardDescription>Monitoring masa berlaku kontrak</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ResponsiveContainer width="55%" height={220}>
                  <PieChart>
                    <Pie data={stats.warnData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50} strokeWidth={2}>
                      {stats.warnData.map((w) => <Cell key={w.name} fill={WARN_COLORS[w.name] || NEUTRAL} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {stats.warnData.map((w) => (
                    <div key={w.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: WARN_COLORS[w.name] || NEUTRAL }} />
                        <span className="text-muted-foreground">{w.name}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold">{w.value}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* 🔵 Akses Internet */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">
                Distribusi Akses Internet per Provinsi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.provAksesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill={PRIMARY} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 🟢 BUMDes */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">
                Distribusi Mitra Konektivitas Mandiri per Provinsi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.provBumdesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill={ACCENT} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>

        {/* Tech + ISP Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Teknologi Akses Internet</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={420}>
                <BarChart data={stats.techData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" label={{ position: "right", fontSize: 12 }} tick={{ fontSize: 12 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill={SECONDARY} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">ISP BUMDes</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={420}>
                <BarChart data={stats.ispData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={120} />
                  <Tooltip />
                  <Bar dataKey="value" fill={ACCENT} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
