const { getAIResponse } = require('../services/openaiService');

const handleChat = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const reply = await getAIResponse(message);
    res.json({ reply });
  } catch (err) {
    console.error('ChatController error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { handleChat };
