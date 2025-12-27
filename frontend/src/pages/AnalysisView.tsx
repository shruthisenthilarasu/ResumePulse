import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analysisApi, Analysis } from '../api/analyses';
import { Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AnalysisView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (id) {
      loadAnalysis();
    }
  }, [id]);

  useEffect(() => {
    if (analysis && (analysis.status === 'PENDING' || analysis.status === 'PROCESSING')) {
      setPolling(true);
      const interval = setInterval(() => {
        loadAnalysis();
      }, 3000); // Poll every 3 seconds

      return () => {
        clearInterval(interval);
        setPolling(false);
      };
    }
  }, [analysis?.status]);

  const loadAnalysis = async () => {
    if (!id) return;
    try {
      const data = await analysisApi.getOne(id);
      setAnalysis(data);
      if (data.status === 'COMPLETED' || data.status === 'FAILED') {
        setPolling(false);
      }
    } catch (error) {
      console.error('Failed to load analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'PROCESSING':
      case 'PENDING':
        return <Clock className="h-6 w-6 text-yellow-500 animate-spin" />;
      case 'FAILED':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <AlertCircle className="h-6 w-6 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading analysis...</div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Analysis not found</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-primary-600 hover:text-primary-500"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const report = analysis.report;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {getStatusIcon(analysis.status)}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Resume Analysis</h1>
              {analysis.targetRole && (
                <p className="text-sm text-gray-500">Target Role: {analysis.targetRole}</p>
              )}
            </div>
          </div>
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800 capitalize">
            {analysis.status.toLowerCase()}
          </span>
        </div>

        {analysis.status === 'PROCESSING' || analysis.status === 'PENDING' ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto text-yellow-500 mb-4 animate-spin" />
            <p className="text-gray-600">Analyzing your resume...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          </div>
        ) : analysis.status === 'FAILED' ? (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">
              <strong>Analysis failed:</strong> {analysis.errorMessage || 'Unknown error'}
            </div>
          </div>
        ) : report ? (
          <div className="space-y-8">
            {/* Overview */}
            {report.overview && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Overview</h2>
                <p className="text-gray-700 leading-relaxed">{report.overview}</p>
              </div>
            )}

            {/* Strong Signals */}
            {report.strongSignals && report.strongSignals.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Strong Signals</h2>
                <div className="space-y-4">
                  {report.strongSignals.map((signal: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded">
                      <h3 className="font-medium text-gray-900">{signal.type}</h3>
                      <p className="text-sm text-gray-700 mt-1 italic">"{signal.evidence}"</p>
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Why this matters:</strong> {signal.whyItMatters}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weak Signals */}
            {report.weakSignals && report.weakSignals.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Weak or Missing Signals</h2>
                <div className="space-y-4">
                  {report.weakSignals.map((signal: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-yellow-500 pl-4 py-2 bg-yellow-50 rounded">
                      <h3 className="font-medium text-gray-900">{signal.gap}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Location:</strong> {signal.location}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Implication:</strong> {signal.implication}
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        <strong>Guidance:</strong> {signal.guidance}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Flags */}
            {report.riskFlags && report.riskFlags.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Risk Flags</h2>
                <div className="space-y-4">
                  {report.riskFlags.map((flag: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-red-500 pl-4 py-2 bg-red-50 rounded">
                      <h3 className="font-medium text-gray-900">{flag.type}</h3>
                      <p className="text-sm text-gray-700 mt-1">{flag.observation}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Evidence:</strong> {flag.evidence}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Note:</strong> {flag.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {report.suggestions && report.suggestions.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Targeted Suggestions</h2>
                <div className="space-y-4">
                  {report.suggestions.map((suggestion: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          suggestion.priority === 'High' ? 'bg-red-100 text-red-800' :
                          suggestion.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {suggestion.priority} Priority
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900">{suggestion.suggestion}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Focus:</strong> {suggestion.focus}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Impact:</strong> {suggestion.impact}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Example Rewrites */}
            {report.exampleRewrites && report.exampleRewrites.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Example Rewrites</h2>
                <div className="space-y-4">
                  {report.exampleRewrites.map((example: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Original:</h4>
                        <p className="text-sm text-gray-600 italic">"{example.original}"</p>
                      </div>
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Revised Example:</h4>
                        <p className="text-sm text-gray-900">"{example.revised}"</p>
                      </div>
                      {example.changes && example.changes.length > 0 && (
                        <div className="mb-2">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Changes Made:</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600">
                            {example.changes.map((change: string, cIdx: number) => (
                              <li key={cIdx}>{change}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {example.note && (
                        <p className="text-xs text-gray-500 mt-2 italic">{example.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

