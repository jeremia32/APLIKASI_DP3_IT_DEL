import React from "react";
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const PagenotFound = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="404"
      subTitle="Maaf, halaman yang Anda kunjungi tidak ditemukan."
      extra={
        <Button type="primary" onClick={() => navigate(-1)}>
          Kembali ke Halaman Sebelumnya
        </Button>
      }
    />
  );
};

export default PagenotFound;
