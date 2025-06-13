import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Modal } from "antd";
import { UserOutlined, MailOutlined, LockOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Styles/ProfilePage.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: "",
    email: "",
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [passwordForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token:", token);

    if (token) {
      axios
        .get("http://localhost:5000/api/admin/profile", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.data.username) {
            setUserData({
              username: response.data.username,
              email: response.data.email,
            });
          } else {
            messageApi.error(response.data.message || "Gagal mengambil data profil.");
          }
        })
        .catch((error) => {
          messageApi.error(error.response?.data?.message || "Gagal mengambil data profil.");
        });
    }
  }, [messageApi]);

  const handlePasswordChange = async (values) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        messageApi.error("Anda belum login. Silakan login terlebih dahulu.");
        return;
      }

      const requestData = {
        username: userData.username,
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      };

      const response = await axios.put("http://localhost:5000/api/admin/change-password", requestData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Tampilkan pesan loading terlebih dahulu
      await new Promise((resolve) => {
        messageApi.open({
          type: "loading",
          content: "Mengubah password...",
          duration: 2.5,
          onClose: resolve,
        });
      });

      // Setelah loading, tampilkan pesan sukses secara berurutan
      await new Promise((resolve) => {
        messageApi.success(response.data.message || "Password berhasil diubah!", 2.5, resolve);
      });

      setIsModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Gagal mengubah password.";
      messageApi.error(errorMessage);
    }
  };

  return (
    <div className="profile-container">
      {contextHolder}
      <Button type="default" icon={<ArrowLeftOutlined />} onClick={() => navigate("/dashboard")} size="large" className="back-button">
        Kembali ke Dashboard
      </Button>

      <div className="profile-box">
        <h2>Profile</h2>
        <Form layout="vertical" className="profile-form">
          <Form.Item label="Username" required>
            <Input prefix={<UserOutlined />} value={userData.username} disabled size="large" />
          </Form.Item>
          <Form.Item label="Email" required>
            <Input prefix={<MailOutlined />} value={userData.email} disabled size="large" />
          </Form.Item>
          <Button type="primary" icon={<LockOutlined />} onClick={() => setIsModalVisible(true)} size="large">
            Ubah Password
          </Button>
        </Form>
      </div>

      <Modal title="Ubah Password" open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null}>
        <Form form={passwordForm} layout="vertical" onFinish={handlePasswordChange}>
          <Form.Item label="Password Lama" name="oldPassword" rules={[{ required: true, message: "Masukkan password lama!" }]}>
            <Input.Password placeholder="Masukkan password lama" size="large" />
          </Form.Item>
          <Form.Item
            label="Password Baru"
            name="newPassword"
            rules={[
              { required: true, message: "Masukkan password baru!" },
              { min: 8, message: "Password minimal 8 karakter!" },
              { pattern: /[0-9]/, message: "Password harus mengandung angka!" },
              { pattern: /[A-Z]/, message: "Password harus mengandung huruf kapital!" },
            ]}
          >
            <Input.Password placeholder="Masukkan password baru" size="large" />
          </Form.Item>
          <Form.Item
            label="Konfirmasi Password Baru"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Konfirmasi password baru!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Password tidak cocok!"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Konfirmasi password baru" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              Ubah Password
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
