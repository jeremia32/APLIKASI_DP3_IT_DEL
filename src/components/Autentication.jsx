import React, { useState } from "react";
import { Image, Input, Button, Form, message, Spin, Alert } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Styles/LoginPage.css";
import imagebackground from "../assets/imagebackground.jpg";
import logo from "../assets/ITDEL.jpg";
import preview1 from "../assets/preview1.jpg";
import preview2 from "../assets/preview2.jpg";

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
      let response;
      let role = "";

      console.log("🔍 Mencoba login sebagai Admin...");
      try {
        response = await axios.post("http://localhost:5000/api/admin/login", values);
        role = "admin";
        console.log("✅ Login Admin Berhasil!", response.data);
      } catch (adminError) {
        console.error("❌ Login Admin Gagal:", adminError.response?.data);
        console.log("🔍 Mencoba login sebagai User...");

        try {
          response = await axios.post("http://localhost:5000/api/userslogin/login", values);
          role = "user";
          console.log("✅ Login User Berhasil!", response.data);
        } catch (userError) {
          console.error("❌ Login User Gagal:", userError.response?.data);
          throw new Error(userError.response?.data?.message || "Login Gagal");
        }
      }

      const { token } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      setSuccessMsg(`Login Berhasil`);

      setTimeout(() => {
        if (role === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/dashboard_user");
        }
      }, 1000);
    } catch (error) {
      setErrorMsg(error.message);
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
            {/* <h2>Login</h2> */}
          </div>

          {/* Alert jika login gagal */}
          {errorMsg && <Alert message="Error" description={errorMsg} type="error" showIcon closable style={{ marginBottom: 16 }} />}

          {/* Alert jika login sukses */}
          {successMsg && <Alert message="Success" description={successMsg} type="success" showIcon style={{ marginBottom: 16 }} />}

          <Spin spinning={loading} tip="Logging in...">
            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item name="username" rules={[{ required: true, message: "Masukkan Username!" }]}>
                <Input prefix={<UserOutlined />} placeholder="Nama Pengguna" size="large" />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, message: "Masukkan Password!" }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Kata Sandi" size="large" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" className="login-button" size="large" loading={loading}>
                  Masuk
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
