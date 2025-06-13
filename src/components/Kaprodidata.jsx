import React, { useState, useEffect } from "react";
import { Card, Input, Modal, Breadcrumb, Button, Form, Select, message, Typography, Divider, Pagination } from "antd";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { ReloadOutlined, SearchOutlined, HomeOutlined, FormOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const DataKaprodi = () => {
  const [dataKaprodi, setDataKaprodi] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKaprodi, setSelectedKaprodi] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const navigate = useNavigate();

  // Hook message untuk notifikasi update
  const [messageApi, contextHolder] = message.useMessage();
  const msgKey = "updateMsg";

  // Fungsi untuk generate password
  const generatePassword = () => {
    const newPassword = uuidv4().replace(/-/g, "").slice(0, 15);
    form.setFieldsValue({ password: newPassword });
  };

  // Ambil data Kaprodi dari backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/kaprodi");
        setDataKaprodi(response.data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, []);

  // Filter data berdasarkan username atau email
  const filteredKaprodi = dataKaprodi.filter((kaprodi) => (kaprodi.username?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || (kaprodi.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()));

  // Pagination: ambil data untuk halaman saat ini
  const startIndex = (currentPage - 1) * pageSize;
  const currentKaprodi = filteredKaprodi.slice(startIndex, startIndex + pageSize);

  // Modal detail muncul saat tombol ditekan
  const showModal = (kaprodi) => {
    setSelectedKaprodi(kaprodi);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedKaprodi(null);
  };

  // Buka modal update dan isi nilai awal form, termasuk nip dan posisi
  const showUpdateModal = () => {
    form.setFieldsValue({
      nip: selectedKaprodi.nip,
      username: selectedKaprodi.username,
      email: selectedKaprodi.email,
      role: selectedKaprodi.role,
      password: selectedKaprodi.password,
      posisi: selectedKaprodi.posisi,
      prestasi: selectedKaprodi.prestasi && selectedKaprodi.prestasi.length > 0 ? selectedKaprodi.prestasi[0] : "",
    });
    setUpdateModalVisible(true);
  };

  const closeUpdateModal = () => {
    setUpdateModalVisible(false);
  };
  const handlePenilaian = () => {
    navigate("/TabelPenilaian");
  };
  // Fungsi update data Kaprodi menggunakan FormData (hanya mengirim field yang valid)
  const handleUpdate = async (values) => {
    try {
      const formData = new FormData();
      formData.append("nip", values.nip);
      formData.append("username", values.username);
      formData.append("email", values.email);
      formData.append("role", values.role);
      formData.append("password", values.password);
      formData.append("posisi", values.posisi);
      formData.append("prestasi", values.prestasi || "");

      messageApi.open({
        key: msgKey,
        type: "loading",
        content: "Loading...",
      });

      const response = await axios.put(`http://localhost:5000/api/users/${selectedKaprodi.nip}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const updatedUser = response.data.user || response.data;

      // Perbarui state dataKaprodi secara real-time
      setDataKaprodi((prev) => prev.map((k) => (k.nip === selectedKaprodi.nip ? updatedUser : k)));

      setTimeout(() => {
        messageApi.open({
          key: msgKey,
          type: "success",
          content: "Data berhasil diupdate!",
          duration: 2,
        });
      }, 1000);

      closeUpdateModal();
      closeModal();
    } catch (error) {
      console.error("Error updating data", error);
      messageApi.open({
        key: msgKey,
        type: "error",
        content: "Gagal mengupdate data Kaprodi",
        duration: 2,
      });
    }
  };

  // Handle perubahan pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div style={{ padding: 20 }}>
      {contextHolder}
      <div style={{ marginBottom: 20 }}>
        {/* Breadcrumb dan Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Breadcrumb>
            <Breadcrumb.Item href="/">
              <HomeOutlined /> Beranda
            </Breadcrumb.Item>
            <Breadcrumb.Item>Lihat akun Pegawai</Breadcrumb.Item>
            <Breadcrumb.Item>Data Kaprodi</Breadcrumb.Item>
          </Breadcrumb>
          <Title level={3} style={{ margin: 0, flex: 1, textAlign: "center" }}>
            Manajemen Data Kaprodi IT DEL
          </Title>
          <div style={{ width: 180 }} />
        </div>

        {/* Search di Kiri */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 36 }}>
              <Search
                placeholder="Cari berdasarkan username atau email"
                enterButton={<SearchOutlined />}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ width: 340 }}
              />
              <Button type="primary" icon={<FormOutlined />} style={{ backgroundColor: "#389e0d", borderColor: "#389e0d" }} onClick={handlePenilaian}>
                Lakukan Penilaian
              </Button>
            </div>
          </div>
      
      {/* Grid Layout untuk kartu Kaprodi */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(500px, 1fr))",
          gap: 20,
        }}
      >
        {currentKaprodi.map((kaprodi) => (
          <Card
            key={kaprodi.nip}
            style={{
              cursor: "default",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              borderRadius: 10,
              padding: 20,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "120px auto", rowGap: 8 }}>
              <Text strong>NIP</Text>
              <Text>: {kaprodi.nip}</Text>
              <Text strong>Username</Text>
              <Text>: {kaprodi.username}</Text>
              <Text strong>Email</Text>
              <Text>: {kaprodi.email}</Text>
              <Text strong>Role</Text>
              <Text>: {kaprodi.role}</Text>
              <Text strong>Password</Text>
              <Text>: {kaprodi.password || "Tidak tersedia"}</Text>
              {kaprodi.posisi && (
                <>
                  <Text strong>Posisi</Text>
                  <Text>: {kaprodi.posisi}</Text>
                </>
              )}
            </div>
            <Button type="primary" style={{ marginTop: 10, marginRight: 10 }} onClick={() => showModal(kaprodi)}>
              Lihat Detail
            </Button>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <Pagination current={currentPage} pageSize={pageSize} total={filteredKaprodi.length} onChange={handlePageChange} />
      </div>

      {/* Modal Detail Kaprodi */}
      <Modal title="Detail Kaprodi" open={modalVisible} onCancel={closeModal} footer={null} centered>
        {selectedKaprodi && (
          <Card style={{ borderRadius: 10, boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
            <Title level={4} style={{ marginBottom: 10 }}>
              Informasi Kaprodi
            </Title>
            <Divider />
            <div style={{ display: "grid", gridTemplateColumns: "120px auto", rowGap: 8 }}>
              <Text strong>NIP</Text>
              <Text>: {selectedKaprodi.nip}</Text>
              <Text strong>Username</Text>
              <Text>: {selectedKaprodi.username}</Text>
              <Text strong>Email</Text>
              <Text>: {selectedKaprodi.email}</Text>
              <Text strong>Role</Text>
              <Text>: {selectedKaprodi.role}</Text>
              <Text strong>Password</Text>
              <Text>: {selectedKaprodi.password || "Tidak tersedia"}</Text>
              <Text strong>Posisi</Text>
              <Text>: {selectedKaprodi.posisi}</Text>
            </div>
            <Divider />
            <Text strong>Prestasi:</Text>
            {selectedKaprodi.prestasi && selectedKaprodi.prestasi.length > 0 ? (
              <ul style={{ paddingLeft: 20 }}>
                {selectedKaprodi.prestasi.map((p, index) => (
                  <li key={index}>{p}</li>
                ))}
              </ul>
            ) : (
              <Text type="secondary">Tidak ada prestasi</Text>
            )}
            <Divider />
            <Button type="primary" onClick={showUpdateModal} style={{ marginTop: 10, width: "100%" }}>
              Update Data
            </Button>
          </Card>
        )}
      </Modal>

      {/* Modal Update Data Kaprodi */}
      <Modal title="Update Data Kaprodi" open={updateModalVisible} onCancel={closeUpdateModal} footer={null}>
        <Form form={form} onFinish={handleUpdate} layout="vertical">
          <Form.Item name="nip" label="NIP" rules={[{ required: true, message: "NIP wajib diisi" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="username" label="Username" rules={[{ required: true, message: "Username wajib diisi" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Email tidak valid" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true, message: "Role wajib diisi" }]}>
            <Select>
              <Option value="Staff">Staff</Option>
              <Option value="dosen">Dosen</Option>
              <Option value="Mahasiswa">Mahasiswa</Option>
              <Option value="dekan">Dekan</Option>
              <Option value="kaprodi">Kaprodi</Option>
            </Select>
          </Form.Item>
          <Form.Item name="posisi" label="Posisi" rules={[{ required: true, message: "Posisi wajib diisi" }]}>
            <Input />
          </Form.Item>

          <Form.Item name="password" label="Password" rules={[{ required: true, message: "Password harus diisi" }]}>
            <Input suffix={<Button type="text" icon={<ReloadOutlined />} onClick={generatePassword} title="Generate Password" />} />
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Simpan Perubahan
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default DataKaprodi;
