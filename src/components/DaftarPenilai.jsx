import React, { useState, useEffect } from "react";
import { List, Breadcrumb, Spin, Button, message, Card, Input, Modal, Popconfirm } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Styles/DaftarPenilai.css";

const DaftarPenilai = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  // Fungsi untuk mengambil data evaluasi dari backend
  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      // Pastikan endpoint mengembalikan data evaluasi dengan field penilai dan user yang sudah dipopulate
      const response = await axios.get("http://localhost:5000/api/nilai360");
      setEvaluations(response.data);
    } catch (error) {
      console.error("Error fetching evaluations:", error);
      messageApi.error("Gagal mengambil data evaluasi.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  // Grouping evaluations berdasarkan evaluator (misalnya, evaluator ada di penilai[0])
  const groupedEvaluations = evaluations.reduce((acc, evalRecord) => {
    if (evalRecord.penilai && evalRecord.penilai.length > 0) {
      const evaluatorId = evalRecord.penilai[0]._id;
      if (!acc[evaluatorId]) {
        acc[evaluatorId] = { evaluator: evalRecord.penilai[0], evaluations: [] };
      }
      acc[evaluatorId].evaluations.push(evalRecord);
    }
    return acc;
  }, {});

  // Fitur search: filter berdasarkan evaluator.username
  const filteredGroupKeys = Object.keys(groupedEvaluations).filter((key) => groupedEvaluations[key].evaluator.username.toLowerCase().includes(searchTerm.toLowerCase()));

  // Fungsi untuk nonaktifkan evaluasi dalam satu grup
  const handleGroupDeactivate = async (groupEvaluations) => {
    try {
      await Promise.all(groupEvaluations.map((evalRecord) => axios.put(`http://localhost:5000/api/nilai360/${evalRecord._id}/deactivate`)));
      messageApi.success("Penilaian berhasil dinonaktifkan.");
      fetchEvaluations();
    } catch (error) {
      console.error("Error deactivating evaluations:", error);
      messageApi.error("Gagal menonaktifkan penilaian.");
    }
  };

  // Fungsi untuk mengaktifkan evaluasi dalam satu grup
  const handleGroupActivate = async (groupEvaluations) => {
    try {
      await Promise.all(groupEvaluations.map((evalRecord) => axios.put(`http://localhost:5000/api/nilai360/${evalRecord._id}/activate`)));
      messageApi.success("Penilaian berhasil diaktifkan.");
      fetchEvaluations();
    } catch (error) {
      console.error("Error activating evaluations:", error);
      messageApi.error("Gagal mengaktifkan penilaian.");
    }
  };

  // Buka modal untuk menampilkan detail evaluator dan konfirmasi pengiriman akun
  // Di sini kita menetapkan evaluationId (misalnya, gunakan evaluasi pertama dari grup)
  const openSendAccountModal = (group) => {
    if (group.evaluations.length > 0) {
      setSelectedGroup({ ...group, evaluationId: group.evaluations[0]._id });
      setIsModalVisible(true);
    } else {
      messageApi.error("Tidak ada evaluasi dalam grup ini.");
    }
  };

  // Fungsi untuk mengirim akun melalui modal dengan sequential messages
  const handleSendAccount = async () => {
    if (!selectedGroup || !selectedGroup.evaluationId) {
      messageApi.error("Data evaluasi tidak lengkap.");
      return;
    }
    try {
      // Tampilkan pesan loading terlebih dahulu
      await new Promise((resolve) => {
        messageApi.open({
          type: "loading",
          content: "Mengirim akun...",
          duration: 2.5,
          onClose: resolve,
        });
      });
      // Panggil endpoint pengiriman akun
      await axios.post(`http://localhost:5000/api/nilai360/${selectedGroup.evaluationId}/send-account`);
      // Setelah itu, tampilkan pesan sukses secara berurutan
      await new Promise((resolve) => {
        messageApi.success("Akun berhasil dikirim.", 2.5, resolve);
      });
      setIsModalVisible(false);
      setSelectedGroup(null);
      fetchEvaluations();
    } catch (error) {
      console.error("Error sending account:", error);
      messageApi.error("Gagal mengirim akun.");
    }
  };

  return (
    <div className="container">
      {contextHolder}
      <div style={{ padding: "20px" }}>
        <Breadcrumb style={{ marginBottom: "20px" }}>
          <Breadcrumb.Item>
            <a href="/dashboard">
              <HomeOutlined style={{ marginRight: "5px" }} />
              Dashboard
            </a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Daftar Penilai</Breadcrumb.Item>
        </Breadcrumb>

        <h2 className="title">Manajemen Status User</h2>
        <h2 className="subtitle">Daftar Penilai</h2>

        <Input.Search placeholder="Cari penilai berdasarkan username" allowClear onSearch={(value) => setSearchTerm(value)} onChange={(e) => setSearchTerm(e.target.value)} className="search-box" />

        {loading ? (
          <Spin size="large" className="loading-spinner" />
        ) : (
          filteredGroupKeys.map((groupKey) => {
            const group = groupedEvaluations[groupKey];
            const groupDeactivated = group.evaluations.every((evalRec) => !evalRec.active);
            return (
              <Card
                key={groupKey}
                title={`Penilai: ${group.evaluator.username}`}
                className="custom-card"
                extra={
                  groupDeactivated ? (
                    <Popconfirm title="Aktifkan penilaian untuk grup ini?" onConfirm={() => handleGroupActivate(group.evaluations)} okText="Ya" cancelText="Tidak">
                      <Button type="primary">Aktifkan Penilaian</Button>
                    </Popconfirm>
                  ) : (
                    <Popconfirm title="Nonaktifkan penilaian untuk grup ini?" onConfirm={() => handleGroupDeactivate(group.evaluations)} okText="Ya" cancelText="Tidak">
                      <Button type="primary" danger>
                        Nonaktifkan Penilaian
                      </Button>
                    </Popconfirm>
                  )
                }
              >
                <List
                  header={<div className="list-header">User yang Dinilai:</div>}
                  bordered
                  dataSource={group.evaluations}
                  renderItem={(evalRecord, index) => (
                    <List.Item>{`${index + 1}. User: ${evalRecord.user.username} (${evalRecord.user.role}) | NIP: ${evalRecord.user.nip} | Email: ${evalRecord.user.email} | Role Evaluasi: ${evalRecord.role}`}</List.Item>
                  )}
                />
                {!groupDeactivated && (
                  <div className="send-button-container">
                    <Button type="default" onClick={() => openSendAccountModal(group)}>
                      Kirim Akun
                    </Button>
                  </div>
                )}
              </Card>
            );
          })
        )}

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
