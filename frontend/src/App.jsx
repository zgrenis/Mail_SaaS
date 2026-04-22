
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Redux'tan veri çekmek için
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Footer from './components/Footer';
import Header from './components/Header';
import About from './pages/About';
import PrivacyPolicy from './pages/Privacy';
import Terms from './pages/Term';
import Contact from './pages/Contact';

// Giriş kontrolü yapan koruyucu bileşen
const ProtectedRoute = ({ children }) => {
  // Redux store içerisindeki auth slice'ından durumu çekiyoruz
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Eğer giriş yapılmamışsa login sayfasına postala
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans text-gray-900">
      
      <Header />
      
      {/* 2. flex-grow: Header ve Footer'dan kalan tüm boşluğu bu div doldurur.
        3. w-full: Genişliğin tam olmasını sağlar.
      */}
      <main className="flex-grow w-full flex flex-col">
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />


          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;