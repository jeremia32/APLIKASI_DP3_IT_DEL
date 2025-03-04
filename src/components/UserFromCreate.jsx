import React, { useState } from "react";
import { Form, Input, Select, Button, Modal, Card, message, Breadcrumb } from "antd";
import axios from "axios";
import "../Styles/userform.css"; // Styling khusus halaman profil
const { Option } = Select;

const UserCreateForm = () => {
  const [form] = Form.useForm();
  const [showConfirm, setShowConfirm] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

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
      {/* Breadcrumb di luar container utama */}
      <div className="breadcrumb-container">
        <Breadcrumb>
          <Breadcrumb.Item href="/dashboard">Home</Breadcrumb.Item>
          <Breadcrumb.Item href="/users">Users</Breadcrumb.Item>
          <Breadcrumb.Item>Buat User</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="form-container">
        <h2 className="title">Buat User Baru</h2>

        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ password: (Math.random() + 1).toString(36).slice(2, 10) }}>
          <Form.Item name="nip" label="NIP" rules={[{ required: true, message: "NIP harus diisi!" }]}>
            <Input />
          </Form.Item>

          <Form.Item name="username" label="Username" rules={[{ required: true, message: "Username harus diisi!" }]}>
            <Input />
          </Form.Item>

          <Form.Item name="role" label="Role" rules={[{ required: true, message: "Pilih role!" }]}>
            <Select>
              {["staff", "dosen", "mahasiswa", "pegawai"].map((role) => (
                <Option key={role} value={role}>
                  {role}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="grup" label="Grup">
            <Input />
          </Form.Item>

          <Form.Item name="posisi" label="Posisi">
            <Input />
          </Form.Item>

          <Form.Item name="jabatan" label="Jabatan">
            <Input />
          </Form.Item>

          <Form.Item name="unit_kerja" label="Unit Kerja" rules={[{ required: true, message: "Pilih unit kerja!" }]}>
            <Select>
              {["IT DEL", "Yayasan Cabang", "Yayasan Pusat"].map((unit) => (
                <Option key={unit} value={unit}>
                  {unit}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Status" rules={[{ required: true, message: "Pilih status!" }]}>
            <Select>
              {["aktif", "non-aktif", "TSDP", "Meninggal"].map((status) => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="jenis_kelamin" label="Jenis Kelamin" rules={[{ required: true, message: "Pilih jenis kelamin!" }]}>
            <Select>
              {["laki-laki", "perempuan"].map((jk) => (
                <Option key={jk} value={jk}>
                  {jk}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true, message: "Email harus diisi!", type: "email" }]}>
            <Input />
          </Form.Item>

          <Form.Item name="password" label="Password (Auto-generated)">
            <Input readOnly />
          </Form.Item>

          <Button type="primary" className="submit-btn" onClick={() => setShowConfirm(true)}>
            Daftar
          </Button>
        </Form>

        {/* Modal Konfirmasi */}
        <Modal title="Konfirmasi" open={showConfirm} onCancel={() => setShowConfirm(false)} footer={null}>
          <p>Apakah Anda yakin ingin mendaftarkan user ini?</p>
          <div className="modal-buttons">
            <Button type="primary" loading={loading} onClick={() => form.submit()}>
              Yakin
            </Button>
            <Button onClick={() => setShowConfirm(false)}>Tidak</Button>
          </div>
        </Modal>

        {/* Output Sukses */}
        {userData && (
          <Card className="success-card">
            <p>
              <strong>Pesan:</strong> {userData.message}
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
