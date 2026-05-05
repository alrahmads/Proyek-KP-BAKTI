import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FilterProvider } from "@/contexts/FilterContext";
import { DataProvider } from "@/contexts/DataContext"; // ✅ TAMBAH INI
import { NotificationProvider } from "@/contexts/NotificationContext";

import OverviewPage from "./pages/OverviewPage";
import AksesInternetPage from "./pages/AksesInternetPage";
import BumdesPage from "./pages/BumdesPage";
import NotifikasiPage from "./pages/NotifikasiPage";
import ClusterPage from "./pages/ClusterPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DataProvider>
        <FilterProvider>
          <NotificationProvider> {/* ✅ TAMBAH DI SINI */}
            
            <Toaster />
            <Sonner />

            <BrowserRouter>
              <Routes>
                <Route path="/" element={<OverviewPage />} />
                <Route path="/akses-internet" element={<AksesInternetPage />} />
                <Route path="/bumdes" element={<BumdesPage />} />
                <Route path="/notifikasi" element={<NotifikasiPage />} />
                <Route path="/cluster" element={<ClusterPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>

          </NotificationProvider> {/* ✅ */}
        </FilterProvider>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;