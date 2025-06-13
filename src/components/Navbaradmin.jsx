import React, { useState, useEffect } from "react";
import { Layout, Menu, Dropdown, Button, message } from "antd";
import { MenuOutlined, SolutionOutlined, BookOutlined, SnippetsOutlined, SettingOutlined, UserOutlined, DownOutlined, LogoutOutlined, PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/ITDEL.jpg";
import "../Styles/Navbar.css";

const { Header } = Layout;

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // handle resize untuk switch mode menu
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // fetch admin profile
  useEffect(() => {
    const fetchAdmin = async () => {
      const token = localStorage.getItem("token");
      if (!token) return setIsLoggedIn(false);

      try {
        const res = await axios.get("http://localhost:5000/api/admin/profile", { headers: { Authorization: `Bearer ${token}` } });
        setUsername(res.data.username);
        setIsLoggedIn(true);
      } catch {
        handleLogout();
      }
    };
    fetchAdmin();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/admin/logout", {}, { withCredentials: true });
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setUsername("");
      message.success("Keluar Berhasil!");
      navigate("/");
    } catch (err) {
      console.error(" Keluar gagal:", err);
    }
  };

  // dropdown menus
  const settingDropdown = (
    <Menu>
      <Menu.Item key="kategori">
        <Link to="/KategoriPage">Kategori</Link>
      </Menu.Item>
      <Menu.Item key="aspek">
        <Link to="/AspekPage">Aspek</Link>
      </Menu.Item>
      <Menu.Item key="rubrik">
        <Link to="/RubrikPage">Rubrik</Link>
      </Menu.Item>
      <Menu.Item key="pertanyaan">
        <Link to="/PertanyaanPage">Pertanyaan</Link>
      </Menu.Item>
    </Menu>
  );
  const tambahAkunDropdown = (
    <Menu>
      <Menu.Item key="tambah-pegawai" icon={<PlusOutlined />}>
        <Link to="/CreateuserAkun">Tambah Akun Pegawai</Link>
      </Menu.Item>
      <Menu.Item key="lihat-akun" icon={<EyeOutlined />}>
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="dosen">
                <Link to="/Dosen">Dosen</Link>
              </Menu.Item>
              <Menu.Item key="staff">
                <Link to="/StafData">Staff</Link>
              </Menu.Item>
              <Menu.Item key="kaprodi">
                <Link to="/Kaprodidata">Kaprodi</Link>
              </Menu.Item>
              <Menu.Item key="dekan">
                <Link to="/Dekan">Dekan</Link>
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
        Keluar
      </Menu.Item>
    </Menu>
  );

  // pilih mode menu: vertical (mobile) atau horizontal (desktop)
  const menuMode = windowWidth <= 700 ? "vertical" : "horizontal";

  return (
    <Header className="navbar">
      <div className="logo-container">
        <Link to="/dashboard">
          <img src={logo} alt="Logo" className="navbar-logo" style={{ cursor: "pointer" }} />
        </Link>
        <div className="burger-menu" onClick={() => setBurgerOpen((prev) => !prev)}>
          <MenuOutlined />
        </div>
      </div>

      <Menu theme="light" mode={menuMode} className={`navbar-menu ${burgerOpen ? "active" : ""}`}>
        <Menu.Item key="5" icon={<UserOutlined />}>
          <Dropdown overlay={tambahAkunDropdown} trigger={["hover"]}>
            <span>
              Kelola Akun Pegawai <DownOutlined />
            </span>
          </Dropdown>
        </Menu.Item>
        <Menu.Item key="2" icon={<BookOutlined />}>
          <Link to="/DaftarPertanyaan">Kusioner</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<SnippetsOutlined />}>
          <Link to="/Evidence">Bukti</Link>
        </Menu.Item>
        <Menu.Item key="4" icon={<SettingOutlined />}>
          <Dropdown overlay={settingDropdown} trigger={["hover"]}>
            <span>
              Pengaturan <DownOutlined />
            </span>
          </Dropdown>
        </Menu.Item>

        {isLoggedIn ? (
          <Menu.Item key="6" icon={<UserOutlined />} className="menu-user">
            <Dropdown overlay={userMenu} trigger={["click"]}>
              <span>{windowWidth <= 700 ? "Akun" : username}</span>
            </Dropdown>
          </Menu.Item>
        ) : (
          <Menu.Item key="7" icon={<LogoutOutlined />} onClick={() => navigate("/LoginPage")}>
            Login
          </Menu.Item>
        )}
      </Menu>
    </Header>
  );
};

export default Navbar;
