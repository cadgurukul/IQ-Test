import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { testsAPI } from '../services/api';
import { FaBrain, FaBriefcase, FaClock, FaArrowRight, FaChartLine } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const [tests, setTests] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [testsResponse, historyResponse] = await Promise.all([
        testsAPI.getAll(),
        testsAPI.getHistory()
      ]);
      setTests(testsResponse.data);
      setHistory(historyResponse.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const startTest = (testId) => {
    navigate(`/test/${testId}`);
  };

  const getTestIcon = (testType) => {
    return testType === 'iq' ? <FaBrain /> : <FaBriefcase />;
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="container">
        <div className="dashboard-header">
          <h1>Assessment Dashboard</h1>
          <p>Choose a test to discover your potential</p>
        </div>

        <div className="tests-grid">
          {tests.map((test) => (
            <div key={test.id} className="test-card">
              <div className={`test-icon ${test.test_type}`}>
                {getTestIcon(test.test_type)}
              </div>
              <h2>{test.title}</h2>
              <p className="test-description">{test.description}</p>
              <div className="test-info">
                <span><FaClock /> {test.duration_minutes} minutes</span>
              </div>
              <button 
                onClick={() => startTest(test.id)} 
                className="btn btn-primary btn-start"
              >
                Start Test <FaArrowRight />
              </button>
            </div>
          ))}
        </div>

        {history.length > 0 && (
          <div className="history-section">
            <h2><FaChartLine /> Your Test History</h2>
            <div className="history-grid">
              {history.slice(0, 3).map((attempt) => (
                <div key={attempt.id} className="history-card">
                  <div className="history-header">
                    <h3>{attempt.title}</h3>
                    <span className={`status-badge ${attempt.status}`}>
                      {attempt.status}
                    </span>
                  </div>
                  {attempt.status === 'completed' && (
                    <div className="history-score">
                      <span className="score-label">Score:</span>
                      <span className="score-value">
                        {attempt.score}/{attempt.total_questions}
                      </span>
                      <span className="score-percentage">
                        ({Math.round((attempt.score / attempt.total_questions) * 100)}%)
                      </span>
                    </div>
                  )}
                  <div className="history-date">
                    {new Date(attempt.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate('/reports')} 
              className="btn btn-secondary"
            >
              View All Reports
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
