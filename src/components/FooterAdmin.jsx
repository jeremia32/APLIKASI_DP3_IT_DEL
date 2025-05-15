import React from "react";
import { Layout, Row, Col, Typography, Space, Divider } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import logo from "../assets/ITDEL.jpg";
import "../Styles/Footeradmin.css";

const { Footer } = Layout;
const { Text, Title } = Typography;

const AppFooter = () => {
  return (
    <Footer className="footer">
      <Row justify="center">
        <Col xs={24} md={16}>
          <div className="footer-center-content">
            <img src={logo} alt="Logo ITDEL" className="footer-logo" />
            <div className="footer-info">
              <Title level={4}>Institut Teknologi Del</Title>
              <Text>
                <EnvironmentOutlined /> Jl. Sisingamangaraja, Sitoluama, Laguboti, Sumatera Utara, Indonesia
              </Text>
              <br />
              <Space direction="vertical" size="small" className="footer-contact">
                <Text>
                  <PhoneOutlined /> +62 123 456 789
                </Text>
                <Text>
                  <MailOutlined /> info@itdel.ac.id
                </Text>
              </Space>
            </div>
          </div>
        </Col>
      </Row>

      <Divider className="footer-divider" />
      <Row justify="center">
        <Col>
          <Text strong>
            © {new Date().getFullYear()} Institut Teknologi Del. All rights reserved.
          </Text>
        </Col>
      </Row>
    </Footer>
  );
};

export default AppFooter;
