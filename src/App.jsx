import "./app.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./components/ProfilePage";
import CreateuserAkun from "./pages/CreateuserAkun";
import Dosen from "./pages/Dosen";
import Dekan from "./pages/Dekan";
import StafData from "./pages/StafData";
import Kaprodidata from "./pages/KaprodiData";
import TabelPenilaian from "./pages/TabelPenilaian";
import DaftarPenilai from "./pages/DaftarPenilai";
import DaftarPertanyaan from "./pages/DaftarPertanyaan";
import UserDinilai from "./pages/UserDinilai";
import PertanyaanPage from "./pages/PertanyaanPage";
import RubrikPage from "./pages/RubrikPage";
import FormPenilaian from "./pages/formpenilaian";
import Laporan from "./pages/Laporan";
import BackupPage from "./pages/BackupPage";
import Evidence from "./pages/Evidence";
import TentangUser from "./pages/TentangUser";
import DetailLaporanPage from "./pages/DetailLaporanPage";
import KategoriPage from "./pages/KategoriPage";
import AspekPage from "./pages/AspekPage";
import Rekapkeseluruhan from "./pages/Rekapkeseluruhan";
import Dashboard_user from "./pages/dashboard_user";
import PagenotFound from "./pages/PagenotFound"; // Pastikan diimpor dengan benar
// import ContentAdmin from "./components/ContentAdmin"
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/BackupPage" element={<BackupPage />} />
        <Route path="/Evidence" element={<Evidence />} />
        <Route path="/ProfilePage" element={<ProfilePage />} />
        <Route path="/CreateuserAkun" element={<CreateuserAkun />} />
        <Route path="/Dosen" element={<Dosen />} />
        <Route path="/Dekan" element={<Dekan />} />
        <Route path="/TentangUser" element={<TentangUser />} />
        <Route path="/Kaprodidata" element={<Kaprodidata />} />
        <Route path="/TabelPenilaian" element={<TabelPenilaian />} />
        <Route path="/DaftarPenilai" element={<DaftarPenilai />} />
        <Route path="/DaftarPertanyaan" element={<DaftarPertanyaan />} />
        <Route path="/UserDinilai" element={<UserDinilai />} />
        <Route path="/PertanyaanPage" element={<PertanyaanPage />} />
        <Route path="/RubrikPage" element={<RubrikPage />} />
        <Route path="/KategoriPage" element={<KategoriPage />} />
        <Route path="/AspekPage" element={<AspekPage />} />
        <Route path="/StafData" element={<StafData />} />
        <Route path="/Dashboard_user" element={<Dashboard_user />} />
        <Route path="/form-penilaian/:id" element={<FormPenilaian />} />
        <Route path="/Laporan" element={<Laporan />} />
        <Route path="/Rekapkeseluruhan" element={<Rekapkeseluruhan />} />
        <Route path="/DetailLaporanPage/:evaluatorNip" element={<DetailLaporanPage />} />

        {/* Route untuk menangkap semua alamat yang tidak valid */}
        <Route path="*" element={<PagenotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
