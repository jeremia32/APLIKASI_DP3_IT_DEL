import React, { useState } from "react";
import { Row, Col, Typography, Card, Divider, Carousel, Modal, Form, Input, Button } from "antd";
import { AimOutlined, RocketOutlined, MailOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import logo from "../assets/ITDEL.jpg";
import header1 from "../assets/preview1.jpg";
import header2 from "../assets/imagebackground.jpg";
import institutionLogo from "../assets/del.jpg";
import foundationLogo from "../assets/yayasandel.png";

const { Title, Paragraph } = Typography;

export default function About() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleFinish = (values) => {
    const { username, subject, message: userMessage } = values;
    const text = `Halo, saya *${username}* ingin menyampaikan pesan:\n\n*Subject:* ${subject}\n*Pesan:* ${userMessage}`;
    const encodedText = encodeURIComponent(text);
    const phoneNumber = "6287751758649";
    window.open(`https://wa.me/${phoneNumber}?text=${encodedText}`, "_blank");

    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div style={{ padding: 20, background: "#f9f9f9", position: "relative" }}>
      {/* Carousel */}
      <Carousel autoplay>
        <div>
          <img src={header1} alt="1" style={{ width: "100%", maxHeight: 500, objectFit: "cover" }} />
        </div>
        <div>
          <img src={header2} alt="2" style={{ width: "100%", maxHeight: 500, objectFit: "cover" }} />
        </div>
      </Carousel>

      {/* Tentang + Logo */}
      <Row gutter={16} align="middle" justify="center" style={{ marginTop: 32 }}>
        <Col xs={8} md={4} lg={3} style={{ textAlign: "center" }}>
          <img src={logo} alt="DP3 Logo" style={{ width: "100%", maxWidth: 120 }} />
        </Col>
        <Col xs={24} md={12} lg={10}>
          <Title level={2}>Tentang DP3</Title>
          <Paragraph>DP3 adalah platform digital yang berfokus pada pengembangan solusi teknologi inovatif. Kami hadir untuk menjawab tantangan modern melalui pendekatan yang efisien dan berdampak.</Paragraph>
        </Col>
      </Row>

      <Divider />

      {/* Visi & Misi */}
      <Row gutter={[16, 16]} justify="center" style={{ marginTop: 32 }}>
        <Col xs={24} md={10} style={{ display: "flex" }}>
          <Card hoverable style={{ height: "100%", width: "100%" }}>
            <AimOutlined style={{ fontSize: 32, color: "#1890ff" }} />
            <Title level={4}>Visi Kami</Title>
            <Paragraph>Menjadi pemimpin dalam transformasi digital di Asia Tenggara dengan solusi yang memberdayakan dan berkelanjutan.</Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={10} style={{ display: "flex" }}>
          <Card hoverable style={{ height: "100%", width: "100%" }}>
            <RocketOutlined style={{ fontSize: 32, color: "#52c41a" }} />
            <Title level={4}>Misi Kami</Title>
            <Paragraph>
              1. Mengembangkan produk yang relevan.
              <br />
              2. Mendorong kolaborasi teknologi & bisnis.
              <br />
              3. Menyediakan platform yang inklusif.
            </Paragraph>
          </Card>
        </Col>
      </Row>

      {/* Footer Logo Institusi & Yayasan */}
      <Row gutter={32} justify="center" style={{ marginTop: 48, marginBottom: 48 }}>
        <Col xs={8} md={4} style={{ textAlign: "center" }}>
          <img src={institutionLogo} alt="Institution Logo" style={{ width: "100%", maxWidth: 100 }} />
        </Col>
        <Col xs={8} md={4} style={{ textAlign: "center" }}>
          <img src={foundationLogo} alt="Foundation Logo" style={{ width: "100%", maxWidth: 100 }} />
        </Col>
      </Row>

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
      <Modal title="Hubungi Kami" open={isModalVisible} onCancel={handleCancel} footer={null} destroyOnClose>
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
