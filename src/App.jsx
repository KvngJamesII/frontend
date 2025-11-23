// src/App.jsx - Frontend with Backend API Integration
import React, { useState, useEffect } from 'react';
import { Bell, User, Wallet, LogOut, Upload, Plus, Trash2, Edit, Search, Moon, Sun, MessageSquare, ArrowLeft, History, RefreshCw, X, Check, ChevronDown } from 'lucide-react';
import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://oking-production.up.railway.app'  // ⚠️ REPLACE THIS WITH YOUR RAILWAY URL
  : 'http://localhost:3000';

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

const PAYSTACK_PUBLIC_KEY = 'pk_live_efa6b01e6086e21bda6762026dcaec02dd4f669a';

const App = () => {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [numbers, setNumbers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({});
  
  // Check authentication on mount
  useEffect(() => {
    checkAuth();
    fetchPublicData();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data.user);
      setCurrentPage(response.data.user.isAdmin ? 'admin' : 'home');
    } catch (error) {
      console.log('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicData = async () => {
    try {
      const [countriesRes, announcementsRes, settingsRes] = await Promise.all([
        api.get('/api/countries'),
        api.get('/api/announcements'),
        api.get('/api/settings')
      ]);
      
      setCountries(countriesRes.data.countries || []);
      setAnnouncements(announcementsRes.data.announcements || []);
      setSettings(settingsRes.data.settings || {});
    } catch (error) {
      console.error('Error fetching public data:', error);
    }
  };

  const fetchNumbers = async () => {
    try {
      const response = await api.get('/api/numbers');
      setNumbers(response.data.numberSets || []);
    } catch (error) {
      console.error('Error fetching numbers:', error);
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await api.post('/api/auth/login', { username, password });
      setUser(response.data.user);
      setCurrentPage(response.data.user.isAdmin ? 'admin' : 'home');
      if (!response.data.user.isAdmin) {
        fetchNumbers();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Login failed');
    }
  };

  const handleSignup = async (username, password, referralCode) => {
    try {
      const response = await api.post('/api/auth/register', { 
        username, 
        password, 
        referralCode 
      });
      setUser(response.data.user);
      setCurrentPage('home');
      fetchNumbers();
    } catch (error) {
      alert(error.response?.data?.error || 'Signup failed');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
      setUser(null);
      setCurrentPage('login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  const theme = darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';

  // Login Page
  if (currentPage === 'login') {
    return <LoginPage onLogin={handleLogin} onSignup={() => setCurrentPage('signup')} darkMode={darkMode} />;
  }

  // Signup Page
  if (currentPage === 'signup') {
    return <SignupPage onSignup={handleSignup} onBack={() => setCurrentPage('login')} darkMode={darkMode} />;
  }

  // Admin Panel
  if (user?.isAdmin && currentPage === 'admin') {
    return (
      <AdminPanel
        user={user}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={handleLogout}
        api={api}
        countries={countries}
      />
    );
  }

  // User Pages
  if (currentPage === 'home') {
    return (
      <UserHomePage
        user={user}
        setUser={setUser}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        numbers={numbers}
        announcements={announcements}
        onLogout={handleLogout}
        onWalletClick={() => setCurrentPage('wallet')}
        setCurrentPage={setCurrentPage}
        api={api}
      />
    );
  }

  if (currentPage === 'wallet') {
    return (
      <WalletPage
        user={user}
        setUser={setUser}
        darkMode={darkMode}
        onBack={() => setCurrentPage('home')}
        api={api}
        settings={settings}
      />
    );
  }

  return null;
};

// Login Component
const LoginPage = ({ onLogin, onSignup, darkMode }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onLogin(username, password);
    setLoading(false);
  };

  const theme = darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900';

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <div className={`${theme} p-8 rounded-xl shadow-2xl w-96`}>
        <h1 className="text-3xl font-bold text-center mb-6">OTP King</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            className={`w-full p-3 mb-4 border rounded-lg ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className={`w-full p-3 mb-6 border rounded-lg ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 mb-3 disabled:bg-gray-400"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <button
          onClick={onSignup}
          className="w-full bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

// Signup Component
const SignupPage = ({ onSignup, onBack, darkMode }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSignup(username, password, referralCode);
    setLoading(false);
  };

  const theme = darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900';

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <div className={`${theme} p-8 rounded-xl shadow-2xl w-96`}>
        <h1 className="text-3xl font-bold text-center mb-6">Sign Up</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            className={`w-full p-3 mb-4 border rounded-lg ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className={`w-full p-3 mb-4 border rounded-lg ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Referral Code (Optional)"
            className={`w-full p-3 mb-6 border rounded-lg ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 mb-3 disabled:bg-gray-400"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <button
          onClick={onBack}
          className="w-full bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

// Simple Admin Panel Component
const AdminPanel = ({ user, darkMode, setDarkMode, onLogout, api, countries }) => {
  const [activeTab, setActiveTab] = useState('stats');
  const theme = darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';

  return (
    <div className={`min-h-screen ${theme}`}>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg p-4`}>
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-700">
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <button onClick={onLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Logout
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-8">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
          <h2 className="text-2xl font-bold mb-4">Welcome, {user.username}!</h2>
          <p className="text-lg">Admin dashboard is under construction. Use the backend API directly for now.</p>
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">Quick Links:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Upload numbers via API: POST /api/numbers/upload</li>
              <li>Manage users via API: GET /api/admin/users</li>
              <li>Create promo codes: POST /api/admin/promo</li>
              <li>View stats: GET /api/admin/stats</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// User Homepage Component
const UserHomePage = ({ user, setUser, darkMode, setDarkMode, numbers, announcements, onLogout, onWalletClick, setCurrentPage, api }) => {
  const theme = darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNumbers = numbers.filter(n => 
    n.country?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${theme}`}>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg p-4`}>
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <User size={24} />
            <Bell size={24} />
          </div>
          <h1 className="text-2xl font-bold">OTP King</h1>
          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold">Credits: {user.credits}</div>
            <button onClick={onWalletClick} className="p-2 rounded-full hover:bg-gray-700">
              <Wallet size={24} />
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-700">
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>
        </div>
      </div>

      {announcements.length > 0 && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-blue-600'} text-white py-2 overflow-hidden`}>
          <div className="animate-marquee whitespace-nowrap">
            {announcements.map((a, i) => (
              <span key={i} className="mx-8">{a.text}</span>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full p-3 border rounded-lg ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {filteredNumbers.map(num => (
            <div
              key={num.id}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-transform`}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">{num.country?.flag}</div>
                <h3 className="text-xl font-bold mb-2">{num.country?.name}</h3>
                <p className="text-lg mb-1">{num.country?.code}</p>
                <p className="text-sm">{num.totalCount} Numbers Available</p>
                <p className="text-xs text-gray-500">{num.usedCount} Used</p>
              </div>
            </div>
          ))}
        </div>

        {filteredNumbers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">No numbers available yet</p>
            <p className="text-sm text-gray-400 mt-2">Admin needs to upload numbers first</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Wallet Page Component  
const WalletPage = ({ user, setUser, darkMode, onBack, api, settings }) => {
  const theme = darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);

  const creditAmount = parseInt(settings.credit_amount || 1000);
  const creditPrice = parseInt(settings.credit_price || 1000);

  const handlePromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setLoading(true);
    try {
      const response = await api.post('/api/wallet/promo', { code: promoCode });
      alert(`${response.data.credits} credits added!`);
      setUser({ ...user, credits: user.credits + response.data.credits });
      setPromoCode('');
    } catch (error) {
      alert(error.response?.data?.error || 'Invalid promo code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme}`}>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg p-4`}>
        <div className="flex items-center max-w-7xl mx-auto">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold ml-4">Wallet</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg mb-6`}>
          <h2 className="text-3xl font-bold mb-2">Your Credits</h2>
          <p className="text-5xl font-bold text-blue-600">{user.credits}</p>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg mb-6`}>
          <h3 className="text-2xl font-bold mb-4">Buy Credits</h3>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-xl text-white mb-4">
            <p className="text-xl mb-2">Get {creditAmount} Credits</p>
            <p className="text-3xl font-bold">₦{creditPrice}</p>
          </div>
          <button className="w-full bg-green-600 text-white p-4 rounded-lg text-xl font-semibold hover:bg-green-700">
            Pay with Paystack
          </button>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg`}>
          <h3 className="text-2xl font-bold mb-4">Promo Code</h3>
          <input
            type="text"
            placeholder="Enter promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className={`w-full p-4 mb-4 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
          />
          <button
            onClick={handlePromoCode}
            disabled={loading}
            className="w-full bg-blue-600 text-white p-4 rounded-lg text-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Claiming...' : 'Claim Credits'}
          </button>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg mt-6`}>
          <h3 className="text-2xl font-bold mb-4">Referral Program</h3>
          <p className="mb-4">Earn credits by inviting friends!</p>
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg mb-4`}>
            <p className="text-sm mb-2">Your Referral Code:</p>
            <p className="text-xl font-bold">{user.username}</p>
          </div>
          <p className="text-sm">Total Referrals: {user.referrals || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default App;
