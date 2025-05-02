import React, { useState } from 'react'
import { ClientFeedbackTable } from '../../components/adminComponents/ClientFeedbackTable'
import { ViewClientFeedback } from '../../components/adminComponents/ViewClientFeedback'

export const ClientFeedback = () => {
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  // const [feedbackData, setFeedbackData] = useState([]);


  return (
    <div className='container mx-auto mt-15 bg-white shadow-md rounded-lg'>
      {selectedFeedback ? (
        <ViewClientFeedback selectedFeedback={selectedFeedback} onBack={() => setSelectedFeedback(null)} />
      ) : (
        <ClientFeedbackTable setSelectedFeedback={setSelectedFeedback} />
      )}
    </div>
  )
}
