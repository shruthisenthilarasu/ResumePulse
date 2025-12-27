import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { resumeApi, Resume } from '../api/resumes';
import { analysisApi, Analysis } from '../api/analyses';
import { FileText, Upload, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [resumesData, analysesData] = await Promise.all([
        resumeApi.getAll(),
        analysisApi.getAll(),
      ]);
      setResumes(resumesData);
      setAnalyses(analysesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'PROCESSING':
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/upload"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Resume
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Resumes</h2>
          {resumes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No resumes uploaded yet</p>
              <Link to="/upload" className="text-primary-600 hover:text-primary-500 mt-2 inline-block">
                Upload your first resume
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.slice(0, 5).map((resume) => (
                <div key={resume.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium text-gray-900">{resume.originalFilename}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                    {resume._count?.analyses || 0} analyses
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Analyses</h2>
          {analyses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No analyses yet</p>
              <p className="text-sm mt-2">Upload a resume to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analyses.slice(0, 5).map((analysis) => (
                <Link
                  key={analysis.id}
                  to={`/analysis/${analysis.id}`}
                  className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(analysis.status)}
                    <div>
                      <p className="font-medium text-gray-900">
                        {analysis.resume?.originalFilename || 'Resume'}
                      </p>
                      {analysis.targetRole && (
                        <p className="text-sm text-gray-500">Target: {analysis.targetRole}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 capitalize">
                    {analysis.status.toLowerCase()}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

