const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const getAIResponse = async (userMessage) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful project estimator for a house construction company in the Philippines. Provide realistic cost, timeline, and material suggestions.',
      },
      {
        role: 'user',
        content: userMessage,
      },
    ],
  });

  return response.choices[0].message.content;
};

module.exports = { getAIResponse };
