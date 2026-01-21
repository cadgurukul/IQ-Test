const PDFDocument = require('pdfkit');
const AWS = require('aws-sdk');
const stream = require('stream');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

async function generateReportPDF(reportData, reportType) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const fileName = `reports/report_${reportData.userId}_${Date.now()}.pdf`;
      
      // Create a buffer stream to collect PDF data
      const bufferStream = new stream.PassThrough();
      const chunks = [];
      
      bufferStream.on('data', (chunk) => chunks.push(chunk));
      bufferStream.on('end', async () => {
        try {
          const pdfBuffer = Buffer.concat(chunks);
          
          // Upload to S3
          const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileName,
            Body: pdfBuffer,
            ContentType: 'application/pdf',
            ACL: 'private' // Change to 'public-read' if you want public access
          };

          const uploadResult = await s3.upload(uploadParams).promise();
          
          // Generate signed URL (valid for 7 days)
          const signedUrl = s3.getSignedUrl('getObject', {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileName,
            Expires: 60 * 60 * 24 * 7 // 7 days
          });

          resolve({ 
            fileName, 
            filePath: uploadResult.Location,
            downloadUrl: signedUrl
          });
        } catch (uploadError) {
          reject(uploadError);
        }
      });

      doc.pipe(bufferStream);

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

    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateReportPDF };
