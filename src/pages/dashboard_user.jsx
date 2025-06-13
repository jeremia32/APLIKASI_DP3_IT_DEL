import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Spin, Result, Button } from "antd";
import UserDashboard from "../components/UserDashboard";
import UserNavbar from "../components/NavbarUser";
import ChatbotQwen from "./../components/ChatbotQwen";

const Dashboard_user = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {

    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      // Pastikan token ada dan role adalah "user"
      if (!token || role !== "user") {
        setIsUnauthorized(true);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/api/userslogin/profile", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setUser(response.data);
      } catch (error) {
        console.error("Gagal mengambil data user:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setIsUnauthorized(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <Spin size="large" tip="Loading, please wait..." />
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Maaf, Anda tidak memiliki akses ke halaman ini."
        extra={
          <Button type="primary" onClick={() => navigate("/")}>
            Back to Login
          </Button>
        }
      />
    );
  }

  return (
    <>
      <UserNavbar />
      <UserDashboard />;
      {/* <ChatbotQwen /> */}
    </>
  );
};

export default Dashboard_user;
