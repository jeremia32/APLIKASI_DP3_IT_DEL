import React, { useState, useEffect } from "react";
import { Card, Avatar, Segmented, Calendar, Row, Col, Breadcrumb, Spin, Popover, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { AppstoreOutlined, BarsOutlined, HomeOutlined, EditOutlined } from "@ant-design/icons";
import CountUp from "react-countup";
import axios from "axios";

const extraCards = [
  { title: "Penilaian", icon: "https://cdn-icons-png.flaticon.com/128/1390/1390708.png", path: "/TabelPenilaian" },
  { title: "Rubrik", icon: "https://cdn-icons-png.flaticon.com/128/17210/17210119.png", path: "/Rubrik" },
  { title: "Backup Data", icon: "https://cdn-icons-png.flaticon.com/128/15096/15096950.png", path: "/BackupData" },
  { title: "Daftar Penilai", icon: "https://cdn-icons-png.flaticon.com/128/6607/6607433.png", path: "/DaftarPenilai" },
  { title: "Qusioner", icon: "https://cdn-icons-png.flaticon.com/128/671/671829.png", path: "/DaftarPertanyaan" },
  { title: "Laporan", icon: "https://cdn-icons-png.flaticon.com/128/9824/9824550.png", path: "/Laporan" },
];

const userRoles = [
  { title: "kaprodi", icon: "https://cdn-icons-png.flaticon.com/128/3135/3135715.png" },
  { title: "Staff", icon: "https://cdn-icons-png.flaticon.com/128/3135/3135776.png" },
  { title: "dosen", icon: "https://cdn-icons-png.flaticon.com/128/3135/3135789.png" },
  { title: "dekan", icon: "https://cdn-icons-png.flaticon.com/128/3135/3135768.png" },
];

const Dashboard = () => {
  const [view, setView] = useState("Grid");
  const [userCounts, setUserCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserCounts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/usercount");
        setUserCounts(response.data);
      } catch (error) {
        console.error("Gagal mengambil data jumlah user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserCounts();
  }, []);

  // Konten popover untuk opsi Laporan
  const laporanContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Button type="primary" block onClick={() => navigate("/Laporan")}>
        Rekap Laporan
      </Button>
      <Button type="default" block onClick={() => navigate("/Laporankeseluruhan")}>
        Rekapitulasi Keseluruhan
      </Button>
    </div>
  );

  return (
    <div style={{ padding: "20px" }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: "20px" }}>
        <Breadcrumb.Item onClick={() => navigate("/")}>
          <HomeOutlined />
          <span> Dashboard Admin</span>
        </Breadcrumb.Item>
      </Breadcrumb>

      <h2>Jumlah Data User Aktif</h2>

      {/* Segmented View Mode */}
      <Segmented
        options={[
          { value: "List", icon: <BarsOutlined /> },
          { value: "Grid", icon: <AppstoreOutlined /> },
        ]}
        onChange={(val) => setView(val)}
        style={{ marginBottom: "20px" }}
      />

      {/* Menampilkan Loading jika data masih diambil */}
      {loading ? (
        <Spin size="large" style={{ display: "block", margin: "20px auto" }} />
      ) : (
        <Row gutter={[16, 16]}>
          {userRoles.map((role, index) => (
            <Col xs={24} sm={12} md={view === "Grid" ? 6 : 24} key={index}>
              <Card
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 10,
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                }}
              >
                <Avatar src={role.icon} size={64} style={{ marginRight: "15px" }} />
                <div>
                  <h3>{role.title}</h3>
                  <h2>
                    <CountUp start={0} end={userCounts[role.title] || 0} duration={5} />
                  </h2>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Menu Tambahan */}
      <h2 style={{ marginTop: "20px" }}>Menu Tambahan</h2>
      <Row gutter={[16, 16]}>
        {extraCards.map((item, index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <Card
              style={{
                borderRadius: 10,
                textAlign: "center",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              }}
              cover={<Avatar src={item.icon} size={64} style={{ margin: "20px auto" }} />}
              actions={[
                item.title === "Laporan" ? (
                  <Popover content={laporanContent} trigger="click">
                    <EditOutlined key="edit" />
                  </Popover>
                ) : (
                  <EditOutlined key="edit" onClick={() => navigate(item.path)} />
                ),
              ]}
            >
              <h3>{item.title}</h3>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Kalender */}
      <h2 style={{ marginTop: "20px" }}>Kalender</h2>
      <Calendar
        fullscreen={false}
        style={{
          borderRadius: 10,
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          padding: "10px",
        }}
      />
    </div>
  );
};

export default Dashboard;
