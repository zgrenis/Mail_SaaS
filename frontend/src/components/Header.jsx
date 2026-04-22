import { Link } from 'react-router-dom';
import About from '../pages/About';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Kısmı */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              OrbisMail
            </Link>
          </div>

          {/* Navigasyon Linkleri */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Anasayfa</Link>
            <Link to="/about" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Hakkımızda</Link>
            
            {/* Giriş Sayfasıyla Uyumlu Buton */}
            <Link 
              to="/login" 
              className="text-indigo-600 font-medium hover:text-indigo-500"
            >
              Giriş Yap
            </Link>
            <Link 
              to="/register" 
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Kayıt Ol
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;