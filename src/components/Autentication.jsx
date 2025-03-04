import React, { useState } from "react";
import { Image, Input, Button, Form, message, Spin, Alert } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Styles/LoginPage.css";
import imagebackground from "../assets/imagebackground.jpg";
import logo from "../assets/ITDEL.jpg";
import preview1 from "../assets/preview1.jpg";
import preview2 from "../assets/preview2.webp";

const LoginForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await axios.post("http://localhost:5000/api/admin/login", values);
      const { token } = response.data;

      localStorage.setItem("token", token);
      setSuccessMsg("Login Berhasil!");

      // Tampilkan alert sukses selama 1 detik sebelum navigasi
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Login Gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Left Side - Login Form */}
        <div className="login-form">
          <div className="login-header">
            <img src={logo} alt="Logo" className="logo" />
            <h2>Login</h2>
          </div>

          {/* Tampilkan Alert jika login gagal */}
          {errorMsg && <Alert message="Error" description={errorMsg} type="error" showIcon closable style={{ marginBottom: 16 }} />}

          {/* Tampilkan Alert jika login sukses */}
          {successMsg && <Alert message="Success" description={successMsg} type="success" showIcon style={{ marginBottom: 16 }} />}

          <Spin spinning={loading} tip="Logging in...">
            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item name="username" rules={[{ required: true, message: "Masukkan Username!" }]}>
                <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, message: "Masukkan Password!" }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" className="login-button" size="large" loading={loading}>
                  Login
                </Button>
              </Form.Item>
            </Form>
          </Spin>
        </div>

        {/* Right Side - Image Preview */}
        <div className="login-image">
          <Image.PreviewGroup items={[preview2, imagebackground, preview1]}>
            <Image width={300} className="preview-image" src={preview2} alt="Preview" />
          </Image.PreviewGroup>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
