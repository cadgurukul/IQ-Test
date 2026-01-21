import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { paymentsAPI, reportsAPI } from '../services/api';
import { FaCheckCircle, FaLock } from 'react-icons/fa';
import './Payment.css';

const Payment = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  const fetchReport = async () => {
    try {
      const response = await reportsAPI.getUserReports();
      const reportData = response.data.find(r => r.id === parseInt(reportId));
      setReport(reportData);
    } catch (error) {
      toast.error('Failed to load report details');
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        setLoading(false);
        return;
      }

      // Create order
      const orderResponse = await paymentsAPI.createOrder({ reportId });
      const { orderId, amount, currency, keyId } = orderResponse.data;

      // Razorpay options
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'IQ Test Platform',
        description: 'Detailed Assessment Report',
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify payment
            await paymentsAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            toast.success('Payment successful! Your report is being sent to your email.');
            navigate('/reports');
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#667eea'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error('Failed to initiate payment');
      setLoading(false);
    }
  };

  if (!report) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="payment-container">
      <div className="container">
        <div className="payment-card">
          <div className="payment-header">
            <h1>Upgrade to Premium Report</h1>
            <p>Unlock detailed insights and personalized recommendations</p>
          </div>

          <div className="pricing-section">
            <div className="price-display">
              <span className="currency">₹</span>
              <span className="amount">499</span>
            </div>
            <p className="price-subtitle">One-time payment</p>
          </div>

          <div className="features-section">
            <h3>What's Included:</h3>
            <ul className="premium-features">
              <li>
                <FaCheckCircle className="check-icon" />
                <div>
                  <strong>AI-Powered Analysis</strong>
                  <p>Advanced evaluation using OpenAI technology</p>
                </div>
              </li>
              <li>
                <FaCheckCircle className="check-icon" />
                <div>
                  <strong>Personalized Recommendations</strong>
                  <p>Tailored advice based on your results</p>
                </div>
              </li>
              <li>
                <FaCheckCircle className="check-icon" />
                <div>
                  <strong>Detailed Career Guidance</strong>
                  <p>Career paths and educational recommendations</p>
                </div>
              </li>
              <li>
                <FaCheckCircle className="check-icon" />
                <div>
                  <strong>Action Plans</strong>
                  <p>Step-by-step improvement strategies</p>
                </div>
              </li>
              <li>
                <FaCheckCircle className="check-icon" />
                <div>
                  <strong>Downloadable PDF Report</strong>
                  <p>Professional report sent to your email</p>
                </div>
              </li>
            </ul>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="btn btn-success btn-payment"
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>

          <div className="security-badge">
            <FaLock /> Secure payment powered by Razorpay
          </div>

          <button
            onClick={() => navigate('/reports')}
            className="btn-link"
          >
            Back to Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
