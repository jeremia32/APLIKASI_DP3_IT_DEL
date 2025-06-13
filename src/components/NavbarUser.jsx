import React, { useEffect, useState } from "react";
import { Layout, Menu, Button, Drawer, Badge, message, Dropdown } from "antd";
import { BellOutlined, LogoutOutlined, MenuOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/ITDEL.jpg";
import "../Styles/UserNavbar.css";

const { Header } = Layout;

export default function UserNavbar() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");
    axios
      .get("http://localhost:5000/api/userslogin/profile", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
      .then((res) => setUsername(res.data.username))
      .catch(console.error);
  }, [navigate]);

  useEffect(() => {
    const fetchPending = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:5000/api/PenilaianUser/evaluationsForPenilai?active=true", { headers: { Authorization: `Bearer ${token}` } });
        setPendingCount(res.data.length);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPending();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const handleNotificationClick = () => {
    if (pendingCount > 0) {
      messageApi.open({
        type: "warning",
        content: `Belum menyelesaikan ${pendingCount} kuisioner, harap diisi!`,
        className: "custom-notif",
        style: { marginTop: "10vh", marginLeft: "65vw" },
      });
    } else {
      messageApi.open({
        type: "success",
        content: "Tidak ada kuisioner tersisa, terima kasih!",
        className: "custom-notif",
        style: { marginTop: "20vh" },
      });
    }
  };

  // NAV ITEMS
  const navMenuItems = [
    { key: "dashboard", label: "Beranda", onClick: () => navigate("/Dashboard_user") },
    { key: "tentang-dp3", label: "Tentang DP3", onClick: () => navigate("/TentangUser") },
  ];

  // USER DROPDOWN MENU
  const userDropdownMenu = (
    <Menu
      items={[
        {
          key: "logout",
          icon: <LogoutOutlined />,
          label: "Keluar",
          onClick: handleLogout,
        },
      ]}
    />
  );

  return (
    <>
      {contextHolder}
      <Header className="user-navbar">
        <div className="navbar-container">
          {/* LEFT: Logo + Nav */}
          <div className="navbar-left">
            <img src={logo} alt="Logo" className="navbar-logo" />
            <div className="desktop-menu">
              <Menu mode="horizontal" defaultSelectedKeys={["dashboard"]} className="navbar-menu" items={navMenuItems} overflowedIndicator={null} />
            </div>
          </div>

          {/* RIGHT: Hamburger, Notif, User */}
          <div className="navbar-right">
            {/* Mobile Hamburger */}
            <div className="mobile-menu-button">
              <Button type="text" icon={<MenuOutlined style={{ fontSize: 24 }} />} onClick={() => setDrawerVisible(true)} />
            </div>

            {/* Notification Bell */}
            <Badge count={pendingCount} overflowCount={9} offset={[-5, 5]}>
              <Button shape="circle" icon={<BellOutlined style={{ fontSize: 16 }} />} onClick={handleNotificationClick} />
            </Badge>

            {/* User Dropdown Trigger */}
            <Dropdown overlay={userDropdownMenu} trigger={["click"]} placement="bottomRight">
              <span className="navbar-user-icon">
                <UserOutlined style={{ fontSize: 20, marginRight: 6 }} />
                <span className="navbar-username-text">{username || "User"}</span>
              </span>
            </Dropdown>
          </div>
        </div>

        {/* Mobile Drawer */}
        <Drawer title="Menu Navigasi" placement="left" closable onClose={() => setDrawerVisible(false)} open={drawerVisible}>
          <Menu mode="vertical" defaultSelectedKeys={["dashboard"]}>
            <Menu.Item key="user-mobile" icon={<UserOutlined />} disabled>
              {username || "User"}
            </Menu.Item>

            {navMenuItems.map((item) => (
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

            <Menu.Divider />
            <Menu.Item key="logout-mobile" icon={<LogoutOutlined />} onClick={handleLogout}>
              Logout
            </Menu.Item>
          </Menu>
        </Drawer>
      </Header>
    </>
  );
}
