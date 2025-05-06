import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const PenilaianListAntd = () => {
  const [data, setData] = useState([]); // [{ nama, nip, role, tanggal }]
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/hasil-penilaian/rekap/detail-penilaian", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const list = res.data.map((item) => ({
          nama: item.penilaianUser.user.username,
          nip: item.penilaianUser.user.nip,
          role: item.penilaianUser.role,
          tanggal: item.tanggal,
        }));

        setData(list);
      } catch (err) {
        console.error(err);
        message.error("Gagal memuat data penilaian");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDetail = (nip) => {
    navigate(`/DetailLaporanPage/${nip}`);
  };

  const handleDownloadAllEvaluator = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/hasil-penilaian/rekap/export/excel", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rekap-evaluator.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      message.error("Gagal mengunduh rekap Excel evaluator");
    }
  };

  const columns = [
    { title: "Nama", dataIndex: "nama", key: "nama" },
    { title: "NIP", dataIndex: "nip", key: "nip" },
    { title: "Role", dataIndex: "role", key: "role" },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Button type="primary" onClick={() => handleDetail(record.nip)}>
          Lihat Detail
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Daftar Penilaian 360</Title>

      <Button type="primary" onClick={handleDownloadAllEvaluator} style={{ marginBottom: 16 }}>
        Unduh Rekap Excel (Semua Evaluator)
      </Button>

      <Table columns={columns} dataSource={data} rowKey="nip" loading={loading} bordered pagination={{ pageSize: 10 }} />
    </div>
  );
};

export default PenilaianListAntd;
