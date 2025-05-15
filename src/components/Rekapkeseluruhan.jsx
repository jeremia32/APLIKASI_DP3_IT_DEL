import React, { useEffect, useState } from "react";
import { Table, Button, Layout, Typography, message, Space, Empty, Breadcrumb } from "antd";
import { DownloadOutlined, FilePdfOutlined, HomeOutlined } from "@ant-design/icons";
import axios from "axios";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/api/hasil-penilaian/json/user");
        setData(response.data);
      } catch (error) {
        message.error("Gagal mengambil data!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const downloadExcel = () => {
    window.open("http://localhost:5000/api/hasil-penilaian/export/user", "_blank");
  };

  const downloadPdf = () => {
    window.open("http://localhost:5000/api/hasil-penilaian/rekap/export/pdf", "_blank");
  };

  const columns = [
    { title: "🆔 NIP", dataIndex: "nip", key: "nip" },
    { title: "👤 Username", dataIndex: "username", key: "username" },
    { title: "💼 Posisi", dataIndex: "posisi", key: "posisi" },
    { title: "💼 Role 360°", dataIndex: "rolePenilaian", key: "rolePenilaian" },
    { title: "📝 Penilai", dataIndex: "penilai", key: "penilai" },
    { title: "📊 Total Skor", dataIndex: "totalSkor", key: "totalSkor" },
    { title: "📈 Persentil (%)", dataIndex: "persentil", key: "persentil" },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          background: "#f5f7fa", // solid navy blue color
          padding: "0 24px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Title
          level={2}
          style={{
            color: "rgba(10, 10, 10, 0.8)",
            margin: 0,
            
            lineHeight: "64px",
            fontWeight: 600,
            fontFamily: "Segoe UI, sans-serif",
          }}
        >
          📄 Rekapitulasi Hasil Penilaian Karyawan
        </Title>
      </Header>

      <Content style={{ padding: "40px 60px" }}>
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item href="/dashboard">
            <HomeOutlined />
            <span>Dashboard</span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Rekapitulasi Keseluruhan</Breadcrumb.Item>
        </Breadcrumb>

        <Space
          style={{
            marginBottom: "24px",
            width: "100%",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Text style={{ fontSize: "16px", color: "#555" }}>
            Total Data: <b>{data.length}</b>
          </Text>

          <Space>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={downloadExcel}
              size="large"
              style={{
                backgroundColor: "#1890ff",
                borderColor: "#1890ff",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
              }}
            >
              Unduh Rekap Excel
            </Button>

            <Button
              type="default"
              icon={<FilePdfOutlined />}
              onClick={downloadPdf}
              size="large"
              style={{
                backgroundColor: "#ff4d4f",
                borderColor: "#ff4d4f",
                color: "#fff",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
              }}
            >
              Unduh Rekap PDF
            </Button>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={data}
          rowKey={(record, index) => index}
          loading={loading}
          bordered
          pagination={{ pageSize: 5 }}
          locale={{
            emptyText: <Empty description="Data belum tersedia" />,
          }}
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 10,
            boxShadow: "0 1px 5px rgba(0, 0, 0, 0.1)",
          }}
        />
      </Content>
    </Layout>
  );
};

export default App;
