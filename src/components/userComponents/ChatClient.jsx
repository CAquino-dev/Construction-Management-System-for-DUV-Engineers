import React, { useState, useRef, useEffect } from 'react';

export const ChatClient = ({ selectedProject, clientUserId }) => {
  const user = localStorage.getItem("userId");
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Welcome to MyProjectChat!' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch messages when selectedProject changes
  useEffect(() => {
    if (!selectedProject) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/chat/project-messages/${selectedProject.id}`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();

        // Fixed: Properly map the API response structure
        const apiMessages = data.messages.map(msg => ({
          id: msg.id,
          sender: msg.sender_id.toString() === user ? 'user' : 'bot',
          text: msg.message,
          senderName: msg.sender_name,
          timestamp: msg.created_at
        }));

        setMessages(apiMessages.length ? apiMessages : [
          { id: 1, sender: 'bot', text: 'No messages yet.' }
        ]);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setMessages([{ id: 1, sender: 'bot', text: 'Failed to load messages.' }]);
      }
    };

    fetchMessages();

    // Optional polling every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedProject, user]); // Fixed: Added user to dependencies

  // Send new message to backend and update UI
  const handleSend = async () => {
    if (!input.trim() || !selectedProject) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: selectedProject.id,
          user_id: user,
          message: input.trim()
        }),
      });

      if (!res.ok) throw new Error('Failed to send message');

      const data = await res.json();

      // Fixed: Add new message to state with proper structure
      const newMessage = {
        id: data.id || Date.now(), // fallback to timestamp if no id
        sender: 'user',
        text: input.trim(),
        senderName: 'You', // or get from response if available
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, newMessage]);
      setInput('');
    } catch (err) {
      console.error('Error sending message:', err);
      // Optionally show error feedback here
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Fixed: Auto-resize textarea
  const handleInputChange = (e) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="h-[500px] border border-gray-300 rounded-lg flex flex-col font-sans">
      <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
        {messages.map(({ id, sender, text, senderName, timestamp }) => (
          <div
            key={id}
            className={`mb-3 text-sm ${sender === 'user' ? 'text-right' : 'text-left'}`}
          >
            {/* Fixed: Show sender name for bot messages */}
            {sender === 'bot' && senderName && (
              <div className="text-xs text-gray-600 mb-1">{senderName}</div>
            )}
            <div
              className={`inline-block max-w-[80%] break-words px-4 py-2 rounded-2xl ${
                sender === 'user'
                  ? 'bg-[#3b5d47] text-white'
                  : 'bg-gray-300 text-gray-900'
              }`}
            >
              {text}
            </div>
            {/* Fixed: Show timestamp */}
            {timestamp && (
              <div className="text-xs text-gray-500 mt-1">
                {new Date(timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-end p-3 border-t border-gray-300 gap-3"
      >
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={1}
          className="flex-1 resize-none border border-gray-300 rounded-full px-4 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-hidden"
          style={{ minHeight: '40px', maxHeight: '120px' }}
        />
        <button
          type="submit"
          disabled={!input.trim() || !selectedProject}
          className="bg-[#3b5d47] text-white rounded-full px-5 py-2 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
};