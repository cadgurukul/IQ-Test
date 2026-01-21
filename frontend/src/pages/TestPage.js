import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { testsAPI } from '../services/api';
import { FaClock, FaCheckCircle } from 'react-icons/fa';
import './TestPage.css';

const TestPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    fetchTestData();
  }, [testId]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && attemptId) {
      handleSubmit();
    }
  }, [timeLeft]);

  const fetchTestData = async () => {
    try {
      const [testResponse, questionsResponse, attemptResponse] = await Promise.all([
        testsAPI.getById(testId),
        testsAPI.getQuestions(testId),
        testsAPI.startTest(testId)
      ]);
      
      setTest(testResponse.data);
      setQuestions(questionsResponse.data);
      setAttemptId(attemptResponse.data.attemptId);
      setTimeLeft(testResponse.data.duration_minutes * 60);
    } catch (error) {
      toast.error('Failed to load test');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
    testsAPI.submitAnswer(attemptId, { questionId, answer }).catch(() => {});
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      if (!window.confirm('You have unanswered questions. Submit anyway?')) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await testsAPI.completeTest(attemptId);
      toast.success('Test completed successfully!');
      navigate('/reports', { 
        state: { 
          attemptId, 
          score: response.data.score,
          total: response.data.total,
          percentage: response.data.percentage
        }
      });
    } catch (error) {
      toast.error('Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  const question = questions[currentQuestion];
  
  // Parse options - handle both string and already-parsed array
  let options = [];
  if (question) {
    if (typeof question.options === 'string') {
      try {
        options = JSON.parse(question.options);
      } catch (e) {
        console.error('Error parsing options:', e);
        options = [];
      }
    } else if (Array.isArray(question.options)) {
      options = question.options;
    }
  }

  return (
    <div className="test-container">
      <div className="container">
        <div className="test-header">
          <div className="test-info">
            <h1>{test.title}</h1>
            <p>Question {currentQuestion + 1} of {questions.length}</p>
          </div>
          <div className={`timer ${timeLeft < 300 ? 'warning' : ''}`}>
            <FaClock /> {formatTime(timeLeft)}
          </div>
        </div>

        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        <div className="question-card">
          <h2 className="question-text">{question.question_text}</h2>
          
          <div className="options-list">
            {options.map((option, index) => (
              <label key={index} className="option-item">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                />
                <span className="option-text">{option}</span>
                {answers[question.id] === option && (
                  <FaCheckCircle className="check-icon" />
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="navigation-buttons">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="btn btn-secondary"
          >
            Previous
          </button>
          
          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-success"
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="btn btn-primary"
            >
              Next
            </button>
          )}
        </div>

        <div className="question-indicators">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className={`indicator ${index === currentQuestion ? 'active' : ''} ${answers[q.id] ? 'answered' : ''}`}
              onClick={() => setCurrentQuestion(index)}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestPage;
