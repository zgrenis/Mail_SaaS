import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Zap, AlertTriangle, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';

const Home = () => {
  //? Animations Settings
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="flex-grow w-full bg-gray-50">
      {/* --- HERO BÖLÜMÜ --- */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-3xl"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 font-medium text-sm mb-6">
            <Zap className="w-4 h-4 mr-2" />
            Daha Akıllı Bir Gelen Kutusu, Daha Hızlı Bir Ekip
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            E-posta Yönetiminde <span className="text-indigo-600">Yeni Nesil</span> Otomasyon 
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-xl text-gray-600 mb-10">
            Müşteri e-postalarını manuel okumaya son verin. Akıllı sistemimiz gelen mesajları analiz eder, sınıflandırır ve aksiyon almanızı hızlandırır.
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/register" 
              className="inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Ücretsiz Başla
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link 
              to="/login" 
              className="inline-flex justify-center items-center px-8 py-3.5 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all duration-300"
            >
              Sistemi İncele
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* --- ÖZELLİKLER BÖLÜMÜ --- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Neden Bizi Seçmelisiniz?</h2>
            <p className="mt-4 text-lg text-gray-600">Süreçlerinizi hızlandıracak güçlü özellikler</p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Özellik 1 */}
            <motion.div variants={fadeUp} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-indigo-100 transition-colors">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Akıllı Şikayet Tespiti</h3>
              <p className="text-gray-600">
                Gelen e-postaları metin analizinden geçirerek şikayet içerenleri anında tespit eder ve veritabanınızda ilgili şekilde işaretler.
              </p>
            </motion.div>

            {/* Özellik 2 */}
            <motion.div variants={fadeUp} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-indigo-100 transition-colors">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Otomatik Sınıflandırma</h3>
              <p className="text-gray-600">
                Mail içeriklerinizi özetleyerek kategorize ederek iş akışınızı düzenler, doğru departmana hızla ulaşmasını sağlar.
              </p>
            </motion.div>

            {/* Özellik 3 */}
            <motion.div variants={fadeUp} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-indigo-100 transition-colors">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Detaylı Raporlama</h3>
              <p className="text-gray-600">
                Hangi konularda daha çok mail aldığınızı, yanıtlanma sürelerinizi ve şikayet oranlarınızı tek ekrandan takip edin.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- ALT CTA BÖLÜMÜ --- */}
      <section className="py-20 bg-indigo-600">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-6">
            Müşteri ilişkilerinizi dönüştürmeye hazır mısınız?
          </h2>
          <p className="text-indigo-100 mb-8 text-lg">
            Kredi kartı gerekmez. Hemen kayıt olun ve sistemin gücünü test edin.
          </p>
          <ul className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10 text-indigo-100">
            <li className="flex items-center"><CheckCircle2 className="w-5 h-5 mr-2 text-indigo-300"/> Hızlı Kurulum</li>
            <li className="flex items-center"><CheckCircle2 className="w-5 h-5 mr-2 text-indigo-300"/> Anında Entegrasyon</li>
            <li className="flex items-center"><CheckCircle2 className="w-5 h-5 mr-2 text-indigo-300"/> 7/24 Destek</li>
          </ul>
          <Link 
            to="/register" 
            className="inline-block bg-white text-indigo-600 font-bold px-8 py-4 rounded-lg shadow-lg hover:bg-gray-50 hover:scale-105 transition-transform duration-200"
          >
            Hesabınızı Oluşturun
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;