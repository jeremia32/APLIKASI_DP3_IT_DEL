import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Typography, message, Breadcrumb, Input, Row, Col, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { HomeOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Search } = Input;

const PenilaianListAntd = () => {
  const [data, setData] = useState([]); // semua data valid
  const [filteredData, setFilteredData] = useState([]);
  const [pageData, setPageData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: false,
  });

  const navigate = useNavigate();

  // Fetch data sekali
  useEffect(() => {
    const fetchList = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/hasil-penilaian/rekap/detail-penilaian", { headers: { Authorization: `Bearer ${token}` } });

        // Filter dan map hanya record dengan penilaianUser.user yang valid
        const list = res.data
          .filter((item) => item.penilaianUser && item.penilaianUser.user)
          .map((item) => ({
            nip: item.penilaianUser.user.nip,
            nama: item.penilaianUser.user.username,
            role: item.penilaianUser.role || "-",
            tanggal: item.tanggal ? new Date(item.tanggal).toLocaleDateString() : "-",
          }));

        setData(list);
        setFilteredData(list);
        setPagination((p) => ({ ...p, total: list.length }));
      } catch (err) {
        console.error(err);
        message.error("Gagal memuat data penilaian");
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, []);

  // Update pageData saat filteredData atau current page berubah
  useEffect(() => {
    const { current, pageSize } = pagination;
    const start = (current - 1) * pageSize;
    const end = start + pageSize;
    setPageData(filteredData.slice(start, end));
  }, [filteredData, pagination.current]);

  // Search handler
  const handleSearch = (val) => {
    setSearchText(val);
    const fd = data.filter((i) => i.nama.toLowerCase().includes(val.toLowerCase()) || i.nip.toLowerCase().includes(val.toLowerCase()));
    setFilteredData(fd);
    setPagination((p) => ({ ...p, current: 1, total: fd.length }));
  };

  const columns = [
    { title: "Nama", dataIndex: "nama", key: "nama" },
    { title: "NIP", dataIndex: "nip", key: "nip" },
    { title: "Role", dataIndex: "role", key: "role" },
    { title: "Tanggal", dataIndex: "tanggal", key: "tanggal" },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Button type="primary" onClick={() => navigate(`/DetailLaporanPage/${record.nip}`)}>
          Lihat Detail
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#fff" }}>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item onClick={() => navigate("/dashboard")}>
          <HomeOutlined /> Beranda
        </Breadcrumb.Item>
        <Breadcrumb.Item>Penilaian</Breadcrumb.Item>
        <Breadcrumb.Item>Daftar Penilaian</Breadcrumb.Item>
      </Breadcrumb>

      <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
        Daftar Penilaian 360
      </Title>

      <Row justify="start" style={{ marginBottom: 16 }}>
        <Col>
          <Search placeholder="Cari Nama atau NIP" allowClear value={searchText} onSearch={handleSearch} onChange={(e) => handleSearch(e.target.value)} style={{ width: 300 }} />
        </Col>
      </Row>

      <div style={{ marginBottom: 12 }}>
        <strong>Total Data: {pagination.total}</strong>
      </div>

      {loading ? <Spin size="large" style={{ display: "block", margin: "40px auto" }} /> : <Table columns={columns} dataSource={pageData} rowKey="nip" bordered pagination={pagination} onChange={(pag) => setPagination(pag)} />}
    </div>
  );
};

export default PenilaianListAntd;
