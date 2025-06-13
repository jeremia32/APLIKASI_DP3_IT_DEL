import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbaradmin from "../components/Navbaradmin";
import ContentAdmin from "../components/ContentAdmin";
import AdminFooter from "../components/FooterAdmin";

const Dashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    const fetchAdminProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/api/admin/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAdmin(response.data);
      } catch (error) {
        console.error("Gagal mengambil data admin:", error);
        localStorage.removeItem("token");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, [navigate]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Navbaradmin theme={theme} setTheme={setTheme} />
      <ContentAdmin />
      <AdminFooter theme={theme} />
    </>
  );
};

export default Dashboard;
