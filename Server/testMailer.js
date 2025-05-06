// testMailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

async function testSendMail() {
  try {
    // Konfigurasi transporter dengan kredensial dari environment variables
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // gunakan TLS
      auth: {
        user: process.env.EMAIL_USER, // misal: syahrialjsinaga@gmail.com
        pass: process.env.EMAIL_PASS, // harus app password jika 2FA aktif
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Opsi email yang akan dikirim
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // kirim ke email yang sama untuk pengujian
      subject: "Test Email dari nodemailer",
      text: "Halo, ini adalah email pengujian untuk memeriksa kredensial SMTP!",
    };

    // Mengirim email
    let info = await transporter.sendMail(mailOptions);
    console.log("Email berhasil dikirim:", info.response);
  } catch (error) {
    console.error("Gagal mengirim email:", error);
  }
}

testSendMail();
