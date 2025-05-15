import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Typography, message, Breadcrumb, Input, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { HomeOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Search } = Input;

const PenilaianListAntd = () => {
  const [data, setData] = useState([]); // semua data mentah
  const [filteredData, setFilteredData] = useState([]); // data hasil search
  const [pageData, setPageData] = useState([]); // data untuk halaman aktif
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: false, // tidak bisa ubah pageSize
  });

  const navigate = useNavigate();

  // Fetch data sekali
  useEffect(() => {
    async function fetchList() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/hasil-penilaian/rekap/detail-penilaian", { headers: { Authorization: `Bearer ${token}` } });
        const list = res.data.map((item) => ({
          nip: item.penilaianUser.user.nip,
          nama: item.penilaianUser.user.username,
          role: item.penilaianUser.role,
          tanggal: item.tanggal,
        }));
        setData(list);
        setFilteredData(list);
        setPagination((p) => ({ ...p, total: list.length }));
      } catch (err) {
        message.error("Gagal memuat data penilaian");
      } finally {
        setLoading(false);
      }
    }
    fetchList();
  }, []);

  // Update pageData saat filteredData atau halaman berubah
  useEffect(() => {
    const { current, pageSize } = pagination;
    const start = (current - 1) * pageSize;
    setPageData(filteredData.slice(start, start + pageSize));
  }, [filteredData, pagination.current]);

  const handleDetail = (nip) => {
    navigate(`/DetailLaporanPage/${nip}`);
  };

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
    {
      title: "Aksi",
      key: "action",
      render: (_, _rec) => (
        <Button type="primary" onClick={() => navigate(`/DetailLaporanPage/${_rec.nip}`)}>
          Lihat Detail
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item href="/dashboard">
          <HomeOutlined />Dashboard
        </Breadcrumb.Item>
        <Breadcrumb.Item>Penilaian</Breadcrumb.Item>
        <Breadcrumb.Item>Daftar Penilaian</Breadcrumb.Item>
      </Breadcrumb>

      <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
        Daftar Penilaian 360
      </Title>

      <Row justify="start" style={{ marginBottom: 16 }}>
        <Col>
          <Search placeholder="Cari Nama atau NIP" allowClear value={searchText} onSearch={handleSearch} onChange={(e) => handleSearch(e.target.value)} style={{ width: 250 }} />
        </Col>
      </Row>

      <div style={{ marginBottom: 12 }}>
        <strong>Total Data: {pagination.total}</strong>
      </div>

      <Table columns={columns} dataSource={pageData} rowKey="nip" loading={loading} bordered pagination={pagination} onChange={(pag) => setPagination(pag)} />
    </div>
  );
};

export default PenilaianListAntd;
