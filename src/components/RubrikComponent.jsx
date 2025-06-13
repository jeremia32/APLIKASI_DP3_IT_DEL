import React, { useEffect, useState, useMemo } from "react";
import { Layout, Breadcrumb, Table, Button, Modal, Form, Input, Select, Space, message, Row, Col, Pagination, Tag, Tooltip } from "antd";
import { SearchOutlined, PlusOutlined, HomeOutlined, EditOutlined, DeleteOutlined, PoweroffOutlined } from "@ant-design/icons";
import axios from "axios";

const { Content } = Layout;
const { Option } = Select;

const RubrikPage = () => {
  const [rubrikData, setRubrikData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
  const [editingRubrik, setEditingRubrik] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchRubrik();
  }, []);

  const fetchRubrik = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/rubrik");
      setRubrikData(res.data);
    } catch (error) {
      message.error("Gagal mengambil data rubrik");
      console.error(error);
    }
    setLoading(false);
  };

  const filteredData = useMemo(() => {
    const filtered = searchText ? rubrikData.filter((item) => item.label.toLowerCase().includes(searchText.toLowerCase())) : rubrikData;

    setPagination((prev) => ({
      ...prev,
      total: filtered.length,
    }));

    return filtered;
  }, [rubrikData, searchText]);

  const displayedData = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, pagination]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/rubrik/${id}`);
      message.success("Rubrik berhasil dihapus");
      fetchRubrik();
    } catch (error) {
      message.error("Gagal menghapus rubrik");
      console.error(error);
    }
  };

  const toggleStatus = async (record) => {
    try {
      await axios.patch(`http://localhost:5000/api/rubrik/${record._id}/status`, {
        isActive: !record.isActive,
      });
      message.success("Status rubrik berhasil diubah");
      fetchRubrik();
    } catch (error) {
      message.error("Gagal mengubah status rubrik");
      console.error(error);
    }
  };

  const openModal = (record = null) => {
    setEditingRubrik(record);
    setVisibleModal(true);
    if (record) {
      form.setFieldsValue({
        label: record.label,
        deskripsi: record.deskripsi,
        skor: record.skor,
        isActive: record.isActive,
      });
    } else {
      form.resetFields();
    }
  };

  const closeModal = () => {
    setVisibleModal(false);
    setEditingRubrik(null);
    form.resetFields();
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingRubrik) {
        await axios.put(`http://localhost:5000/api/rubrik/${editingRubrik._id}`, values);
        message.success("Rubrik berhasil diperbarui");
      } else {
        await axios.post("http://localhost:5000/api/rubrik/create", values);
        message.success("Rubrik berhasil ditambahkan");
      }
      closeModal();
      fetchRubrik();
    } catch (error) {
      message.error("Gagal menyimpan rubrik");
      console.error(error);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (page, pageSize) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize,
    }));
  };

  const columns = [
    {
      title: "Label",
      dataIndex: "label",
      sorter: (a, b) => a.label.localeCompare(b.label),
    },
    {
      title: "Deskripsi",
      dataIndex: "deskripsi",
      ellipsis: true,
    },
    {
      title: "Skor",
      dataIndex: "skor",
      sorter: (a, b) => a.skor - b.skor,
      sortDirections: ["descend", "ascend"],
      render: (skor) => <span style={{ fontWeight: "bold" }}>{skor}</span>,
    },
    {
      title: "Status",
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
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Rubrik">
            <Button type="link" icon={<EditOutlined />} onClick={() => openModal(record)} />
          </Tooltip>
          <Tooltip title="Hapus Rubrik">
            <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record._id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const startData = (pagination.current - 1) * pagination.pageSize + 1;
  const endData = Math.min(pagination.current * pagination.pageSize, pagination.total);

  return (
    <Layout style={{ minHeight: "100vh", padding: "20px" }}>
      <Breadcrumb style={{ marginBottom: "20px" }}>
        <Breadcrumb.Item>
          <a href="/dashboard">
            <HomeOutlined style={{ marginRight: "5px" }} />
            Dashboard
          </a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Rubrik</Breadcrumb.Item>
      </Breadcrumb>
      <div style={{ textAlign: "center", marginBottom: "3px" }}>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#2c3e50",
            marginBottom: "20px",
            textAlign: "center",
            textTransform: "capitalize",
          }}
        >
         Rubrik Penilaian 
        </h2>      </div>
      <Content>
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              Tambah Rubrik
            </Button>
          </Col>
          <Col>
            <Input.Search placeholder="Cari rubrik berdasarkan label..." allowClear enterButton={<SearchOutlined />} onSearch={handleSearch} onChange={(e) => handleSearch(e.target.value)} style={{ width: 300 }} className="search-box" />
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
          <Col>{pagination.total > 0 ? `Menampilkan ${startData} - ${endData} dari total ${pagination.total} data` : "Tidak ada data yang ditampilkan."}</Col>
          <Col>
            <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} onChange={handleTableChange} showSizeChanger />
          </Col>
        </Row>
      </Content>

      <Modal title={editingRubrik ? "Edit Rubrik" : "Tambah Rubrik"} open={visibleModal} onCancel={closeModal} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleModalOk}>
          <Form.Item name="label" label="Label" rules={[{ required: true, message: "Masukkan label rubrik" }]}>
            <Input placeholder="Contoh: Sangat Baik" />
          </Form.Item>
          <Form.Item name="deskripsi" label="Deskripsi" rules={[{ required: true, message: "Masukkan deskripsi rubrik" }]}>
            <Input.TextArea placeholder="Masukkan deskripsi" rows={3} />
          </Form.Item>
          <Form.Item name="skor" label="Skor" rules={[{ required: true, message: "Masukkan skor" }]}>
            <Input type="number" placeholder="Masukkan skor" />
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

export default RubrikPage;
