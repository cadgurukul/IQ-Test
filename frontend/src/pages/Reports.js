import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { reportsAPI } from '../services/api';
import { FaFilePdf, FaDownload, FaStar, FaCrown } from 'react-icons/fa';
import './Reports.css';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const attemptData = location.state;

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await reportsAPI.getUserReports();
      setReports(response.data);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (reportType) => {
    if (!attemptData?.attemptId) {
      toast.error('No test attempt data available');
      return;
    }

    setGeneratingReport(true);
    try {
      const response = await reportsAPI.generate({
        attemptId: attemptData.attemptId,
        reportType: reportType
      });

      if (reportType === 'paid' && response.data.needsPayment) {
        navigate(`/payment/${response.data.reportId}`);
      } else {
        toast.success('Report generated! Check your email.');
        fetchReports();
      }
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDownload = async (reportId, reportType) => {
    try {
      const response = await reportsAPI.download(reportId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="reports-container">
      <div className="container">
        <h1 className="page-title">Your Reports</h1>

        {attemptData && (
          <div className="completion-card">
            <div className="completion-header">
              <h2>🎉 Test Completed!</h2>
              <p className="completion-score">
                Score: {attemptData.score}/{attemptData.total} ({attemptData.percentage}%)
              </p>
            </div>
            
            <div className="report-options">
              <div className="report-option">
                <div className="option-header">
                  <FaStar className="icon-free" />
                  <h3>Free Report</h3>
                </div>
                <ul className="features-list">
                  <li>Basic analysis</li>
                  <li>Score breakdown</li>
                  <li>General insights</li>
                </ul>
                <button
                  onClick={() => handleGenerateReport('free')}
                  disabled={generatingReport}
                  className="btn btn-secondary"
                >
                  {generatingReport ? 'Generating...' : 'Get Free Report'}
                </button>
              </div>

              <div className="report-option premium">
                <div className="premium-badge">
                  <FaCrown /> PREMIUM
                </div>
                <div className="option-header">
                  <FaCrown className="icon-premium" />
                  <h3>Detailed Report</h3>
                </div>
                <ul className="features-list">
                  <li>✓ AI-powered analysis</li>
                  <li>✓ Personalized recommendations</li>
                  <li>✓ Detailed insights</li>
                  <li>✓ Career guidance</li>
                  <li>✓ Action plans</li>
                </ul>
                <div className="price-tag">₹499</div>
                <button
                  onClick={() => handleGenerateReport('paid')}
                  disabled={generatingReport}
                  className="btn btn-success"
                >
                  {generatingReport ? 'Processing...' : 'Get Detailed Report'}
                </button>
              </div>
            </div>
          </div>
        )}

        {reports.length > 0 && (
          <div className="reports-list">
            <h2>Generated Reports</h2>
            <div className="reports-grid">
              {reports.map((report) => (
                <div key={report.id} className="report-card">
                  <div className="report-header">
                    <FaFilePdf className="pdf-icon" />
                    <div>
                      <h3>{report.title}</h3>
                      <span className={`report-type ${report.report_type}`}>
                        {report.report_type === 'paid' ? '👑 Premium' : '⭐ Free'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="report-details">
                    <p>Test Type: {report.test_type === 'iq' ? 'IQ Test' : 'Career Assessment'}</p>
                    {report.score !== null && (
                      <p>Score: {report.score}/{report.total_questions}</p>
                    )}
                    <p>Date: {new Date(report.end_time).toLocaleDateString()}</p>
                  </div>

                  <div className="report-actions">
                    {report.is_paid || report.report_type === 'free' ? (
                      <button
                        onClick={() => handleDownload(report.id, report.report_type)}
                        className="btn btn-primary btn-small"
                      >
                        <FaDownload /> Download
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/payment/${report.id}`)}
                        className="btn btn-success btn-small"
                      >
                        <FaCrown /> Upgrade to Premium
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!attemptData && reports.length === 0 && (
          <div className="empty-state">
            <p>No reports yet. Complete a test to generate your first report!</p>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
