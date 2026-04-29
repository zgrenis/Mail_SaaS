import { motion } from 'framer-motion';
import { Mail, MapPin, Send } from 'lucide-react';
import { useState } from 'react';



const Contact = () => {

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (data.success) {
        alert("Mesaj başarıyla gönderildi!");
        setForm({ name: "", email: "", message: "" });
      } else {
        alert("Bir hata oluştu!");
      }

    } catch (err) {
      console.log(err);
      alert("Server hatası");
    }

    setLoading(false);
  };

  return (
    <div className="flex-grow flex items-center py-12 px-4">
      <div className="max-w-6xl mx-auto w-full">

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Bize Ulaşın</h1>
          <p className="mt-4 text-gray-600">
            Sorularınız veya iş birliği talepleriniz için ekibimizle iletişime geçin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* SOL */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >

            <div className="flex items-start space-x-4">
              <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">E-posta</h3>
                <p className="text-gray-600">zgr.enis@gmail.com</p>
              </div>
            </div>

            {/* LinkedIn FIXED */}
            <div className="flex items-start space-x-4">
              <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 
                  2.761 2.239 5 5 5h14c2.761 0 5-2.239 
                  5-5v-14c0-2.761-2.239-5-5-5zm-11 
                  19h-3v-10h3v10zm-1.5-11.268c-.966 
                  0-1.75-.784-1.75-1.75s.784-1.75 
                  1.75-1.75 1.75.784 
                  1.75 1.75-.784 1.75-1.75 
                  1.75zm13.5 11.268h-3v-5.604c0-3.368-4-3.113-4 
                  0v5.604h-3v-10h3v1.528c1.396-2.586 
                  7-2.777 7 2.476v5.996z"/>
                </svg>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">LinkedIn</h3>
                <a
                  href="https://linkedin.com/in/eniszgr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  linkedin.com/in/eniszgr
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Konum</h3>
                <p className="text-gray-600">Balıkesir/Türkiye</p>
              </div>
            </div>

          </motion.div>

          {/* FORM */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200 space-y-6"
          >

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              type="text"
              className="w-full px-4 py-3 border rounded-md"
              placeholder="İsim Soyisim"
              required
            />

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              className="w-full px-4 py-3 border rounded-md"
              placeholder="mail@example.com"
              required
            />

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border rounded-md"
              placeholder="Mesajınız"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              {loading ? "Gönderiliyor..." : "Gönder"}
              <Send className="ml-2 w-4 h-4" />
            </button>

          </motion.form>

        </div>
      </div>
    </div>
  );
};

export default Contact;