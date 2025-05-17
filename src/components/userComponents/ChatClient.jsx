import React,{ useState, useRef, useEffect } from 'react'

export const ChatClient = () => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: 'Welcome to MyProjectChat!' }
      ]);
      const [input, setInput] = useState('');
      const messagesEndRef = useRef(null);
    
      useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, [messages]);
    
      const handleSend = () => {
        if (!input.trim()) return;
    
        setMessages(prev => [
          ...prev,
          { id: prev.length + 1, sender: 'user', text: input.trim() }
        ]);
        setInput('');
      };
    
      const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      };
  return (
    <div className=" h-[500px] border border-gray-300 rounded-lg flex flex-col font-sans">
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
          className="ml-3 bg-[#3b5d47]  text-white rounded-full px-5 font-semibold text-sm transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  )
}
