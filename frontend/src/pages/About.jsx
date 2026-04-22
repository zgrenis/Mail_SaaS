import { motion } from 'framer-motion';
import { Target, Users, ShieldCheck, Rocket } from 'lucide-react';

const About = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="flex-grow">
      {/* Üst Başlık Bölümü */}
      <section className="bg-white border-b border-gray-200 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6"
          >
            Dijital İletişimi <span className="text-indigo-600">Yeniden Tanımlıyoruz</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            E-posta yığınlarını anlamlı verilere dönüştürerek, işletmelerin müşterileriyle olan bağını güçlendiriyoruz.
          </motion.p>
        </div>
      </section>

      {/* Hikayemiz ve Vizyon */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Neden Buradayız?</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Günümüzde işletmeler günde yüzlerce, hatta binlerce e-posta alıyor. Bu mesajların içindeki kritik şikayetleri, talepleri ve fırsatları manuel olarak ayıklamak sadece zaman kaybı değil, aynı zamanda hata payı yüksek bir süreçtir.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Biz, geliştiriciler ve operasyon ekipleri için bu süreci otopilota bağlayan bir teknoloji geliştirdik. Mail otomasyon çözümümüzle, gelen her mesajı saniyeler içinde analiz ediyor, sınıflandırıyor ve doğrudan iş akışınıza (veritabanınıza) entegre ediyoruz.
            </p>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="grid grid-cols-2 gap-4"
          >
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <Target className="text-indigo-600 w-8 h-8 mb-3" />
              <span className="font-bold text-gray-900">Odaklı</span>
              <span className="text-sm text-gray-500">Sadece ihtiyacınız olan veri</span>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <Rocket className="text-indigo-600 w-8 h-8 mb-3" />
              <span className="font-bold text-gray-900">Hızlı</span>
              <span className="text-sm text-gray-500">Gerçek zamanlı sınıflandırma</span>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <Users className="text-indigo-600 w-8 h-8 mb-3" />
              <span className="font-bold text-gray-900">Kullanıcı Dostu</span>
              <span className="text-sm text-gray-500">Karmaşıklıktan uzak arayüz</span>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <ShieldCheck className="text-indigo-600 w-8 h-8 mb-3" />
              <span className="font-bold text-gray-900">Güvenli</span>
              <span className="text-sm text-gray-500">Uçtan uca veri koruması</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Değerlerimiz */}
      <section className="bg-indigo-900 py-20 px-4 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Temel Prensiplerimiz</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-indigo-300">İnovasyon</h3>
              <p className="text-indigo-100/80">E-posta yönetiminde en yeni algoritmaları kullanarak, statik kurallar yerine dinamik çözümler üretiyoruz.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-indigo-300">Şeffaflık</h3>
              <p className="text-indigo-100/80">Sistemimizin nasıl karar verdiğini ve verilerinizin nasıl işlendiğini her zaman açık bir şekilde raporluyoruz.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-indigo-300">Verimlilik</h3>
              <p className="text-indigo-100/80">Ekiplerin rutin işlere değil, değer yaratan projelere odaklanması için zamanı geri kazandırıyoruz.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;