import React, { useEffect, useState } from "react";
import { Layout, Breadcrumb, Table, Button, Modal, Form, Input, Select, Space, message, Row, Col, Pagination, Tag, Tooltip } from "antd";
import { SearchOutlined, PlusOutlined, HomeOutlined, EditOutlined, DeleteOutlined, PoweroffOutlined } from "@ant-design/icons";
import axios from "axios";

const { Content } = Layout;
const { Option } = Select;

const AspekComponent = () => {
  const [aspek, setAspek] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAspek, setEditingAspek] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0,
  });

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [updateSuccessModalVisible, setUpdateSuccessModalVisible] = useState(false);
  const [deleteSuccessModalVisible, setDeleteSuccessModalVisible] = useState(false);

  useEffect(() => {
    fetchAspek();
    fetchKategori();
  }, []);

  useEffect(() => {
    fetchAspek();
  }, [searchText]);

  const fetchAspek = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/aspek");
      let data = response.data;
      if (searchText) {
        data = data.filter((item) => item.nama.toLowerCase().includes(searchText.toLowerCase()));
      }
      setAspek(data);
      setPagination((prev) => ({ ...prev, total: data.length }));
    } catch (error) {
      message.error("Gagal mengambil data aspek");
    }
    setLoading(false);
  };

  const fetchKategori = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/kategori");
      const activeKategori = response.data.filter((kategori) => kategori.isActive);
      setKategoriList(activeKategori);
    } catch (error) {
      message.error("Gagal mengambil data kategori");
    }
  };

  const handleFormSubmit = async (values) => {
    try {
      if (editingAspek) {
        await axios.put(`http://localhost:5000/api/aspek/${editingAspek._id}`, values);
        message.success("Aspek berhasil diperbarui");
        setUpdateSuccessModalVisible(true);
      } else {
        await axios.post("http://localhost:5000/api/aspek", values);
        message.success("Aspek berhasil ditambahkan");
        setSuccessModalVisible(true);
      }
      closeModal();
      fetchAspek();
    } catch (error) {
      message.error("Terjadi kesalahan saat menyimpan data");
    }
  };

  const showDeleteModal = (id) => {
    setSelectedIdToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    setConfirmLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/aspek/${selectedIdToDelete}`);
      message.success("Aspek berhasil dihapus");
      setDeleteSuccessModalVisible(true);
      fetchAspek();
    } catch (error) {
      message.error("Gagal menghapus aspek");
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

  const toggleStatus = async (record) => {
    try {
      await axios.patch(`http://localhost:5000/api/aspek/${record._id}/status`, {
        isActive: !record.isActive,
      });
      message.success("Status aspek berhasil diubah");
      fetchAspek();
    } catch (error) {
      message.error("Gagal mengubah status aspek");
    }
  };

  const openModal = (record = null) => {
    setEditingAspek(record);
    setModalVisible(true);
    if (record) {
      form.setFieldsValue({
        nama: record.nama,
        deskripsi: record.deskripsi,
        kategori: record.kategori?._id,
        isActive: record.isActive,
      });
    } else {
      form.resetFields();
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingAspek(null);
    form.resetFields();
  };

  const handleTableChange = (pag) => {
    setPagination(pag);
  };

  const columns = [
    {
      title: "Nama",
      dataIndex: "nama",
      key: "nama",
      sorter: (a, b) => a.nama.localeCompare(b.nama),
    },
    {
      title: "Kategori",
      dataIndex: "kategori",
      key: "kategori",
      render: (kategori) => (kategori ? kategori.nama : "-"),
    },
    {
      title: "Deskripsi",
      dataIndex: "deskripsi",
      key: "deskripsi",
      ellipsis: true,
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Space>
          <Tag color={record.isActive ? "green" : "red"}>{record.isActive ? "Aktif" : "Nonaktif"}</Tag>
          <Tooltip title={record.isActive ? "Nonaktifkan" : "Aktifkan"}>
            <Button type="link" icon={<PoweroffOutlined />} onClick={() => toggleStatus(record)} />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit Aspek">
            <Button type="link" icon={<EditOutlined />} onClick={() => openModal(record)} />
          </Tooltip>
          <Tooltip title="Hapus Aspek">
            <Button type="link" danger icon={<DeleteOutlined />} onClick={() => showDeleteModal(record._id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const startData = (pagination.current - 1) * pagination.pageSize + 1;
  const endData = Math.min(pagination.current * pagination.pageSize, pagination.total);
  const displayedData = aspek.slice(startData - 1, endData);

  return (
    <Layout style={{ minHeight: "100vh", padding: "20px" }}>
      <Breadcrumb style={{ marginBottom: "20px" }}>
        <Breadcrumb.Item>
          <a href="/dashboard">
            <HomeOutlined style={{ marginRight: 5 }} />
            Dashboard
          </a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Aspek</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h2>Manajemen Aspek</h2>
      </div>

      <Content>
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              Tambah Aspek
            </Button>
          </Col>
          <Input.Search
            placeholder="Cari aspek berdasarkan nama..."
            allowClear
            enterButton={<SearchOutlined />}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPagination((prev) => ({ ...prev, current: 1 }));
            }}
            style={{ width: 300 }}
          />
        </Row>

        <Table
          columns={columns}
          dataSource={displayedData}
          loading={loading}
          rowKey="_id"
          pagination={false}
          onRow={(record) => ({
            style: { cursor: "pointer" },
            onMouseEnter: (e) => (e.currentTarget.style.backgroundColor = "#fafafa"),
            onMouseLeave: (e) => (e.currentTarget.style.backgroundColor = "white"),
          })}
        />

        <Row justify="space-between" align="middle" style={{ marginTop: 16 }}>
          <Col>{pagination.total > 0 ? `Menampilkan ${startData} - ${endData} data dari total ${pagination.total} data` : "Tidak ada data yang ditampilkan."}</Col>
          <Col>
            <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} onChange={(page, pageSize) => handleTableChange({ current: page, pageSize })} />
          </Col>
        </Row>
      </Content>

      {/* Form Modal */}
      <Modal title={editingAspek ? "Edit Aspek" : "Tambah Aspek"} open={modalVisible} onCancel={closeModal} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item name="nama" label="Nama Aspek" rules={[{ required: true, message: "Nama aspek wajib diisi" }]}>
            <Input placeholder="Masukkan nama aspek" />
          </Form.Item>
          <Form.Item name="deskripsi" label="Deskripsi">
            <Input.TextArea placeholder="Masukkan deskripsi" rows={3} />
          </Form.Item>
          <Form.Item name="kategori" label="Kategori" rules={[{ required: true, message: "Pilih kategori" }]}>
            <Select placeholder="Pilih kategori">
              {kategoriList.map((kategori) => (
                <Option key={kategori._id} value={kategori._id}>
                  {kategori.nama}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="isActive" label="Status" initialValue={true}>
            <Select>
              <Option value={true}>Aktif</Option>
              <Option value={false}>Nonaktif</Option>
            </Select>
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={closeModal}>Batalkan</Button>
            <Button type="primary" htmlType="submit" style={{ marginLeft: 8 }}>
              Kirim
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal title="Konfirmasi Penghapusan" open={deleteModalVisible} onCancel={handleDeleteCancel} footer={null} destroyOnClose>
        <p>Apakah kamu yakin ingin menghapus aspek ini?</p>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
          <Button onClick={handleDeleteCancel}>Batal</Button>
          <Button type="primary" danger loading={confirmLoading} onClick={handleDeleteConfirm} style={{ marginLeft: 8 }}>
            Hapus
          </Button>
        </div>
      </Modal>

      {/* Success Modals */}
      <Modal
        title="✅ Aspek Ditambahkan"
        open={successModalVisible}
        onCancel={() => setSuccessModalVisible(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setSuccessModalVisible(false)}>
            OK
          </Button>,
        ]}
      >
        <p>Aspek berhasil ditambahkan.</p>
      </Modal>

      <Modal
        title="✅ Aspek Diperbarui"
        open={updateSuccessModalVisible}
        onCancel={() => setUpdateSuccessModalVisible(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setUpdateSuccessModalVisible(false)}>
            OK
          </Button>,
        ]}
      >
        <p>Aspek berhasil diperbarui.</p>
      </Modal>

      <Modal
        title="✅ Aspek Dihapus"
        open={deleteSuccessModalVisible}
        onCancel={() => setDeleteSuccessModalVisible(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setDeleteSuccessModalVisible(false)}>
            OK
          </Button>,
        ]}
      >
        <p>Aspek berhasil dihapus.</p>
      </Modal>
    </Layout>
  );
};

export default AspekComponent;
