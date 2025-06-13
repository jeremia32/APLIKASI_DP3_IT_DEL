import React, { useState, useEffect } from "react";
import { Table, Breadcrumb, Spin, Button, message, Tabs, Modal, Form, Input, Row, Col, Pagination } from "antd";
import { HomeOutlined, SearchOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../Styles/PenilaianUser.css";

// Supaya semua axios.get/post("/api/...") otomatis ke backend port 5000
axios.defaults.baseURL = "http://localhost:5000";

const { TabPane } = Tabs;
const { Search } = Input;

const UserDinilai = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [evaluator, setEvaluator] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedPeerKeys, setSelectedPeerKeys] = useState([]);
  const [selectedClientKeys, setSelectedClientKeys] = useState([]);
  const [selectedSuperiorKeys, setSelectedSuperiorKeys] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);

  const [searchPeer, setSearchPeer] = useState("");
  const [searchClient, setSearchClient] = useState("");
  const [searchSuperior, setSearchSuperior] = useState("");
  const [peerPage, setPeerPage] = useState(1);
  const [clientPage, setClientPage] = useState(1);
  const [superiorPage, setSuperiorPage] = useState(1);
  const [messageApi, contextHolder] = message.useMessage();

  const pageSize = 10;
  const navigate = useNavigate();
  const nipParam = new URLSearchParams(useLocation().search).get("nip")?.trim() || "";

  const normalize = (s) => s?.trim().toLowerCase();

  // Ambil data semua user + evaluator berdasarkan nipParam
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const resp = await axios.get("/api/users");
        setAllUsers(resp.data);
        if (nipParam) {
          const ev = await axios.get(`/api/users/${nipParam}`);
          setEvaluator(ev.data.user);
        }
      } catch {
        message.error("Gagal mengambil data pengguna.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [nipParam]);

  // Bangun tiga grup berdasarkan role & posisi evaluator
  let peerGroup = [],
    clientGroup = [],
    superiorGroup = [];

  if (evaluator) {
    const role = normalize(evaluator.role);
    const pos = evaluator.posisi;

    if (role === "staff") {
      peerGroup = allUsers.filter((u) => normalize(u.role) === "staff" && u.posisi === pos);
      clientGroup = [];
      superiorGroup = allUsers.filter((u) => {
        const r = normalize(u.role);
        return r === "kaprodi" || r === "dekan";
      });
    } else if (role === "dosen") {
      peerGroup = allUsers.filter((u) => normalize(u.role) === "dosen" && u.posisi === "Dosen Matkul");
      clientGroup = allUsers.filter((u) => normalize(u.role) === "dosen" && ["Teaching Assistant[TA]", "Asisten Dosen", "Baak"].includes(u.posisi));
      superiorGroup = allUsers.filter((u) => {
        const r = normalize(u.role);
        return r === "kaprodi" || r === "dekan";
      });
    } else if (role === "kaprodi") {
      peerGroup = [];
      clientGroup = allUsers.filter((u) => normalize(u.role) === "dosen");
      superiorGroup = allUsers.filter((u) => normalize(u.role) === "dekan");
    } else if (role === "dekan") {
      peerGroup = allUsers.filter((u) => {
        const r = normalize(u.role);
        return r === "dosen" || r === "kaprodi";
      });
      clientGroup = [...peerGroup];
      superiorGroup = [];
    }
  }

  // Konfigurasi kolom tabel
  const columns = (page) => [
    {
      title: "No",
      key: "no",
      render: (_, __, i) => (page - 1) * pageSize + i + 1,
    },
    { title: "NIP", dataIndex: "nip", key: "nip" },
    { title: "Nama", dataIndex: "username", key: "username" },
    { title: "Posisi", dataIndex: "posisi", key: "posisi" },
    { title: "Role", dataIndex: "role", key: "role" },
  ];

  // Helper untuk search + paginate
  const filterPaginate = (data, q, page) => {
    const filtered = data.filter((u) => u.username.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()));
    const total = filtered.length;
    return {
      paginated: filtered.slice((page - 1) * pageSize, page * pageSize),
      total,
    };
  };

  const { paginated: peers, total: totPeer } = filterPaginate(peerGroup, searchPeer, peerPage);
  const { paginated: clients, total: totClient } = filterPaginate(clientGroup, searchClient, clientPage);
  const { paginated: sups, total: totSup } = filterPaginate(superiorGroup, searchSuperior, superiorPage);

  const idxRange = (page, total) => {
    if (!total) return `0–0 dari 0`;
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    return `${start}–${end} dari ${total}`;
  };

  // Buka modal preview
  const openPreview = () => {
    if (!selectedPeerKeys.length && !selectedClientKeys.length && !selectedSuperiorKeys.length) {
      return message.error("Pilih minimal satu user untuk dievaluasi.");
    }
    setPreviewVisible(true);
  };

  // Submit ke backend
  const submitAll = async () => {
    if (!evaluator) return messageApi.error("Evaluator tidak terdeteksi.");
    try {
      const calls = [
        ...selectedPeerKeys.map((id) =>
          axios.post("/api/nilai360/assign", {
            userId: id,
            role: "Sejawat",
            penilaiIds: [evaluator._id],
          })
        ),
        ...selectedClientKeys.map((id) =>
          axios.post("/api/nilai360/assign", {
            userId: id,
            role: "Client",
            penilaiIds: [evaluator._id],
          })
        ),
        ...selectedSuperiorKeys.map((id) =>
          axios.post("/api/nilai360/assign", {
            userId: id,
            role: "Atasan",
            penilaiIds: [evaluator._id],
          })
        ),
      ];
      await Promise.all(calls);
      messageApi.success("Penilaian terkirim");
      setTimeout(() => navigate("/DaftarPenilai"), 800);
      setSelectedPeerKeys([]);
      setSelectedClientKeys([]);
      setSelectedSuperiorKeys([]);
      setPreviewVisible(false);
    } catch {
      messageApi.error("Gagal mengirim penilaian.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {contextHolder}
      <Breadcrumb style={{ marginBottom: 20 }}>
        <Breadcrumb.Item href="/dashboard">
          <HomeOutlined /> Beranda
        </Breadcrumb.Item>
        <Breadcrumb.Item href="/TabelPenilaian">Manajemen Penilaian User</Breadcrumb.Item>
        <Breadcrumb.Item>Manajemen Evaluasi</Breadcrumb.Item>
      </Breadcrumb>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: "2.5rem", color: "#1a202c", marginBottom: 8 }}>Manajemen Evaluasi</h1>
        <h3 style={{ fontSize: "1.2rem", color: "#4a5568" }}>Evaluasi oleh {evaluator?.username || "-"}</h3>
      </div>

      {loading ? (
        <Spin style={{ margin: "40px auto", display: "block" }} />
      ) : (
        <Tabs defaultActiveKey="peers">
          {/* TAB Sejawat */}
          <TabPane tab="Penilaian Sejawat" key="peers">
            <Row justify="end" style={{ marginBottom: 12 }}>
              <Search
                placeholder="Cari sejawat"
                enterButton={<SearchOutlined />}
                value={searchPeer}
                onChange={(e) => {
                  setSearchPeer(e.target.value);
                  setPeerPage(1);
                }}
                style={{ width: 280 }}
              />
            </Row>
            <Table
              rowSelection={{
                selectedRowKeys: selectedPeerKeys,
                onChange: setSelectedPeerKeys,
              }}
              columns={columns(peerPage)}
              dataSource={peers}
              rowKey="nip"
              pagination={false}
            />
            <Row justify="space-between" style={{ marginTop: 12 }}>
              <Col>{idxRange(peerPage, totPeer)}</Col>
              <Col>
                <Pagination current={peerPage} pageSize={pageSize} total={totPeer} onChange={setPeerPage} showSizeChanger={false} />
              </Col>
            </Row>
          </TabPane>

          {/* TAB Client */}
          <TabPane tab="Penilaian Client" key="clients">
            <Row justify="end" style={{ marginBottom: 12 }}>
              <Search
                placeholder="Cari client"
                enterButton={<SearchOutlined />}
                value={searchClient}
                onChange={(e) => {
                  setSearchClient(e.target.value);
                  setClientPage(1);
                }}
                style={{ width: 280 }}
              />
            </Row>
            <Table
              rowSelection={{
                selectedRowKeys: selectedClientKeys,
                onChange: setSelectedClientKeys,
              }}
              columns={columns(clientPage)}
              dataSource={clients}
              rowKey="nip"
              pagination={false}
            />
            <Row justify="space-between" style={{ marginTop: 12 }}>
              <Col>{idxRange(clientPage, totClient)}</Col>
              <Col>
                <Pagination current={clientPage} pageSize={pageSize} total={totClient} onChange={setClientPage} showSizeChanger={false} />
              </Col>
            </Row>
          </TabPane>

          {/* TAB Atasan */}
          <TabPane tab="Penilaian Atasan" key="superiors">
            <Row justify="end" style={{ marginBottom: 12 }}>
              <Search
                placeholder="Cari atasan"
                enterButton={<SearchOutlined />}
                value={searchSuperior}
                onChange={(e) => {
                  setSearchSuperior(e.target.value);
                  setSuperiorPage(1);
                }}
                style={{ width: 280 }}
              />
            </Row>
            <Table
              rowSelection={{
                selectedRowKeys: selectedSuperiorKeys,
                onChange: setSelectedSuperiorKeys,
              }}
              columns={columns(superiorPage)}
              dataSource={sups}
              rowKey="nip"
              pagination={false}
            />
            <Row justify="space-between" style={{ marginTop: 12 }}>
              <Col>{idxRange(superiorPage, totSup)}</Col>
              <Col>
                <Pagination current={superiorPage} pageSize={pageSize} total={totSup} onChange={setSuperiorPage} showSizeChanger={false} />
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      )}

      {/* Tombol Kirim */}
      <Button type="primary" onClick={openPreview} style={{ marginTop: 16 }}>
        Kirim Evaluasi
      </Button>

      {/* Modal Konfirmasi */}
      <Modal title="Konfirmasi Evaluasi" visible={previewVisible} onCancel={() => setPreviewVisible(false)} footer={null}>
        <Form onFinish={submitAll}>
          {peerGroup.length > 0 && selectedPeerKeys.length > 0 && (
            <>
              <h4>Sejawat:</h4>
              <ul>
                {peerGroup
                  .filter((u) => selectedPeerKeys.includes(u.nip))
                  .map((u) => (
                    <li key={u.nip}>
                      {u.nip} – {u.username}
                    </li>
                  ))}
              </ul>
            </>
          )}
          {clientGroup.length > 0 && selectedClientKeys.length > 0 && (
            <>
              <h4>Client:</h4>
              <ul>
                {clientGroup
                  .filter((u) => selectedClientKeys.includes(u.nip))
                  .map((u) => (
                    <li key={u.nip}>
                      {u.nip} – {u.username}
                    </li>
                  ))}
              </ul>
            </>
          )}
          {superiorGroup.length > 0 && selectedSuperiorKeys.length > 0 && (
            <>
              <h4>Atasan:</h4>
              <ul>
                {superiorGroup
                  .filter((u) => selectedSuperiorKeys.includes(u.nip))
                  .map((u) => (
                    <li key={u.nip}>
                      {u.nip} – {u.username}
                    </li>
                  ))}
              </ul>
            </>
          )}
          <Row justify="end" style={{ marginTop: 16 }}>
            <Button style={{ marginRight: 8 }} onClick={() => setPreviewVisible(false)}>
              Batal
            </Button>
            <Button type="primary" htmlType="submit">
              Kirim
            </Button>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default UserDinilai;
