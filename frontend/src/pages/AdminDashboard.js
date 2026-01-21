import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminAPI } from '../services/api';
import { FaUsers, FaFileAlt, FaMoneyBillWave, FaChartBar, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('statistics');
  const [statistics, setStatistics] = useState({});
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    test_id: 1,
    question_text: '',
    question_type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_answer: '',
    points: 1,
    order_number: 1
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'statistics':
          const statsResponse = await adminAPI.getStatistics();
          setStatistics(statsResponse.data);
          break;
        case 'users':
          const usersResponse = await adminAPI.getUsers();
          setUsers(usersResponse.data);
          break;
        case 'reports':
          const reportsResponse = await adminAPI.getReports();
          setReports(reportsResponse.data);
          break;
        case 'questions':
          const questionsResponse = await adminAPI.getQuestions();
          setQuestions(questionsResponse.data);
          break;
        case 'settings':
          const settingsResponse = await adminAPI.getSettings();
          setSettings(settingsResponse.data);
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    
    try {
      await adminAPI.deleteQuestion(questionId);
      toast.success('Question deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.addQuestion(questionForm);
      toast.success('Question added successfully');
      setShowAddQuestion(false);
      setQuestionForm({
        test_id: 1,
        question_text: '',
        question_type: 'multiple_choice',
        options: ['', '', '', ''],
        correct_answer: '',
        points: 1,
        order_number: 1
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to add question');
    }
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateQuestion(editingQuestion.id, questionForm);
      toast.success('Question updated successfully');
      setEditingQuestion(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to update question');
    }
  };

  const openEditForm = (question) => {
    setEditingQuestion(question);
    setQuestionForm({
      test_id: question.test_id,
      question_text: question.question_text,
      question_type: question.question_type,
      options: typeof question.options === 'string' ? JSON.parse(question.options) : question.options,
      correct_answer: question.correct_answer,
      points: question.points || 1,
      order_number: question.order_number
    });
  };

  const updateQuestionFormOption = (index, value) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const handleSaveSetting = async (key, value) => {
    try {
      await adminAPI.updateSetting(key, value);
      toast.success('Setting updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update setting');
    }
  };

  const renderStatistics = () => (
    <div className="stats-grid">
      <div className="stat-card">
        <FaUsers className="stat-icon users" />
        <div className="stat-info">
          <h3>{statistics.totalUsers}</h3>
          <p>Total Users</p>
        </div>
      </div>
      <div className="stat-card">
        <FaChartBar className="stat-icon tests" />
        <div className="stat-info">
          <h3>{statistics.totalTestsCompleted}</h3>
          <p>Tests Completed</p>
        </div>
      </div>
      <div className="stat-card">
        <FaFileAlt className="stat-icon reports" />
        <div className="stat-info">
          <h3>{statistics.paidReports}</h3>
          <p>Paid Reports</p>
        </div>
      </div>
      <div className="stat-card">
        <FaMoneyBillWave className="stat-icon revenue" />
        <div className="stat-info">
          <h3>₹{statistics.totalRevenue}</h3>
          <p>Total Revenue</p>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Provider</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td><span className={`badge ${user.role}`}>{user.role}</span></td>
              <td>{user.auth_provider}</td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderReports = () => (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Test</th>
            <th>Type</th>
            <th>Score</th>
            <th>Paid</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(report => (
            <tr key={report.id}>
              <td>{report.id}</td>
              <td>{report.name}</td>
              <td>{report.test_title}</td>
              <td><span className={`badge ${report.report_type}`}>{report.report_type}</span></td>
              <td>{report.score}/{report.total_questions}</td>
              <td>{report.is_paid ? '✓' : '✗'}</td>
              <td>{new Date(report.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderQuestions = () => (
    <div className="questions-section">
      <button onClick={() => setShowAddQuestion(true)} className="btn btn-primary btn-add">
        <FaPlus /> Add Question
      </button>
      
      <div className="questions-list">
        {questions.map(question => (
          <div key={question.id} className="question-item">
            <div className="question-header">
              <span className="question-id">Q#{question.id}</span>
              <span className="test-badge">{question.test_title}</span>
            </div>
            <p className="question-text">{question.question_text}</p>
            <div className="question-actions">
              <button onClick={() => openEditForm(question)} className="btn-icon edit">
                <FaEdit />
              </button>
              <button onClick={() => handleDeleteQuestion(question.id)} className="btn-icon delete">
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="settings-section">
      {settings.map(setting => (
        <div key={setting.id} className="setting-item">
          <div className="setting-info">
            <h4>{setting.setting_key.replace(/_/g, ' ').toUpperCase()}</h4>
            <p>{setting.description}</p>
          </div>
          <input
            type="text"
            defaultValue={setting.setting_value}
            onBlur={(e) => handleSaveSetting(setting.setting_key, e.target.value)}
            className="setting-input"
          />
        </div>
      ))}
    </div>
  );

  const renderQuestionForm = () => (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{editingQuestion ? 'Edit Question' : 'Add Question'}</h2>
        <form onSubmit={editingQuestion ? handleUpdateQuestion : handleAddQuestion}>
          <div className="form-group">
            <label>Test Type</label>
            <select
              value={questionForm.test_id}
              onChange={(e) => setQuestionForm({ ...questionForm, test_id: parseInt(e.target.value) })}
              required
            >
              <option value={1}>IQ Test</option>
              <option value={2}>Career Assessment</option>
            </select>
          </div>

          <div className="form-group">
            <label>Question Text</label>
            <textarea
              value={questionForm.question_text}
              onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
              required
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Question Type</label>
            <select
              value={questionForm.question_type}
              onChange={(e) => setQuestionForm({ ...questionForm, question_type: e.target.value })}
              required
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="text">Text</option>
            </select>
          </div>

          {questionForm.question_type === 'multiple_choice' && (
            <>
              <div className="form-group">
                <label>Options</label>
                {questionForm.options.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    value={option}
                    onChange={(e) => updateQuestionFormOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    required
                  />
                ))}
              </div>

              <div className="form-group">
                <label>Correct Answer</label>
                <select
                  value={questionForm.correct_answer}
                  onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                  required
                >
                  <option value="">Select correct answer</option>
                  {questionForm.options.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Points</label>
            <input
              type="number"
              value={questionForm.points}
              onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) })}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Order Number</label>
            <input
              type="number"
              value={questionForm.order_number}
              onChange={(e) => setQuestionForm({ ...questionForm, order_number: parseInt(e.target.value) })}
              min="1"
              required
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn btn-primary">
              {editingQuestion ? 'Update' : 'Add'} Question
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddQuestion(false);
                setEditingQuestion(null);
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="admin-container">
      <div className="container">
        <h1 className="admin-title">Admin Dashboard</h1>
        
        <div className="admin-tabs">
          <button
            className={activeTab === 'statistics' ? 'active' : ''}
            onClick={() => setActiveTab('statistics')}
          >
            <FaChartBar /> Statistics
          </button>
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            <FaUsers /> Users
          </button>
          <button
            className={activeTab === 'reports' ? 'active' : ''}
            onClick={() => setActiveTab('reports')}
          >
            <FaFileAlt /> Reports
          </button>
          <button
            className={activeTab === 'questions' ? 'active' : ''}
            onClick={() => setActiveTab('questions')}
          >
            Questions
          </button>
          <button
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        <div className="admin-content">
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <>
              {activeTab === 'statistics' && renderStatistics()}
              {activeTab === 'users' && renderUsers()}
              {activeTab === 'reports' && renderReports()}
              {activeTab === 'questions' && renderQuestions()}
              {activeTab === 'settings' && renderSettings()}
            </>
          )}
        </div>

        {(showAddQuestion || editingQuestion) && renderQuestionForm()}
      </div>
    </div>
  );
};

export default AdminDashboard;
