import React, { useEffect, useState } from "react";
import { Layout, Menu, Button, Drawer, Badge, message } from "antd";
import { BellOutlined, LogoutOutlined, DownOutlined, MenuOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/ITDEL.jpg"; // Sesuaikan path logo
import "../Styles/UserNavbar.css"; // File CSS eksternal

const { Header } = Layout;

const UserNavbar = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [messageApi, contextHolder] = message.useMessage();

  // Ambil profil user dari backend untuk mendapatkan username
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");
    axios
      .get("http://localhost:5000/api/userslogin/profile", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
      .then((response) => {
        setUsername(response.data.username);
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
      });
  }, [navigate]);

  // Ambil jumlah evaluasi yang belum dinilai (pending)
  useEffect(() => {
    const fetchPending = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://localhost:5000/api/PenilaianUser/evaluationsForPenilai?active=true", { headers: { Authorization: `Bearer ${token}` } });
        setPendingCount(response.data.length);
      } catch (error) {
        console.error("Error fetching pending evaluations:", error);
      }
    };
    fetchPending();
  }, []);

  // Fungsi untuk logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  // Handler klik notifikasi
  const handleNotificationClick = () => {
    if (pendingCount > 0) {
      messageApi.open({
        type: "warning",
        content: `Belum menyelesaikan ${pendingCount} kuisioner, harap diisi secepatnya ya!`,
        className: "custom-notif",
        style: { marginTop: "10vh", marginLeft: "65vw" },
      });
    } else {
      messageApi.open({
        type: "success",
        content: "Kamu tidak ada lagi kuisioner, terima kasih sudah mengisi!",
        className: "custom-notif",
        style: { marginTop: "20vh" },
      });
    }
  };

  // Menu navigasi dan user
  const navItems = [
    { key: "dashboard", label: "Dashboard", onClick: () => navigate("/Dashboard_user") },
    { key: "tentang-dp3", label: "Tentang DP3", onClick: () => navigate("/TentangUser") },
  ];
  const userMenuItems = [{ key: "logout", label: "Logout", icon: <LogoutOutlined />, onClick: handleLogout }];

  return (
    <>
      {contextHolder}
      <Header className="user-navbar">
        <div className="navbar-container">
          <div className="navbar-left">
            <img src={logo} alt="Logo Aplikasi" className="navbar-logo" />
            <div className="desktop-menu">
              <Menu mode="horizontal" defaultSelectedKeys={["dashboard"]} className="navbar-menu">
                {navItems.map((item) => (
                  <Menu.Item key={item.key} onClick={item.onClick}>
                    {item.label}
                  </Menu.Item>
                ))}
              </Menu>
            </div>
          </div>

          <div className="navbar-right">
            {/* Tombol menu mobile di kanan */}
            <div className="mobile-menu-button">
              <Button type="text" icon={<MenuOutlined style={{ fontSize: "24px" }} />} onClick={() => setDrawerVisible(true)} />
            </div>

            <Badge count={pendingCount} showZero={false} overflowCount={9} offset={[-5, 5]}>
              <Button shape="circle" icon={<BellOutlined style={{ fontSize: "16px" }} />} onClick={handleNotificationClick} />
            </Badge>

            <Menu mode="horizontal" selectable={false} triggerSubMenuAction="click">
              <Menu.SubMenu
                key="user"
                title={
                  <span className="navbar-user">
                    <span className="navbar-username" title={username}>
                      {username || "User"}
                    </span>
                    <DownOutlined />
                  </span>
                }
              >
                {userMenuItems.map((item) => (
                  <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
                    {item.label}
                  </Menu.Item>
                ))}
              </Menu.SubMenu>
            </Menu>
          </div>
        </div>

        {/* Drawer untuk mobile, dengan username */}
        <Drawer title="Menu Navigasi" placement="left" closable onClose={() => setDrawerVisible(false)} visible={drawerVisible}>
          <Menu mode="vertical" defaultSelectedKeys={["dashboard"]} className="drawer-menu">
            {/* Tampilkan username di atas menu */}
            <Menu.Item key="user-mobile" icon={<UserOutlined />} disabled>
              {username || "User"}
            </Menu.Item>

            {navItems.map((item) => (
              <Menu.Item
                key={item.key}
                onClick={() => {
                  setDrawerVisible(false);
                  item.onClick();
                }}
              >
                {item.label}
              </Menu.Item>
            ))}

            {/* Tombol Logout di drawer */}
            <Menu.Divider />
            <Menu.Item key="logout-mobile" icon={<LogoutOutlined />} onClick={handleLogout}>
              Logout
            </Menu.Item>
          </Menu>
        </Drawer>
      </Header>
    </>
  );
};

export default UserNavbar;
