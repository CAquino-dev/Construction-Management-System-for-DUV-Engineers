import React, { useState, useEffect, useRef } from 'react';
import duvLogo from '../../assets/duvLogo.jpg'; // Path to the logo

export const ChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I assist you today?' }
  ]);

  const [userInputs, setUserInputs] = useState({
    projectType: '',
    materialType: '',
    sizeInSqm: '',  // Changed from size selection to size input (square meters)
    location: '',
    budget: ''
  });

  const [step, setStep] = useState(0); // Track which step of the estimation flow we're in
  const [isEstimation, setIsEstimation] = useState(false); // Flag to track if we are in estimation flow
  const [isEstimationStarted, setIsEstimationStarted] = useState(false);  // Flag to check if estimation has started

  // Choices for the initial interaction with the chatbot
  const choices = [
    'Estimation for a project',
    'About Us',
    'Who are you?'
  ];

  const projectTypes = ['Residential', 'Commercial', 'Industrial'];
  const materials = ['Concrete', 'Steel', 'Wood'];
  const locations = ['Dasmarinas', 'Tagaytay', 'Silang'];

  const messagesEndRef = useRef(null);  // Ref to the end of messages container

  // Scroll to the bottom whenever a new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (userInputs.location && !isEstimationStarted) {
      // If location is set and estimation hasn't started, then calculate the estimate
      setIsEstimationStarted(true);
      submitEstimation(userInputs);  // Pass the latest user inputs to submitEstimation
    }
  }, [userInputs.location]);  // Run when location is updated

  const handleChoice = (choice) => {
    console.log(`Sending to system: ${choice}`);
    setMessages([...messages, { sender: 'user', text: choice }]);

    let botResponse = '';
    switch (choice) {
      case 'Estimation for a project':
        botResponse = 'Please put your budget: ';
        setIsEstimation(true); // Start the estimation flow
        setStep(1); // Set the step to project type selection
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

  // Function to handle budget input for the user
const handleBudgetInput = (e) => {
  const value = e.target.value;
  setUserInputs({ ...userInputs, budget: value });
};


  // Function to handle user input for project details
  const handleSelection = (category, selection) => {
    console.log('category', category)
    setUserInputs((prevState) => {
      const updatedState = { ...prevState, [category]: selection };
      return updatedState;
    });

    // Add user's input to messages after selecting project details
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'user', text: selection }
    ]);

    // Handle bot responses for each selection
    let botResponse = '';
    if (category === 'budget') {
      botResponse = 'Please select the project type:'; 
      setStep(2); // Move to material selection
    } else if (category === 'projectType') {
      botResponse = 'Please select the material type:';
      setStep(3); // Move to material selection
    } else if (category === 'materialType') {
      botResponse = 'Please input the area (in square meters) for your project:';
      setStep(4); // Move to size input (sqm)
    } else if (category === 'sizeInSqm') {
      botResponse = 'Please select the location:';
      setStep(5); // Move to location selection
    } else if (category === 'location') {
      botResponse = 'I will now calculate your project estimate...';  
    }

    

    // Add bot response for project details selection
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'bot', text: botResponse }
    ]);
  };

  // Function to handle size input for the user (size in sqm)
  const handleSizeInput = (e) => {
    const value = e.target.value;
    setUserInputs({ ...userInputs, sizeInSqm: value });
  };

// Function to submit the estimation and get the estimate from the backend using fetch
const submitEstimation = async (updatedUserInputs) => {
  try {
    const { projectType, materialType, sizeInSqm, location, budget } = updatedUserInputs;

    // Prepare the request payload with the updated userInputs
    const requestBody = {
      projectType,
      materialType,
      sizeInSqm,
      location,
      budget  // Include budget in the request
    };

    console.log('Request Body:', requestBody);  // Log the request body to check it

    // Make the POST request to the backend using fetch
    const response = await fetch('${import.meta.env.VITE_REACT_APP_API_URL}/api/project/estimate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody), // Send the request body
    });

    if (!response.ok) {
      throw new Error('Error calculating estimate');
    }

    const data = await response.json();
    console.log('date estimate', data.totalCost);
    const estimate = data.totalCost;

    // Format the estimate as currency (PHP format)
    const formattedEstimate = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2, // Ensures two decimal places
      maximumFractionDigits: 2, // Ensures two decimal places
    }).format(estimate);

    // Show the formatted estimated result
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'bot', text: `The estimated cost for your project is ${formattedEstimate}` }
    ]);

    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'bot', text: `${data.message}` }
    ]);

    // Ask the user if they want to estimate another project or take further action
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'bot', text: 'Would you like to estimate another project or need help with something else?' }
    ]);

    setIsEstimation(false); // End the estimation flow
    setStep(0); // Reset the step counter to start fresh next time

  } catch (error) {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'bot', text: 'Sorry, there was an error calculating the estimate.' }
    ]);
  }
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
          <div ref={messagesEndRef} /> {/* Invisible div to scroll to the bottom */}
        </div>

        {/* Buttons for user choices */}
        <div className="p-4 border-t border-gray-300 overflow-y-auto bg-white" style={{ minHeight: '150px' }}>
          {isEstimation ? (
            <div className="grid grid-cols-2 gap-3">
              {/* Dynamic buttons for project details based on step */}
              {step === 1 && (
                  <div className="flex flex-col">
                    <input
                      type="number"
                      placeholder="Enter your budget"
                      className="border-2 border-[#4c735c] p-2 rounded-md"
                      value={userInputs.budget}
                      onChange={handleBudgetInput}
                    />
                    <button
                      onClick={() => handleSelection('budget', userInputs.budget)}
                      className="text-[#4c735c] border-2 border-[#4c735c] w-full py-2 rounded-md cursor-pointer transition duration-200 hover:bg-[#4c735c] hover:text-white mt-3"
                    >
                      Confirm Budget
                    </button>
                  </div>
                )}
              {step === 2 && projectTypes.map((type, index) => (
                <button
                  key={index}
                  onClick={() => handleSelection('projectType', type)}
                  className="text-[#4c735c] border-2 border-[#4c735c] w-full py-2 rounded-md cursor-pointer transition duration-200 hover:bg-[#4c735c] hover:text-white"
                >
                  {type}
                </button>
              ))}
              {step === 3 && materials.map((material, index) => (
                <button
                  key={index}
                  onClick={() => handleSelection('materialType', material)}
                  className="text-[#4c735c] border-2 border-[#4c735c] w-full py-2 rounded-md cursor-pointer transition duration-200 hover:bg-[#4c735c] hover:text-white"
                >
                  {material}
                </button>
              ))}
              {step === 4 && (
                <div className="flex flex-col">
                  <input
                    type="number"
                    placeholder="Enter area in square meters"
                    className="border-2 border-[#4c735c] p-2 rounded-md"
                    value={userInputs.sizeInSqm}
                    onChange={handleSizeInput}
                  />
                  <button
                    onClick={() => handleSelection('sizeInSqm', userInputs.sizeInSqm)}
                    className="text-[#4c735c] border-2 border-[#4c735c] w-full py-2 rounded-md cursor-pointer transition duration-200 hover:bg-[#4c735c] hover:text-white mt-3"
                  >
                    Confirm Size
                  </button>
                </div>
              )}
              {step === 5 && locations.map((location, index) => (
                <button
                  key={index}
                  onClick={() => handleSelection('location', location)}
                  className="text-[#4c735c] border-2 border-[#4c735c] w-full py-2 rounded-md cursor-pointer transition duration-200 hover:bg-[#4c735c] hover:text-white"
                >
                  {location}
                </button>
              ))}
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};
