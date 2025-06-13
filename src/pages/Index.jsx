import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Row, Col, Typography, Spin } from "antd";
import logo from "../assets/ITDEL.jpg";

const { Content } = Layout;
const { Title } = Typography;

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/LoginPage"), 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Layout style={styles.container}>
      <Content>
        <Row justify="center" align="middle" style={styles.fullHeight}>
          <Col style={styles.centerCol}>
            <div style={styles.logoWrapper}>
              <img src={logo} alt="Logo DP3" style={styles.logo} />
            </div>
            <Title level={4} style={styles.title}>
              Daftar Penilaian Pelaksanaan Pekerjaan Institut Teknologi Del
            </Title>
            <Spin size="large" style={styles.spinner} />
          </Col>
        </Row>
      </Content>
      {/* Keyframes for animations */}
      <style>{`
        @keyframes scaleIn {0% {transform: scale(0.5); opacity: 0;} 100% {transform: scale(1); opacity:1;}}
        @keyframes fadeIn {0% {opacity:0;} 100% {opacity:1;}}
      `}</style>
    </Layout>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#ffffff",
  },
  fullHeight: { height: "100vh" },
  centerCol: { textAlign: "center" },
  logoWrapper: {
    display: "inline-block",
    animation: "scaleIn 1.5s ease-in-out",
  },
  logo: {
    width: "300px",
    height: "auto",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
  },
  title: {
    color: "#333333",
    marginTop: "24px",
    animation: "fadeIn 2s ease-in-out",
  },
  spinner: {
    marginTop: "40px",
    color: "#1890ff",
  },
};

export default SplashScreen;
