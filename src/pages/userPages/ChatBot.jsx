import React, { useState } from 'react';
import duvLogo from '../../assets/duvLogo.jpg'; // Path to the logo

export const ChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I assist you today?' }
  ]);

  const choices = [
    'Estimation for a project',
    'About Us',
    'Who are you?'
  ];

  const handleChoice = (choice) => {
    // Send to the system (you can replace this with an actual API call)
    console.log(`Sending to system: ${choice}`);

    // Add the choice to the conversation
    setMessages([...messages, { sender: 'user', text: choice }]);

    // Add a response from the bot
    let botResponse = '';
    switch (choice) {
      case 'Estimation for a project':
        botResponse = 'I will send you the project estimation details shortly.';
        break;
      case 'About Us':
        botResponse = 'We are a leading architecture firm that specializes in designing remarkable structures.';
        break;
      case 'Who are you?':
        botResponse = 'I am your friendly assistant here to help you with any questions you have!';
        break;
      default:
        botResponse = 'I am not sure about that. Could you please clarify?';
        break;
    }

    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'bot', text: botResponse }
    ]);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-transparent pt-16">
      {/* Full-page Chat Window */}
      <div className="w-full max-w-3xl h-full bg-transparent flex flex-col rounded-lg">
        <div className="text-[#4c735c] border-b border-gray-300 p-4 flex justify-between items-center rounded-t-lg">
          <span className="font-semibold text-lg">DUV Estimation Chat</span>
        </div>

        <div className="flex-grow p-4 overflow-y-auto max-h-[70vh] scrollbar-thin">
          {/* Render messages */}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 mb-3 rounded-lg flex items-start ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
            >
              {/* Logo inside the message bubble */}
              {message.sender === 'bot' && (
                <div className="mr-3">
                  <img
                    src={duvLogo}
                    alt="Duv Logo"
                    className="w-8 h-8 rounded-full border-2 border-[#4c735c]"
                  />
                </div>
              )}
              {/* Message text inside the bubble with consistent width */}
              <div className={`max-w-[70%] p-3 rounded-lg ${message.sender === 'bot' ? 'bg-[#4c735c] text-white' : 'bg-white text-black'}`}>
                {message.text}
              </div>
            </div>
          ))}
        </div>

        {/* Buttons for user choices */}
        <div className="p-4 border-t border-gray-300 overflow-y-auto bg-white" style={{ minHeight: '150px' }}>
          <div className="grid grid-cols-2 gap-3">
            {choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoice(choice)}
                className="text-[#4c735c] border-2 border-[#4c735c] w-full py-2 rounded-md cursor-pointer transition duration-200 hover:bg-[#4c735c] hover:text-white"
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
