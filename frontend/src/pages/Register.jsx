// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [formData, setFormData] = useState({ email: '', password: '', plan: 'Free' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Başarı mesajı için yeni state
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api/users';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await axios.post(`${BACKEND_URL}/register`, {
        email: formData.email,
        password: formData.password,
        plan: formData.plan
      });

      // Popup yerine ekranda görünecek mesaj
      setSuccess('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
      
      // 2.5 saniye sonra otomatik yönlendirme
      setTimeout(() => {
        navigate('/login');
      }, 2500);

    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Kayıt sırasında bir hata oluştu.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
        <h2 className="text-3xl font-extrabold text-center text-indigo-600 mb-2">Aramıza Katıl</h2>
        <p className="text-center text-gray-500 mb-8 text-sm italic">Sadece bir adım uzaktasın.</p>
        
        {/* ESTETİK HATA MESAJI */}
        {error && (
          <div className="mb-6 flex items-center p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-bounce-short">
            <svg className="h-5 w-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* ESTETİK BAŞARI MESAJI */}
        {success && (
          <div className="mb-6 flex items-center p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg shadow-sm animate-pulse">
            <svg className="h-5 w-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="ml-3 text-sm font-medium text-green-800">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">E-posta</label>
            <input 
              type="email" required placeholder="ornek@mail.com"
              disabled={!!success} // Başarı durumunda inputları kilitle
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition-all"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Şifre</label>
            <input 
              type="password" required placeholder="••••••••"
              disabled={!!success}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition-all"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !!success}
            className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center ${
              success ? 'bg-green-500 shadow-green-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
            }`}
          >
            {loading ? (
               <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : success ? 'Yönlendiriliyorsunuz...' : 'Kayıt Ol'}
          </button>
        </form>

        {!success && (
          <p className="mt-8 text-center text-sm text-gray-500">
            Zaten hesabın var mı?{' '}
            <Link to="/login" className="font-extrabold text-indigo-600 hover:text-indigo-800">Giriş Yap</Link>
          </p>
        )}
      </div>
    </div>
  );
}