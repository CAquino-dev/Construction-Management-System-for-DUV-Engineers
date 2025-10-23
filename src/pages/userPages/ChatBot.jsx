import React, { useState, useEffect, useRef } from 'react';
import duvLogo from '../../assets/duvLogo.jpg';

export const ChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I assist you today?' }
  ]);

  const [userInputs, setUserInputs] = useState({
    projectType: '',
    materialType: '',
    designComplexity: '',
    numFloors: '',
    foundationType: '',
    roofType: '',
    laborQuality: '',
    timelineUrgency: '',
    sizeInSqm: '',
    location: '',
    budget: '',
    siteAccessibility: 'Moderate'
  });

  const [step, setStep] = useState(0);
  const [isEstimation, setIsEstimation] = useState(false);
  const [isEstimationStarted, setIsEstimationStarted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);

  const choices = ['Estimation for a project', 'About Us', 'Who are you?'];
  const projectTypes = ['Residential', 'Commercial', 'Industrial'];
  const materials = ['Concrete', 'Steel', 'Wood'];
  const complexities = ['Simple', 'Moderate', 'Complex'];
  const floors = ['1', '2', '3', '4+'];
  const foundations = ['Slab', 'Footing', 'Pile'];
  const roofs = ['Gable', 'Flat', 'Metal'];
  const laborQualities = ['Standard', 'Skilled', 'Premium'];
  const timelines = ['Normal', 'Rush', 'Very Urgent'];
  const siteAccessibilities = ['Easy', 'Moderate', 'Difficult'];
  const locations = ['Dasmarinas', 'Tagaytay', 'Silang'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (userInputs.location && !isEstimationStarted && !isProcessing) {
      setIsEstimationStarted(true);
      setIsProcessing(true);
      submitEstimation(userInputs);
    }
  }, [userInputs.location]);

  const handleChoice = (choice) => {
    setMessages([...messages, { sender: 'user', text: choice }]);
    let botResponse = '';
    if (choice === 'Estimation for a project') {
      botResponse = 'Please enter your budget:';
      setIsEstimation(true);
      setStep(1);
    } else if (choice === 'About Us') {
      botResponse = 'We are a leading architecture and construction firm specializing in high-quality builds.';
    } else {
      botResponse = 'I am your friendly DUV estimator assistant!';
    }
    setMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
  };

  const handleSelection = (category, selection) => {
    setUserInputs((prev) => ({ ...prev, [category]: selection }));
    setMessages((prev) => [...prev, { sender: 'user', text: selection }]);

    let botResponse = '';
    switch (category) {
      case 'budget':
        botResponse = 'Select the project type:';
        setStep(2);
        break;
      case 'projectType':
        botResponse = 'Select the material type:';
        setStep(3);
        break;
      case 'materialType':
        botResponse = 'Select design complexity:';
        setStep(4);
        break;
      case 'designComplexity':
        botResponse = 'Select number of floors:';
        setStep(5);
        break;
      case 'numFloors':
        botResponse = 'Select foundation type:';
        setStep(6);
        break;
      case 'foundationType':
        botResponse = 'Select roof type:';
        setStep(7);
        break;
      case 'roofType':
        botResponse = 'Select labor quality:';
        setStep(8);
        break;
      case 'laborQuality':
        botResponse = 'Select project timeline:';
        setStep(9);
        break;
      case 'timelineUrgency':
        botResponse = 'Select site accessibility:';
        setStep(10);
        break;
      case 'siteAccessibility':
        botResponse = 'Enter total floor area (in sqm):';
        setStep(11);
        break;
      case 'sizeInSqm':
        botResponse = 'Select your project location:';
        setStep(12);
        break;
      case 'location':
        botResponse = 'Calculating your project estimate...';
        break;
      default:
        botResponse = 'Please continue...';
    }

    setMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
  };

  const handleBudgetInput = (e) => {
    setUserInputs({ ...userInputs, budget: e.target.value });
  };

  const handleSizeInput = (e) => {
    setUserInputs({ ...userInputs, sizeInSqm: e.target.value });
  };

  // Function to format the complete estimate into 1-2 clean messages
  const formatCompleteEstimate = (message, totalCost) => {
    const formattedTotal = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(totalCost);

    // Extract key information from the message
    const lines = message.split('\n').filter(line => line.trim() !== '');
    
    // Find key sections
    const projectDetails = [];
    const costBreakdown = [];
    const adjustments = [];
    const budgetStatus = [];
    let costTier = '';
    let baseRate = '';
    let totalArea = '';

    lines.forEach(line => {
      const cleanLine = line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').trim();
      
      if (cleanLine.includes('Cost Tier Applied:')) {
        costTier = cleanLine.split(':')[1]?.trim();
      } else if (cleanLine.includes('Base Rate:')) {
        baseRate = cleanLine.split(':')[1]?.trim();
      } else if (cleanLine.includes('Total Floor Area:')) {
        totalArea = cleanLine.split(':')[1]?.trim();
      } else if (cleanLine.includes('Project Type:') || cleanLine.includes('Material:') || 
                 cleanLine.includes('Complexity:') || cleanLine.includes('Floors:') ||
                 cleanLine.includes('Foundation:') || cleanLine.includes('Roof:') ||
                 cleanLine.includes('Labor Quality:') || cleanLine.includes('Timeline:') ||
                 cleanLine.includes('Location:')) {
        projectDetails.push(cleanLine);
      } else if (cleanLine.includes('Base Construction') || cleanLine.includes('Finishing Works') ||
                 cleanLine.includes('Foundation System') || cleanLine.includes('Roofing Structure') ||
                 cleanLine.includes('Labor Costs') || cleanLine.includes('Utility Systems') ||
                 cleanLine.includes('Location & Complexity Adjustments')) {
        costBreakdown.push(cleanLine);
      } else if (cleanLine.includes('Material:') && cleanLine.includes('x') && cleanLine.length < 50) {
        adjustments.push(cleanLine);
      } else if (cleanLine.includes('Budget Alert:') || cleanLine.includes('Budget Status:') ||
                 cleanLine.includes('Suggestions:') || cleanLine.includes('Opportunity:')) {
        budgetStatus.push(cleanLine);
      }
    });

    // Create compact, well-formatted messages
    const message1 = `
🏗️ CONSTRUCTION ESTIMATE SUMMARY
Based on ACDC 2025 Construction Cost Chart

${costTier ? `📊 ${costTier}` : ''} ${baseRate ? `• ${baseRate}` : ''}
${totalArea ? `📐 Total Area: ${totalArea}` : ''}
💰 TOTAL ESTIMATED COST: ${formattedTotal}

PROJECT DETAILS:
${projectDetails.slice(0, 5).join('\n')}
${projectDetails.length > 5 ? projectDetails.slice(5).join('\n') : ''}
    `.trim();

    const message2 = `
COST BREAKDOWN:
${costBreakdown.slice(0, 4).join('\n')}
${costBreakdown.length > 4 ? costBreakdown.slice(4).join('\n') : ''}

${adjustments.length > 0 ? 'ADJUSTMENT FACTORS:\n' + adjustments.slice(0, 3).join('\n') : ''}
${adjustments.length > 3 ? adjustments.slice(3).join('\n') : ''}

${budgetStatus.join('\n')}

💡 Note: Based on ACDC 2025 Construction Cost standards. Rates are preliminary estimates.
    `.trim();

    return [message1, message2].filter(msg => msg.trim() !== '');
  };

  const submitEstimation = async (data) => {
    try {
      // Prepare the data for backend (convert strings to numbers where needed)
      const requestData = {
        ...data,
        budget: parseFloat(data.budget) || 0,
        sizeInSqm: parseFloat(data.sizeInSqm) || 0,
        numFloors: parseInt(data.numFloors) || 1,
        // These are hardcoded as per your backend expectation
        includePlumbing: true,
        includeElectrical: true,
        includeHVAC: false,
        siteAccessibility: data.siteAccessibility || 'Moderate'
      };

      console.log('Sending data to backend:', requestData);

      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/project/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resData = await response.json();
      
      // Format the complete estimate into 1-2 clean messages
      const formattedMessages = formatCompleteEstimate(resData.message, resData.totalCost);
      
      // Add the formatted messages
      formattedMessages.forEach((message, index) => {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { sender: 'bot', text: message }
          ]);
        }, index * 500);
      });

      // Add final message after a delay
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: 'Would you like to estimate another project?' }
        ]);

        // Reset for new estimation
        setStep(0);
        setIsEstimation(false);
        setIsEstimationStarted(false);
        setIsProcessing(false);
        setUserInputs({
          projectType: '',
          materialType: '',
          designComplexity: '',
          numFloors: '',
          foundationType: '',
          roofType: '',
          laborQuality: '',
          timelineUrgency: '',
          sizeInSqm: '',
          location: '',
          budget: '',
          siteAccessibility: 'Moderate'
        });
      }, (formattedMessages.length + 1) * 500);
      
    } catch (err) {
      console.error('Estimation error:', err);
      setMessages((prev) => [...prev, { 
        sender: 'bot', 
        text: `Error calculating estimate: ${err.message}. Please try again.` 
      }]);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-transparent pt-16">
      <div className="w-full max-w-3xl h-full bg-transparent flex flex-col rounded-lg">
        <div className="text-[#4c735c] border-b border-gray-300 p-4 flex justify-between items-center rounded-t-lg">
          <span className="font-semibold text-lg">DUV Estimation Chat</span>
        </div>

        <div className="flex-grow p-4 overflow-y-auto max-h-[70vh]">
          {messages.map((m, i) => (
            <div key={i} className={`p-3 mb-3 rounded-lg flex ${m.sender === 'bot' ? 'justify-start' : 'justify-end'}`}>
              {m.sender === 'bot' && (
                <div className="mr-3">
                  <img src={duvLogo} alt="logo" className="w-8 h-8 rounded-full border-2 border-[#4c735c]" />
                </div>
              )}
              <div className={`max-w-[70%] p-3 rounded-lg ${m.sender === 'bot' ? 'bg-[#4c735c] text-white' : 'bg-white text-black'}`}>
                {/* Preserve line breaks in the message */}
                {m.text.split('\n').map((line, index) => (
                  <div key={index}>
                    {line}
                    {index < m.text.split('\n').length - 1 && <br />}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="p-3 mb-3 rounded-lg flex justify-start">
              <div className="mr-3">
                <img src={duvLogo} alt="logo" className="w-8 h-8 rounded-full border-2 border-[#4c735c]" />
              </div>
              <div className="bg-[#4c735c] text-white p-3 rounded-lg">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-300 bg-white min-h-[150px]">
          {isEstimation ? (
            <div className="grid grid-cols-2 gap-3">
              {step === 1 && (
                <div className="flex flex-col col-span-2">
                  <input 
                    type="number" 
                    placeholder="Enter your budget" 
                    className="border-2 border-[#4c735c] p-2 rounded-md" 
                    value={userInputs.budget} 
                    onChange={handleBudgetInput} 
                  />
                  <button 
                    onClick={() => handleSelection('budget', userInputs.budget)} 
                    className="mt-2 border-2 border-[#4c735c] text-[#4c735c] py-2 rounded-md hover:bg-[#4c735c] hover:text-white transition duration-200"
                  >
                    Confirm Budget
                  </button>
                </div>
              )}
              {step === 2 && projectTypes.map((x) => <Button key={x} text={x} category="projectType" handler={handleSelection} />)}
              {step === 3 && materials.map((x) => <Button key={x} text={x} category="materialType" handler={handleSelection} />)}
              {step === 4 && complexities.map((x) => <Button key={x} text={x} category="designComplexity" handler={handleSelection} />)}
              {step === 5 && floors.map((x) => <Button key={x} text={x} category="numFloors" handler={handleSelection} />)}
              {step === 6 && foundations.map((x) => <Button key={x} text={x} category="foundationType" handler={handleSelection} />)}
              {step === 7 && roofs.map((x) => <Button key={x} text={x} category="roofType" handler={handleSelection} />)}
              {step === 8 && laborQualities.map((x) => <Button key={x} text={x} category="laborQuality" handler={handleSelection} />)}
              {step === 9 && timelines.map((x) => <Button key={x} text={x} category="timelineUrgency" handler={handleSelection} />)}
              {step === 10 && siteAccessibilities.map((x) => <Button key={x} text={x} category="siteAccessibility" handler={handleSelection} />)}
              {step === 11 && (
                <div className="flex flex-col col-span-2">
                  <input 
                    type="number" 
                    placeholder="Enter floor area (sqm)" 
                    className="border-2 border-[#4c735c] p-2 rounded-md" 
                    value={userInputs.sizeInSqm} 
                    onChange={handleSizeInput} 
                  />
                  <button 
                    onClick={() => handleSelection('sizeInSqm', userInputs.sizeInSqm)} 
                    className="mt-2 border-2 border-[#4c735c] text-[#4c735c] py-2 rounded-md hover:bg-[#4c735c] hover:text-white transition duration-200"
                  >
                    Confirm Size
                  </button>
                </div>
              )}
              {step === 12 && locations.map((x) => <Button key={x} text={x} category="location" handler={handleSelection} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {choices.map((c) => (
                <button 
                  key={c} 
                  onClick={() => handleChoice(c)} 
                  className="text-[#4c735c] border-2 border-[#4c735c] w-full py-2 rounded-md hover:bg-[#4c735c] hover:text-white transition duration-200"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Button = ({ text, category, handler }) => (
  <button 
    onClick={() => handler(category, text)} 
    className="text-[#4c735c] border-2 border-[#4c735c] w-full py-2 rounded-md hover:bg-[#4c735c] hover:text-white transition duration-200"
  >
    {text}
  </button>
);