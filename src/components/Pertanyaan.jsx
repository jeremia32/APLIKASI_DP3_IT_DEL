import React, { useEffect, useState } from "react";
import { Layout, Breadcrumb, Table, Button, Modal, Form, Input, Select, Space, message, Row, Col, Pagination, Tag, Tooltip } from "antd";
import { SearchOutlined, PlusOutlined, HomeOutlined, EditOutlined, DeleteOutlined, PoweroffOutlined } from "@ant-design/icons";
import axios from "axios";

const { Content } = Layout;
const { Option } = Select;

const PertanyaanPage = () => {
  const [pertanyaanData, setPertanyaanData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
  const [editingPertanyaan, setEditingPertanyaan] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  // Opsi untuk field referensi
  const [aspekOptions, setAspekOptions] = useState([]);
  const [rubrikOptions, setRubrikOptions] = useState([]);

  // Konfigurasi pagination untuk tabel
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchPertanyaan();
    fetchAspekOptions();
    fetchRubrikOptions();
  }, []);

  useEffect(() => {
    fetchPertanyaan();
  }, [searchText]);

  const fetchPertanyaan = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/pertanyaan");
      let data = res.data;
      if (searchText) {
        data = data.filter((item) => item.teks.toLowerCase().includes(searchText.toLowerCase()));
      }
      setPertanyaanData(data);
      setPagination((prev) => ({ ...prev, total: data.length }));
    } catch (error) {
      message.error("Gagal mengambil data pertanyaan");
      console.error(error);
    }
    setLoading(false);
  };

  const fetchAspekOptions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/aspek");
      const activeAspek = res.data.filter((aspek) => aspek.isActive); // Filter hanya aspek aktif
      setAspekOptions(activeAspek);
    } catch (error) {
      message.error("Gagal mengambil data aspek");
      console.error(error);
    }
  };

  const fetchRubrikOptions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/rubrik");
      setRubrikOptions(res.data);
    } catch (error) {
      message.error("Gagal mengambil data rubrik");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/pertanyaan/${id}`);
      message.success("Pertanyaan berhasil dihapus");
      fetchPertanyaan();
    } catch (error) {
      message.error("Gagal menghapus pertanyaan");
      console.error(error);
    }
  };

  const toggleStatus = async (record) => {
    try {
      await axios.patch(`http://localhost:5000/api/pertanyaan/${record._id}/status`, {
        isActive: !record.isActive,
      });
      message.success("Status pertanyaan berhasil diubah");
      fetchPertanyaan();
    } catch (error) {
      message.error("Gagal mengubah status pertanyaan");
      console.error(error);
    }
  };

  const openModal = (record = null) => {
    setEditingPertanyaan(record);
    setVisibleModal(true);
    if (record) {
      form.setFieldsValue({
        teks: record.teks,
        aspek: record.aspek?._id,
        bobot: record.bobot,
        rubrik: record.rubrik?.map((r) => r._id),
        isActive: record.isActive,
      });
    } else {
      form.resetFields();
    }
  };

  const closeModal = () => {
    setVisibleModal(false);
    setEditingPertanyaan(null);
    form.resetFields();
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      // Validasi: Pastikan rubrik tepat 7 item
      if (!values.rubrik || values.rubrik.length !== 7) {
        message.error("Setiap pertanyaan harus memiliki tepat 7 rubrik.");
        return;
      }
      if (editingPertanyaan) {
        await axios.put(`http://localhost:5000/api/pertanyaan/${editingPertanyaan._id}`, values);
        message.success("Pertanyaan berhasil diperbarui");
      } else {
        await axios.post("http://localhost:5000/api/pertanyaan", values);
        message.success("Pertanyaan berhasil ditambahkan");
      }
      closeModal();
      fetchPertanyaan();
    } catch (error) {
      message.error("Gagal menyimpan pertanyaan");
      console.error(error);
    }
  };

  const columns = [
    {
      title: "Teks Pertanyaan",
      dataIndex: "teks",
      key: "teks",
    },
    {
      title: "Aspek",
      dataIndex: "aspek",
      key: "aspek",
      render: (aspek) => (aspek ? aspek.nama : "-"),
    },
    {
      title: "Bobot",
      dataIndex: "bobot",
      key: "bobot",
    },
    {
      title: "Rubrik",
      dataIndex: "rubrik",
      key: "rubrik",
      render: (rubriks) => rubriks?.map((r) => `${r.label} (${r.skor})`).join(", "),
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
          <Tooltip title="Edit Pertanyaan">
            <Button type="link" icon={<EditOutlined />} onClick={() => openModal(record)} />
          </Tooltip>
          <Tooltip title="Hapus Pertanyaan">
            <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const startData = (pagination.current - 1) * pagination.pageSize + 1;
  const endData = Math.min(pagination.current * pagination.pageSize, pagination.total);
  const displayedData = pertanyaanData.slice(startData - 1, endData);

  return (
    <Layout style={{ minHeight: "100vh", padding: "20px" }}>
      <Breadcrumb style={{ marginBottom: "20px" }}>
        <Breadcrumb.Item>
          <a href="/dashboard">
            <HomeOutlined style={{ marginRight: "5px" }} />
            Dashboard
          </a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Pertanyaan</Breadcrumb.Item>
      </Breadcrumb>
      <div style={{ textAlign: "center", marginBottom: "3px" }}>
        <h2>Manajemen Pertanyaan</h2>
      </div>
      <Content>
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              Tambah Pertanyaan
            </Button>
          </Col>
          <Col>
            <Input.Search
              placeholder="Cari pertanyaan berdasarkan teks..."
              allowClear
              enterButton={<SearchOutlined />}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPagination((prev) => ({ ...prev, current: 1 }));
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
            onMouseEnter: (e) => (e.currentTarget.style.backgroundColor = "#fafafa"),
            onMouseLeave: (e) => (e.currentTarget.style.backgroundColor = "white"),
          })}
        />
        <Row justify="space-between" align="middle" style={{ marginTop: 16 }}>
          <Col>{pagination.total > 0 ? `Menampilkan ${startData} - ${endData} data dari total ${pagination.total} data` : "Tidak ada data yang ditampilkan."}</Col>
          <Col>
            <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} onChange={(page, pageSize) => setPagination({ current: page, pageSize })} />
          </Col>
        </Row>
      </Content>

      <Modal title={editingPertanyaan ? "Edit Pertanyaan" : "Tambah Pertanyaan"} open={visibleModal} onCancel={closeModal} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleModalOk}>
          <Form.Item name="teks" label="Teks Pertanyaan" rules={[{ required: true, message: "Masukkan teks pertanyaan" }]}>
            <Input placeholder="Contoh: Apa pendapat Anda tentang ...?" />
          </Form.Item>
          <Form.Item name="aspek" label="Aspek" rules={[{ required: true, message: "Pilih aspek" }]}>
            <Select placeholder="Pilih aspek">
              {aspekOptions.map((aspek) => (
                <Option key={aspek._id} value={aspek._id}>
                  {aspek.nama}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="bobot" label="Bobot" rules={[{ required: true, message: "Masukkan bobot" }]}>
            <Input type="number" placeholder="Masukkan bobot" />
          </Form.Item>
          <Form.Item name="rubrik" label="Rubrik (Pilih 7)" rules={[{ required: true, message: "Pilih tepat 7 rubrik" }]}>
            <Select mode="multiple" placeholder="Pilih rubrik">
              {rubrikOptions.map((rubrik) => (
                <Option key={rubrik._id} value={rubrik._id}>
                  {rubrik.label} ({rubrik.skor})
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
        </Form>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <Button onClick={closeModal}>Batalkan</Button>
          <Button type="primary" onClick={() => form.submit()} style={{ marginLeft: 8 }}>
            Kirim
          </Button>
        </div>
      </Modal>
    </Layout>
  );
};

export default PertanyaanPage;
