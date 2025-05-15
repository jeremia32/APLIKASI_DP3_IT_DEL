import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Spin, message, Radio, Typography, Button, Card, Table, Tooltip, Modal, Input } from "antd";
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
  const [jawaban, setJawaban] = useState({});
  const [saran, setSaran] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [periodePenilaian, setPeriodePenilaian] = useState("");

  // hitung total pertanyaan
  const totalQuestions = categories.reduce((sumCat, cat) => sumCat + (cat.aspek?.reduce((sumAsp, asp) => sumAsp + (asp.pertanyaan?.length || 0), 0) || 0), 0);

  // fetch data user dinilai
  useEffect(() => {
    if (!userDinilai?.nip) return;
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${userDinilai.nip}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        setUserDinilaiData(res.data.user);
      } catch {
        message.error("Gagal mengambil data user.");
      }
    };
    fetchUser();
  }, [userDinilai]);

  // fetch kategori kuesioner
  useEffect(() => {
    if (!roleFromUrl) return;
    const fetchCategories = async () => {
      setLoadingData(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/kategori/by-role/${roleFromUrl}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        setCategories(res.data.tree || res.data); // jika backend mengemas tree
      } catch (err) {
        message.error(err.response?.data?.message || "Gagal memuat kuesioner");
      } finally {
        setLoadingData(false);
      }
    };
    fetchCategories();
  }, [roleFromUrl]);

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

  const handleSubmit = async () => {
    if (Object.keys(jawaban).length < totalQuestions) {
      return message.warning(`Mohon isi semua pertanyaan (${Object.keys(jawaban).length}/${totalQuestions})`);
    }

    // gunakan pertanyaan pertama sebagai placeholder jika model masih memerlukan field pertanyaan
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
      await axios.post("http://localhost:5000/api/hasil-penilaian", payload, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      message.success("Penilaian berhasil disimpan!");
      navigate("/dashboard_user", { state: { removedId: id }, replace: true });
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Gagal menyimpan penilaian");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmSubmit = () => setIsModalVisible(true);
  const handleModalOk = () => {
    setIsModalVisible(false);
    handleSubmit();
  };
  const handleModalCancel = () => setIsModalVisible(false);

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
            <Text strong>Prestasi: </Text> {userDinilaiData.prestasi || "-"}
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
                    onCell: (row) => ({ colSpan: row.isAspekRow ? 2 : 1 }),
                  },
                  {
                    title: "Rubrik",
                    dataIndex: "pertanyaanId",
                    width: "60%",
                    key: "rubrik",
                    render: (pertanyaanId, row) =>
                      row.isAspekRow ? null : (
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
        <Modal title="Konfirmasi Penilaian" open={isModalVisible} onCancel={handleModalCancel} footer={null} centered>
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
      </div>
    </div>
  );
};

export default FormPenilaian;
