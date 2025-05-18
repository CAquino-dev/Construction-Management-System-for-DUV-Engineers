import React, { useState, useRef, useEffect } from 'react';

export const MyProjectChat = ({ selectedProject, userId }) => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Welcome to MyProjectChat!' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const user = localStorage.getItem('userId');

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch messages when selectedProject changes
  useEffect(() => {
    if (!selectedProject) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/chat/${selectedProject.id}`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();

        const apiMessages = data.map(msg => ({
          id: msg.id,
          sender: msg.user_id === userId ? 'user' : 'bot',
          text: msg.message
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
  }, [selectedProject, userId]);

  // Send new message to backend and update UI
  const handleSend = async () => {
    if (!input.trim()) return;

    console.log(selectedProject.id)
    console.log(user)
    console.log(input.trim())

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

      setMessages(prev => [
        ...prev,
        { id: data.id, sender: 'user', text: data.message }
      ]);
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

  return (
    <div className="h-[500px] border border-gray-300 rounded-lg flex flex-col font-sans">
      <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
        {messages.map(({ id, sender, text }) => (
          <div
            key={id}
            className={`mb-3 text-sm ${sender === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block max-w-[80%] break-words px-4 py-2 rounded-2xl ${
                sender === 'user'
                  ? 'bg-[#3b5d47] text-white'
                  : 'bg-gray-300 text-gray-900'
              }`}
            >
              {text}
            </div>
          </div>
        ))}
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
