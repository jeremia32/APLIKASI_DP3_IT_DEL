import React, { useState } from "react";
import { Form, Input, Select, Button, Modal, Card, message, Breadcrumb } from "antd";
import axios from "axios";
import "../Styles/userform.css";

const { Option } = Select;

const UserCreateForm = () => {
  const [form] = Form.useForm();
  const [showConfirm, setShowConfirm] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOpenConfirm = async () => {
    try {
      await form.validateFields();
      setShowConfirm(true);
    } catch (error) {
      message.error("Mohon lengkapi semua field yang diperlukan!");
    }
  };


  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/users/register", values);
      setUserData(response.data);
      message.success("User berhasil didaftarkan!");
      form.resetFields();
      setShowConfirm(false);
    } catch (error) {
      message.error("Terjadi kesalahan: " + (error.response?.data.message || "Gagal mendaftar"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="breadcrumb-container">
        <Breadcrumb>
          <Breadcrumb.Item href="/dashboard">Home</Breadcrumb.Item>
          <Breadcrumb.Item href="/users">Users</Breadcrumb.Item>
          <Breadcrumb.Item>Buat User</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="form-container">
        <h2 className="title">Buat User Baru</h2>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="nip" label="NIP" rules={[{ required: true, message: "NIP harus diisi!" }]}>
            <Input />
          </Form.Item>

          <Form.Item name="username" label="Username" rules={[{ required: true, message: "Username harus diisi!" }]}>
            <Input />
          </Form.Item>

          <Form.Item name="role" label="Role" rules={[{ required: true, message: "Pilih role!" }]}>
            <Select>
              {["Staff", "dosen", "Mahasiswa", "dekan", "kaprodi"].map((role) => (
                <Option key={role} value={role}>
                  {role}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="posisi" label="Posisi">
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Email harus valid!" }]}>
            <Input />
          </Form.Item>

          {/* Form prestasi tidak ditampilkan sesuai permintaan */}

          <Button type="primary" className="submit-btn" onClick={handleOpenConfirm}>
            Daftar
          </Button>
        </Form>

        <Modal title="Konfirmasi" open={showConfirm} onCancel={() => setShowConfirm(false)} footer={null}>
          <p>Apakah Anda yakin ingin mendaftarkan user ini?</p>
          <div className="modal-buttons">
            <Button type="primary" loading={loading} onClick={() => form.submit()}>
              Yakin
            </Button>
            <Button onClick={() => setShowConfirm(false)}>Tidak</Button>
          </div>
        </Modal>

        {userData && (
          <Card className="success-card">
            <p>
              <strong>Pesan:</strong> {userData.message || "Berhasil"}
            </p>
            <p>
              <strong>User ID:</strong> {userData.userId}
            </p>
            <p>
              <strong>Username:</strong> {userData.username}
            </p>
            <p>
              <strong>Email:</strong> {userData.email}
            </p>
            <p>
              <strong>Password:</strong> {userData.password}
            </p>
            {/* Untuk alasan keamanan, password tidak ditampilkan */}
            <Button type="primary" onClick={() => setUserData(null)}>
              Oke
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserCreateForm;
