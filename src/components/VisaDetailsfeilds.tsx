import React, { useRef, useState } from 'react';

const visaDetailFields = [
  { label: 'Visa grant number', key: 'visaGrantNumber', type: 'text', placeholder: 'e.g., 218957952581' },
  { label: 'Current date and time', key: 'currentDateTime', type: 'text', placeholder: 'e.g., Thursday August 21, 2025 15:10:22 (AEST) Canberra, Australia (GMT +1000)' },
  { label: 'Family name', key: 'familyName', type: 'text', placeholder: 'e.g., SHYAM LAL' },
  { label: 'Visa description', key: 'visaDescription', type: 'text', placeholder: 'e.g., VISITOR' },
  { label: 'Document number', key: 'documentNumber', type: 'text', placeholder: 'e.g., U9355845' },
  { label: 'Country of Passport', key: 'countryOfPassport', type: 'text', placeholder: 'e.g., INDIA' },
  { label: 'Visa class / subclass', key: 'visaClass', type: 'text', placeholder: 'e.g., FA / 600' },
  { label: 'Visa stream', key: 'visaStream', type: 'text', placeholder: 'e.g., Tourist' },
  { label: 'Visa applicant', key: 'visaApplicant', type: 'text', placeholder: 'e.g., Primary' },
  { label: 'Visa grant date', key: 'visaGrantDate', type: 'text', placeholder: 'e.g., 14 March 2025' },
  { label: 'Visa expiry date', key: 'visaExpiryDate', type: 'text', placeholder: 'e.g., 14 March 2028' },
  { label: 'Location', key: 'location', type: 'text', placeholder: 'e.g., Offshore' },
  { label: 'Visa status', key: 'visaStatus', type: 'text', placeholder: 'e.g., In Effect' },
  { label: 'Entries allowed', key: 'entriesAllowed', type: 'text', placeholder: 'e.g., Multiple entries ...' },
  { label: 'Must not arrive after', key: 'mustNotArriveAfter', type: 'text', placeholder: 'e.g., 14 March 2028' },
  { label: 'Period of stay', key: 'periodOfStay', type: 'text', placeholder: 'e.g., 03 months on each arrival' },
  { label: 'Work entitlements', key: 'workEntitlements', type: 'text', placeholder: 'e.g., The Visa Holder does not have Work Entitlements' },
  { label: 'Workplace rights', key: 'workplaceRights', type: 'text', placeholder: 'Workplace info...' },
  { label: 'Workplace rights Link', key: 'workplaceRightsLink', type: 'text', placeholder: 'https://...' },
  { label: 'Study entitlements', key: 'studyEntitlements', type: 'text', placeholder: 'Study entitlements...' },
];

interface Message {
  type: 'success' | 'error';
  text: string;
}

