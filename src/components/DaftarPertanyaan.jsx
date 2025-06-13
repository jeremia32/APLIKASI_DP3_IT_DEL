import React, { useEffect, useState } from "react";
import { Layout, Breadcrumb, Card, Spin, Typography, message, Row, Col, Input, Pagination, Empty, Collapse, Tag, Badge, List } from "antd";
import { HomeOutlined, SearchOutlined, FolderOpenOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import axios from "axios";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Panel } = Collapse;

const highlightText = (text, query) => {
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <Text key={i} mark>
        {part}
      </Text>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
};

const TreeKuisionerView = () => {
  const [tree, setTree] = useState([]);
  const [filteredTree, setFilteredTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  useEffect(() => {
    fetchTree();
  }, []);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [tree, searchQuery]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const fetchTree = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/kategori/tree");
      // Perbaikan: data kusioner ada di res.data.tree
      const data = Array.isArray(res.data.tree) ? res.data.tree : [];
      setTree(data);
      setFilteredTree(data);
    } catch (err) {
      message.error("Gagal memuat kuisioner");
      console.error(err);
    }
    setLoading(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredTree(tree);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = tree
      .map((kategori) => {
        const matchedAspek = kategori.aspek?.filter((aspek) => {
          const matchAspek = aspek.nama.toLowerCase().includes(lowerQuery) || aspek.pertanyaan?.some((p) => p.teks.toLowerCase().includes(lowerQuery));
          return matchAspek;
        });

        if (kategori.nama.toLowerCase().includes(lowerQuery) || matchedAspek.length > 0) {
          return { ...kategori, aspek: matchedAspek };
        }
        return null;
      })
      .filter((item) => item !== null);

    setFilteredTree(filtered);
    setCurrentPage(1);
  };

  const paginatedData = filteredTree.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <Layout style={{ padding: 24, minHeight: "100vh", background: "#fafafb" }}>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item href="/dashboard">
          <HomeOutlined />
          <span>Beranda</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Daftar Kuisioner</Breadcrumb.Item>
      </Breadcrumb>

      <Content>
        <Title level={2}>Daftar Kuisioner</Title>

        <Search placeholder="Cari kategori, aspek, atau pertanyaan..." allowClear enterButton={<SearchOutlined />} size="large" onSearch={handleSearch} style={{ marginBottom: 24, maxWidth: 600 }} />

        {loading ? (
          <Spin tip="Memuat kuisioner...">
            <div style={{ minHeight: 200 }} />
          </Spin>
        ) : paginatedData.length === 0 ? (
          <Empty description="Tidak ditemukan data kuisioner sesuai pencarian." />
        ) : (
          <Row gutter={[16, 16]}>
            {paginatedData.map((kategori) => (
              <Col xs={24} sm={24} md={12} lg={8} key={kategori._id}>
                <div className="card-hover-scale">
                  <Card
                    title={
                      <Title level={4} style={{ margin: 0 }}>
                        <FolderOpenOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                        {highlightText(kategori.nama, searchQuery)}
                      </Title>
                    }
                    bordered={false}
                    hoverable
                    style={{ borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
                  >
                    deskripsi : {kategori.deskripsi && <Text type="secondary">{highlightText(kategori.deskripsi, searchQuery)}</Text>}
                    {kategori.roles?.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        {kategori.roles.map((role, idx) => (
                          <Tag color="blue" key={idx}>
                            {role}
                          </Tag>
                        ))}
                      </div>
                    )}
                    {kategori.periodePenilaian && (
                      <div style={{ marginTop: 12 }}>
                        <Text type="secondary">Periode Penilaian: </Text>
                        <Tag color="green">{kategori.periodePenilaian}</Tag>
                      </div>
                    )}
                    <Collapse accordion bordered={false} expandIconPosition="right" style={{ marginTop: 20 }} ghost>
                      {kategori.aspek?.map((aspekItem) => (
                        <Panel header={highlightText(aspekItem.nama, searchQuery)} key={aspekItem._id} extra={<QuestionCircleOutlined />}>
                          {aspekItem.deskripsi && <Text type="secondary">{highlightText(aspekItem.deskripsi, searchQuery)}</Text>}
                          <List
                            dataSource={aspekItem.pertanyaan}
                            renderItem={(p, i) => (
                              <List.Item>
                                <List.Item.Meta
                                  avatar={<Badge status="default" text={`${i + 1}.`} />}
                                  title={highlightText(p.teks, searchQuery)}
                                  description={
                                    p.rubrik?.length > 0 && (
                                      <div>
                                        {p.rubrik.map((r) => (
                                          <Tag key={r.label}>
                                            {r.label}: {r.skor}
                                          </Tag>
                                        ))}
                                      </div>
                                    )
                                  }
                                />
                              </List.Item>
                            )}
                          />
                        </Panel>
                      ))}
                    </Collapse>
                  </Card>
                </div>
              </Col>
            ))}
          </Row>
        )}

        {filteredTree.length > pageSize && (
          <Pagination current={currentPage} pageSize={pageSize} total={filteredTree.length} onChange={(page) => setCurrentPage(page)} showSizeChanger={false} style={{ marginTop: 24, textAlign: "center" }} />
        )}
      </Content>
    </Layout>
  );
};

export default TreeKuisionerView;
