// src/components/About.jsx
import React, { useState } from "react";
import { Row, Col, Typography, Card, Divider, Carousel, Modal, Form, Input, Button, List } from "antd";
import { QuestionCircleOutlined, CalendarOutlined, CheckCircleOutlined, FormOutlined, TeamOutlined } from "@ant-design/icons";
import logo from "../assets/ITDEL.jpg";
import header1 from "../assets/preview1.jpg";
import header2 from "../assets/imagebackground.jpg";
import institutionLogo from "../assets/del.jpg";
import foundationLogo from "../assets/yayasandel.png";

const { Title, Paragraph } = Typography;

export default function About() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleFinish = (values) => {
    const { username, subject, message: userMessage } = values;
    const text = `Halo, saya *${username}* ingin menyampaikan pesan:\n\n*Subject:* ${subject}\n*Pesan:* ${userMessage}`;
    const encodedText = encodeURIComponent(text);
    const phoneNumber = "6287751758649";
    // Pastikan URL dan "_blank" diapit dengan tanda petik/single-quote, bukan backtick
    window.open(`https://wa.me/${phoneNumber}?text=${encodedText}`, "_blank");

    setIsModalVisible(false);
    form.resetFields();
  };

  const currentYear = new Date().getFullYear();

  return (
    <div style={{ padding: 20, background: "#f9f9f9", position: "relative" }}>
      {/* Carousel */}
      <Carousel autoplay>
        <div>
          <img src={header1} alt="Slide 1" style={{ width: "100%", maxHeight: 500, objectFit: "cover" }} />
        </div>
        <div>
          <img src={header2} alt="Slide 2" style={{ width: "100%", maxHeight: 500, objectFit: "cover" }} />
        </div>
      </Carousel>

      {/* Bagian Tentang + Logo */}
      <Row gutter={16} align="middle" justify="center" style={{ marginTop: 32 }}>
        <Col xs={8} md={4} lg={3} style={{ textAlign: "center" }}>
          <img src={logo} alt="DP3 Logo" style={{ width: "100%", maxWidth: 120 }} />
        </Col>
        <Col xs={24} md={12} lg={10}>
          <Title level={2}>Tentang DP3</Title>
          <Paragraph>
            DP3 (Direktorat Pengembangan Program dan Pembelajaran) Institut Teknologi Del bertugas merancang, mengelola, dan mengevaluasi kurikulum serta proses pembelajaran. Kami berfokus pada pengembangan sistem penilaian kinerja yang
            transparan dan objektif.
          </Paragraph>
        </Col>
      </Row>

      <Divider />

      {/* 2 & 3: Periode Penilaian dan Aspek Penilaian Kinerja */}
      <Row gutter={[34, 34]} justify="center" align="stretch" style={{ marginTop: 32, marginBottom: 32 }}>
        {/* 2. Periode Penilaian */}
        <Col xs={24} md={11} style={{ display: "flex" }}>
          <Card
            hoverable
            bordered={false}
            style={{
              flex: 1,
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <Row align="middle" gutter={8}>
              <Col>
                <CalendarOutlined style={{ fontSize: 32, color: "#1890ff" }} />
              </Col>
              <Col>
                <Title level={4} style={{ margin: 0 }}>
                  2. Periode Penilaian
                </Title>
              </Col>
            </Row>
            <Paragraph style={{ marginTop: 12 }}>Aplikasi akan mengelola periode kapan penilaian dilaksanakan.</Paragraph>
            <List.Item>
              <Row>
                <Col span={6}>
                  <strong>Tahun Penilaian:</strong>
                </Col>
                <Col span={18}>{currentYear}</Col>
              </Row>
            </List.Item>
          </Card>
        </Col>

        {/* 3. Aspek Penilaian Kinerja */}
        <Col xs={24} md={11} style={{ display: "flex" }}>
          <Card
            hoverable
            bordered={false}
            style={{
              flex: 1,
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <Row align="middle" gutter={8}>
              <Col>
                <CheckCircleOutlined style={{ fontSize: 32, color: "#52c41a" }} />
              </Col>
              <Col>
                <Title level={4} style={{ margin: 0 }}>
                  3. Aspek Penilaian Kinerja
                </Title>
              </Col>
            </Row>
            <Paragraph style={{ marginTop: 12 }}>Ini adalah inti dari aplikasi, di mana kriteria penilaian ditetapkan:</Paragraph>
            <List
              size="small"
              dataSource={[
                "Kedisiplinan: Kehadiran, ketepatan waktu.",
                "Kualitas Kerja: Akurasi, kelengkapan, inovasi.",
                "Kerja Sama: Kemampuan berkolaborasi, komunikasi.",
                "Inisiatif dan Kreativitas: Memecahkan masalah, mengajukan ide.",
                "Tanggung Jawab: Komitmen terhadap tugas.",
                "Pelayanan: Responsivitas, kepuasan pihak terkait.",
                "Penelitian & Pengabdian (untuk dosen): Jumlah publikasi, proyek.",
                "Pengajaran (untuk dosen): Evaluasi mahasiswa, pengembangan materi.",
              ]}
              renderItem={(item) => (
                <List.Item>
                  <TeamOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                  {item}
                </List.Item>
              )}
              style={{ marginTop: 16 }}
            />
            <Paragraph style={{ marginTop: 12 }}>
              <strong>Bobot Penilaian:</strong> Nilai persentase untuk setiap aspek, menunjukkan tingkat kepentingannya.
            </Paragraph>
          </Card>
        </Col>
      </Row>

      {/* 4. Proses Penilaian */}
      <Row gutter={[24, 24]} justify="center" style={{ marginBottom: 32 }}>
        <Col xs={24} md={22} style={{ display: "flex" }}>
          <Card
            hoverable
            bordered={false}
            style={{
              flex: 1,
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <Row align="middle" gutter={8}>
              <Col>
                <FormOutlined style={{ fontSize: 32, color: "#faad14" }} />
              </Col>
              <Col>
                <Title level={4} style={{ margin: 0 }}>
                  4. Proses Penilaian
                </Title>
              </Col>
            </Row>
            <Paragraph style={{ marginTop: 12 }}>Mekanisme bagaimana penilaian dilakukan dan dicatat:</Paragraph>
            <List
              size="small"
              dataSource={[
                "Formulir Penilaian: Antarmuka untuk penilai (atasan) dan self-assessment.",
                "Skala Penilaian: Skala Likert (1-7) dari sangat kurang hingga sangat baik.",
                "Catatan/Komentar Penilai: Ruang untuk umpan balik kualitatif.",
                "Review Penilaian: Validasi atau persetujuan Untuk Mengirim Formulir.",
              ]}
              renderItem={(item) => (
                <List.Item>
                  <CheckCircleOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                  {item}
                </List.Item>
              )}
              style={{ marginTop: 16 }}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Footer modern dengan konten sosial & logo */}
      <div style={{ marginTop: 64, paddingBottom: 80 }}>
        <div
          style={{
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Title level={4} style={{ marginBottom: 8 }}>
            Terhubung Bersama Kami
          </Title>
          <Paragraph style={{ maxWidth: 500 }}>
            DP3 Institut Teknologi Del berkomitmen untuk menghadirkan solusi teknologi yang inovatif, kolaboratif, dan berdampak bagi masyarakat. Kami percaya bahwa transformasi digital dimulai dari kolaborasi yang kuat.
          </Paragraph>

          {/* Ikon sosial media */}
          <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
            <a href="https://www.instagram.com/itdelofficial" target="_blank" rel="noopener noreferrer">
              <img src="https://img.icons8.com/ios-filled/30/000000/instagram-new.png" alt="Instagram" />
            </a>
            <a href="https://www.facebook.com/itdel" target="_blank" rel="noopener noreferrer">
              <img src="https://img.icons8.com/ios-filled/30/000000/facebook-new.png" alt="Facebook" />
            </a>
            <a href="mailto:dpitdelvokasi@gmail.com">
              <img src="https://img.icons8.com/ios-filled/30/000000/gmail-new.png" alt="Email" />
            </a>
          </div>

          {/* Logo Institusi & Yayasan */}
          <div style={{ display: "flex", gap: 32, marginTop: 24 }}>
            <img src={institutionLogo} alt="Institut Teknologi Del" style={{ width: 60, height: 60 }} />
            <img src={foundationLogo} alt="Yayasan Del" style={{ width: 60, height: 60 }} />
          </div>

          <Paragraph style={{ fontSize: 12, color: "#888", marginTop: 24 }}>© {new Date().getFullYear()} DP3 IT Del. All rights reserved.</Paragraph>
        </div>
      </div>

      {/* Floating Contact Button */}
      <Button
        type="primary"
        icon={<QuestionCircleOutlined />}
        size="large"
        onClick={showModal}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
        }}
      >
        Hubungi Kami
      </Button>

      {/* Modal Form */}
      <Modal title="Hubungi Kami" visible={isModalVisible} onCancel={handleCancel} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: "Username wajib diisi" },
              { min: 3, message: "Minimal 3 karakter" },
            ]}
          >
            <Input placeholder="Nama Anda" />
          </Form.Item>
          <Form.Item name="subject" label="Subject" rules={[{ required: true, message: "Subject wajib diisi" }]}>
            <Input placeholder="Judul pesan" />
          </Form.Item>
          <Form.Item name="message" label="Pesan" rules={[{ required: true, message: "Pesan wajib diisi" }]}>
            <Input.TextArea rows={4} placeholder="Tulis pesan Anda" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Kirim ke WhatsApp
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
