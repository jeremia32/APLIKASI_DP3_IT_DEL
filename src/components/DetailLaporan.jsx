import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Typography, Spin, Alert, Card, Row, Col, Table, Tag, Space } from "antd";

const { Title } = Typography;

export default function DetailLaporanPage() {
  const { evaluatorNip } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasil, setHasil] = useState([]);
  const [perQuestion, setPerQuestion] = useState([]);
  const [perAspekPerUser, setPerAspekPerUser] = useState([]);
  const [perUserOverall, setPerUserOverall] = useState([]);
  const [statistikAspekEvaluator, setStatistikAspekEvaluator] = useState([]);

  useEffect(() => {
    if (!evaluatorNip) return;
    setLoading(true);
    axios
      .get(`http://localhost:5000/api/hasil-penilaian/DetailLaporanPage/${evaluatorNip}`)
      .then(({ data }) => {
        setHasil(data.hasil || []);
        setPerQuestion(data.perQuestion || []);
        setPerAspekPerUser(data.perAspekPerUser || []);
        setPerUserOverall(data.perUserOverall || []);
        setStatistikAspekEvaluator(data.statistikAspekEvaluator || []);
      })
      .catch((err) => {
        console.error(err);
        setError("Gagal memuat data. Silakan coba lagi.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [evaluatorNip]);

  if (loading) return <Spin tip="Memuat..." style={{ margin: 50 }} />;
  if (error) return <Alert type="error" message={error} />;

  const colPerQuestion = [
    { title: "Pertanyaan", dataIndex: "teks", key: "teks" },
    {
      title: "Avg",
      dataIndex: "avgNilai",
      key: "avgNilai",
      render: (v) => v.toFixed(2),
    },
    { title: "Max", dataIndex: "maxNilai", key: "maxNilai" },
    { title: "Min", dataIndex: "minNilai", key: "minNilai" },
    {
      title: "Positif (%)",
      dataIndex: "percentPositive",
      key: "percentPositive",
      render: (v) => `${v.toFixed(1)}%`,
    },
    {
      title: "Negatif (%)",
      dataIndex: "percentNegative",
      key: "percentNegative",
      render: (v) => `${v.toFixed(1)}%`,
    },
  ];

  const colPerAspek = [
    {
      title: "Responden ID",
      dataIndex: "penilaianUser",
      key: "penilaianUser",
    },
    { title: "Aspek", dataIndex: "aspekNama", key: "aspekNama" },
    {
      title: "Rata-rata",
      dataIndex: "avgNilai",
      key: "avgNilai",
      render: (v) => v.toFixed(2),
    },
  ];

  const colOverall = [
    { title: "NIP", dataIndex: "userNip", key: "userNip" },
    { title: "Penilai (NIP)", dataIndex: "userName", key: "userName" }, // <--- Tambahkan ini
    {
      title: "Rata-rata Total",
      dataIndex: "avgTotal",
      key: "avgTotal",
      render: (v) => v.toFixed(2),
    },
  ];

  const colStatistikAspek = [
    { title: "Aspek", dataIndex: "aspekNama", key: "aspekNama" },
    { title: "Min", dataIndex: "minNilai", key: "minNilai" },
    { title: "Max", dataIndex: "maxNilai", key: "maxNilai" },
    { title: "Range", dataIndex: "range", key: "range" },
    {
      title: "Rata-rata",
      dataIndex: "avgNilai",
      key: "avgNilai",
      render: (v) => v.toFixed(2),
    },
    {
      title: "P25",
      dataIndex: "persentil25",
      key: "persentil25",
      render: (v) => v?.toFixed(2),
    },
    {
      title: "Median (P50)",
      dataIndex: "persentil50",
      key: "persentil50",
      render: (v) => v?.toFixed(2),
    },
    {
      title: "Persentil 75",
      dataIndex: "persentil75",
      key: "persentil75",
      render: (v) => v?.toFixed(2),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Detail Laporan Evaluator: {evaluatorNip}</Title>

      <Row gutter={[16, 16]}>
        {hasil.map((item) => (
          <Col xs={24} sm={12} key={item._id}>
            <Card title={`User: ${item.penilaianUser.user.username}`} size="small">
              <p>
                <strong>NIP:</strong> {item.penilaianUser.user.nip}
              </p>
              <p>
                <strong>Role:</strong> {item.penilaianUser.role}
              </p>
              <p>
                <strong>Evaluator(s):</strong>{" "}
                <Space wrap>
                  {item.penilaianUser.penilai.map((u) => (
                    <Tag key={u._id}>{u.username}</Tag>
                  ))}
                </Space>
              </p>
              <p>
                <strong>Jawaban:</strong>
              </p>
              <ul>
                {item.jawaban.map((j, idx) => (
                  <li key={idx}>
                    {j.pertanyaan} → {j.nilai}
                  </li>
                ))}
              </ul>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Rata-rata Per Pertanyaan" style={{ marginTop: 24 }}>
        <Table columns={colPerQuestion} dataSource={perQuestion} rowKey="pertanyaanId" pagination={false} size="small" />
      </Card>

      <Card title="Rata-rata Per Aspek per Responden" style={{ marginTop: 24 }}>
        <Table columns={colPerAspek} dataSource={perAspekPerUser} rowKey={(r) => `${r.penilaianUser}-${r.aspekId}`} pagination={false} size="small" />
      </Card>

      <Card title="Rata-rata Total Keseluruhan per User" style={{ marginTop: 24 }}>
        <Table columns={colOverall} dataSource={perUserOverall} rowKey="penilaianUser" pagination={false} size="small" />
      </Card>

      <Card title="Statistik per Aspek (Evaluator)" style={{ marginTop: 24 }}>
        <Table columns={colStatistikAspek} dataSource={statistikAspekEvaluator} rowKey="aspekId" pagination={false} size="small" />
      </Card>
    </div>
  );
}
