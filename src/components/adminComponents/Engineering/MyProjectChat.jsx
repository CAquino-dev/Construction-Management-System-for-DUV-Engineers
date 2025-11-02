import React, { useState, useRef, useEffect } from 'react';

export const MyProjectChat = ({ selectedProject }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const projectId = selectedProject?.id; 
  const userId = Number(localStorage.getItem('userId'));

  // Fetch messages when project changes
  useEffect(() => {
    if (!projectId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/chat/project-messages/${projectId}`);
        const data = await res.json();
        console.log('Fetched messages:', data.messages); // Debug log
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };

    fetchMessages();

    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [projectId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !projectId || isSending) return;

    const tempId = Date.now();
    const optimisticMessage = {
      id: tempId,
      sender_id: userId,
      sender_name: 'You',
      message: trimmed,
      created_at: new Date().toISOString(),
      isOptimistic: true
    };

    // Optimistically add message to UI immediately
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

      console.log('Sending message:', newMessage); // Debug log

      const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/chat/project-messages/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage),
      });

      if (!res.ok) throw new Error('Failed to send message');
      const savedMessage = await res.json();
      
      console.log('Server response:', savedMessage); // Debug log
      console.log('User ID from localStorage:', userId, 'Type:', typeof userId); // Debug log

      // SIMPLIFIED: Just let polling handle the update
      // The polling will fetch the updated messages in 3 seconds
      // Remove the optimistic message since polling will get the real one
      setMessages(prev => prev.filter(msg => msg.id !== tempId));

    } catch (err) {
      console.error('Error sending message:', err);
      // Remove optimistic message if send failed
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setInput(trimmed);
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

  if (!selectedProject) {
    return (
      <div className="h-[500px] border border-gray-300 rounded-lg flex items-center justify-center font-sans">
        <div className="text-gray-500">Select a project to start chatting</div>
      </div>
    );
  }

  return (
    <div className="h-[500px] border border-gray-300 rounded-lg flex flex-col font-sans">
      <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-4">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map(({ id, sender_id, sender_name, message, created_at, isOptimistic }) => {
            const isCurrentUser = sender_id === userId;
            console.log('Rendering message:', { id, sender_id, userId, isCurrentUser }); // Debug log

            return (
              <div
                key={id}
                className={`mb-3 text-sm ${isCurrentUser ? 'text-right' : 'text-left'} ${
                  isOptimistic ? 'opacity-70' : ''
                }`}
              >
                <div className="text-xs text-gray-500 mb-1">
                  {!isCurrentUser && (sender_name || 'Unknown User')}
                  {isCurrentUser && 'You'}
                  <span className="ml-2">
                    {new Date(created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isOptimistic && (
                    <span className="ml-2 text-orange-500">Sending...</span>
                  )}
                </div>
                <div
                  className={`inline-block max-w-[80%] break-words px-4 py-2 rounded-2xl ${
                    isCurrentUser
                      ? 'bg-[#3b5d47] text-white'
                      : 'bg-gray-300 text-gray-900'
                  } ${isOptimistic ? 'animate-pulse' : ''}`}
                >
                  {message}
                </div>
              </div>
            );
          })
        )}
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
          disabled={!input.trim() || !projectId || isSending}
          className="bg-[#3b5d47] text-white rounded-full px-5 py-2 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};