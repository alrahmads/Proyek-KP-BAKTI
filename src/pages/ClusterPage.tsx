import React, { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

import {
  Network,
  Target,
  BarChart3,
  Search,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

import pcaImage from "@/assets/pca-cluster.png";

/* ================= TYPES ================= */

type Row = {
  Cluster: number;
  "Nama Lokasi": string;
  Kabupaten: string;
  Provinsi: string;
  "Penyedia (Data di Lapangan)": string;
  Download_avg: number;
  Upload_avg: number;
  "Kapasitas Bandwidth (dalam kontrak)": number;
};

type ClusterSummary = {
  cluster: number;
  total: number;
  bandwidth: number;
  download: number;
  upload: number;
  kategori: string;
};

/* ================= COLORS ================= */

const CLUSTER_COLORS = {
  0: "#ef4444",
  1: "#16a34a",
  2: "#2563eb",
};

const CLUSTER_BG = {
  0: "bg-red-50",
  1: "bg-green-50",
  2: "bg-blue-50",
};

export default function ClusterPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Row>("Download_avg");
  const [zoom, setZoom] = useState(false);

  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadExcel();
  }, []);

  const loadExcel = async () => {
    try {
      const res = await fetch("/data/final_clustered.xlsx");
      const buffer = await res.arrayBuffer();

      const wb = XLSX.read(buffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws);

      const cleaned = (json as any[]).map((item) => ({
        Cluster: Number(item.Cluster),
        "Nama Lokasi": item["Nama Lokasi"] || "-",
        Kabupaten: item.Kabupaten || "-",
        Provinsi: item.Provinsi || "-",
        "Penyedia (Data di Lapangan)": item["Penyedia (Data di Lapangan)"] || "-",
        Download_avg: Number(item.Download_avg || 0),
        Upload_avg: Number(item.Upload_avg || 0),
        "Kapasitas Bandwidth (dalam kontrak)": Number(
          item["Kapasitas Bandwidth (dalam kontrak)"] || 0
        ),
      }));

      setRows(cleaned);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  /* ================= SUMMARY ================= */

  const clusterData = useMemo<ClusterSummary[]>(() => {
    const grouped: Record<number, Row[]> = {};

    rows.forEach((r) => {
      if (!grouped[r.Cluster]) grouped[r.Cluster] = [];
      grouped[r.Cluster].push(r);
    });

    return Object.keys(grouped)
      .map((key) => {
        const cluster = Number(key);
        const data = grouped[cluster];
        const total = data.length;

        const bandwidth =
          data.reduce(
            (a, b) =>
              a + Number(b["Kapasitas Bandwidth (dalam kontrak)"]),
            0
          ) / total;

        const download =
          data.reduce((a, b) => a + b.Download_avg, 0) / total;

        const upload =
          data.reduce((a, b) => a + b.Upload_avg, 0) / total;

        let kategori = "Standar";

        if (cluster === 0) kategori = "Perlu Upgrade";
        if (cluster === 1) kategori = "Premium Stabil";
        if (cluster === 2) kategori = "Download Tinggi";

        return {
          cluster,
          total,
          bandwidth,
          download,
          upload,
          kategori,
        };
      })
      .sort((a, b) => a.cluster - b.cluster);
  }, [rows]);

  const filteredRows = useMemo(() => {
    let data = rows.filter((row) => {
      const clusterMatch =
        selectedCluster === null ||
        row.Cluster === selectedCluster;

      const keyword = search.toLowerCase();

      const searchMatch =
        row["Nama Lokasi"].toLowerCase().includes(keyword) ||
        row.Kabupaten.toLowerCase().includes(keyword) ||
        row.Provinsi.toLowerCase().includes(keyword);

      return clusterMatch && searchMatch;
    });

    data.sort((a: any, b: any) => b[sortKey] - a[sortKey]);

    return data;
  }, [rows, selectedCluster, search, sortKey]);

  const bestCluster = [...clusterData].sort(
    (a, b) =>
      b.bandwidth + b.download + b.upload -
      (a.bandwidth + a.download + a.upload)
  )[0];

  const weakCluster = [...clusterData].sort(
    (a, b) =>
      a.bandwidth + a.download + a.upload -
      (b.bandwidth + b.download + b.upload)
  )[0];

  const activeCluster =
    selectedCluster !== null
      ? clusterData.find((c) => c.cluster === selectedCluster)
      : null;

  const handleCluster = (id: number | null) => {
    setSelectedCluster(id);

    setTimeout(() => {
      tableRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 200);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">Loading cluster data...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Analisis Cluster Tahun 2025
          </h1>
          <p className="text-sm text-muted-foreground">
            Hasil clustering berdasarkan performa jaringan di berbagai lokasi. Klik card cluster untuk melihat detailnya.
          </p>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Jumlah Cluster" value="3" icon={<Network />} />
          <StatCard title="Silhouette Score" value="0.849" icon={<Target />} />
          <StatCard title="Total Data" value={rows.length.toString()} icon={<BarChart3 />} />
        </div>

        {/* CLUSTER CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {clusterData.map((item) => (
            <Card
              key={item.cluster}
              onClick={() => handleCluster(item.cluster)}
              className={`
                cursor-pointer border-0 transition-all duration-300
                hover:-translate-y-1 hover:shadow-xl
                ${
                  selectedCluster === item.cluster
                    ? "ring-2 ring-offset-2 scale-[1.02]"
                    : "shadow-sm"
                }
                ${CLUSTER_BG[item.cluster as 0 | 1 | 2]}
              `}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-bold">
                    Cluster {item.cluster}
                  </CardTitle>

                  <Badge
                    className="text-white"
                    style={{
                      backgroundColor:
                        CLUSTER_COLORS[item.cluster as 0 | 1 | 2],
                    }}
                  >
                    {item.kategori}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-2 text-sm">
                <RowInfo label="Jumlah Data" value={item.total} />
                <RowInfo label="Bandwidth" value={item.bandwidth.toFixed(2)} />
                <RowInfo label="Download" value={item.download.toFixed(2)} />
                <RowInfo label="Upload" value={item.upload.toFixed(2)} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* VISUAL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* PIE */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Distribusi Cluster</CardTitle>
              <CardDescription>
                Klik warna chart untuk filter cluster
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex gap-4 items-center">

                <ResponsiveContainer width="45%" height={220}>
                  <PieChart>
                    <Pie
                      data={clusterData}
                      dataKey="total"
                      nameKey="cluster"
                      outerRadius={85}
                      innerRadius={48}
                      onClick={(e: any) => handleCluster(e.cluster)}
                    >
                      {clusterData.map((c) => (
                        <Cell
                          key={c.cluster}
                          fill={
                            CLUSTER_COLORS[c.cluster as 0 | 1 | 2]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string, props: any) => [
                        value,
                        `Cluster ${props.payload.cluster}`
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-3 flex-1">
                  {clusterData.map((c) => {
                    const pct = (
                      (c.total / rows.length) *
                      100
                    ).toFixed(1);

                    return (
                      <div key={c.cluster}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Cluster {c.cluster}</span>
                          <span className="font-bold">
                            {pct}%
                          </span>
                        </div>

                        <Progress value={Number(pct)} className="h-2" />
                      </div>
                    );
                  })}
                </div>

              </div>
            </CardContent>
          </Card>

          {/* BAR */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Rata-rata Performa Cluster</CardTitle>
              <CardDescription>
                Bandwidth, Download, Upload
              </CardDescription>
            </CardHeader>

            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={clusterData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />

                  <XAxis
                    dataKey="cluster"
                    tickFormatter={(v) => `Cluster ${v}`}
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis tick={{ fontSize: 11 }} />

                  <Tooltip
                    labelFormatter={(label) => `Cluster ${label}`}
                    formatter={(v: any) =>
                      `${Number(v).toFixed(2)} Mbps`
                    }
                  />

                  <Legend />

                  <Bar dataKey="bandwidth" fill="#ef4444" radius={[6,6,0,0]} />
                  <Bar dataKey="download" fill="#16a34a" radius={[6,6,0,0]} />
                  <Bar dataKey="upload" fill="#2563eb" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* PCA */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Visualisasi PCA</CardTitle>
          </CardHeader>

          <CardContent>
            <img
              src={pcaImage}
              onClick={() => setZoom(true)}
              className="cursor-pointer w-full max-h-[380px] object-contain rounded-xl border hover:scale-[1.01] transition-all"
            />
          </CardContent>
        </Card>

        {/* INSIGHT */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Insight Cluster</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <Insight
              bg="bg-green-50"
              icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
              title={`Cluster ${bestCluster?.cluster} Terbaik`}
              desc="Memiliki performa rata-rata paling tinggi."
            />

            <Insight
              bg="bg-red-50"
              icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
              title={`Cluster ${weakCluster?.cluster} Perlu Upgrade`}
              desc="Performa rata-rata paling rendah."
            />

            <Insight
              bg="bg-blue-50"
              icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
              title={
                activeCluster
                  ? `Cluster ${activeCluster.cluster} Sedang Dipilih`
                  : "Klik Cluster"
              }
              desc={
                activeCluster
                  ? `${activeCluster.total} lokasi dalam cluster ini`
                  : "Klik card / chart untuk filter data"
              }
            />

          </CardContent>
        </Card>

        {/* TABLE */}
        <div ref={tableRef}>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex justify-between gap-4 flex-wrap">

                <div>
                  <CardTitle>
                    {selectedCluster === null
                      ? "Detail Semua Cluster"
                      : `Detail Cluster ${selectedCluster}`}
                  </CardTitle>

                  <CardDescription>
                    {filteredRows.length} lokasi
                  </CardDescription>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                      placeholder="Cari lokasi..."
                      className="pl-9 w-56"
                    />
                  </div>

                  <button
                    onClick={() => handleCluster(null)}
                    className="px-4 py-2 border rounded-md text-sm"
                  >
                    Semua
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
            <div className="rounded-xl border overflow-hidden">
                
                {/* container scroll dalam card */}
                <div className="max-h-[520px] overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                
                <Table>
                    <TableHeader className="sticky top-0 z-20 bg-white shadow-sm">
                    <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>Cluster</TableHead>
                        <TableHead>Nama Lokasi</TableHead>
                        <TableHead>Kabupaten</TableHead>
                        <TableHead>Provinsi</TableHead>
                        <TableHead>Penyedia Layanan</TableHead>

                        <TableHead
                        className="cursor-pointer"
                        onClick={() =>
                            setSortKey(
                            "Kapasitas Bandwidth (dalam kontrak)"
                            )
                        }
                        >
                        Bandwidth
                        </TableHead>

                        <TableHead
                        className="cursor-pointer"
                        onClick={() =>
                            setSortKey("Download_avg")
                        }
                        >
                        Download
                        </TableHead>

                        <TableHead
                        className="cursor-pointer"
                        onClick={() =>
                            setSortKey("Upload_avg")
                        }
                        >
                        Upload
                        </TableHead>
                    </TableRow>
                    </TableHeader>

                    <TableBody>
                    {filteredRows.map((row, i) => (
                        <TableRow
                        key={i}
                        className={`
                            ${CLUSTER_BG[row.Cluster as 0 | 1 | 2]}
                            hover:brightness-95 transition
                        `}
                        >
                        <TableCell>{i + 1}</TableCell>

                        <TableCell>
                            <Badge
                            className="text-white"
                            style={{
                                backgroundColor:
                                CLUSTER_COLORS[
                                    row.Cluster as 0 | 1 | 2
                                ],
                            }}
                            >
                            {row.Cluster}
                            </Badge>
                        </TableCell>

                        <TableCell className="font-medium">
                            {row["Nama Lokasi"]}
                        </TableCell>

                        <TableCell>{row.Kabupaten}</TableCell>
                        <TableCell>{row.Provinsi}</TableCell>

                        <TableCell>
                            {row["Penyedia (Data di Lapangan)"]}
                        </TableCell>

                        <TableCell>
                            {
                            row[
                                "Kapasitas Bandwidth (dalam kontrak)"
                            ]
                            }
                        </TableCell>

                        <TableCell>
                            {row.Download_avg.toFixed(2)}
                        </TableCell>

                        <TableCell>
                            {row.Upload_avg.toFixed(2)}
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>

                </div>
            </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* MODAL PCA */}
      {zoom && (
        <div
          onClick={() => setZoom(false)}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-8"
        >
          <img
            src={pcaImage}
            className="max-w-6xl w-full rounded-xl bg-white p-3"
          />
        </div>
      )}
    </DashboardLayout>
  );
}

/* ================= COMPONENTS ================= */

function RowInfo({ label, value }: any) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function Insight({ bg, icon, title, desc }: any) {
  return (
    <div className={`p-4 rounded-xl flex gap-3 ${bg}`}>
      {icon}
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5 flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h2 className="text-2xl font-bold">{value}</h2>
        </div>
        <div className="text-primary">{icon}</div>
      </CardContent>
    </Card>
  );
}