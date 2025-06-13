import React, { useState, useEffect } from "react";
import { Layout, Typography, Card, Avatar, Segmented, Calendar, Row, Col, Breadcrumb, Spin, Popover, Button } from "antd";
import { AppstoreOutlined, BarsOutlined, HomeOutlined, EditOutlined } from "@ant-design/icons";
import CountUp from "react-countup";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;
const { Title } = Typography;

const extraCards = [
  {
    title: "Lakukan Penilaian",
    icon: "https://cdn-icons-png.flaticon.com/128/1390/1390708.png",
    path: "/TabelPenilaian",
  },
  {
    title: "Rubrik",
    icon: "https://cdn-icons-png.flaticon.com/128/17210/17210119.png",
    path: "/RubrikPage",
  },
  {
    title: "Backup Data",
    icon: "https://cdn-icons-png.flaticon.com/128/15096/15096950.png",
    path: "/BackupComponent",
  },
  {
    title: "Daftar Penilai",
    icon: "https://cdn-icons-png.flaticon.com/128/6607/6607433.png",
    path: "/DaftarPenilai",
  },
  {
    title: "Lihat Qusioner Anda",
    icon: "https://cdn-icons-png.flaticon.com/128/671/671829.png",
    path: "/DaftarPertanyaan",
  },
  {
    title: "Laporan",
    icon: "https://cdn-icons-png.flaticon.com/128/9824/9824550.png",
    path: "/Laporan",
  },
];

const userRoles = [
  {
    key: "kaprodi",
    title: "Kaprodi",
    icon: "https://cdn-icons-png.flaticon.com/128/3135/3135715.png",
  },
  {
    key: "Staff",
    title: "Staff",
    icon: "https://cdn-icons-png.flaticon.com/128/3135/3135776.png",
  },
  {
    key: "dosen",
    title: "Dosen",
    icon: "https://cdn-icons-png.flaticon.com/128/3135/3135789.png",
  },
  {
    key: "dekan",
    title: "Dekan",
    icon: "https://cdn-icons-png.flaticon.com/128/3135/3135768.png",
  },
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

  const handleBackupClick = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/hasil-penilaian/Backup/user", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "backup_user.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      console.log("Backup berhasil diunduh");
    } catch (error) {
      console.error("Gagal melakukan backup:", error);
      alert("Gagal melakukan backup data");
    }
  };

  const laporanContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Button type="primary" block onClick={() => navigate("/Laporan")}>
        Rekap Laporan
      </Button>
      <Button type="default" block onClick={() => navigate("/Rekapkeseluruhan")}>
        Rekapitulasi Keseluruhan
      </Button>
    </div>
  );

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Content style={{ padding: "20px 50px" }}>
        <Breadcrumb style={{ marginBottom: "20px" }}>
          <Breadcrumb.Item onClick={() => navigate("/")}>
            {" "}
            <HomeOutlined />
            <span style={{ marginLeft: "8px" }}>Beranda Admin</span>{" "}
          </Breadcrumb.Item>
        </Breadcrumb>

        {/* Section: User Counts */}
        <div style={{ marginBottom: "40px" }}>
          <Title level={3}>Jumlah Data Pengguna Aktif</Title>
          <Segmented
            options={[
              { value: "List", icon: <BarsOutlined /> },
              { value: "Grid", icon: <AppstoreOutlined /> },
            ]}
            onChange={(val) => setView(val)}
            value={view}
            style={{ marginBottom: "20px" }}
          />

          {loading ? (
            <Spin size="large" style={{ display: "block", margin: "20px auto" }} />
          ) : (
            <Row gutter={[24, 24]}>
              {userRoles.map((role, index) => (
                <Col xs={24} sm={12} md={view === "Grid" ? 6 : 24} key={index}>
                  <Card
                    hoverable={false}
                    style={{
                      borderRadius: 12,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      cursor: "default",
                    }}
                  >
                    <Card.Meta
                      avatar={<Avatar src={role.icon} size={64} />}
                      title={
                        <Title level={5} style={{ marginBottom: 0 }}>
                          {role.title}
                        </Title>
                      }
                      description={
                        <Title level={3} style={{ margin: 0 }}>
                          <CountUp start={0} end={userCounts[role.key] || 0} duration={2} />
                        </Title>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>

        {/* Section: Menu Tambahan */}
        <div style={{ marginBottom: "40px" }}>
          <Title level={3}>Menu Tambahan</Title>
          <Row gutter={[24, 24]}>
            {extraCards.map((item, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <div onClick={() => item.title !== "Backup Data" && item.title !== "Laporan" && navigate(item.path)} style={{ cursor: "pointer" }}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: 12,
                      textAlign: "center",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    }}
                    cover={
                      <div style={{ padding: "24px 0" }}>
                        <Avatar src={item.icon} size={72} />
                      </div>
                    }
                    actions={[
                      item.title === "Laporan" ? (
                        <Popover content={laporanContent} trigger="click">
                          <EditOutlined key="edit" />
                        </Popover>
                      ) : item.title === "Backup Data" ? (
                        <EditOutlined key="edit" onClick={handleBackupClick} />
                      ) : (
                        <EditOutlined key="edit" onClick={() => navigate(item.path)} />
                      ),
                    ]}
                  >
                    <Title level={5}>{item.title}</Title>
                  </Card>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        {/* Section: Kalender */}
        <div>
          <Title level={3}>Kalender</Title>
          <Calendar
            fullscreen={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              padding: "20px",
              backgroundColor: "#fff",
            }}
          />
        </div>
      </Content>
    </Layout>
  );
};

export default Dashboard;
