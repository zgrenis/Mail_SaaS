import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  return (
    <div className="flex-grow flex items-center py-8 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white shadow-sm rounded-2xl p-8 md:p-12 border border-gray-200"
      >
        <h1 className="text-3xl font-bold text-indigo-600 mb-8 border-b pb-4">Gizlilik Politikası</h1>
        
        <div className="prose prose-indigo text-indigo-600 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-indigo-600">1. Veri Toplama ve Kullanım</h2>
            <p className='text-black '>Sistemimiz, sağladığınız e-posta verilerini yalnızca analiz etmek, sınıflandırmak ve size raporlamak amacıyla işler. Verileriniz üçüncü taraflarla reklam veya pazarlama amacıyla paylaşılmaz.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-indigo-600">2. Veri Güvenliği</h2>
            <p className='text-black'>Hesap şifreleriniz şifrelenmiş bir şekilde saklanmaktadır.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-indigo-600">3. KVKK Uyumluluğu</h2>
            <p className='text-black'>Kullanıcılarımızın kişisel verilerinin korunması kanunu kapsamındaki haklarına saygı duyuyoruz. Verilerinizi istediğiniz an sistemden kalıcı olarak silme hakkına sahipsiniz.</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;