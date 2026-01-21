const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function sendReportEmail(userEmail, userName, reportType, pdfPath, reportId) {
  try {
    const isPaid = reportType === 'paid';
    const subject = isPaid ? 'Your Detailed Assessment Report' : 'Your Free Assessment Report';
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Assessment Report Ready!</h1>
          </div>
          <div class="content">
            <p>Dear ${userName},</p>
            <p>Thank you for completing your assessment! Your ${isPaid ? 'detailed' : 'free'} report is now ready.</p>
            
            ${!isPaid ? `
              <p><strong>🎁 Want more insights?</strong></p>
              <p>Upgrade to our detailed report for:</p>
              <ul>
                <li>In-depth personality analysis</li>
                <li>Personalized recommendations</li>
                <li>Career path guidance</li>
                <li>Action plans and resources</li>
              </ul>
              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/payment/${reportId}" class="button">
                  Get Detailed Report - ₹${process.env.PAID_REPORT_PRICE}
                </a>
              </p>
            ` : `
              <p>Your comprehensive analysis includes detailed insights and personalized recommendations.</p>
            `}
            
            <p>You can also access your report anytime from your dashboard.</p>
            
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/reports" class="button">View Dashboard</a>
            </p>
            
            <p>Best regards,<br>IQ Test Team</p>
          </div>
          <div class="footer">
            <p>This email was sent from IQ Test Platform</p>
            <p>${process.env.FRONTEND_URL}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"IQ Test Platform" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: subject,
      html: htmlContent,
      attachments: [{
        filename: `report_${reportType}.pdf`,
        path: pdfPath
      }]
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

async function sendPaymentConfirmationEmail(userEmail, userName, amount) {
  try {
    const mailOptions = {
      from: `"IQ Test Platform" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Payment Confirmation - Detailed Report',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Payment Successful!</h1>
            </div>
            <div class="content">
              <p>Dear ${userName},</p>
              <p>Your payment of ₹${amount} has been received successfully.</p>
              <p>Your detailed report is being generated and will be sent to you shortly.</p>
              <p>Thank you for choosing our service!</p>
              <p>Best regards,<br>IQ Test Team</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

module.exports = {
  sendReportEmail,
  sendPaymentConfirmationEmail
};
