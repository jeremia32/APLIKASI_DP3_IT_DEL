import React, { useEffect, useState } from "react";
import { Table, Breadcrumb, Pagination, Button, Tabs, Input } from "antd";
import { EditOutlined, HomeOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Search } = Input;

const PenilaianUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState({});
  const pageSize = 10;
  const navigate = useNavigate();

  const roles = ["dosen", "Staff", "Mahasiswa", "dekan", "kaprodi"];

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/api/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Gagal mengambil data user:", error);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handlePenilaian = (user) => {
    navigate(`/UserDinilai?nip=${user.nip}`);
  };

  const handleSearch = (text) => {
    setSearchText(text.toLowerCase());
  };

  return (
    <div style={{ padding: "20px" }}>
      <Breadcrumb style={{ marginBottom: "20px" }}>
        <Breadcrumb.Item>
          <a href="/dashboard">
            <HomeOutlined style={{ marginRight: "5px" }} />
            Dashboard
          </a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Penilaian</Breadcrumb.Item>
      </Breadcrumb>
      <h2 style={{ textAlign: "center", color: "black" }}>Manajemen Penilaian User</h2>

      <Tabs
        defaultActiveKey="dosen"
        onChange={(key) => {
          setSearchText("");
          setCurrentPage((prev) => ({ ...prev, [key]: 1 }));
        }}
      >
        {roles.map((role) => {
          const filteredUsers = users.filter((user) => user.role === role && (user.username.toLowerCase().includes(searchText) || user.email.toLowerCase().includes(searchText)));

          const current = currentPage[role] || 1; 
          const startIdx = (current - 1) * pageSize;
          const endIdx = startIdx + pageSize;
          const paginatedUsers = filteredUsers.slice(startIdx, endIdx);

          const columns = [
            {
              title: "No",
              key: "no",
              render: (_, __, index) => startIdx + index + 1,
              width: 60,
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
              title: "Jabatan",
              dataIndex: "role",
              key: "role",
            },
            {
              title: "Aksi",
              key: "aksi",
              render: (text, record) => (
                <Button type="primary" icon={<EditOutlined />} onClick={() => handlePenilaian(record)}>
                  Menilai
                </Button>
              ),
            },
          ];

          return (
            <Tabs.TabPane tab={role} key={role}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                <Search placeholder="Cari berdasarkan username atau email" enterButton={<SearchOutlined />} onChange={(e) => handleSearch(e.target.value)} style={{ width: 340 }} />
              </div>

              <Table columns={columns} dataSource={paginatedUsers} loading={loading} rowKey="nip" pagination={false} style={{ marginTop: 16 }} />

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                <div>
                  Menampilkan {filteredUsers.length === 0 ? 0 : startIdx + 1}–{Math.min(endIdx, filteredUsers.length)} dari {filteredUsers.length} data
                </div>
                <Pagination current={current} pageSize={pageSize} total={filteredUsers.length} onChange={(page) => setCurrentPage((prev) => ({ ...prev, [role]: page }))} showSizeChanger={false} />
              </div>
            </Tabs.TabPane>
          );
        })}
      </Tabs>
    </div>
  );
};

export default PenilaianUser;
