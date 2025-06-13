import React, { useEffect, useState } from "react";
import { Tabs, Breadcrumb, Table, Button, Input, message, Modal, Form, Typography, Row, Col, Pagination } from "antd";
import axios from "axios";
import { SearchOutlined, HomeOutlined } from "@ant-design/icons";

const { Search } = Input;
const { TabPane } = Tabs;
const { Title } = Typography;
const roles = ["Staff", "dosen", "Mahasiswa", "dekan", "kaprodi"];

const UserTabs = () => {
  const [usersByRole, setUsersByRole] = useState({});
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [prestasiText, setPrestasiText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [paginationState, setPaginationState] = useState({});
  const [activeRole, setActiveRole] = useState("dosen");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/users");
      const allUsers = response.data;

      const groupedUsers = roles.reduce((acc, role) => {
        const filtered = allUsers.filter((user) => user.role === role);
        acc[role] = filtered;
        return acc;
      }, {});

      setUsersByRole(groupedUsers);

      const initialPagination = roles.reduce((acc, role) => {
        acc[role] = {
          current: 1,
          pageSize: 10,
          total: groupedUsers[role]?.length || 0,
        };
        return acc;
      }, {});
      setPaginationState(initialPagination);
    } catch (error) {
      console.error("Gagal fetch users:", error);
      messageApi.error("Gagal mengambil data pengguna");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setEditingUser(null);
    setPrestasiText("");
    form.resetFields();
  };

  const handleSave = async () => {
    if (!prestasiText) {
      messageApi.warning("Harap isi prestasi terlebih dahulu.");
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/users/${editingUser.nip}`, {
        prestasi: prestasiText,
      });
      messageApi.success("Evidence berhasil diperbarui!");
      handleModalClose();
      fetchUsers();
    } catch (error) {
      console.error("Gagal update:", error);
      messageApi.error("Gagal memperbarui evidence");
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value.toLowerCase());
    const updatedPagination = {
      ...paginationState,
      [activeRole]: {
        ...paginationState[activeRole],
        current: 1,
      },
    };
    setPaginationState(updatedPagination);
  };

  const getFilteredData = (data) => data?.filter((user) => user.username.toLowerCase().includes(searchTerm) || user.nip.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm));

  const handleTableChange = (role, newPagination) => {
    const updatedPagination = {
      ...paginationState,
      [role]: {
        ...paginationState[role],
        current: newPagination.current,
        pageSize: newPagination.pageSize,
      },
    };
    setPaginationState(updatedPagination);
  };

  const getPaginatedData = (data, role) => {
    const { current, pageSize } = paginationState[role] || {};
    const startIndex = (current - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  };

  const renderTable = (role) => {
    const allData = getFilteredData(usersByRole[role] || []);
    const paginatedData = getPaginatedData(allData, role);
    const { current, pageSize, total } = paginationState[role] || {};
    const startData = total === 0 ? 0 : (current - 1) * pageSize + 1;
    const endData = Math.min(current * pageSize, allData.length);

    const columns = [
      {
        title: "No",
        render: (_, __, index) => startData + index,
      },
      {
        title: "NIP",
        dataIndex: "nip",
        key: "nip",
      },
      {
        title: "Nama",
        dataIndex: "username",
        key: "username",
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
      },
      {
        title: "Bukti",
        dataIndex: "prestasi",
        key: "prestasi",
        render: (text) => text || "-",
      },
      {
        title: "Aksi",
        key: "aksi",
        render: (_, record) => (
          <Button
            type="primary"
            onClick={() => {
              setEditingUser(record);
              setPrestasiText(record.prestasi || "");
              form.setFieldsValue({ prestasi: record.prestasi || "" });
            }}
          >
            Kelola Evidence
          </Button>
        ),
      },
    ];

    return (
      <>
        <Table loading={loading} dataSource={paginatedData} columns={columns} pagination={false} rowKey="_id" />
        <Row justify="space-between" align="middle" style={{ marginTop: 16 }}>
          <Col>
            {allData.length > 0 ? (
              <>
                Menampilkan {startData}–{endData} dari total {allData.length} data
              </>
            ) : (
              <>Tidak ada data yang ditampilkan.</>
            )}
          </Col>
          <Col>
            <Pagination current={current} pageSize={pageSize} total={allData.length} onChange={(page, pageSize) => handleTableChange(role, { current: page, pageSize })} />
          </Col>
        </Row>
      </>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      {contextHolder}

      <div style={{ marginBottom: 30 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Breadcrumb>
            <Breadcrumb.Item href="/dashboard">
              <HomeOutlined /> Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item>Evidence</Breadcrumb.Item>
          </Breadcrumb>
          <Title level={3} style={{ margin: 0, flex: 1, textAlign: "center" }}>
            Manajemen Evidence Pegawai
          </Title>
          <div style={{ width: 180 }} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <Search placeholder="Cari berdasarkan username atau email" enterButton={<SearchOutlined />} onChange={(e) => handleSearch(e.target.value)} style={{ width: 340 }} />
        </div>
      </div>

      <Tabs defaultActiveKey="dosen" onChange={setActiveRole}>
        {roles.map((role) => (
          <TabPane tab={role} key={role}>
            {renderTable(role)}
          </TabPane>
        ))}
      </Tabs>

      <Modal title="Manajemen Evidence" open={!!editingUser} onCancel={handleModalClose} footer={null}>
        <Form layout="vertical" form={form} onFinish={handleSave}>
          <Form.Item label="Bukti" name="prestasi" rules={[{ required: true, message: "Prestasi tidak boleh kosong" }]}>
            <Input.TextArea rows={4} value={prestasiText} onChange={(e) => setPrestasiText(e.target.value)} />
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

export default UserTabs;
