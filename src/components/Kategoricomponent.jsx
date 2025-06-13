import React, { useEffect, useState } from "react";
import { Layout, Breadcrumb, Table, Button, Modal, Form, Input, Space, message, Row, Col, Pagination, Select, Tag, Tooltip } from "antd";
import { PlusOutlined, HomeOutlined, EditOutlined, DeleteOutlined, PoweroffOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";

const { Content } = Layout;

const roleOptions = [
  { label: "Staff", value: "Staff" },
  { label: "Dosen", value: "dosen" },
  { label: "Mahasiswa", value: "Mahasiswa" },
  { label: "Dekan", value: "dekan" },
  { label: "Kaprodi", value: "kaprodi" },
];

const KategoriComponent = () => {
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingKategori, setEditingKategori] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  const [pagination, setPagination] = useState({ current: 1, pageSize: 8, total: 0 });

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formValues, setFormValues] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  useEffect(() => {
    fetchKategori();
  }, [searchText]);

  const fetchKategori = async () => {
    setLoading(true);
    try {
      const url = currentUser && currentUser._id ? `http://localhost:5000/api/kategori/user/${currentUser._id}` : "http://localhost:5000/api/kategori";
      const response = await axios.get(url);
      let data = response.data;
      if (searchText) data = data.filter((item) => item.nama.toLowerCase().includes(searchText.toLowerCase()));
      setKategori(data);
      setPagination((prev) => ({ ...prev, total: data.length }));
    } catch {
      messageApi.open({ type: "error", content: "Gagal mengambil data kategori" });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (record = null) => {
    form.resetFields();
    if (form.clearFields) form.clearFields();
    setEditingKategori(record);
    setModalVisible(true);
    if (record) {
      form.setFieldsValue({
        nama: record.nama,
        deskripsi: record.deskripsi,
        roles: record.roles,
        periodePenilaian: record.periodePenilaian,
        isActive: record.isActive,
      });
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingKategori(null);
    form.resetFields();
    if (form.clearFields) form.clearFields();
  };

  const handleFormSubmit = async (values) => {
    Modal.confirm({
      title: editingKategori ? "Konfirmasi Perubahan" : "Konfirmasi Penambahan",
      content: editingKategori ? "Apakah Anda yakin ingin menyimpan perubahan pada kategori ini?" : "Apakah Anda yakin ingin menambahkan kategori baru?",
      okText: "yakin",
      cancelText: "Batal",

      onOk: async () => {
        try {
          if (editingKategori) {
            await axios.put(`http://localhost:5000/api/kategori/${editingKategori._id}`, values);
            messageApi.open({ type: "success", content: "Kategori berhasil diperbarui" });
          } else {
            await axios.post("http://localhost:5000/api/kategori", values);
            messageApi.open({ type: "success", content: "Kategori berhasil ditambahkan" });
          }
          closeModal();
          fetchKategori();
        } catch {
          messageApi.open({ type: "error", content: "Terjadi kesalahan saat menyimpan data" });
        }
      },
    });
  };
  const submitConfirmedForm = async () => {
    try {
      if (editingKategori) {
        await axios.put(`http://localhost:5000/api/kategori/${editingKategori._id}`, formValues);
        messageApi.open({ type: "success", content: "Berhasil update kategori!" });
      } else {
        await axios.post("http://localhost:5000/api/kategori", formValues);
        messageApi.open({ type: "success", content: "Berhasil menambahkan kategori!" });
      }
      closeModal();
      fetchKategori();
    } catch {
      messageApi.open({ type: "error", content: "Terjadi kesalahan saat menyimpan data Pastikan Data Di isi dan Karakter Lebih dari 4huruf" });
    } finally {
      setShowConfirmModal(false);
      setFormValues(null);
    }
  };

  const showDeleteModal = (id) => {
    setSelectedIdToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    setConfirmLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/kategori/${selectedIdToDelete}`);
      messageApi.open({ type: "success", content: "Kategori berhasil dihapus" });
      fetchKategori();
    } catch {
      messageApi.open({ type: "error", content: "Gagal menghapus kategori" });
    } finally {
      setConfirmLoading(false);
      setDeleteModalVisible(false);
      setSelectedIdToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setSelectedIdToDelete(null);
  };

  const handleToggleStatus = async (record) => {
    try {
      await axios.put(`http://localhost:5000/api/kategori/${record._id}`, { isActive: !record.isActive });
      setKategori((prev) => prev.map((item) => (item._id === record._id ? { ...item, isActive: !record.isActive } : item)));
      // message.success(`Kategori ${!record.isActive ? "diaktifkan" : "dinonaktifkan"}`);
      messageApi.open({ type: "success", content: `Kategori ${!record.isActive ? "diaktifkan" : "dinonaktifkan"}` });
    } catch {
      messageApi.open({ type: "error", content: "Gagal memperbarui status kategori" });
    }
  };

  const handleTableChange = (pag) => setPagination(pag);

  const columns = [
    { title: "Nama", dataIndex: "nama", key: "nama", sorter: (a, b) => a.nama.localeCompare(b.nama) },
    { title: "Deskripsi", dataIndex: "deskripsi", key: "deskripsi", ellipsis: true },
    { title: "Roles", dataIndex: "roles", key: "roles", render: (roles) => roles?.join(", ") || "-" },
    { title: "Periode Penilaian", dataIndex: "periodePenilaian", key: "periodePenilaian", sorter: (a, b) => a.periodePenilaian.localeCompare(b.periodePenilaian) },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Space>
          <Tag color={record.isActive ? "green" : "red"}>{record.isActive ? "Aktif" : "Nonaktif"}</Tag>
          <Tooltip title={record.isActive ? "Nonaktifkan" : "Aktifkan"}>
            <Button type="link" icon={<PoweroffOutlined />} onClick={() => handleToggleStatus(record)} />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit Kategori">
            <Button type="link" icon={<EditOutlined />} onClick={() => openModal(record)} />
          </Tooltip>
          <Tooltip title="Hapus Kategori">
            <Button type="link" danger icon={<DeleteOutlined />} onClick={() => showDeleteModal(record._id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const startData = (pagination.current - 1) * pagination.pageSize + 1;
  const endData = Math.min(pagination.current * pagination.pageSize, pagination.total);
  const displayedData = kategori.slice(startData - 1, endData);

  return (
    <Layout style={{ minHeight: "100vh", padding: 20 }}>
      {contextHolder}
      <Breadcrumb style={{ marginBottom: 20 }}>
        <Breadcrumb.Item>
          <a href="/dashboard">
            <HomeOutlined /> Beranda
          </a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Kategori</Breadcrumb.Item>
      </Breadcrumb>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>Kategori Penilaian </h2>
      <Content>
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              Tambah Kategori
            </Button>
          </Col>
          <Col>
            <Input.Search
              placeholder="Cari kategori..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={(value) => {
                setSearchText(value);
                setPagination({ ...pagination, current: 1 });
              }}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPagination({ ...pagination, current: 1 });
              }}
              style={{ width: 300 }}
            />
          </Col>
        </Row>
        <Table columns={columns} dataSource={displayedData} loading={loading} rowKey="_id" pagination={false} />
        <Row justify="space-between" align="middle" style={{ marginTop: 16 }}>
          <Col>{pagination.total > 0 ? `Menampilkan ${startData} - ${endData} dari ${pagination.total}` : "Tidak ada data."}</Col>
          <Col>
            <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} onChange={(page, pageSize) => handleTableChange({ current: page, pageSize })} />
          </Col>
        </Row>
      </Content>
      <Modal title={editingKategori ? "Edit Kategori" : "Tambah Kategori"} open={modalVisible} onCancel={closeModal} footer={null} destroyOnClose>
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            setFormValues(values); // Simpan data form
            setShowConfirmModal(true); // Tampilkan modal konfirmasi
          }}
        >
          <Modal title={editingKategori ? "Konfirmasi Perubahan" : "Konfirmasi Penambahan"} open={showConfirmModal} onCancel={() => setShowConfirmModal(false)} footer={null} destroyOnClose>
            <p>{editingKategori ? "Apakah Anda yakin ingin menyimpan perubahan pada kategori ini?" : "Apakah Anda yakin ingin menambahkan kategori baru?"}</p>
            <div style={{ textAlign: "right", marginTop: 24 }}>
              <Button onClick={() => setShowConfirmModal(false)}>Batal</Button>
              <Button type="primary" onClick={submitConfirmedForm} style={{ marginLeft: 8 }}>
                Yakin
              </Button>
            </div>
          </Modal>

          <Form.Item name="nama" label="Nama Kategori" rules={[{ required: true, message: "Nama kategori wajib diisi" }]}>
            <Input placeholder="Masukkan nama kategori" />
          </Form.Item>
          <Form.Item name="deskripsi" label="Deskripsi">
            <Input.TextArea rows={3} placeholder="Deskripsi..." />
          </Form.Item>
          <Form.Item name="roles" label="Roles" rules={[{ required: true, message: "Pilih minimal satu role" }]}>
            <Select mode="multiple" options={roleOptions} placeholder="Pilih role" />
          </Form.Item>
          <Form.Item
            name="periodePenilaian"
            label="Periode Penilaian"
            rules={[
              { required: true, message: "Periode penilaian wajib diisi" },
              { pattern: /^\d{4}\/\d{4}$/, message: "Format: YYYY/YYYY" },
            ]}
          >
            <Input placeholder="contoh: 2024/2025" />
          </Form.Item>
          <Form.Item name="isActive" label="Status" initialValue={true}>
            <Select>
              <Select.Option value={true}>Aktif</Select.Option>
              <Select.Option value={false}>Nonaktif</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space style={{ float: "right" }}>
              <Button onClick={closeModal}>Batal</Button>
              <Button type="primary" htmlType="submit">
                Simpan
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      <Modal title="Konfirmasi Penghapusan" open={deleteModalVisible} onCancel={handleDeleteCancel} footer={null} destroyOnClose>
        <p>Apakah Anda yakin ingin menghapus kategori ini?</p>
        <div style={{ textAlign: "right", marginTop: 24 }}>
          <Button onClick={handleDeleteCancel}>Batal</Button>
          <Button type="primary" danger loading={confirmLoading} onClick={handleDeleteConfirm} style={{ marginLeft: 8 }}>
            Hapus
          </Button>
        </div>
      </Modal>
    </Layout>
  );
};

export default KategoriComponent;
