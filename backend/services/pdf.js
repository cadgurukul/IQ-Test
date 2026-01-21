const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function generateReportPDF(reportData, reportType) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const fileName = `report_${reportData.userId}_${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../reports', fileName);

      // Ensure reports directory exists
      if (!fs.existsSync(path.join(__dirname, '../reports'))) {
        fs.mkdirSync(path.join(__dirname, '../reports'), { recursive: true });
      }

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Header
      doc.fontSize(24).fillColor('#2563eb').text('Assessment Report', { align: 'center' });
      doc.moveDown();
      
      // Report Type Badge
      doc.fontSize(14).fillColor('#059669')
         .text(reportType === 'paid' ? 'DETAILED REPORT' : 'FREE REPORT', { align: 'center' });
      doc.moveDown(2);

      // User Information
      doc.fontSize(12).fillColor('#000000')
         .text(`Name: ${reportData.userName}`, { continued: false });
      doc.text(`Email: ${reportData.userEmail}`);
      doc.text(`Test Type: ${reportData.testType === 'iq' ? 'IQ Assessment' : 'Career Assessment'}`);
      doc.text(`Date: ${new Date(reportData.completedAt).toLocaleDateString()}`);
      doc.moveDown();

      // Score (for IQ test)
      if (reportData.testType === 'iq') {
        doc.fontSize(16).fillColor('#2563eb')
           .text('Test Results', { underline: true });
        doc.moveDown();
        doc.fontSize(12).fillColor('#000000')
           .text(`Score: ${reportData.score}/${reportData.totalQuestions} (${reportData.percentage}%)`);
        doc.moveDown(2);
      }

      // AI Analysis
      doc.fontSize(16).fillColor('#2563eb')
         .text('Analysis', { underline: true });
      doc.moveDown();
      doc.fontSize(11).fillColor('#000000')
         .text(reportData.aiAnalysis, { align: 'justify' });
      doc.moveDown(2);

      // Recommendations (Only in paid reports)
      if (reportType === 'paid' && reportData.recommendations) {
        doc.fontSize(16).fillColor('#2563eb')
           .text('Detailed Recommendations', { underline: true });
        doc.moveDown();
        doc.fontSize(11).fillColor('#000000')
           .text(reportData.recommendations, { align: 'justify' });
        doc.moveDown(2);
      }

      // Footer
      doc.fontSize(10).fillColor('#6b7280')
         .text('This report is confidential and intended for personal use only.', 
               50, doc.page.height - 80, { align: 'center' });
      doc.text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });

      doc.end();

      writeStream.on('finish', () => {
        resolve({ fileName, filePath });
      });

      writeStream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateReportPDF };
