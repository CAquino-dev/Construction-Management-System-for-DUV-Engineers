import React, { useState } from 'react'
import { Card, CardHeader, CardContent } from '../ui/card'
import { Button } from '../ui/button'

export const ViewClientFeedback = ({ selectedFeedback, onBack }) => {
  const feedbackTypeColor = selectedFeedback.feedbackType === 'Positive' ? 'text-green-600' : 'text-red-600';
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReplyClick = () => {
    setIsReplying(true); // Show the input field when the reply button is clicked
  }

  const handleReplyChange = (e) => {
    setReplyText(e.target.value); // Update the reply text
  }

  const handleSubmitReply = () => {
    const subject = `Reply to Feedback: ${selectedFeedback.feedbackAbout}`;
    const body = `Hello ${selectedFeedback.name},\n\nThank you for your feedback. Here is our response:\n\n${replyText}\n\nBest regards, Your Team`;

    // Construct the mailto link
    const mailtoLink = `mailto:${selectedFeedback.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Trigger the default email client with the mailto link
    window.location.href = mailtoLink;

    // Hide the reply input after submitting 
    setIsReplying(false);
  }

  return (
    <div className='p-6'>
      <Button
        variant='link'
        onClick={onBack}
        className='mb-6 text-[#4c735c]' // Adjust the style of the back button
      >
        ← Back
      </Button>

      <Card className='p-6 w-full'>
        <CardHeader className=''>
          <p className='text-sm font-medium text-gray-700'>{selectedFeedback.date}</p>
        </CardHeader>
        <CardContent>
          <div className='mb-2 border-b-2 border-gray-300 pb-2'>
            <p className='text-xl font-semibold'>{selectedFeedback.name}</p>
            <p className='text-md font-medium text-gray-700/80'>{selectedFeedback.email} / {selectedFeedback.phone}</p>
          </div>
          <div>
            <p className={`text-lg font-semibold ${feedbackTypeColor}`}>
              <span className='text-gray-700/60'>Feedback Type:</span> {selectedFeedback.feedbackType}
            </p>
            <p className='text-lg font-semibold mb-6'>
              <span className='text-gray-700/60'>Feedback About:</span> {selectedFeedback.feedbackAbout}
            </p>
            
            <p className='text-gray-700/60'>Description:</p> 
            {/* Description with scrollable content */}
            <div
              className="h-40 overflow-y-auto bg-gray-200/80 p-2 border border-gray-300 rounded" // Fixed height with scroll
              style={{ maxHeight: '200px', overflowY: 'auto' }} // You can adjust the height here
            >
              <p className='text-lg font-semibold'>
                {selectedFeedback.description}
              </p>
            </div>
          </div>

          <div className='mt-4'>
            {!isReplying ? (
              <div className='flex justify-end'>
                <Button
                  variant='outline'
                  onClick={handleReplyClick}
                  className='w-auto py-2 text-center bg-gray-600 text-white hover:bg-gray-700'
                >
                  Reply
                </Button>
              </div>
            ) : (
              <div>
                <textarea
                  className='w-full p-2 border rounded-md' // Fixed typo here: rouneded-md -> rounded-md
                  placeholder='Type your reply here...'
                  value={replyText}
                  onChange={handleReplyChange}
                />
                <p className="mt-2 text-sm text-gray-600">
                  This reply will be sent via email to {selectedFeedback.email}.
                </p>
                <div className="flex justify-end mt-2">
                  <Button
                    variant='outline'
                    onClick={handleSubmitReply}
                    className='w-auto py-2 text-center bg-gray-600 text-white hover:bg-gray-700'
                  >
                    Send Reply
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
