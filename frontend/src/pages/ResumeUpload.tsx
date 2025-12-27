import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { resumeApi } from '../api/resumes';
import { Upload, FileText, X } from 'lucide-react';

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setError('');
      }
    },
    onDropRejected: () => {
      setError('Please upload a valid PDF file');
    },
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const resume = await resumeApi.upload(file);
      // Automatically create analysis after upload
      const { analysisApi } = await import('../api/analyses');
      const analysis = await analysisApi.create({ resumeId: resume.id });
      navigate(`/analysis/${analysis.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Upload Resume</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-primary-600">Drop the PDF here...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                Drag and drop a PDF resume, or click to select
              </p>
              <p className="text-sm text-gray-500">PDF files only, max 10MB</p>
            </div>
          )}
        </div>

        {file && (
          <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Resume'}
          </button>
        </div>
      </div>
    </div>
  );
}

