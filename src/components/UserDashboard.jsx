import React, { useEffect, useState, useMemo } from "react";
import { Table, message, Spin, Typography, Badge, Button } from "antd";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const { Title } = Typography;

const UserDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [sejawatData, setSejawatData] = useState([]);
  const [atasanData, setAtasanData] = useState([]);
  const [bawahanData, setBawahanData] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const removedId = location.state?.removedId || null;

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/PenilaianUser/evaluationsForPenilai?active=true", { headers: { Authorization: `Bearer ${token}` } });

      const data = response.data;
      const filterData = (role) => data.filter((item) => item.role === role && item.active).filter((item) => item._id !== removedId);

      setSejawatData(filterData("Sejawat"));
      setAtasanData(filterData("Atasan"));
      setBawahanData(filterData("Client"));
    } catch (error) {
      message.error(error.response?.data?.message || "Gagal mengambil data evaluasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, [removedId]);

  useEffect(() => {
    if (removedId) {
      window.history.replaceState({}, document.title);
    }
  }, [removedId]);

  const handleNilaiClick = (record) => {
    if (!record?._id || !record.user?.role) {
      message.error("Data tidak lengkap untuk melakukan penilaian.");
      return;
    }
    const userRole = record.user.role.toLowerCase();
    navigate(`/form-penilaian/${record._id}?role=${userRole}`, {
      state: { userDinilai: record.user },
    });
  };

  // Gabungkan semua data evaluasi
  const combinedData = useMemo(() => [...sejawatData, ...atasanData, ...bawahanData], [sejawatData, atasanData, bawahanData]);

  const columns = [
    {
      title: "NIP Pengguna",
      dataIndex: ["user", "nip"],
      key: "nip",
      render: (text, record) => record?.user?.nip || "-",
    },
    {
      title: "Nama Pengguna",
      dataIndex: ["user", "username"],
      key: "username",
      render: (text, record) => record?.user?.username || "-",
    },
    {
      title: "Posisi",
      dataIndex: ["user", "posisi"],
      key: "posisi",
      render: (text, record) => record?.user?.posisi || "-",
    },
    {
      title: " Email Pengguna",
      dataIndex: ["user", "email"],
      key: "email",
      render: (text, record) => record?.user?.email || "-",
    },
    {
      title: "Jabatan",
      dataIndex: ["user", "role"],
      key: "role",
      render: (role) => <Badge color={role === "Sejawat" ? "geekblue" : role === "Atasan" ? "volcano" : role === "Bawahan" ? "green" : "default"} text={role || "-"} />,
    },
    {
      title: "Penilai",
      dataIndex: "penilai",
      key: "penilai",
      render: (penilai) => (penilai?.length ? penilai.map((p) => p.username).join(", ") : "-"),
    },
    {
      title: "Status Evaluasi",
      dataIndex: "active",
      key: "active",
      render: (active) => <Badge status={active ? "success" : "default"} text={active ? "Aktif" : "Nonaktif"} />,
    },
    {
      title: "Aksi",
      key: "aksi",

      render: (_, record) => (
        <Button type="primary" onClick={() => handleNilaiClick(record)}>
          Nilai
        </Button>
      ),
    },
  ];

  return (
    <Spin spinning={loading} tip="Memuat data evaluasi...">
      <div style={{ padding: "50px" }}>
        <Title level={4} style={{ textAlign: "center", marginTop: "-20px",fontSize: "24px", fontWeight: "bold", paddingBottom: "20px" }}> 
          Daftar Penilaian
   
        </Title>
        <Table columns={columns} dataSource={combinedData} rowKey="_id" locale={{ emptyText: "Tidak ada data evaluasi." }} />
      </div>
    </Spin>
  );
};

export default UserDashboard;
