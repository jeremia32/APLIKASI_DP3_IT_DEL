import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Layout, Typography, Spin, Alert, Card, Row, Col, Table, Tag, Space, Button, Divider, message, Breadcrumb } from "antd";
import { DownloadOutlined, HomeOutlined, FileExcelOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Content } = Layout;

export default function DetailLaporanPage() {
  const { evaluatorNip } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasil, setHasil] = useState([]);
  const [perQuestion, setPerQuestion] = useState([]);
  const [perAspekPerUser, setPerAspekPerUser] = useState([]);
  const [perUserOverall, setPerUserOverall] = useState([]);
  const [statistikAspekEvaluator, setStatistikAspekEvaluator] = useState([]);
  const [saran, setSaran] = useState([]);

  const fetchData = useCallback(async () => {
    if (!evaluatorNip) return;
    setError(null);
    setLoading(true);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/hasil-penilaian/DetailLaporanPage/${evaluatorNip}`);
      setHasil(data.hasil || []);
      setPerQuestion(data.perQuestion || []);
      setPerAspekPerUser(data.perAspekPerUser || []);
      setPerUserOverall(data.perUserOverall || []);
      setStatistikAspekEvaluator(data.statistikAspekEvaluator || []);
      setSaran(data.saran || []);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data. Silakan coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }, [evaluatorNip]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDownloadExcel = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/hasil-penilaian/export/rekap/${evaluatorNip}`, { responseType: "blob" });
      const blob = new Blob([data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rekap_penilaian_${evaluatorNip}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success("File Excel berhasil diunduh");
    } catch (err) {
      console.error(err);
      message.error("Gagal mengunduh file Excel");
      setError("Gagal mengunduh file. Coba ulang beberapa saat lagi.");
    }
  };

  const columnsConfig = {
    perQuestion: [
      { title: "Pertanyaan", dataIndex: "teks", key: "teks" },
      { title: "Avg", dataIndex: "avgNilai", key: "avgNilai", render: (v) => v.toFixed(2) },
      { title: "Max", dataIndex: "maxNilai", key: "maxNilai" },
      { title: "Min", dataIndex: "minNilai", key: "minNilai" },
      { title: "Positif (%)", dataIndex: "percentPositive", key: "percentPositive", render: (v) => `${v.toFixed(1)}%` },
      { title: "Negatif (%)", dataIndex: "percentNegative", key: "percentNegative", render: (v) => `${v.toFixed(1)}%` },
    ],
    perAspek: [
      { title: "Responden ID", dataIndex: "penilaianUser", key: "penilaianUser" },
      { title: "Aspek", dataIndex: "aspekNama", key: "aspekNama" },
      { title: "Rata-rata", dataIndex: "avgNilai", key: "avgNilai", render: (v) => v.toFixed(2) },
    ],
    overall: [
      { title: "NIP", dataIndex: "userNip", key: "userNip" },
      { title: "Nama Penilai", dataIndex: "userName", key: "userName" },
      { title: "Rata-rata Total", dataIndex: "avgTotal", key: "avgTotal", render: (v) => v.toFixed(2) },
    ],
    statistikAspek: [
      { title: "Aspek", dataIndex: "aspekNama", key: "aspekNama" },
      { title: "Min", dataIndex: "minNilai", key: "minNilai" },
      { title: "Max", dataIndex: "maxNilai", key: "maxNilai" },
      { title: "Range", dataIndex: "range", key: "range" },
      { title: "Rata-rata", dataIndex: "avgNilai", key: "avgNilai", render: (v) => v.toFixed(2) },
      { title: "P25", dataIndex: "persentil25", key: "persentil25", render: (v) => v?.toFixed(2) },
      { title: "Median (P50)", dataIndex: "persentil50", key: "persentil50", render: (v) => v?.toFixed(2) },
      { title: "P75", dataIndex: "persentil75", key: "persentil75", render: (v) => v?.toFixed(2) },
    ],

    saran: [
      { title: "Isi Saran", dataIndex: "isi", key: "isi" },

      {
        title: "Tanggal",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (dt) => new Date(dt).toLocaleString("id-ID"),
      },
    ],
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", paddingTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fa" }}>
      <Content style={{ margin: "24px 32px" }}>
        {/* Breadcrumb */}
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item href="/dashboard">
            <HomeOutlined /> Beranda
          </Breadcrumb.Item>
          <Breadcrumb.Item href="/laporan">Laporan</Breadcrumb.Item>
          <Breadcrumb.Item>Detail Evaluator</Breadcrumb.Item>
        </Breadcrumb>

        <div
          style={{
            background: "#fff",
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Laporan Evaluator: {evaluatorNip}
            </Title>
            <Text type="secondary">Total Responden: {hasil.length}</Text>
          </div>
          <Space>
            <Button type="primary" icon={<FileExcelOutlined />} onClick={handleDownloadExcel}>
              Unduh Excel
            </Button>
          </Space>
        </div>

        {error && <Alert type="error" message={error} style={{ margin: "16px 0" }} />}

        <Divider />

        <Row gutter={[24, 24]}>
          {hasil.map((item) => (
            <Col xs={24} sm={12} lg={8} key={item._id}>
              <Card hoverable bodyStyle={{ padding: 16 }} style={{ borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }} title={<Text strong>{item.penilaianUser.user.username}</Text>}>
                <Text type="secondary">NIP:</Text> <Text strong>{item.penilaianUser.user.nip}</Text>
                <br />
                <Text type="secondary">Role:</Text> <Text strong>{item.penilaianUser.role}</Text>
                <br />
                <Text type="secondary">Evaluator(s):</Text>
                <Space wrap>
                  {item.penilaianUser.penilai.map((u) => (
                    <Tag key={u._id}>{u.username}</Tag>
                  ))}
                </Space>
                <Divider style={{ margin: "12px 0" }} />
                <Text underline>Jawaban:</Text>
                <ul style={{ paddingLeft: 16, marginTop: 8 }}>
                  {item.jawaban.map((j, idx) => (
                    <li key={idx}>
                      <Text>{j.pertanyaan}</Text> → <Text strong>{j.nilai}</Text>
                    </li>
                  ))}
                </ul>
              </Card>
            </Col>
          ))}
        </Row>

        <Divider />

        <Card title="Rata-rata Per Pertanyaan" style={{ marginBottom: 24, borderRadius: 12 }} bodyStyle={{ padding: 16 }}>
          <Table columns={columnsConfig.perQuestion} dataSource={perQuestion} rowKey="pertanyaanId" pagination={{ pageSize: 5, showSizeChanger: true, showTotal: (total) => `Total ${total} data` }} size="middle" />
        </Card>

        <Card title="Rata-rata Per Aspek per Responden" style={{ marginBottom: 24, borderRadius: 12 }} bodyStyle={{ padding: 16 }}>
          <Table
            columns={columnsConfig.perAspek}
            dataSource={perAspekPerUser}
            rowKey={(r) => `${r.penilaianUser}-${r.aspekId}`}
            pagination={{ pageSize: 5, showSizeChanger: true, showTotal: (total) => `Total ${total} data` }}
            size="middle"
          />
        </Card>

        <Card title="Rata-rata Total Keseluruhan per User" style={{ marginBottom: 24, borderRadius: 12 }} bodyStyle={{ padding: 16 }}>
          <Table columns={columnsConfig.overall} dataSource={perUserOverall} rowKey="penilaianUser" pagination={{ pageSize: 5, showSizeChanger: true, showTotal: (total) => `Total ${total} data` }} size="middle" />
        </Card>

        <Card title="Statistik per Aspek (Evaluator)" style={{ borderRadius: 12 }} bodyStyle={{ padding: 16 }}>
          <Table columns={columnsConfig.statistikAspek} dataSource={statistikAspekEvaluator} rowKey="aspekId" pagination={{ pageSize: 5, showSizeChanger: true, showTotal: (total) => `Total ${total} data` }} size="middle" />
        </Card>
        <Card title="Daftar Saran" style={{ marginBottom: 24, borderRadius: 12 }} bodyStyle={{ padding: 16 }}>
          <Table
            columns={columnsConfig.saran}
            dataSource={saran}
            rowKey={(record) => `${record.penilaianUser}-${record._id}`}
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} saran`,
            }}
            size="middle"
          />
        </Card>
      </Content>
    </Layout>
  );
}
