const OpenAI = require('openai');
const db = require('../config/database');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate IQ test analysis
async function generateIQAnalysis(attemptId, score, totalQuestions) {
  try {
    const [answers] = await db.query(
      `SELECT ua.answer, ua.is_correct, q.question_text, q.correct_answer
       FROM user_answers ua
       JOIN questions q ON ua.question_id = q.id
       WHERE ua.attempt_id = ?`,
      [attemptId]
    );

    const percentage = Math.round((score / totalQuestions) * 100);
    
    const prompt = `Analyze the following IQ test results and provide a comprehensive assessment:
    
Score: ${score}/${totalQuestions} (${percentage}%)

Performance Summary:
${answers.map((a, i) => `Q${i+1}: ${a.is_correct ? 'Correct' : 'Incorrect'}`).join('\n')}

Please provide:
1. Overall IQ level assessment
2. Strengths identified
3. Areas for improvement
4. Detailed cognitive abilities analysis
5. Recommendations for development

Make it professional and constructive.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'Analysis temporarily unavailable. Please try again later.';
  }
}

// Generate Career assessment analysis
async function generateCareerAnalysis(attemptId) {
  try {
    const [answers] = await db.query(
      `SELECT ua.answer, q.question_text, q.options
       FROM user_answers ua
       JOIN questions q ON ua.question_id = q.id
       WHERE ua.attempt_id = ?`,
      [attemptId]
    );

    const userResponses = answers.map((a, i) => 
      `Q${i+1}: ${a.question_text}\nAnswer: ${a.answer}`
    ).join('\n\n');
    
    const prompt = `Based on the following career assessment responses, provide a detailed career guidance:

${userResponses}

Please provide:
1. Personality type analysis
2. Top 5 recommended career paths with explanations
3. Educational paths to consider
4. Skills to develop
5. Industries that align with the personality
6. Work environment preferences
7. Long-term career growth suggestions

Make it detailed, actionable, and encouraging.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'Analysis temporarily unavailable. Please try again later.';
  }
}

module.exports = {
  generateIQAnalysis,
  generateCareerAnalysis
};
