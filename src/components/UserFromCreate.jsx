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

  // Validator async untuk cek unikitas nip, username, dan email
  const validateUnique = (field) => async (_, value) => {
    if (!value) return Promise.resolve();
    try {
      const res = await axios.get("http://localhost:5000/api/users/check-unique", {
        params: { field, value },
      });
      if (res.data.exists) {
        return Promise.reject(new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} sudah terdaftar`));
      }
      return Promise.resolve();
    } catch (err) {
      // jika error, biarkan lanjut dan tangani di submit
      return Promise.resolve();
    }
  };

  const handleOpenConfirm = async () => {
    try {
      await form.validateFields();
      setShowConfirm(true);
    } catch (error) {
      message.error("Mohon periksa kembali field yang diberi tanda merah");
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
      const status = error.response?.status;
      const msg = error.response?.data?.message || "Gagal mendaftar";
      if (status === 409) {
        Modal.error({ title: "Duplikat Data", content: msg });
      } else {
        message.error(`Terjadi kesalahan: ${msg}`);
      }
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
        <h3
          style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#2c3e50",
            marginBottom: "20px",
            textAlign: "center",
            textTransform: "capitalize",
          }}
        >
          Tambah Akun Staff Akademik / Non-Akademik
        </h3>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="nip" label="NIP" rules={[{ required: true, message: "NIP harus diisi!" }, { validator: validateUnique("nip") }]}>
            <Input placeholder="Masukkan NIP" />
          </Form.Item>

          <Form.Item name="username" label="Username" rules={[{ required: true, message: "Username harus diisi!" }, { validator: validateUnique("username") }]}>
            <Input placeholder="Masukkan Username" />
          </Form.Item>

          <Form.Item name="role" label="Role" rules={[{ required: true, message: "Pilih role!" }]}>
            <Select placeholder="Pilih Role">
              {["Staff", "dosen", "Mahasiswa", "dekan", "kaprodi"].map((role) => (
                <Option key={role} value={role}>
                  {role}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="posisi" label="Posisi">
            <Input placeholder="Masukkan Posisi" />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Email harus valid!" }, { validator: validateUnique("email") }]}>
            <Input placeholder="Masukkan Email" />
          </Form.Item>

          <Button type="primary" className="submit-btn" onClick={handleOpenConfirm}>
            Daftar
          </Button>
        </Form>

        <Modal title="Konfirmasi" visible={showConfirm} onCancel={() => setShowConfirm(false)} footer={null}>
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
              <strong>Passwod:</strong> {userData.password}
            </p>
            {/* Password tidak ditampilkan untuk keamanan */}
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
