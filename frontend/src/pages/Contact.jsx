import { motion } from 'framer-motion';
import { Mail, MapPin, Send } from 'lucide-react';

const Contact = () => {
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
          {/* İletişim Bilgileri */}
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

          {/* İletişim Formu */}
          <motion.form
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200 space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ad Soyad
              </label>
              <input
                type="text"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="İsim Soyisim"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="mailadresi@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mesajınız
              </label>
              <textarea
                rows="4"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nasıl yardımcı olabiliriz?"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 font-medium transition-colors"
            >
              Gönder <Send className="ml-2 w-4 h-4" />
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default Contact;