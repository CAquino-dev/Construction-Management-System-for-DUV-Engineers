import React, { useState, useRef, useEffect } from 'react';

export const ChatClient = ({ selectedProject, clientUserId }) => {
  const userId = localStorage.getItem("userId");
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Welcome to MyProjectChat!' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const [isSending, setIsSending] = useState(false);

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

        const apiMessages = data.messages.map(msg => ({
          id: msg.id,
          sender: msg.sender_id.toString() === userId ? 'user' : 'bot',
          text: msg.message,
          senderName: msg.sender_name,
          timestamp: msg.created_at
        }));

        setMessages(apiMessages.length ? apiMessages : [
          { id: 1, sender: 'bot', text: 'No messages yet.' }
        ]);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();

    // Optional polling every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedProject, userId]);

  // Improved handleSend with optimistic update
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !selectedProject || isSending) return;

    const tempId = Date.now(); // Temporary ID for optimistic update
    const optimisticMessage = {
      id: tempId,
      sender: 'user',
      text: trimmed,
      senderName: 'You',
      timestamp: new Date().toISOString(),
      isOptimistic: true // Flag to identify optimistic messages
    };

    // Optimistically add the message immediately
    setMessages(prev => [...prev, optimisticMessage]);
    setInput('');
    setIsSending(true);
    
    // Reset textarea height
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
    }

    try {
      const newMessage = {
        senderId: userId,
        message: trimmed,
      };

      const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/chat/project-messages/${selectedProject.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage),
      });

      if (!res.ok) throw new Error('Failed to send message');
      const savedMessage = await res.json();

      // Replace optimistic message with real one from server
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId && msg.isOptimistic
            ? {
                id: savedMessage.id,
                sender: 'user',
                text: savedMessage.message || trimmed,
                senderName: 'You',
                timestamp: savedMessage.created_at || new Date().toISOString()
              }
            : msg
        )
      );

    } catch (err) {
      console.error('Error sending message:', err);
      // Remove the optimistic message if there was an error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      // Optionally show error feedback to user
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="h-[500px] border border-gray-300 rounded-lg flex flex-col font-sans">
      <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
        {messages.map(({ id, sender, text, senderName, timestamp, isOptimistic }) => (
          <div
            key={id}
            className={`mb-3 text-sm ${sender === 'user' ? 'text-right' : 'text-left'} ${
              isOptimistic ? 'opacity-70' : ''
            }`}
          >
            {sender === 'bot' && senderName && (
              <div className="text-xs text-gray-600 mb-1">{senderName}</div>
            )}
            <div
              className={`inline-block max-w-[80%] break-words px-4 py-2 rounded-2xl ${
                sender === 'user'
                  ? 'bg-[#3b5d47] text-white'
                  : 'bg-gray-300 text-gray-900'
              } ${isOptimistic ? 'animate-pulse' : ''}`}
            >
              {text}
              {isOptimistic && (
                <span className="ml-2 text-xs opacity-70">Sending...</span>
              )}
            </div>
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
          disabled={!input.trim() || !selectedProject || isSending}
          className="bg-[#3b5d47] text-white rounded-full px-5 py-2 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};