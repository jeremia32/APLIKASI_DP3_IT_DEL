import React, { useState, useEffect } from "react";
import { Layout, Menu, Dropdown, Avatar, Badge, Switch, Button, message } from "antd";
import { HomeOutlined, UserOutlined, LogoutOutlined, NotificationOutlined, BulbOutlined, SolutionOutlined, TeamOutlined, BookOutlined, PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/ITDEL.jpg";
import "../Styles/Navbar.css";

const { Header } = Layout;

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [notifications, setNotifications] = useState(3);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchAdminData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
        return;
      }
      try {
        const res = await axios.get("http://localhost:5000/api/admin/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsername(res.data.username);
        setIsLoggedIn(true);
      } catch (error) {
        handleLogout();
      }
    };
    fetchAdminData();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/admin/logout", {}, { withCredentials: true });
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setUsername("");
      message.success("Logout Berhasil!");
      navigate("/");
    } catch (err) {
      console.error("Logout gagal:", err);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.classList.toggle("dark-theme");
  };

  const tambahAkunDropdown = (
    <Menu>
      <Menu.Item key="tambah-pegawai" icon={<PlusOutlined />}>
        <Link to="/CreateuserAkun">Tambah Akun Pegawai</Link>
      </Menu.Item>
      <Menu.Item key="lihat-akun" icon={<EyeOutlined />}>
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="lihat-dosen">
                <Link to="/Dosen">Dosen</Link>
              </Menu.Item>
              <Menu.Item key="lihat-staff">
                <Link to="/lihat-akun/staff">Staff</Link>
              </Menu.Item>
              <Menu.Item key="lihat-mahasiswa">
                <Link to="/lihat-akun/mahasiswa">Mahasiswa</Link>
              </Menu.Item>
            </Menu>
          }
          trigger={["hover"]}
          placement="rightTop"
        >
          <span>Lihat Akun Pegawai ▸</span>
        </Dropdown>
      </Menu.Item>
    </Menu>
  );

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/ProfilePage">Profil</Link>
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className={`navbar ${theme}`}>
      <div className="logo-container">
        <img src={logo} alt="Logo" className="navbar-logo" />
        {/* <span className="brand-name">DP3 IT DEL</span> */}
      </div>

      <Menu theme={theme} mode="horizontal" className="navbar-menu">
        <Menu.Item key="penilaian-pejabat" icon={<SolutionOutlined />}>
          <Link to="/penilaian-pejabat">Pejabat Struktural</Link>
        </Menu.Item>
        <Menu.Item key="penilaian-pengajar" icon={<BookOutlined />}>
          <Link to="/penilaian-pengajar">Pengajar</Link>
        </Menu.Item>
        <Menu.Item key="penilaian-staff" icon={<TeamOutlined />}>
          <Link to="/penilaian-staff">Staff</Link>
        </Menu.Item>
        <Dropdown overlay={tambahAkunDropdown} trigger={["hover"]}>
          <Button type="text" icon={<UserOutlined />}>
            Tambah Akun
          </Button>
        </Dropdown>
      </Menu>

      <div className="navbar-actions">
   

        <Switch checked={theme === "dark"} checkedChildren={<BulbOutlined />} unCheckedChildren={<BulbOutlined />} onChange={toggleTheme} className="theme-toggle" />

        {isLoggedIn ? (
          <Dropdown overlay={userMenu} trigger={["click"]}>
            <Button type="text" icon={<UserOutlined />} className="username-button">
              {username}
            </Button>
          </Dropdown>
        ) : (
          <Button type="primary" icon={<LogoutOutlined />} onClick={() => navigate("/LoginPage")}>
            Login
          </Button>
        )}
      </div>
    </Header>
  );
};

export default Navbar;
