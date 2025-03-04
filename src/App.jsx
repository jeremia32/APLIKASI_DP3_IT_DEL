import "./app.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./components/ProfilePage";
import CreateuserAkun from "./pages/CreateuserAkun";
import Dosen from "./pages/dosen";
// import PagenotFound from "./pages/PagenotFound";
// import Page404 from "./components/Page404";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ProfilePage" element={<ProfilePage />} />
        <Route path="/CreateuserAkun" element={<CreateuserAkun />} />
        <Route path="/Dosen" element={<Dosen />} />
        {/* <Route path="*" element={<Page404 />} /> */}

        {/* <Route path="/page-Not-found" element={< PagenotFound />} /> */}
        {/* <Route path="*" element={< PagenotFound />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
