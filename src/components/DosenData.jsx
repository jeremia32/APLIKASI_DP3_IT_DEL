import React, { useState, useEffect } from "react";
import { Card, Input, Modal, Button, Form, Select } from "antd";
import axios from "axios";

const { Search } = Input;
const { Option } = Select;

const DataDosen = () => {
  const [dataDosen, setDataDosen] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDosen, setSelectedDosen] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/dosen");
        setDataDosen(response.data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, []);

  const filteredDosen = dataDosen.filter((dosen) => dosen.username.toLowerCase().includes(searchTerm.toLowerCase()) || dosen.email.toLowerCase().includes(searchTerm.toLowerCase()));

  const showModal = (dosen) => {
    setSelectedDosen(dosen);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDosen(null);
  };

  const showUpdateModal = () => {
    form.setFieldsValue(selectedDosen);
    setUpdateModalVisible(true);
  };

  const closeUpdateModal = () => {
    setUpdateModalVisible(false);
  };

  const handleUpdate = async (values) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${selectedDosen.nip}`, values);
      setDataDosen((prev) => prev.map((d) => (d.nip === selectedDosen.nip ? { ...d, ...values } : d)));
      closeUpdateModal();
      closeModal();
    } catch (error) {
      console.error("Error updating data", error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Search placeholder="Cari berdasarkan username atau email" onChange={(e) => setSearchTerm(e.target.value)} style={{ marginBottom: 20, width: 300 }} />
      <div>
        {filteredDosen.map((dosen) => (
          <Card key={dosen.nip} style={{ marginBottom: 10, cursor: "pointer" }} onClick={() => showModal(dosen)}>
            <p>
              <strong>Username:</strong> {dosen.username}
            </p>
            <p>
              <strong>Email:</strong> {dosen.email}
            </p>
            <p>
              <strong>Status:</strong> {dosen.status}
            </p>
          </Card>
        ))}
      </div>

      <Modal title="Detail Dosen" open={modalVisible} onCancel={closeModal} footer={null}>
        {selectedDosen && (
          <div>
            <p>
              <strong>NIP:</strong> {selectedDosen.nip}
            </p>
            <p>
              <strong>Username:</strong> {selectedDosen.username}
            </p>
            <p>
              <strong>Email:</strong> {selectedDosen.email}
            </p>
            <p>
              <strong>Role:</strong> {selectedDosen.role}
            </p>
            <p>
              <strong>Unit Kerja:</strong> {selectedDosen.unit_kerja}
            </p>
            <p>
              <strong>Status:</strong> {selectedDosen.status}
            </p>
            <p>
              <strong>Jenis Kelamin:</strong> {selectedDosen.jenis_kelamin}
            </p>
            <p>
              <strong>Jabatan:</strong> {selectedDosen.jabatan}
            </p>
            <p>
              <strong>Posisi:</strong> {selectedDosen.posisi}
            </p>
            <Button type="primary" onClick={showUpdateModal} style={{ marginTop: 10 }}>
              Update Data
            </Button>
          </div>
        )}
      </Modal>

      <Modal title="Update Data Dosen" open={updateModalVisible} onCancel={closeUpdateModal} footer={null}>
        <Form form={form} onFinish={handleUpdate} layout="vertical">
          <Form.Item name="username" label="Username" rules={[{ required: true, message: "Masukkan username" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: "Masukkan email" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role">
            <Select>
              <Option value="dosen">Dosen</Option>
              <Option value="staff">Staff</Option>
              <Option value="mahasiswa">Mahasiswa</Option>
            </Select>
          </Form.Item>
          <Form.Item name="unit_kerja" label="Unit Kerja">
            <Select>
              <Option value="IT DEL">IT DEL</Option>
              <Option value="Yayasan Cabang">Yayasan Cabang</Option>
              <Option value="Yayasan Pusat">Yayasan Pusat</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select>
              <Option value="aktif">Aktif</Option>
              <Option value="non-aktif">Non-Aktif</Option>
              <Option value="TSDP">TSDP</Option>
            </Select>
          </Form.Item>
          <Form.Item name="jenis_kelamin" label="Jenis Kelamin">
            <Select>
              <Option value="laki-laki">Laki-laki</Option>
              <Option value="perempuan">Perempuan</Option>
            </Select>
          </Form.Item>
          <Form.Item name="jabatan" label="Jabatan">
            <Input />
          </Form.Item>
          <Form.Item name="posisi" label="Posisi">
            <Input />
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

export default DataDosen;
