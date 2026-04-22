import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-xl font-bold text-indigo-600">OrbisMail</span>
            <p className="text-gray-500 text-sm mt-1">
              © {new Date().getFullYear()} Tüm Hakları Saklıdır.
            </p>
          </div>
          
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-gray-400 hover:text-gray-600 text-sm">Gizlilik Politikası</Link>
            <Link to="/terms" className="text-gray-400 hover:text-gray-600 text-sm">Kullanım Şartları</Link>
            <Link to="/contact" className="text-gray-400 hover:text-gray-600 text-sm">İletişim</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;