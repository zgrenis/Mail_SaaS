// src/pages/Login.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  loginUser,
  clearAuthMessages,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated,
} from '../store/authSlice';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Zaten giriş yaptıysa dashboard'a yönlendir
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  // Sayfa değişince hataları temizle
  useEffect(() => {
    return () => dispatch(clearAuthMessages());
  }, [dispatch]);

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Giriş Yap</h2>

        {/* Hata Mesajı */}
        {error && (
          <div className="mb-6 flex items-center p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <svg className="h-5 w-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Adresi</label>
            <input
              type="email"
              placeholder="ornek@mail.com"
              className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition-all ${
                errors.email ? 'border-red-400' : 'border-gray-200'
              }`}
              {...register('email', {
                required: 'Email zorunludur.',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Geçerli bir email girin.' },
              })}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Şifre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input
              type="password"
              placeholder="••••••••"
              className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition-all ${
                errors.password ? 'border-red-400' : 'border-gray-200'
              }`}
              {...register('password', {
                required: 'Şifre zorunludur.',
                minLength: { value: 6, message: 'Şifre en az 6 karakter olmalıdır.' },
              })}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-white font-bold rounded-xl shadow-lg bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 transition-all transform active:scale-95 flex items-center justify-center disabled:opacity-70"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Hesabın yok mu?{' '}
          <Link to="/register" className="font-extrabold text-indigo-600 hover:text-indigo-800">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
}