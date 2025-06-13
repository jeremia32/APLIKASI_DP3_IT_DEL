import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Spin, Radio, Typography, Button, Card, Table, Tooltip, Modal, Input } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

const FormPenilaian = () => {
  const { id } = useParams(); // penilaianUser ID
  const navigate = useNavigate();
  const { search, state: locationState } = useLocation();
  const roleFromUrl = new URLSearchParams(search).get("role");
  const userDinilai = locationState?.userDinilai;

  const [userDinilaiData, setUserDinilaiData] = useState(userDinilai);
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // jawaban: objek { [pertanyaanId]: nilai }
  const [jawaban, setJawaban] = useState({});

  // saran opsional
  const [saran, setSaran] = useState("");

  // modal konfirmasi
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  // modal sukses
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  // hitung mundur (detik)
  const [countdown, setCountdown] = useState(5);
  const countdownRef = useRef(null);

  // flag untuk menampilkan pesan validasi di bawah masing-masing pertanyaan
  const [validationTriggered, setValidationTriggered] = useState(false);

  // Hitung total pertanyaan
  const totalQuestions = categories.reduce((sumCat, cat) => sumCat + (cat.aspek?.reduce((sumAsp, asp) => sumAsp + (asp.pertanyaan?.length || 0), 0) || 0), 0);

  // Fetch data user yang dinilai
  useEffect(() => {
    if (!userDinilai?.nip) return;
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${userDinilai.nip}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUserDinilaiData(res.data.user);
      } catch {
        Modal.error({
          title: "Error",
          content: "Gagal mengambil data user.",
          okText: "Oke",
        });
      }
    };
    fetchUser();
  }, [userDinilai]);

  // Fetch kategori kuesioner berdasarkan role
  useEffect(() => {
    if (!roleFromUrl) return;
    const fetchCategories = async () => {
      setLoadingData(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/kategori/by-role/${roleFromUrl}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setCategories(res.data.tree || res.data);
      } catch (err) {
        Modal.error({
          title: "Gagal memuat kuesioner",
          content: err.response?.data?.message || "Terjadi kesalahan server.",
          okText: "Oke",
        });
      } finally {
        setLoadingData(false);
      }
    };
    fetchCategories();
  }, [roleFromUrl]);

  // Saat user memilih nilai radio
  const handleChange = (pertanyaanId, nilai) => {
    setJawaban((prev) => ({ ...prev, [pertanyaanId]: nilai }));
  };

  const skorRubrik = {
    7: "Sangat Baik",
    6: "Baik Sekali",
    5: "Baik",
    4: "Cukup",
    3: "Kurang",
    2: "Sangat Kurang",
    1: "Tidak Memadai",
  };

  // Validasi sebelum menampilkan modal konfirmasi
  const handleConfirmSubmit = () => {
    const filledCount = Object.keys(jawaban).length;

    if (filledCount < totalQuestions) {
      // Aktifkan validasi di bawah setiap pertanyaan
      setValidationTriggered(true);
      Modal.warning({
        title: "Isi Tidak Lengkap",
        content: `Harap mengisi semua pertanyaan (${filledCount}/${totalQuestions}).`,
        okText: "Oke",
      });
      return;
    }

    // Jika sudah lengkap, reset validasi lalu tampilkan modal konfirmasi
    setValidationTriggered(false);
    setIsConfirmModalVisible(true);
  };

  // Jika user klik “Kirim” di modal konfirmasi
  const handleModalOk = () => {
    setIsConfirmModalVisible(false);
    kirimKeAPI();
  };

  // Jika user klik “Batalkan” di modal konfirmasi
  const handleModalCancel = () => {
    setIsConfirmModalVisible(false);
  };

  // Kirim data ke backend
  const kirimKeAPI = async () => {
    const firstPertanyaanId = categories?.[0]?.aspek?.[0]?.pertanyaan?.[0]?._id;
    const saranPayload = firstPertanyaanId ? [{ pertanyaan: firstPertanyaanId, isi: saran.trim() }] : [];

    const payload = {
      penilaianUser: id,
      evaluatorNip: userDinilaiData?.nip,
      jawaban: Object.entries(jawaban).map(([pertanyaan, nilai]) => ({
        pertanyaan,
        nilai,
      })),
      saran: saranPayload,
    };

    setSubmitting(true);
    try {
      await axios.post("http://localhost:5000/api/hasil-penilaian", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      // Tampilkan modal sukses
      setIsSuccessModalVisible(true);
      // Mulai hitung mundur 5 detik
      setCountdown(5);
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } catch (err) {
      Modal.error({
        title: "Gagal Menyimpan",
        content: err.response?.data?.message || "Gagal menyimpan penilaian.",
        okText: "Oke",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Jika user klik “Oke” di modal sukses
  const handleSuccessOk = () => {
    clearInterval(countdownRef.current);
    navigate("/dashboard_user", { state: { removedId: id }, replace: true });
  };

  // Saat countdown mencapai 0, otomatis redirect
  useEffect(() => {
    if (countdown === 0) {
      clearInterval(countdownRef.current);
      navigate("/dashboard_user", { state: { removedId: id }, replace: true });
    }
  }, [countdown, navigate, id]);

  if (loadingData) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: 30 }}>
      <div
        style={{
          maxWidth: 900,
          margin: "auto",
          padding: 60,
          borderRadius: 8,
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Title
          level={3}
          style={{
            textAlign: "center",
            marginTop: -20,
            fontSize: 24,
            fontWeight: "bold",
            paddingBottom: 20,
          }}
        >
          Lembar Penilaian
        </Title>
        <Text
          style={{
            fontSize: 16,
            color: "#555",
            padding: 20,
            textAlign: "center",
            lineHeight: "1.8",
          }}
        >
          Mohon berikan penilaian secara <strong>jujur</strong>, <strong>objektif</strong>, dan <strong>bertanggung jawab</strong> sesuai dengan pengetahuan Anda terhadap yang bersangkutan. Informasi yang Anda sampaikan akan digunakan
          semata-mata untuk keperluan proses evaluasi. Penilaian mencakup berbagai aspek sebagaimana tercantum dalam tabel berikut, dengan memilih skor pada kolom yang tersedia, di mana <strong>skor 1</strong> menunjukkan nilai paling
          rendah dan <strong>skor 7</strong> nilai paling tinggi.
        </Text>
        <br />

        {userDinilaiData ? (
          <Card style={{ marginBottom: 20, background: "#fafafa" }}>
            <Text strong>Periode Penilaian: {new Date().getFullYear()}</Text>
            <br />
            <Text strong>Nama: </Text> {userDinilaiData.username}
            <br />
            <Text strong>Email: </Text> {userDinilaiData.email}
            <br />
            <Text strong>Jabatan: </Text> {userDinilaiData.role}
            <br />
            <Text strong>Bukti: </Text> {userDinilaiData.prestasi || "-"}
          </Card>
        ) : (
          <Text type="warning">Data user dinilai tidak tersedia.</Text>
        )}

        {categories.length === 0 && <Text type="secondary">Tidak ada kuesioner untuk role ini.</Text>}

        {categories.map((cat) => {
          const dataSource = cat.aspek.flatMap((asp) => {
            const rows = [{ key: `aspek-${asp._id}`, isAspekRow: true, aspekNama: asp.nama }];
            asp.pertanyaan?.forEach((pt) =>
              rows.push({
                key: pt._id,
                isAspekRow: false,
                teks: pt.teks,
                pertanyaanId: pt._id,
              })
            );
            return rows;
          });

          return (
            <Card
              key={cat._id}
              style={{
                background: "#ffffff",
                borderRadius: 8,
                marginBottom: 20,
              }}
            >
              <div style={{ margin: "16px 0" }}>
                <Text style={{ fontSize: 14, color: "#555" }}>
                  Skala Penilaian:
                  <br />
                  {Object.entries(skorRubrik)
                    .map(([score, label]) => `${score}: ${label}`)
                    .join(", ")}
                </Text>
              </div>
              <Table
                dataSource={dataSource}
                pagination={false}
                bordered
                rowClassName={(record) => (record.isAspekRow ? "aspek-header-row" : "")}
                columns={[
                  {
                    title: "Pertanyaan",
                    dataIndex: "teks",
                    width: "40%",
                    key: "pertanyaan",
                    render: (text, row) => (row.isAspekRow ? <strong style={{ fontSize: 16 }}>{`Aspek: ${row.aspekNama}`}</strong> : text),
                    onCell: (row) => ({
                      colSpan: row.isAspekRow ? 2 : 1,
                    }),
                  },
                  {
                    title: "Rubrik",
                    dataIndex: "pertanyaanId",
                    width: "60%",
                    key: "rubrik",
                    render: (pertanyaanId, row) =>
                      row.isAspekRow ? null : (
                        <div>
                          <Radio.Group
                            onChange={(e) => handleChange(pertanyaanId, e.target.value)}
                            value={jawaban[pertanyaanId]}
                            style={{
                              display: "flex",
                              gap: 12,
                              flexWrap: "wrap",
                            }}
                          >
                            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                              <Tooltip key={n} title={skorRubrik[n]}>
                                <Radio value={n}>{n}</Radio>
                              </Tooltip>
                            ))}
                          </Radio.Group>
                          {/* Pesan validasi di bawah Radio.Group */}
                          {validationTriggered && (jawaban[pertanyaanId] === undefined || jawaban[pertanyaanId] === null) && (
                            <Text type="danger" style={{ display: "block", marginTop: 4 }}>
                              Harap Mengisi skala untuk pertanyaan ini
                            </Text>
                          )}
                        </div>
                      ),
                  },
                ]}
              />
            </Card>
          );
        })}

        {/* Card untuk Saran Umum */}
        {categories.length > 0 && (
          <Card title="Saran dan Masukan (opsional)" style={{ marginBottom: 20 }}>
            <TextArea rows={4} placeholder="Tuliskan saran atau masukan Anda mengenai proses penilaian ini…" value={saran} onChange={(e) => setSaran(e.target.value)} />
          </Card>
        )}

        {categories.length > 0 && (
          <Button type="primary" onClick={handleConfirmSubmit} loading={submitting} style={{ marginTop: 20 }}>
            Simpan Penilaian
          </Button>
        )}

        {/* Modal Konfirmasi */}
        <Modal title="Konfirmasi Penilaian" open={isConfirmModalVisible} onCancel={handleModalCancel} footer={null} centered>
          <Text>Apakah Anda yakin ingin menyimpan penilaian ini?</Text>
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <Button onClick={handleModalCancel} style={{ marginRight: 10 }}>
              Batalkan
            </Button>
            <Button type="primary" onClick={handleModalOk}>
              Kirim
            </Button>
          </div>
        </Modal>

        {/* Modal Sukses dengan hitung mundur */}
        <Modal title="Sukses" open={isSuccessModalVisible} footer={null} centered>
          <Text>Penilaian berhasil terkirim!</Text>
          <br />
          <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
            Anda akan diarahkan ke Beranda dalam {countdown} detik.
          </Text>
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <Button type="primary" onClick={handleSuccessOk}>
              Oke
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default FormPenilaian;
