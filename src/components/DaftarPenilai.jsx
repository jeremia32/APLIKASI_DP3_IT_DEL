import React, { useState, useEffect } from "react";
import { List, Breadcrumb, Spin, Button, message, Card, Input, Modal, Popconfirm } from "antd";
import { HomeOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../Styles/DaftarPenilai.css";

// Set default backend URL
axios.defaults.baseURL = "http://localhost:5000";

const ANIMATION_DURATION = 600; // in ms

const DaftarPenilai = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingIds, setDeletingIds] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const location = useLocation();
  const [deletingId, setDeletingId] = useState(null);

  // Fetch evaluations sorted by latest
  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/nilai360");
      const sorted = response.data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
      setEvaluations(sorted);
    } catch (error) {
      messageApi.error("Gagal mengambil data evaluasi.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  // Group by evaluator
  const grouped = evaluations.reduce((acc, evalRec) => {
    const penilai = evalRec.penilai?.[0];
    if (penilai) {
      if (!acc[penilai._id]) {
        acc[penilai._id] = { evaluator: penilai, list: [] };
      }
      acc[penilai._id].list.push(evalRec);
    }
    return acc;
  }, {});

  const filteredKeys = Object.keys(grouped).filter((key) => grouped[key].evaluator.username.toLowerCase().includes(searchTerm.toLowerCase()));

  // Delete single evaluation with slide-out animation
  const handleDeleteEval = async (id) => {
    setDeletingId(id); // Trigger animasi
    setTimeout(async () => {
      try {
        await axios.delete(`/api/nilai360/${id}`);
        messageApi.success("Penilaian berhasil dihapus.");
        fetchEvaluations();
      } catch {
        messageApi.error("Gagal menghapus penilaian.");
      } finally {
        setDeletingId(null);
      }
    }, ANIMATION_DURATION);
  };

  // Activate/deactivate group
  const handleGroupDeactivate = async (list) => {
    try {
      await Promise.all(list.map((e) => axios.put(`/api/nilai360/${e._id}/deactivate`)));
      messageApi.success("Penilaian dinonaktifkan.");
      fetchEvaluations();
    } catch {
      messageApi.error("Gagal menonaktifkan penilaian.");
    }
  };
  const handleGroupActivate = async (list) => {
    try {
      await Promise.all(list.map((e) => axios.put(`/api/nilai360/${e._id}/activate`)));
      messageApi.success("Penilaian diaktifkan.");
      fetchEvaluations();
    } catch {
      messageApi.error("Gagal mengaktifkan penilaian.");
    }
  };

  // Send account modal
  const openSendAccount = (group) => {
    if (group.list.length) {
      setSelectedGroup({ ...group, evalId: group.list[0]._id });
      setIsModalVisible(true);
    } else {
      messageApi.error("Tidak ada evaluasi dalam grup.");
    }
  };
  const handleSendAccount = async () => {
    try {
      await messageApi.open({ type: "loading", content: "Mengirim akun...", duration: 2 });
      await axios.post(`/api/nilai360/${selectedGroup.evalId}/send-account`);
      await messageApi.success("Akun berhasil dikirim", 2);
      setIsModalVisible(false);
      fetchEvaluations();
    } catch {
      messageApi.error("Gagal mengirim akun.");
    }
  };

  return (
    <div className="container">
      {contextHolder}
      <div style={{ padding: 20 }}>
        <Breadcrumb style={{ marginBottom: 20 }}>
          <Breadcrumb.Item href="/dashboard">
            <HomeOutlined /> Beranda
          </Breadcrumb.Item>
          <Breadcrumb.Item>Daftar Penilai</Breadcrumb.Item>
        </Breadcrumb>

        <Input.Search placeholder="Cari penilai" allowClear value={searchTerm} onSearch={setSearchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ marginBottom: 16, width: 300 }} />

        {loading ? (
          <Spin style={{ display: "block", margin: "40px auto" }} />
        ) : (
          filteredKeys.map((key) => {
            const grp = grouped[key];
            const deact = grp.list.every((e) => !e.active);
            return (
              <Card
                key={key}
                title={`Penilai: ${grp.evaluator.username}`}
                className="custom-card"
                extra={
                  deact ? (
                    <Popconfirm title="Aktifkan semua evaluasi?" onConfirm={() => handleGroupActivate(grp.list)}>
                      <Button type="primary">Aktifkan</Button>
                    </Popconfirm>
                  ) : (
                    <Popconfirm title="Nonaktifkan semua evaluasi?" onConfirm={() => handleGroupDeactivate(grp.list)}>
                      <Button danger type="primary">
                        Nonaktifkan
                      </Button>
                    </Popconfirm>
                  )
                }
                style={{ marginBottom: 16 }}
              >
                <List
                  bordered
                  dataSource={grp.list}
                  renderItem={(e, i) => {
                    const isDeleting = deletingIds.includes(e._id);
                    return (
                      <List.Item
                        style={{
                          transition: `transform ${ANIMATION_DURATION}ms ease, opacity ${ANIMATION_DURATION}ms ease, background-color ${ANIMATION_DURATION}ms ease`,
                          transform: deletingId === e._id ? "translateX(100%)" : "translateX(0)",
                          opacity: deletingId === e._id ? 0 : 1,
                          backgroundColor: deletingId === e._id ? "#ff4d4f" : "transparent",
                        }}
                        actions={[
                          <Popconfirm title="Hapus penilaian ini?" onConfirm={() => handleDeleteEval(e._id)} okText="Ya" cancelText="Tidak">
                            <Button type="text" icon={<DeleteOutlined />} />
                          </Popconfirm>,
                        ]}
                      >
                        {`${i + 1}. User: ${e.user.username} | Role: ${e.role} | Tanggal: ${new Date(e.tanggal).toLocaleString()}`}
                      </List.Item>
                    );
                  }}
                />
                {!deact && (
                  <Button type="default" style={{ marginTop: 12 }} onClick={() => openSendAccount(grp)}>
                    Kirim Akun
                  </Button>
                )}
              </Card>
            );
          })
        )}

        {/* Custom Modal for Send Account */}
        <Modal title="Konfirmasi Kirim Akun" open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null}>
          {selectedGroup && (
            <div>
              <p>Detail Evaluator:</p>
              <p>
                <strong>Username:</strong> {selectedGroup.evaluator.username}
              </p>
              <p>
                <strong>NIP:</strong> {selectedGroup.evaluator.nip}
              </p>
              <p>
                <strong>Email:</strong> {selectedGroup.evaluator.email}
              </p>
              <p>
                <strong>Role:</strong> {selectedGroup.evaluator.role}
              </p>
              <p>Pastikan data ini benar. Klik "Kirim" untuk mengirim akun ke penilai melalui email atau "Batalkan" untuk membatalkan.</p>
              <div className="modal-buttons">
                <Button onClick={() => setIsModalVisible(false)} className="cancel-button">
                  Batalkan
                </Button>
                <Button type="primary" onClick={handleSendAccount}>
                  Kirim
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default DaftarPenilai;
