import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Upload, User, FileText, CheckCircle, XCircle, Clock, Mail, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [status, setStatus] = useState('');
  const [visaType, setVisaType] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Get authToken from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Create headers with auth token (for multipart/form-data, don't set Content-Type)
  const createHeaders = () => {
    const token = getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const processFile = (file: File) => {
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setMessage('');
    } else {
      setPdfFile(null);
      setMessage('❌ Only PDF files are allowed.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleSubmit = async () => {
    if (!pdfFile || !status || !userEmail || !visaType) {
      setMessage('❌ Please fill in all fields and upload a PDF.');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setMessage('❌ Authentication required. Please login again.');
      logout();
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', pdfFile);
      formData.append('email', userEmail);
      formData.append('status', status);
      formData.append('visa_type', visaType);

      const response = await fetch('https://immu-backend.up.railway.app/upload/doc', {
        method: 'POST',
        headers: createHeaders(),
        body: formData,
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        setMessage('❌ Session expired. Please login again.');
        logout();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      setMessage('✅ Document uploaded and user status updated successfully.');
      setPdfFile(null);
      setStatus('');
      setUserEmail('');
      setVisaType('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      console.log('Success response:', responseData);
    } catch (err) {
      console.error('Error submitting:', err);
      setMessage(`❌ Error: ${err instanceof Error ? err.message : 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (statusValue: string) => {
    switch (statusValue) {
      case 'Visa grant':
        return <CheckCircle className="w-4 h-4" />;
      case 'Immi Refusal':
        return <XCircle className="w-4 h-4" />;
      case 'Processing':
      case 'Pending':
      case 'Hold':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#c5d6ff_1px,transparent_1px)] bg-[length:20px_20px] opacity-30"></div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-2 px-4 py-2 text-blue-700 border border-blue-700 rounded-lg transition-colors duration-200 hover:bg-blue-50"
                onClick={() => navigate('/vevo')}
              >
                VEVO
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full text-blue-700 font-medium mb-4">
              <FileText className="w-5 h-5" />
              User Review Panel
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Review & Status Update</h2>
            <p className="text-gray-600">Upload user documents and update their verification status</p>
          </div>

          <div className="space-y-6">
            {/* User Email Field */}
            <div className="space-y-2">
              <label htmlFor="userEmail" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail className="w-4 h-4" />
                User Email Address
              </label>
              <input
                id="userEmail"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-gray-100"
                placeholder="user@example.com"
                disabled={isSubmitting}
              />
            </div>

            {/* Visa Type Field */}
            <div className="space-y-2">
              <label htmlFor="visaType" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <CreditCard className="w-4 h-4" />
                Visa Type
              </label>
              <input
                id="visaType"
                type="text"
                value={visaType}
                onChange={(e) => setVisaType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-gray-100"
                placeholder="e.g., Tourist Visa, Student Visa, Work Visa"
                disabled={isSubmitting}
              />
            </div>

            {/* File Upload Area */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Upload className="w-4 h-4" />
                Document Upload
              </label>
              <div
                ref={dropRef}
                onDrop={handleFileDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                  isDragOver
                    ? 'border-blue-400 bg-blue-50'
                    : pdfFile
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isSubmitting}
                />

                {pdfFile ? (
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-green-700 font-medium">File ready for upload:</p>
                    <p className="text-sm text-green-600">{pdfFile.name}</p>
                    <p className="text-xs text-gray-500">Size: {(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p className="text-xs text-gray-500">Click to change file</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-700">
                      {isDragOver ? 'Drop the PDF file here' : 'Drag and drop a PDF file here, or click to browse'}
                    </p>
                    <p className="text-xs text-gray-500">PDF files only (full file will be uploaded)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Selection */}
            <div className="space-y-2">
              <label htmlFor="status" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                {getStatusIcon(status)}
                User Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-gray-100"
                disabled={isSubmitting}
              >
                <option value="">-- Select Status --</option>
                <option value="Processing">⏳ Processing</option>
                <option value="Visa grant">✅ Visa Grant</option>
                <option value="Immi Refusal">❌ Immi Refusal</option>
                <option value="Finalized">✅ Finalized</option>
                <option value="Pending">⏳ Pending</option>
                <option value="Hold">🔒 Hold</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !pdfFile || !status || !userEmail || !visaType}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Uploading Document...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Upload Document & Update Status
                </>
              )}
            </button>

            {/* Message Display */}
            {message && (
              <div
                className={`p-4 rounded-xl border ${
                  message.includes('✅')
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  {message.includes('✅') ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  {message}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
