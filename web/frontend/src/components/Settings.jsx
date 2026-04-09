import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, LogOut, Shield } from 'lucide-react';
import { clearSession } from '../services/api';

export default function Settings() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#e7e3f4] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/chat" className="p-2 -ml-2 text-[#6e6093] hover:bg-[#d8cfee] rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-[#23114b]">Settings</h1>
        </div>

        {/* Simple Settings */}
        <div className="space-y-4">
          <div className="bg-[#f6f3ff] rounded-2xl shadow-sm border border-[#d8cfee] overflow-hidden">
            <button className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#efe9ff] transition-colors text-left">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-[#75669e]" />
                <span className="font-medium text-[#23114b]">Bahasa</span>
              </div>
              <span className="text-sm text-[#75669e]">Indonesia</span>
            </button>
          </div>

          <Link to="/temp-encryption" className="w-full flex items-center justify-between px-6 py-4 bg-[#f6f3ff] border border-[#d8cfee] hover:bg-[#efe9ff] rounded-2xl transition-colors text-left">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#75669e]" />
              <span className="font-medium text-[#23114b]">Temporary Encryption Viewer</span>
            </div>
            <span className="text-sm text-[#75669e]">Buka</span>
          </Link>

          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-[#f6f3ff] border border-red-200 text-red-600 hover:bg-red-50 rounded-2xl font-semibold transition-colors shadow-sm">
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
