import React, { useState, useRef, useEffect } from 'react';

export const MyProjectChat = ({selectedProject}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const projectId = selectedProject.id; 
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    // Fetch messages for the project
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/chat/project-messages/${projectId}`);
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };

    fetchMessages();
  }, [projectId]);

  messages.map((message) => {
    console.log(message)
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const newMessage = {
      senderId: userId,
      message: trimmed,
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/chat/project-messages/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage),
      });

      if (!res.ok) throw new Error('Failed to send message');
      const savedMessage = await res.json();

      setMessages(prev => [...prev, savedMessage]);
      setInput('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

 return (
  <div className="h-[500px] border border-gray-300 rounded-lg flex flex-col font-sans">
    <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
      {messages.map(({ id, sender_id, sender_name, message, created_at }) => {
        const isCurrentUser = sender_id === Number(userId);

        return (
          <div
            key={id}
            className={`mb-3 text-sm ${isCurrentUser ? 'text-right' : 'text-left'}`}
          >
            <div className="text-xs text-gray-500 mb-1">
              {!isCurrentUser && sender_name}
              <span className="ml-2">{new Date(created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div
              className={`inline-block max-w-[80%] break-words px-4 py-2 rounded-2xl ${
                isCurrentUser
                  ? 'bg-[#3b5d47] text-white'
                  : 'bg-gray-300 text-gray-900'
              }`}
            >
              {message}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>

    <form
      onSubmit={e => {
        e.preventDefault();
        handleSend();
      }}
      className="flex p-3 border-t border-gray-300"
    >
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        rows={1}
        className="flex-1 resize-none border border-gray-300 rounded-full px-4 py-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="ml-3 bg-[#3b5d47] text-white rounded-full px-5 font-semibold text-sm transition-colors"
      >
        Send
      </button>
    </form>
  </div>
);
};
