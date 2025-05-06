import React, { useEffect, useState } from "react";
import { Layout, Breadcrumb, Table, Button, Modal, Form, Input, Space, message, Row, Col, Pagination, Select, Tag, Tooltip } from "antd";
import { PlusOutlined, HomeOutlined, EditOutlined, DeleteOutlined, PoweroffOutlined,SearchOutlined } from "@ant-design/icons";
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

  // Konfigurasi pagination untuk tabel
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0,
  });

  // Asumsikan data user tersimpan di localStorage (misalnya setelah login)
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    fetchKategori();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const fetchKategori = async () => {
    setLoading(true);
    try {
      let response;
      // Jika ada data user, ambil kategori berdasarkan role user
      if (currentUser && currentUser._id) {
        response = await axios.get(`http://localhost:5000/api/kategori/user/${currentUser._id}`);
      } else {
        // Jika tidak, ambil semua kategori
        response = await axios.get("http://localhost:5000/api/kategori");
      }
      let data = response.data;
      // Filter kategori berdasarkan nama (jika ada search text)
      if (searchText) {
        data = data.filter((item) => item.nama.toLowerCase().includes(searchText.toLowerCase()));
      }
      setKategori(data);
      setPagination((prev) => ({ ...prev, total: data.length }));
    } catch (error) {
      message.error("Gagal mengambil data kategori");
    }
    setLoading(false);
  };

  const handleFormSubmit = async (values) => {
    try {
      if (editingKategori) {
        await axios.put(`http://localhost:5000/api/kategori/${editingKategori._id}`, values);
        message.success("Kategori berhasil diperbarui");
      } else {
        await axios.post("http://localhost:5000/api/kategori", values);
        message.success("Kategori berhasil ditambahkan");
      }
      closeModal();
      fetchKategori();
    } catch (error) {
      message.error("Terjadi kesalahan saat menyimpan data");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/kategori/${id}`);
      message.success("Kategori berhasil dihapus");
      fetchKategori();
    } catch (error) {
      message.error("Gagal menghapus kategori");
    }
  };

  const openModal = (record = null) => {
    setEditingKategori(record);
    setModalVisible(true);
    if (record) {
      form.setFieldsValue({
        nama: record.nama,
        deskripsi: record.deskripsi,
        roles: record.roles,
        isActive: record.isActive,
      });
    } else {
      form.resetFields();
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingKategori(null);
    form.resetFields();
  };

  // Fungsi untuk toggle status aktif/nonaktif kategori
  const handleToggleStatus = async (record) => {
    try {
      await axios.put(`http://localhost:5000/api/kategori/${record._id}`, {
        isActive: !record.isActive,
      });
      setKategori((prev) => prev.map((item) => (item._id === record._id ? { ...item, isActive: !record.isActive } : item)));
      message.success(`Kategori ${!record.isActive ? "diaktifkan" : "dinonaktifkan"}`);
    } catch (error) {
      message.error("Gagal memperbarui status kategori");
    }
  };

  // Mengatur pagination tabel secara manual
  const handleTableChange = (pag) => {
    setPagination(pag);
  };

  // Definisi kolom untuk tabel, termasuk kolom Roles dan Status
  const columns = [
    {
      title: "Nama",
      dataIndex: "nama",
      key: "nama",
      sorter: (a, b) => a.nama.localeCompare(b.nama),
    },
    {
      title: "Deskripsi",
      dataIndex: "deskripsi",
      key: "deskripsi",
      ellipsis: true,
    },
    {
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
      render: (roles) => (roles && roles.length ? roles.join(", ") : "-"),
    },
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
            <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Menghitung data yang ditampilkan pada halaman saat ini
  const startData = (pagination.current - 1) * pagination.pageSize + 1;
  const endData = Math.min(pagination.current * pagination.pageSize, pagination.total);
  // Data yang akan ditampilkan sesuai pagination
  const displayedData = kategori.slice(startData - 1, endData);

  return (
    <Layout style={{ minHeight: "100vh", padding: "20px" }}>
      <Breadcrumb style={{ marginBottom: "20px" }}>
        <Breadcrumb.Item>
          <a href="/dashboard">
            <HomeOutlined style={{ marginRight: "5px" }} />
            Dashboard
          </a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Kategori</Breadcrumb.Item>
      </Breadcrumb>
      <div style={{ textAlign: "center", marginBottom: "3px" }}>
        <h2>Manajemen Kategori</h2>
      </div>
      <Content>
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              Tambah Kategori
            </Button>
          </Col>
          <Col>
            <Input.Search
              placeholder="Cari kategori berdasarkan nama..."
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
              className="search-box"
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={displayedData}
          loading={loading}
          rowKey="_id"
          pagination={false}
          onRow={(record) => ({
            style: { cursor: "pointer" },
            onMouseEnter: (e) => {
              e.currentTarget.style.backgroundColor = "#fafafa";
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.backgroundColor = "white";
            },
          })}
        />

        <Row justify="space-between" align="middle" style={{ marginTop: 16 }}>
          <Col>{pagination.total > 0 ? `Menampilkan ${startData} - ${endData} data dari total ${pagination.total} data` : "Tidak ada data yang ditampilkan."}</Col>
          <Col>
            <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} onChange={(page, pageSize) => handleTableChange({ current: page, pageSize })} />
          </Col>
        </Row>
      </Content>

      <Modal title={editingKategori ? "Edit Kategori" : "Tambah Kategori"} open={modalVisible} onCancel={closeModal} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item name="nama" label="Nama Kategori" rules={[{ required: true, message: "Nama kategori wajib diisi" }]}>
            <Input placeholder="Masukkan nama kategori" />
          </Form.Item>
          <Form.Item name="deskripsi" label="Deskripsi">
            <Input.TextArea placeholder="Masukkan deskripsi" rows={3} />
          </Form.Item>
          <Form.Item name="roles" label="Roles" rules={[{ required: true, message: "Pilih minimal satu role" }]}>
            <Select mode="multiple" placeholder="Pilih role" options={roleOptions} />
          </Form.Item>
          <Form.Item name="isActive" label="Status" initialValue={true}>
            <Select>
              <Select.Option value={true}>Aktif</Select.Option>
              <Select.Option value={false}>Nonaktif</Select.Option>
            </Select>
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <Button onClick={closeModal}>Batalkan</Button>
            <Button type="primary" htmlType="submit" style={{ marginLeft: 8 }}>
              Kirim
            </Button>
          </div>
        </Form>
      </Modal>
    </Layout>
  );
};

export default KategoriComponent;
