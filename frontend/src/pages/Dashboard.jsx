import { useSelector, useDispatch } from 'react-redux';
import { logout, selectAuthLoading, connectGmail, disconnectGmail, deleteAccount } from '../store/authSlice';
import api from '../api/axios';
import { useState } from 'react';
import ActionCard from '../components/ActionCard';
import { useNavigate } from 'react-router-dom';
import EmailsTable from '../components/EmailsTable';
import DepartmentStats from '../components/DepartmanStats';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth); // Gerekirse token bilgisini buradan kullanabilirsin
  const [status, setStatus] = useState({ message: '', type: '' });

  const loading = useSelector(selectAuthLoading);

  const handleGmailConnect = async () => {
    const result = await dispatch(connectGmail());

    if (connectGmail.fulfilled.match(result)) {
      const url = result.payload?.url || result.payload?.authUrl;
      if (url) {
        window.location.href = url; // Google OAuth sayfasına yönlendir
      }
    }
  };

  const handleDisconnectGmail = async () => {
    const result = await dispatch(disconnectGmail());
    if (disconnectGmail.fulfilled.match(result)) {
      alert('Gmail bağlantısı kesildi.'); // ya da toast notification
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm('Hesabınız kalıcı olarak silinecek. Emin misiniz?');
    if (!confirm) return;

    const result = await dispatch(deleteAccount());
    if (deleteAccount.fulfilled.match(result)) {
      navigate('/register'); // Hesap silindi, kayıt sayfasına yönlendir
    }
  };

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
      <div className="max-w-8xl mx-auto">
        {/* Header Section */}
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Hoş Geldin!</h1>
            <p className="text-gray-500 text-sm">SaaS Panelinize Genel Bakış</p>
          </div>
          <button 
            onClick={() => dispatch(logout())}
            className="px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all border border-red-100 active:scale-95 cursor-pointer"
          >
            Güvenli Çıkış
          </button>
        </header>

        {/* Status Message (Alert) */}
        {status.message && (
          <div className={`mb-8 p-4 rounded-xl text-sm font-semibold animate-pulse border ${
            status.type === 'success' 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {status.message}
          </div>
        )}

          {/* E-posta Listeleme Tablosu */}
          <div className="mb-10">
            <EmailsTable />
          </div>
          {/* Departman İstatistikleri */}
          <div className="mb-10">
            <DepartmentStats />
          </div>
          {/* Account Operations  */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Card Connect Gmail */}
            <ActionCard
              icon="📧"
              title="Email Entegrasyonu"
              description="Gmail adresinizi bağlayarak e-postalarınızı otomatik olarak analiz edebilirsiniz."
              buttonText={loading ? 'Yönlendiriliyor...' : 'Gmail Hesabınızı Bağlayın'}
              onClick={handleGmailConnect}
              variant="green"
            />

            {/* 2. Card Diconnect Gmail */}
            <ActionCard
            icon="📧"
            title="Gmail Bağlantısını Kes"
            description="Gmail hesabınızın bağlantısını kesin."
            buttonText={loading ? 'İşleniyor...' : 'Bağlantıyı Kes'}
            onClick={handleDisconnectGmail}
            variant="amber"
          />

     

            {/* 3. Card Diconnect Gmail */}
            <ActionCard
            icon="🗑️"
            title="Hesabı Sil"
            description="Hesabınızı kalıcı olarak silin. Bu işlem geri alınamaz."
            buttonText={loading ? 'Siliniyor...' : 'Hesabı Sil'}
            onClick={handleDeleteAccount}
            variant="red"
          />
          </div>
      </div>
    </div>
  );
}