import { motion } from 'framer-motion';

const Terms = () => {
  return (
    <div className="flex-grow flex items-center py-8 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white shadow-sm rounded-2xl p-8 md:p-12 border border-gray-200"
      >
        <h1 className="text-3xl font-bold text-indigo-600 mb-8 border-b pb-4">Kullanım Şartları</h1>
        
        <div className="space-y-6 text-black">
          <h2 className="text-xl font-semibold text-indigo-600">Hizmet Tanımı</h2>
          <p className="text-black">Bu platform, e-posta otomasyonu, özetleme ve sınıflandırma hizmeti sunan bir SaaS (Hizmet Olarak Yazılım) çözümüdür. Kullanıcılar, sisteme bağladıkları e-postaların analiz edilmesine izin vermiş sayılırlar.</p>

          <h2 className="text-xl font-semibold text-indigo-600">Kullanım Kısıtlamaları</h2>
          <ul className="list-disc pl-5 space-y-2 text-black">
            <li className="text-indigo-600"><p className='text-black'>Sistemi yasa dışı faaliyetler veya spam gönderimi amacıyla kullanamazsınız.</p></li>
            <li className="text-indigo-600"><p className='text-black'>Tersine mühendislik yoluyla sistem altyapısına müdahale edilemez.</p></li>
            <li className="text-indigo-600"><p className='text-black'>Hizmetin kesintisiz çalışması için gayret gösterilse de, teknik aksaklıklardan doğabilecek veri kayıplarından platform sorumlu tutulamaz.</p></li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default Terms;