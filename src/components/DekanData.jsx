import React, { useState, useEffect } from "react";
import { Card, Input, Modal, Button, Form, Select, message, Typography, Divider, Pagination, Breadcrumb } from "antd";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { ReloadOutlined, SearchOutlined, HomeOutlined, FormOutlined } from "@ant-design/icons"; // Impor icon
import { useNavigate } from "react-router-dom";

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const DataDekan = () => {
  const [dataDekan, setDataDekan] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDekan, setSelectedDekan] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const navigate = useNavigate();

  // Message hook untuk notifikasi
  const [messageApi, contextHolder] = message.useMessage();
  const msgKey = "updateMsg";

  // Fungsi generate password
  const generatePassword = () => {
    const newPassword = uuidv4().replace(/-/g, "").slice(0, 15);
    form.setFieldsValue({ password: newPassword });
  };

  // Ambil data Dekan dari backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/dekan");
        setDataDekan(response.data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, []);

  // Filter data berdasarkan username atau email
  const filteredDekan = dataDekan.filter((dekan) => (dekan.username?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || (dekan.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()));

  // Pagination: ambil data untuk halaman saat ini
  const startIndex = (currentPage - 1) * pageSize;
  const currentDekan = filteredDekan.slice(startIndex, startIndex + pageSize);

  // Modal detail muncul ketika tombol ditekan
  const showModal = (dekan) => {
    setSelectedDekan(dekan);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDekan(null);
  };

  // Buka modal update dan isi nilai awal form (tanpa unit_kerja, prestasi, dan bukti_prestasi)
  const showUpdateModal = () => {
    form.setFieldsValue({
      username: selectedDekan.username,
      email: selectedDekan.email,
      nip: selectedDekan.nip,
      role: selectedDekan.role,
      password: selectedDekan.password,
    });
    setUpdateModalVisible(true);
  };

  const closeUpdateModal = () => {
    setUpdateModalVisible(false);
  };

  const handlePenilaian = () => {
    navigate("/TabelPenilaian");
  };
  // Fungsi update data Dekan menggunakan FormData
  const handleUpdate = async (values) => {
    try {
      const formData = new FormData();
      formData.append("username", values.username);
      formData.append("nip", values.nip);
      formData.append("email", values.email);
      formData.append("role", values.role);
      formData.append("password", values.password);

      messageApi.open({
        key: msgKey,
        type: "loading",
        content: "Loading...",
      });

      const response = await axios.put(`http://localhost:5000/api/users/${selectedDekan.nip}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const updatedUser = response.data.user || response.data;

      // Perbarui state dataDekan secara real-time
      setDataDekan((prev) => prev.map((d) => (d.nip === selectedDekan.nip ? updatedUser : d)));

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
        content: "Gagal mengupdate data Dekan",
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
      <div style={{ marginBottom: 20 }}>
        {/* Breadcrumb dan Title */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Breadcrumb>
            <Breadcrumb.Item href="/dashboard">
              <HomeOutlined /> Beranda
            </Breadcrumb.Item>
            <Breadcrumb.Item>Lihat akun Pegawai</Breadcrumb.Item>
            <Breadcrumb.Item>Data Dekan</Breadcrumb.Item>
          </Breadcrumb>
          <Title level={3} style={{ margin: 0, flex: 1, textAlign: "center" }}>
            Manajemen Data Dekan
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

      {/* Grid Layout untuk kartu Dekan */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(500px, 1fr))",
          gap: 20,
        }}
      >
        {currentDekan.map((dekan) => (
          <Card
            key={dekan.nip}
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
            <div style={{ display: "grid", gridTemplateColumns: "130px auto", rowGap: 8 }}>
              <div>
                <strong>Nip</strong>
              </div>
              <div>: {dekan.nip}</div>
              <div>
                <strong>Username</strong>
              </div>
              <div>: {dekan.username}</div>
              <div>
                <strong>Email</strong>
              </div>
              <div>: {dekan.email}</div>
              <div>
                <strong>Role</strong>
              </div>
              <div>: {dekan.role}</div>
            </div>
            <Button type="primary" style={{ marginTop: 10, marginRight: 10 }} onClick={() => showModal(dekan)}>
              Update data
            </Button>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <Pagination current={currentPage} pageSize={pageSize} total={filteredDekan.length} onChange={handlePageChange} />
      </div>

      {/* Modal Detail Dekan */}
      <Modal title="Detail Dekan" open={modalVisible} onCancel={closeModal} footer={null} centered>
        {selectedDekan && (
          <Card style={{ borderRadius: 10, boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
            <Title level={4} style={{ marginBottom: 10 }}>
              Informasi Dekan
            </Title>
            <Divider />
            <div style={{ display: "grid", gridTemplateColumns: "120px auto", rowGap: 8 }}>
              <Text strong>NIP</Text>
              <Text>: {selectedDekan.nip}</Text>
              <Text strong>Username</Text>
              <Text>: {selectedDekan.username}</Text>
              <Text strong>Email</Text>
              <Text>: {selectedDekan.email}</Text>
              <Text strong>Role</Text>
              <Text>: {selectedDekan.role}</Text>
              <Text strong>Password</Text>
              <Text>: {selectedDekan.password || "Tidak tersedia"}</Text>
              {selectedDekan.posisi && (
                <>
                  <Text strong>Posisi</Text>
                  <Text>: {selectedDekan.posisi}</Text>
                </>
              )}
            </div>
            <Divider />
            <Text strong>Prestasi:</Text>
            {selectedDekan.prestasi && selectedDekan.prestasi.length > 0 ? (
              <ul style={{ paddingLeft: 20 }}>
                {selectedDekan.prestasi.map((p, index) => (
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

      {/* Modal Update Data Dekan */}
      <Modal title="Update Data Dekan" open={updateModalVisible} onCancel={closeUpdateModal} footer={null}>
        <Form form={form} onFinish={handleUpdate} layout="vertical">
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
          <Form.Item name="password" label="Password" rules={[{ required: true, message: "Password harus diisi" }]}>
            <Input suffix={<Button type="text" icon={<ReloadOutlined />} onClick={generatePassword} title="Generate Password" />} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Simpan Perubahan
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DataDekan;
