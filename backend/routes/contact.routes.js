const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

// Mail transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // 587 için false olmalı
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    // Bazı ağlarda sertifika doğrulamasını esnetmek gerekebilir
    rejectUnauthorized: false 
  }
});

// POST /api/contact
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Eksik alan var" });
    }

    // 1. DB'ye kaydet
    //await Contact.create({ name, email, message });

    // 2. Mail gönder
    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER,
      subject: `Yeni Mesaj - ${name}`,
      text: `
        İsim: ${name}
        Email: ${email}
        Mesaj: ${message}
      `
    });

    return res.json({ success: true, message: "Mesaj gönderildi" });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false });
  }
});

module.exports = router;