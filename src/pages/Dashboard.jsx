import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbaradmin from "../components/Navbaradmin";

const Dashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      const token = localStorage.getItem("token"); // Ambil token dari localStorage

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/api/admin/profile", {
          headers: { Authorization: `Bearer ${token}` }, // Kirim token dalam Authorization Header
        });

        setAdmin(response.data);
      } catch (error) {
        console.error("Gagal mengambil data admin:", error);
        localStorage.removeItem("token"); // Hapus token jika tidak valid
        navigate("/login"); // Redirect ke halaman login
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
      <Navbaradmin />
      <div>
        <h2>Dashboard Admin</h2>
        {admin ? (
          <div>
            <p>Username: {admin.username}</p>
            <p>Email: {admin.email}</p>
          </div>
        ) : (
          <p>Anda belum login.</p>
        )}
      </div>
    </>
  );
};

export default Dashboard;
