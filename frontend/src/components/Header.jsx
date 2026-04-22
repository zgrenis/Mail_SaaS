// src/components/Header.jsx
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, selectIsAuthenticated, selectUser } from '../store/authSlice';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  

  return (
    <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      <span
        onClick={() => navigate('/')}
        className="font-bold text-indigo-600 text-xl cursor-pointer"
      >
        OrbisMail
      </span>

      <nav className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            {/* Email göster — JWT'den gelen field adına göre ayarla */}
            {(user?.email || user?.sub) && (
              <span className="text-sm text-gray-500 hidden sm:block">
                {user.email ?? user.sub}
              </span>
            )}

            {/* Dashboard butonu */}
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
            >
              Dashboard
            </button>

            {/* Çıkış butonu */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors cursor-pointer"
            >
              Çıkış Yap
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Giriş Yap
            </button>
            <button
              onClick={() => navigate('/register')}
              className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Kayıt Ol
            </button>
          </>
        )}
      </nav>
    </header>
  );
}