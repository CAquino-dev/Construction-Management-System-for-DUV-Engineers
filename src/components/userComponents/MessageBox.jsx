import React, { useState } from 'react';

export const MessageBox = ({ selectedUser }) => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState(selectedUser ? selectedUser.messages : []);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = { sender: 'You', text: message };
      setConversation([...conversation, newMessage]);
      setMessage('');
    }
  };

  if (!selectedUser) {
    return <div className="p-6">Select a user to start a conversation.</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Conversation messages area */}
      <div className="flex-1 space-y-4 overflow-y-auto mb-16 pr-2">
        {conversation.map((msg, idx) => (
          <div key={idx} className={msg.sender === 'You' ? 'text-right' : 'text-left'}>
            <div
              className={`inline-block p-3 max-w-xs rounded-lg ${
                msg.sender === 'You' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'
              }`}
            >
              <strong>{msg.sender}:</strong> {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input area at the bottom */}
      <div className="p-4 border-t flex items-center space-x-2 bg-white mb-4">
        <input
          type="text"
          className="flex-1 p-2 border rounded-md"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          className="p-2 bg-blue-500 text-white rounded-md"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};
