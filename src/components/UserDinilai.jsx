import React, { useState, useEffect } from "react";
import { Table, Breadcrumb, Spin, Button, message, Tabs, Modal, Form, Input, Row, Col, Pagination } from "antd";
import { HomeOutlined, SearchOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../Styles/PenilaianUser.css";

const { TabPane } = Tabs;
const { Search } = Input;

const UserDinilai = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [evaluator, setEvaluator] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeerKeys, setSelectedPeerKeys] = useState([]);
  const [selectedSuperiorKeys, setSelectedSuperiorKeys] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);

  const [searchPeer, setSearchPeer] = useState("");
  const [searchSuperior, setSearchSuperior] = useState("");
  const [peerPage, setPeerPage] = useState(1);
  const [superiorPage, setSuperiorPage] = useState(1);
  const [messageApi, contextHolder] = message.useMessage();

  const pageSize = 10;
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roleParam = queryParams.get("role")?.trim() || "";
  const nipParam = queryParams.get("nip")?.trim() || "";

  const normalize = (str) => str?.trim().toLowerCase();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/api/users");
        setAllUsers(response.data);

        if (nipParam) {
          const evalResponse = await axios.get(`http://localhost:5000/api/users/${nipParam}`);
          setEvaluator(evalResponse.data.user);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Gagal mengambil data pengguna.");
      }
      setLoading(false);
    };

    fetchData();
  }, [nipParam]);

  const evaluatorRole = evaluator ? normalize(evaluator.role) : "";
  const peerGroup = evaluatorRole ? allUsers.filter((user) => normalize(user.role) === evaluatorRole) : [];

  let superiorGroup = [];
  if (evaluatorRole === "dosen") {
    superiorGroup = allUsers.filter((user) => {
      const r = normalize(user.role);
      return r === "kaprodi" || r === "dekan";
    });
  } else if (evaluatorRole === "kaprodi") {
    superiorGroup = allUsers.filter((user) => normalize(user.role) === "dekan");
  }

  const columnsWithNo = (data, page) => [
    {
      title: "No",
      key: "no",
      render: (_, __, index) => (page - 1) * pageSize + index + 1,
    },
    { title: "NIP", dataIndex: "nip", key: "nip" },
    { title: "Nama", dataIndex: "username", key: "username" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Jabatan", dataIndex: "role", key: "role" },
  ];

  const peerRowSelection = {
    selectedRowKeys: selectedPeerKeys,
    onChange: (selectedKeys) => setSelectedPeerKeys(selectedKeys),
  };

  const superiorRowSelection = {
    selectedRowKeys: selectedSuperiorKeys,
    onChange: (selectedKeys) => setSelectedSuperiorKeys(selectedKeys),
  };

  const filterAndPaginate = (data, searchTerm, page) => {
    const filtered = data.filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()));
    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
    return { filtered, paginated, total };
  };

  const handlePreview = () => {
    if (selectedPeerKeys.length === 0 && selectedSuperiorKeys.length === 0) {
      message.error("Pilih setidaknya satu user untuk dievaluasi.");
      return;
    }
    setPreviewVisible(true);
  };

  const handleSubmitEvaluations = async () => {
    if (!evaluator) {
      messageApi.open({
        type: "error",
        content: "Evaluator tidak diketahui.",
      });
      return;
    }
    try {
      const peerPromises = selectedPeerKeys.map((peerId) =>
        axios.post("http://localhost:5000/api/nilai360/assign", {
          userId: peerId,
          role: "Sejawat",
          penilaiIds: [evaluator._id],
        })
      );
      const superiorPromises = selectedSuperiorKeys.map((superiorId) =>
        axios.post("http://localhost:5000/api/nilai360/assign", {
          userId: superiorId,
          role: "Atasan",
          penilaiIds: [evaluator._id],
        })
      );
      await Promise.all([...peerPromises, ...superiorPromises]);

      messageApi.open({
        type: "success",
        content: "Penilaian berhasil dikirim.",
      });

      // Delay sebentar agar user lihat notifikasi
      setTimeout(() => {
        navigate("/DaftarPenilai");
      }, 1000);

      setSelectedPeerKeys([]);
      setSelectedSuperiorKeys([]);
      setPreviewVisible(false);
    } catch (error) {
      console.error("Error sending evaluations:", error);
      messageApi.open({
        type: "error",
        content: "Terjadi kesalahan saat mengirim penilaian.",
      });
    }
  };

  const { filtered: filteredPeers, paginated: paginatedPeers, total: totalPeers } = filterAndPaginate(peerGroup, searchPeer, peerPage);
  const { filtered: filteredSuperiors, paginated: paginatedSuperiors, total: totalSuperiors } = filterAndPaginate(superiorGroup, searchSuperior, superiorPage);

  // Hitung indeks untuk tampilan pagination info
  const startPeer = totalPeers > 0 ? (peerPage - 1) * pageSize + 1 : 0;
  const endPeer = Math.min(peerPage * pageSize, totalPeers);
  const startSuperior = totalSuperiors > 0 ? (superiorPage - 1) * pageSize + 1 : 0;
  const endSuperior = Math.min(superiorPage * pageSize, totalSuperiors);

  return (
    <div style={{ padding: "20px" }}>
      {contextHolder}

      <Breadcrumb style={{ marginBottom: "20px" }}>
        <Breadcrumb.Item>
          <a href="/dashboard">
            <HomeOutlined style={{ marginRight: "5px" }} />
            Dashboard
          </a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <a href="/TabelPenilaian">Manajemen Penilaian User</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Manajemen Evaluasi</Breadcrumb.Item>
      </Breadcrumb>

      <h1 className="penilaian-title" style={{ color: "black" }}>
        Manajemen Evaluasi
      </h1>
      <h3 className="evaluator-title">Evaluasi oleh {evaluator ? evaluator.username : "Evaluator"}</h3>

      {loading ? (
        <Spin size="large" style={{ display: "block", margin: "20px auto" }} />
      ) : (
        <Tabs defaultActiveKey="peers">
          <TabPane tab="Penilaian Sejawat" key="peers">
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <Search
                placeholder="Cari berdasarkan username atau email"
                enterButton={<SearchOutlined />}
                onChange={(e) => {
                  setSearchPeer(e.target.value);
                  setPeerPage(1);
                }}
                style={{ width: 340 }}
                value={searchPeer}
              />
            </div>
            <Table rowSelection={peerRowSelection} columns={columnsWithNo(paginatedPeers, peerPage)} dataSource={paginatedPeers} rowKey="nip" pagination={false} style={{ marginTop: 16 }} />
            <Row justify="space-between" align="middle" style={{ marginTop: 16 }}>
              <Col>
                {totalPeers > 0 ? (
                  <>
                    Menampilkan {startPeer}–{endPeer} dari total {totalPeers} data
                  </>
                ) : (
                  <>Tidak ada data yang ditampilkan.</>
                )}
              </Col>
              <Col>
                <Pagination current={peerPage} pageSize={pageSize} total={totalPeers} onChange={(page, pageSize) => setPeerPage(page)} showSizeChanger={false} />
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="Penilaian Atasan" key="superiors">
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <Search
                placeholder="Cari berdasarkan username atau email"
                enterButton={<SearchOutlined />}
                onChange={(e) => {
                  setSearchSuperior(e.target.value);
                  setSuperiorPage(1);
                }}
                style={{ width: 340 }}
                value={searchSuperior}
              />
            </div>
            <Table rowSelection={superiorRowSelection} columns={columnsWithNo(paginatedSuperiors, superiorPage)} dataSource={paginatedSuperiors} rowKey="nip" pagination={false} style={{ marginTop: 16 }} />
            <Row justify="space-between" align="middle" style={{ marginTop: 16 }}>
              <Col>
                {totalSuperiors > 0 ? (
                  <>
                    Menampilkan {startSuperior}–{endSuperior} dari total {totalSuperiors} data
                  </>
                ) : (
                  <>Tidak ada data yang ditampilkan.</>
                )}
              </Col>
              <Col>
                <Pagination current={superiorPage} pageSize={pageSize} total={totalSuperiors} onChange={(page, pageSize) => setSuperiorPage(page)} showSizeChanger={false} />
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      )}

      <Button type="primary" onClick={handlePreview} style={{ marginTop: "20px" }}>
        Kirim Evaluasi
      </Button>

      <Modal title="Konfirmasi Evaluasi" open={previewVisible} onCancel={() => setPreviewVisible(false)} footer={null}>
        <Form onFinish={handleSubmitEvaluations}>
          {peerGroup.length > 0 && (
            <>
              <h3>Evaluasi Sejawat</h3>
              <ul>
                {peerGroup
                  .filter((u) => selectedPeerKeys.includes(u.nip))
                  .map((user) => (
                    <li key={user.nip}>
                      {user.nip} - {user.username} ({user.email})
                    </li>
                  ))}
              </ul>
            </>
          )}
          {superiorGroup.length > 0 && (
            <>
              <h3>Evaluasi Atasan</h3>
              <ul>
                {superiorGroup
                  .filter((u) => selectedSuperiorKeys.includes(u.nip))
                  .map((user) => (
                    <li key={user.nip}>
                      {user.nip} - {user.username} ({user.email})
                    </li>
                  ))}
              </ul>
            </>
          )}
          <Form.Item style={{ textAlign: "right", marginTop: "20px" }}>
            <Button onClick={() => setPreviewVisible(false)} style={{ marginRight: 8 }}>
              Batal
            </Button>
            <Button type="primary" htmlType="submit">
              Kirim Penilaian
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserDinilai;
