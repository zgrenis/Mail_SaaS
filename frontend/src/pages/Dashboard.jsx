import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import api from '../api/axios';
import { useState } from 'react';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth); // Gerekirse token bilgisini buradan kullanabilirsin
  const [status, setStatus] = useState({ message: '', type: '' });

  const handleAction = async (endpoint, confirmMsg) => {
    if (!window.confirm(confirmMsg)) return;

    try {
      // Backend route'un /api/users altında olduğu için api instance'ı 
      // baz adresi http://localhost:5000/api/users olarak kullanıyor.
      const response = await api.delete(endpoint);
      
      setStatus({ 
        message: response.data.message || 'İşlem başarıyla tamamlandı.', 
        type: 'success' 
      });

      // Eğer hesap silindiyse kullanıcıyı logout yapıp ana sayfaya atarız
      if (endpoint === '/delete-account') {
        setTimeout(() => {
          dispatch(logout());
        }, 2000);
      }
    } catch (err) {
      console.error("Dashboard Action Error:", err);
      setStatus({ 
        message: err.response?.data?.error || 'İşlem sırasında bir hata oluştu.', 
        type: 'error' 
      });
    }
  };

  return (
    <div className="flex-grow p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Bölümü */}
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Hoş Geldin!</h1>
            <p className="text-gray-500 text-sm">SaaS Panelinize Genel Bakış</p>
          </div>
          <button 
            onClick={() => dispatch(logout())}
            className="px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all border border-red-100 active:scale-95"
          >
            Güvenli Çıkış
          </button>
        </header>

        {/* Durum Mesajları (Alert) */}
        {status.message && (
          <div className={`mb-8 p-4 rounded-xl text-sm font-semibold animate-pulse border ${
            status.type === 'success' 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {status.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gmail Ayarları Kartı */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">📧</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Email Entegrasyonu</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Bağlı olan Gmail hesabınızın izinlerini buradan yönetebilir, işlenmiş mail geçmişini temizleyebilirsiniz.
            </p>
            <button 
              onClick={() => handleAction('/disconnect-gmail', 'Gmail bağlantısını kesmek istiyor musunuz? İşlenmiş veriler temizlenecektir.')}
              className="w-full py-3 bg-amber-50 text-amber-700 font-bold rounded-xl hover:bg-amber-100 transition-colors active:scale-[0.98]"
            >
              Gmail Bağlantısını Kes
            </button>
          </div>

          {/* Tehlikeli Alan Kartı */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl">⚠️</span>
            </div>
            <h3 className="text-lg font-bold text-red-600 mb-2">Tehlikeli Bölge</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Hesabınızı sildiğinizde tüm abonelikleriniz ve verileriniz kalıcı olarak kaldırılır. Bu işlem geri alınamaz.
            </p>
            <button 
              onClick={() => handleAction('/delete-account', 'Hesabınızı kalıcı olarak silmek istediğinize emin misiniz?')}
              className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-[0.98]"
            >
              Hesabı Tamamen Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}