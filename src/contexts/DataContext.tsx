import { createContext, useContext, useEffect, useState } from "react";

interface DataContextType {
  aksesData: any[];
  bumdesData: any[];
  loading: boolean;
}

const DataContext = createContext<DataContextType>({
  aksesData: [],
  bumdesData: [],
  loading: true,
});

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [aksesData, setAksesData] = useState<any[]>([]);
  const [bumdesData, setBumdesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [aksesRes, bumdesRes] = await Promise.all([
          fetch("https://opensheet.elk.sh/1ddok_wIwD-Rm3QekmYCdbRqembstJzU9PSSzJrtRRW8/data"),
          fetch("https://opensheet.elk.sh/1WTWCxr7BYb1WmkKXwUhzSJPelIQF2coaOYoJMSiLp3U/data"),
        ]);

        const aksesJson = await aksesRes.json();
        const bumdesJson = await bumdesRes.json();
        
        setAksesData(
          aksesJson.map((d: any) => ({
            siteId: d["Site ID"] || "",
            namaLokasi: d["Nama Lokasi"] || "",

            provinsi: d["Provinsi"] || "",
            kabupaten: d["Kabupaten"]?.replace("Kab. ", "") || "",
            kecamatan: d["Kecamatan"] || "",
            tahun: d["Tanggal visit"]
              ? d["Tanggal visit"].split("/")[2]
              : "",
            teknologi: d["Teknologi Akses Internet (Data di Lapangan)"] || "",

            utilitas: d["Utilitas"] || "",
            layananAiMandiri: d["Layanan AI Mandiri"] || "",
            layananAiGanda: d["Layanan AI Ganda"] || "",
            bantuanGandaUSO: d["Bantuan Ganda USO"] || "Tidak Ada",
            tools: d["Tools Spead Test"] || "-",
            linkLaporan: d["Link Laporan"] || "",
            aksesMandiri: d["Akses Mandiri"] || "",

            rekomendasi: d["Rekomendasi Wilker"] || "",
            skema: d["Skema/Status Layanan (Data Awal)"] || "",

            bandwidth: Number(d["Kapasitas (Data di Lapangan) Mbps"]) || 0,
            penyedia: d["Penyedia (Data di Lapangan)"] || "Tidak Diketahui",

            downloadMbps: parseFloat(d["Kecepatan Download (Kbps) AP 1"]) || 0,
            uploadMbps: parseFloat(d["Kecepatan Upload (Kbps) AP 1"]) || 0,

            downloadAP2: parseFloat(d["Kecepatan Download (Kbps) AP 2"]) || 0,
            uploadAP2: parseFloat(d["Kecepatan Upload (Kbps) AP 2"]) || 0,

            kualitasAkses: d["Kualitas Akses Internet"] || "",

            tindakLanjut: d["Tindak Lanjut"]?.trim() || "-",

            pelaksanaan: d["Pelaksanaan"] || "",

            lat: d["Koordinat Lintang (Data di Lapangan)"]
              ? Number(String(d["Koordinat Lintang (Data di Lapangan)"]).replace(",", ".").trim())
              : null,

            lng: d["Koordinat Bujur (Data di Lapangan)"]
              ? Number(String(d["Koordinat Bujur (Data di Lapangan)"]).replace(",", ".").trim())
              : null,
          }))
        );

       setBumdesData(
          bumdesJson.map((d: any) => {
            const parseIndoDate = (val: string) => {
              if (!val) return null;

              // format: hanya tahun
              if (/^\d{4}$/.test(val)) {
                return new Date(Number(val), 0, 1);
              }

            const bulanMap: any = {
              Januari: 0, Februari: 1, Maret: 2, April: 3,
              Mei: 4, Juni: 5, Juli: 6, Agustus: 7,
              September: 8, Oktober: 9, November: 10, Desember: 11,

              January: 0, February: 1, March: 2,
              May: 4, June: 5, July: 6, August: 7,
              October: 9, December: 11,

              Jan: 0, Feb: 1, Mar: 2, Apr: 3,
              Jun: 5, Jul: 6, Aug: 7,
              Sep: 8, Oct: 9, Nov: 10, Dec: 11,
            };

            const parts = val.trim().split(/\s+/);

              if (parts.length >= 3) {
                const day = parseInt(parts[0]);
                const month = bulanMap[parts[1]];
                let year = parseInt(parts[2]);

                if (year < 100) year += 2000;

                if (!isNaN(day) && month !== undefined && !isNaN(year)) {
                  return new Date(year, month, day);
                }
              }

              // 🔥 HANDLE FORMAT DD/MM/YYYY
              if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(val)) {
                const [day, month, year] = val.split("/").map(Number);
                return new Date(year, month - 1, day);
              }

              // 🔥 FALLBACK (INI YANG DITAMBAHKAN)
              const fallback = new Date(val.trim());
              return isNaN(fallback.getTime()) ? null : fallback;
            };

            // 🔥 LOOKER LOGIC (effective expiry date)
            const effectiveExpiryDate = (() => {
              const p2 = parseIndoDate(d["Perpanjangan PKS II"]);
              const p1 = parseIndoDate(d["Perpanjangan PKS I"]);
              const pks = parseIndoDate(d["PKS"]);

              if (p2) return p2;
              if (p1) return p1;
              if (pks) {
                return new Date(
                  pks.getFullYear() + 5, // asumsi PKS berlaku 5 tahun
                  pks.getMonth(),
                  pks.getDate()
                );
              }

              return null;
            })();

            // 🔥 DAYS LEFT dari effective date
            const daysLeft = effectiveExpiryDate
              ? Math.ceil(
                  (effectiveExpiryDate.getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : null;

            // 🔥 WARNING LEVEL
            const warningLevel =
              daysLeft === null
                ? "Tidak Diketahui"
                : daysLeft < 0
                ? "Expired"
                : daysLeft <= 30
                ? "Warning"
                : "Aktif";

            return {
              no: Number(d["No."]) || 0,
              status: d["Status"]?.trim() || "Tidak Diketahui",
              namaBumdes: d["BUMDes/Badan Usaha"] || "",

              alamat: d["Alamat"] || "",
              desa: d["Desa"] || "",
              kecamatan: d["Kecamatan"] || "",
              kabupaten: d["Kabupaten"] || "",
              provinsi: d["Provinsi"] || "",

              lng: d["Long"] ? Number(d["Long"]) : null,
              lat: d["Lat"] ? Number(d["Lat"]) : null,

              isp: d["ISP"]?.trim() || "Tidak Diketahui",

              // PKS / timeline
              tglAssesment: d["Tgl Assesment"] || null,
              tglRkub: d["Tgl RKUB"] || null,

              // bandwidth
              kapasitasBandwidth:
                Number(d["Kapasitas Bandwidth (Mbps)"]) || 0,
              updateKapasitasBandwidth:
                Number(d["Update Kapasitas Bandwidth\n(Mbps)"]) || 0,
              bandwidth: Number(d["Bandwidth (Mbps)"]) || 0,

              // pelanggan
              pelangganInstansi:
                Number(d["Pelanggan \nInstansi"]) || 0,
              pelangganSekolah:
                Number(d["Pelanggan\nSekolah"]) || 0,
              pelangganRumahan:
                Number(d["Pelanggan\nRumahan"]) || 0,
              pelangganKiosWifi:
                Number(d["Pelanggan\nKios Wifi"]) || 0,
              pelangganVoucher:
                Number(d["Pelanggan\nVoucher "]) || 0,

              totalPelanggan: Number(d["TOTAL PELANGGAN"]) || 0,

              // dokumen
              picBumdes: d["PIC BUMDes"] || "",
              noSuratPeminatanBumdes: d["No. Surat Peminatan BUMDes"] || "",
              suratPeminatanBumdes: d["Surat Peminatan BUMDes"] || "",
              perdesPendirian: d["Perdes Pendirian BUMDes"] || "",
              strukturBumdes: d["Struktur BUMDes"] || "",
              npwpBumdes: d["NPWP BUMDes"] || "",
              ktpDirekturBumdes: d["KTP Direktur BUMDes"] || "",
              nibBumdes: d["NIB BUMDes"] || "",
              apbdes: d["APBDES"] || "",
              logoBumdes: d["Logo BUMDes"] || "",

              // ISP
              picIsp: d["PIC ISP"] || "",
              pergantianIsp: d["Pergantian ISP"] || "",

              suratPeminatanIsp: d["Surat Peminatan ISP"] || "",
              aktaIsp: d["Akta Pendirian ISP"] || "",
              skKemenkumham: d["SK Kemenkumham ISP"] || "",
              nibIsp: d["NIB ISP"] || "",
              izinTelekom: d["Izin Penyelenggara Telekomunikasi ISP"] || "",
              jartaplok: d["Jartaplok ISP"] || "",
              ulo: d["ULO ISP"] || "",
              npwpIsp: d["NPWP ISP"] || "",
              logoIsp: d["Logo ISP"] || "",
              ktpDirekturIsp: d["KTP DIREKTUR ISP"] || "",
              companyProfile: d["COMPANY PROFILE ISP"] || "",
              dokumenRKUB: d["Dokumen RFI/RKUB"] || "",

              // metadata
              jumlahAksesPoint:
                Number(d["Jumlah Akses Point"]) || 0,

              // =======================
              // 🟡 PKS & DOKUMEN LANJUTAN (FIX)
              // =======================
              pks: d["PKS"] || "",
              dokumenPks: d["Dokumen PKS"] || "",

              perpanjanganPks1: d["Perpanjangan PKS I"] || "",
              suratPerpanjanganPks1:
                d["Surat Permohonan Perpanjangan\nPKS I"] || "",
              dokumenPerpanjanganPks1:
                d["Dokumen Perpanjangan PKS I"] || "",

              perpanjanganPks2: d["Perpanjangan PKS II"] || "",
              suratPerpanjanganPks2:
                d["Surat Permohonan Perpanjangan PKS II"] || "",
              dokumenPerpanjanganPks2:
                d["Dokumen Perpanjangan PKS II"] || "",

              // 🔥 FINAL OUTPUT (INI YANG DIPAKAI DASHBOARD)
              effectiveExpiryDate,
              daysLeft,
              warningLevel,
            };
          })
        );

      } catch (err) {
        console.error("Error fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return (
    <DataContext.Provider value={{ aksesData, bumdesData, loading }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => useContext(DataContext);