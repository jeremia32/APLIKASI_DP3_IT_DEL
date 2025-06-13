import React, { useState } from "react";
import { Form, Input, Select, Button, Modal, Card, message, Breadcrumb } from "antd";
import axios from "axios";
import "../Styles/userform.css";
import { HomeOutlined } from "@ant-design/icons";

const { Option } = Select;

const posisiOptionsMap = {
  Staff: ["Keasramaan", "Kantin", "Satpam", "Duktek", "Tendik", "Maintenance", "Perpustakaan", "Kemahasiswaan"],
  dosen: ["Teaching Assistant[TA]", "Asisten Dosen", "Dosen Matkul", "Baak"],
  dekan: ["Fakultas Informatika & Teknik Elektro", "Fakultas Teknologi Industri", "Fakultas Bioteknologi", "Fakultas Vokasi"],
  kaprodi: [
    "Teknik Informatika (S1)",
    "Teknik Elektro (S1)",
    "Sistem Informasi (S1)",
    "Teknologi Rekayasa Perangkat Lunak (STR)",
    "Teknik Informatika (D3)",
    "Teknik Komputer (D3)",
    "Manajemen Rekayasa (S1)",
    "Teknik Bioproses (S1)",
    "Teknik Metalurgi (S1)",
  ],
};

const UserCreateForm = () => {
  const [form] = Form.useForm();
  const [showConfirm, setShowConfirm] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

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
          <Breadcrumb.Item href="/dashboard">
            <HomeOutlined /> Beranda
          </Breadcrumb.Item>
          <Breadcrumb.Item href="/users">Pengguna</Breadcrumb.Item>
          <Breadcrumb.Item>Buat Akun Pengguna</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="form-container">
        <h3 style={{ fontSize: 20, fontWeight: 600, color: "#2c3e50", marginBottom: 20, textAlign: "center", textTransform: "capitalize" }}>Tambah Akun Staff Akademik / Non-Akademik</h3>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="nip"
            label="NIP"
            rules={[
              { required: true, message: "NIP harus diisi!" },
              { min: 9, max: 10, message: "NIP harus terdiri dari 10 karakter!" },
              {
                pattern: /^\d{9,10}$/,
                message: "NIP harus terdiri dari 9 hingga 10 digit angka!",
              },
              { validator: validateUnique("nip") },
            ]}
          >
            <Input placeholder="Masukkan NIP (10 digit)" maxLength={10} />
          </Form.Item>

          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: "Username harus diisi!" },
              {
                validator: (_, value) => {
                  if (/\s/.test(value)) {
                    return Promise.reject(new Error("Username tidak boleh mengandung spasi"));
                  }
                  return Promise.resolve();
                },
              },
              { validator: validateUnique("username") },
            ]}
          >
            <Input placeholder="Masukkan Username (tanpa spasi)" />
          </Form.Item>

          <Form.Item name="role" label="Role" rules={[{ required: true, message: "Pilih role!" }]}>
            <Select placeholder="Pilih Role">
              <Select.OptGroup label="Staff Akademik">
                <Option value="dosen">Dosen</Option>
                <Option value="dekan">Dekan</Option>
                <Option value="kaprodi">Kaprodi</Option>
              </Select.OptGroup>
              <Select.OptGroup label="Staff Non Akademik">
                <Option value="Staff">Pegawai</Option>
              </Select.OptGroup>
            </Select>
          </Form.Item>

          {/* Dynamic Posisi based on Role */}
          <Form.Item noStyle dependencies={["role"]} shouldUpdate>
            {({ getFieldValue }) => {
              const role = getFieldValue("role");
              if (!role) return null;
              const options = posisiOptionsMap[role] || [];
              return (
                <Form.Item name="posisi" label="Posisi" rules={[{ required: true, message: "Posisi harus diisi!" }]}>
                  <Select placeholder="Pilih Posisi">
                    {options.map((opt) => (
                      <Option key={opt} value={opt}>
                        {opt}
                      </Option>
                    ))}
                    <Option value="Lainnya">Lainnya</Option>
                  </Select>
                </Form.Item>
              );
            }}
          </Form.Item>

          {/* Free text when 'Lainnya' selected */}
          <Form.Item noStyle dependencies={["posisi"]} shouldUpdate>
            {({ getFieldValue }) =>
              getFieldValue("posisi") === "Lainnya" ? (
                <Form.Item name="posisiLainnya" label="Posisi Lainnya" rules={[{ required: true, message: "Mohon isi posisi lainnya!" }]}>
                  <Input placeholder="Tuliskan posisi lain..." />
                </Form.Item>
              ) : null
            }
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
              <strong>Password:</strong> {userData.password}
            </p>
            <p>
              <strong>Email:</strong> {userData.email}
            </p>
            <p>
              <strong>Silahkan Lihat Akun Pegawai Untuk Mengupdate Data</strong>
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