const VevoPanel: React.FC = () => {
  const [userEmail, setUserEmail] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [visaConditions, setVisaConditions] = useState([
    { code: '', description: '', details: '', reference: '' }
  ]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    // Only auto-hide error messages, keep success messages visible
    if (type === 'error') {
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleConditionChange = (idx: number, key: string, value: string) => {
    setVisaConditions((prev) =>
      prev.map((cond, i) =>
        i === idx ? { ...cond, [key]: value } : cond
      )
    );
  };

  const addCondition = () => {
    setVisaConditions((prev) => [
      ...prev,
      { code: '', description: '', details: '', reference: '' }
    ]);
  };

  const removeCondition = (idx: number) => {
    if (visaConditions.length > 1) {
      setVisaConditions((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const resetForm = () => {
    setFields({});
    setVisaConditions([{ code: '', description: '', details: '', reference: '' }]);
    setPdfFile(null);
    setUserEmail('');
    setMessage(null);
    setIsSubmitted(false);
  };

  // PDF handlers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      console.log('Dropped file:', file.name, file.type);
      
      if (file.type === 'application/pdf') {
        setPdfFile(file);
        if (message?.type === 'error') setMessage(null); // Clear error messages
        console.log('PDF file set successfully');
      } else {
        showMessage('error', 'Please select a PDF file only');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed');
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      console.log('Selected file:', file.name, file.type);
      
      if (file.type === 'application/pdf') {
        setPdfFile(file);
        if (message?.type === 'error') setMessage(null); // Clear error messages
        console.log('PDF file set successfully');
      } else {
        showMessage('error', 'Please select a PDF file only');
      }
    }
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Browse clicked');
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removePdf = () => {
    setPdfFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (message?.type === 'error') setMessage(null); // Clear error messages

    try {
      // Get auth token from localStorage
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        showMessage('error', 'Authentication token not found. Please login again.');
        setIsSubmitting(false);
        return;
      }

      // Check if PDF file is required
      if (!pdfFile) {
        showMessage('error', 'Please select a PDF file before submitting.');
        setIsSubmitting(false);
        return;
      }

      // Prepare the payload according to API requirements
      const visaData = {
        email: userEmail,
        ...fields,
        visaConditions: visaConditions.filter(condition => 
          condition.code.trim() !== '' && condition.description.trim() !== ''
        )
      };

      // Create FormData for multipart/form-data request
      const formData = new FormData();
      
      // Add payload as JSON string
      formData.append('payload', JSON.stringify(visaData));
      
      // Add PDF file
      formData.append('pdf', pdfFile);

      console.log('Submitting payload:', visaData);
      console.log('PDF file:', pdfFile);

      const response = await fetch('https://immu-backend.up.railway.app/visa/user_details', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
          // Don't set Content-Type header - let browser set it with boundary for FormData
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        showMessage('success', 'Visa details submitted successfully! Your information has been saved.');
        // Reset only form fields but keep email and success state
        setFields({});
        setVisaConditions([{ code: '', description: '', details: '', reference: '' }]);
        setPdfFile(null);
      } else {
        console.error('API Error:', data);
        const errorMessage = data.message || 
          (data.detail ? JSON.stringify(data.detail) : null) || 
          'Submission failed. Please try again.';
        showMessage('error', `Submission failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Network Error:', error);
      showMessage('error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Message Display */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg border flex items-center justify-between ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="font-medium">{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <form className="bg-white p-6 rounded-xl shadow-lg border" onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {isSubmitted ? 'Visa Details Submitted' : 'Enter Visa Details'}
            </h3>
            {isSubmitted && (
              <button
                type="button"
                onClick={resetForm}
                className="text-blue-600 hover:text-blue-700 underline text-sm font-medium"
              >
                Submit Another Form
              </button>
            )}
          </div>
          
          {/* Email field - always visible and editable */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Enter email address"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Show form fields only if not submitted or if user wants to submit another */}
          {!isSubmitted && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {visaDetailFields.map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                    <input
                      type={field.type}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={fields[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                ))}
              </div>

              {/* PDF Upload Section */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attach PDF Document <span className="text-red-500">*</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                    dragActive 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                  } ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  {!pdfFile ? (
                    <div className="text-center text-gray-500">
                      <div className="flex flex-col items-center space-y-2">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <div>
                          <span className="text-sm">Drag & drop a PDF here, or </span>
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-700 underline font-medium"
                            onClick={handleBrowseClick}
                            disabled={isSubmitting}
                          >
                            browse
                          </button>
                        </div>
                        <span className="text-xs text-gray-400">PDF format only (Required)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-white rounded border">
                      <div className="flex items-center space-x-3">
                        <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{pdfFile.name}</p>
                          <p className="text-xs text-gray-500">{(pdfFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 p-1 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePdf();
                        }}
                        disabled={isSubmitting}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Visa Conditions */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-4 text-gray-900">Visa Conditions</h4>
                <div className="space-y-4">
                  {visaConditions.map((cond, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-700">Condition {idx + 1}</span>
                        {visaConditions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCondition(idx)}
                            className="text-red-600 hover:text-red-800 text-sm"
                            disabled={isSubmitting}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Code</label>
                          <input
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., 8101"
                            value={cond.code}
                            onChange={e => handleConditionChange(idx, "code", e.target.value)}
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                          <input
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Brief description"
                            value={cond.description}
                            onChange={e => handleConditionChange(idx, "description", e.target.value)}
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Details</label>
                          <input
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Additional details"
                            value={cond.details}
                            onChange={e => handleConditionChange(idx, "details", e.target.value)}
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Reference</label>
                          <input
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Reference link"
                            value={cond.reference}
                            onChange={e => handleConditionChange(idx, "reference", e.target.value)}
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addCondition}
                  className="mt-4 text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                  disabled={isSubmitting}
                >
                  + Add another condition
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || !pdfFile || !userEmail}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Visa Details'}
              </button>
            </>
          )}

          {/* Show success state */}
          {isSubmitted && (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Submission Successful!</h4>
              <p className="text-gray-600 mb-6">Your visa details have been submitted successfully for <strong>{userEmail}</strong></p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default VevoPanel;
