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

  // Ambil data aspek dan rubrik sekali saat komponen mount
  useEffect(() => {
    fetchAspekOptions();
    fetchRubrikOptions();
  }, []);

  // Ambil data pertanyaan setiap kali searchText, halaman, atau pageSize berubah
  useEffect(() => {
    fetchPertanyaan();
  }, [searchText, pagination.current, pagination.pageSize]);

  const fetchPertanyaan = async () => {
    setLoading(true);
    try {
      // Ambil semua data dari API
      const res = await axios.get("http://localhost:5000/api/pertanyaan");
      let data = res.data;

      // Filter berdasarkan searchText
      if (searchText) {
        data = data.filter((item) => item.teks.toLowerCase().includes(searchText.toLowerCase()));
      }

      // Update total data setelah filter
      setPagination((prev) => ({ ...prev, total: data.length }));

      // Hitung slice (start, end) sesuai halaman aktif
      const start = (pagination.current - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;

      // Simpan hanya potongan data yang diperlukan
      setPertanyaanData(data.slice(start, end));
    } catch (error) {
      message.error("Gagal mengambil data pertanyaan");
      console.error(error);
    }
    setLoading(false);
  };

  const fetchAspekOptions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/aspek");
      // Filter hanya aspek yang aktif
      setAspekOptions(res.data.filter((aspek) => aspek.isActive));
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
      // Setelah delete, refresh data dan pastikan halaman masih valid
      fetchPertanyaan();
    } catch (error) {
      message.error("Gagal menghapus pertanyaan");
      console.error(error);
    }
  };

  const toggleStatus = async (record) => {
    try {
      await axios.patch(`http://localhost:5000/api/pertanyaan/${record._id}/status`, { isActive: !record.isActive });
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
      // reset form dan set default isActive = true
      form.resetFields();
      form.setFieldsValue({ isActive: true });
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

      // Validasi jumlah rubrik = 7
      if (!values.rubrik || values.rubrik.length !== 7) {
        message.error("Setiap pertanyaan harus memiliki tepat 7 rubrik.");
        return;
      }

      if (editingPertanyaan) {
        // Update
        await axios.put(`http://localhost:5000/api/pertanyaan/${editingPertanyaan._id}`, values);
        message.success("Pertanyaan berhasil diperbarui");
      } else {
        // Create
        await axios.post("http://localhost:5000/api/pertanyaan", values);
        message.success("Pertanyaan berhasil ditambahkan");
      }
      closeModal();
      // Refresh data (menggunakan state pagination saat ini)
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
        <Space>
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

  // Untuk menampilkan teks “Menampilkan X – Y dari total Z data”
  const startData = (pagination.current - 1) * pagination.pageSize + 1;
  const endData = Math.min(pagination.current * pagination.pageSize, pagination.total);

  return (
    <Layout style={{ minHeight: "100vh", padding: "20px" }}>
      <Breadcrumb style={{ marginBottom: "20px" }}>
        <Breadcrumb.Item href="/dashboard">
          <HomeOutlined /> Beranda
        </Breadcrumb.Item>
        <Breadcrumb.Item>Pertanyaan</Breadcrumb.Item>
      </Breadcrumb>
      <div style={{ textAlign: "center", marginBottom: "3px" }}>
        <h2> Pertanyaan Penilaian </h2>
      </div>
      <Content>
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }} wrap>
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
                // Reset halaman ke 1 saat pencarian berubah
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
              style={{ width: 300 }}
              className="search-box"
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={pertanyaanData}
          loading={loading}
          rowKey="_id"
          pagination={false}
          style={{ marginTop: 20 }}
          onRow={(record) => ({
            style: { cursor: "pointer" },
            onMouseEnter: (e) => (e.currentTarget.style.backgroundColor = "#fafafa"),
            onMouseLeave: (e) => (e.currentTarget.style.backgroundColor = "white"),
          })}
        />

        <Row justify="space-between" align="middle" style={{ marginTop: 16 }}>
          <Col>{pagination.total > 0 ? `Menampilkan ${startData} - ${endData} dari ${pagination.total} data` : "Tidak ada data yang ditampilkan."}</Col>
          <Col>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={(page, pageSize) => {
                setPagination((prev) => ({
                  ...prev,
                  current: page,
                  pageSize,
                }));
              }}
              showSizeChanger
            />
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
          {/* <Form.Item name="bobot" label="Bobot" rules={[{ required: true, message: "Masukkan bobot" }]}>
            <Input type="number" placeholder="Masukkan bobot" />
          </Form.Item> */}
          <Form.Item
            name="bobot"
            label="Bobot"
            rules={[
              { required: true, message: "Masukkan bobot pertanyaan" },
              {
                type: "number",
                min: 1,
                max: 7,
                message: "Bobot harus antara 1 hingga 7",
              },
            ]}
            // setiap kali ada input, ubah ke Number
            getValueFromEvent={(e) => {
              const val = e.target.value;
              // jika kosong, kembalikan undefined biar required-nya jalan
              if (val === "") return undefined;
              return Number(val);
            }}
          >
            <Input type="number" placeholder="Masukkan bobot (1 - 7)" />
          </Form.Item>

          <Form.Item name="rubrik" label="Rubrik (Pilih Minimal 7)" rules={[{ required: true, message: "Pilih tepat 7 rubrik" }]}>
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
          <Form.Item>
            <Space style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={closeModal}>Batalkan</Button>
              <Button type="primary" htmlType="submit">
                Simpan
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default PertanyaanPage;
