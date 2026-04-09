import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Shield, Key, Edit2, Upload, X, Check, Eye, EyeOff } from 'lucide-react';
import { STORAGE_KEYS } from '../data/mockData';
import { updateCurrentUser } from '../services/api';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
  const [picturePreview, setPicturePreview] = useState(null);
  const [pictureUrl, setPictureUrl] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const fileInputRef = useRef(null);
  
  const [profileData, setProfileData] = useState(() => {
    const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser) || 'null');
    return {
      username: currentUser?.username || 'satoshi_nakamoto',
      email: currentUser?.email || 'satoshi@bitcoin.org',
      avatar: currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=MyUserAvatar',
    };
  });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPicturePreview(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (url) => {
    setPictureUrl(url);
    setPicturePreview(url);
  };

  const handlePictureSave = () => {
    if (picturePreview) {
      setProfileData((prev) => ({ ...prev, avatar: picturePreview }));
      setShowPictureModal(false);
      setPicturePreview(null);
      setPictureUrl('');
      setUploadMethod('file');
    }
  };

  const handlePictureCancel = () => {
    setShowPictureModal(false);
    setPicturePreview(null);
    setPictureUrl('');
    setUploadMethod('file');
  };

  const handleSave = async () => {
    try {
      await updateCurrentUser({
        username: profileData.username,
        email: profileData.email,
      });

      const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser) || '{}');
      localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify({
        ...currentUser,
        username: profileData.username,
        email: profileData.email,
        avatar: profileData.avatar,
      }));

      setIsEditing(false);
    } catch (error) {
      setPasswordError(error.message || 'Gagal update profil.');
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (!passwordForm.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (!passwordForm.newPassword) {
      setPasswordError('New password is required');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    // Check new password is different from current password
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setPasswordError('New password must be different from your current password');
      return;
    }

    try {
      await updateCurrentUser({
        prevPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordSuccess('Password changed successfully!');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordError('');
        setPasswordSuccess('');
        setShowPasswords({ current: false, new: false, confirm: false });
      }, 2000);
    } catch (error) {
      setPasswordError(error.message || 'Gagal mengganti password.');
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordModal(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
    setPasswordSuccess('');
    setShowPasswords({ current: false, new: false, confirm: false });
  };

  return (
    <div className="min-h-screen bg-[#e7e3f4] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/chat" className="p-2 -ml-2 text-[#6e6093] hover:bg-[#d8cfee] rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-bold text-[#23114b]">Profile</h1>
          </div>
          <button 
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#f6f3ff] border border-[#d8cfee] rounded-xl hover:bg-[#efe9ff] transition-colors shadow-sm text-sm font-medium text-[#4c3f73]"
          >
            <Edit2 className="w-4 h-4" />
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-[#f6f3ff] rounded-2xl shadow-sm border border-[#d8cfee] overflow-hidden">
          
          {/* Cover Photo & Avatar */}
          <div className="h-48 bg-gradient-to-r from-[#7b64ba] to-[#9b84de] relative">
            <div className="absolute -bottom-16 left-8">
              <div className="relative group">
                <img 
                  src={profileData.avatar}
                  alt="Avatar" 
                  className="w-32 h-32 rounded-full border-4 border-white bg-white object-cover"
                />
                {isEditing && (
                  <button 
                    onClick={() => setShowPictureModal(true)}
                    className="absolute bottom-0 right-0 p-2 bg-[#23114b] text-white rounded-full hover:bg-[#3a236f] transition shadow-md"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-20 px-8 pb-8">
            <div className="space-y-6">
              
              {/* Username Field */}
              <div>
                <label className="block text-sm font-medium text-[#75669e] mb-2">
                  Username
                </label>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#ede7ff] text-[#6b57a4] rounded-lg">
                    <User className="w-5 h-5" />
                  </div>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profileData.username}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, username: e.target.value }))}
                      className="flex-1 bg-white border border-[#d8cfee] rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#b7d62e] focus:outline-none text-[#23114b]"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-[#23114b]">{profileData.username}</span>
                  )}
                </div>
              </div>

               {/* Email Field */}
               <div>
                <label className="block text-sm font-medium text-[#75669e] mb-2">
                  Email Address
                </label>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#ede7ff] text-[#6b57a4] rounded-lg">
                    <Mail className="w-5 h-5" />
                  </div>
                  {isEditing ? (
                    <input 
                      type="email" 
                      value={profileData.email}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                      className="flex-1 bg-white border border-[#d8cfee] rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#b7d62e] focus:outline-none text-[#23114b]"
                    />
                  ) : (
                    <span className="text-lg font-medium text-[#23114b]">{profileData.email}</span>
                  )}
                </div>
              </div>

              {/* Security Metrics */}
              <div className="pt-6 mt-6 border-t border-[#e0d7f2] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-center gap-4">
                  <div className="p-3 bg-green-100 text-green-600 rounded-full">
                     <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-green-900">End-to-End Encryption</h4>
                    <p className="text-xs text-green-700">Active and secured</p>
                  </div>
                </div>

                <div className="p-4 bg-[#eee8ff] rounded-xl border border-[#ddd4f2] flex items-center gap-4 cursor-pointer hover:bg-[#e7deff] transition-colors" onClick={() => setShowPasswordModal(true)}>
                  <div className="p-3 bg-white text-[#6c5c97] rounded-full shadow-sm">
                     <Key className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#23114b]">Change Password</h4>
                    <p className="text-xs text-[#75669e]">Last changed 3 months ago</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Picture Upload Modal */}
        {showPictureModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 rounded-lg">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#7b64ba] to-[#9b84de] px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Change Profile Picture</h2>
                <button 
                  onClick={handlePictureCancel}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded-full transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Upload Method Tabs */}
                <div className="flex gap-2 bg-[#f6f3ff] p-1 rounded-lg">
                  <button 
                    onClick={() => {
                      setUploadMethod('file');
                      setPicturePreview(null);
                      setPictureUrl('');
                    }}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
                      uploadMethod === 'file' 
                        ? 'bg-white text-[#7b64ba] shadow-sm' 
                        : 'text-[#75669e] hover:text-[#23114b]'
                    }`}
                  >
                    Upload File
                  </button>
                  <button 
                    onClick={() => {
                      setUploadMethod('url');
                      setPicturePreview(null);
                      setPictureUrl('');
                    }}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
                      uploadMethod === 'url' 
                        ? 'bg-white text-[#7b64ba] shadow-sm' 
                        : 'text-[#75669e] hover:text-[#23114b]'
                    }`}
                  >
                    From URL
                  </button>
                </div>

                {/* File Upload Section */}
                {uploadMethod === 'file' && (
                  <div>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-[#d8cfee] rounded-xl p-8 hover:border-[#b7d62e] hover:bg-[#f6f3ff] transition text-center cursor-pointer space-y-3"
                    >
                      <Upload className="w-8 h-8 text-[#7b64ba] mx-auto" />
                      <div>
                        <p className="font-semibold text-[#23114b]">Click to upload</p>
                        <p className="text-sm text-[#75669e]">PNG, JPG, GIF (Max 5MB)</p>
                      </div>
                    </button>
                  </div>
                )}

                {/* URL Input Section */}
                {uploadMethod === 'url' && (
                  <div>
                    <label className="block text-sm font-medium text-[#75669e] mb-2">
                      Image URL
                    </label>
                    <input 
                      type="url" 
                      placeholder="https://example.com/image.jpg"
                      value={pictureUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      className="w-full border border-[#d8cfee] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#b7d62e] focus:outline-none text-[#23114b]"
                    />
                  </div>
                )}

                {/* Image Preview */}
                {picturePreview && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-[#75669e]">Preview</p>
                    <div className="flex justify-center">
                      <img 
                        src={picturePreview} 
                        alt="Preview" 
                        className="w-24 h-24 rounded-full border-2 border-[#d8cfee] object-cover"
                        onError={() => {
                          setPicturePreview(null);
                          alert('Failed to load image. Please check the URL.');
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-[#f6f3ff] px-6 py-4 flex gap-3 justify-end border-t border-[#d8cfee]">
                <button 
                  onClick={handlePictureCancel}
                  className="px-4 py-2 text-[#75669e] hover:bg-[#e7deff] rounded-lg transition font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePictureSave}
                  disabled={!picturePreview}
                  className="px-4 py-2 bg-[#7b64ba] text-white rounded-lg hover:bg-[#6b5499] disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Picture
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#7b64ba] to-[#9b84de] px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Change Password</h2>
                <button 
                  onClick={handlePasswordCancel}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded-full transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-[#75669e] mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full border border-[#d8cfee] rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-[#b7d62e] focus:outline-none text-[#23114b]"
                      placeholder="Enter current password"
                    />
                    <button
                      onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#75669e] hover:text-[#23114b]"
                    >
                      {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-[#75669e] mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full border border-[#d8cfee] rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-[#b7d62e] focus:outline-none text-[#23114b]"
                      placeholder="Enter new password"
                    />
                    <button
                      onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#75669e] hover:text-[#23114b]"
                    >
                      {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-[#75669e] mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full border border-[#d8cfee] rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-[#b7d62e] focus:outline-none text-[#23114b]"
                      placeholder="Confirm new password"
                    />
                    <button
                      onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#75669e] hover:text-[#23114b]"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {passwordError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{passwordError}</p>
                  </div>
                )}

                {/* Success Message */}
                {passwordSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-700">{passwordSuccess}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-[#f6f3ff] px-6 py-4 flex gap-3 justify-end border-t border-[#d8cfee]">
                <button 
                  onClick={handlePasswordCancel}
                  className="px-4 py-2 text-[#75669e] hover:bg-[#e7deff] rounded-lg transition font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePasswordChange}
                  className="px-4 py-2 bg-[#7b64ba] text-white rounded-lg hover:bg-[#6b5499] transition font-medium flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Change Password
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
