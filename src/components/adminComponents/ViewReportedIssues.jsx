import React, { useState } from 'react'
import { Card, CardHeader, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { ArrowBendUpLeft } from '@phosphor-icons/react'

export const ViewReportedIssues = ({ selectedIssue, onBack }) => {
  // State to handle the reply input visibility
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const feddbackTypeColor = selectedIssue.status === 'Pending' ? 'text-yellow-400' : 'text-green-400';

  const handleReplyClick = () => {
    setIsReplying(true); // Show the input field when the reply button is clicked
  };

  const handleReplyChange = (e) => {
    setReplyText(e.target.value); // Update the reply text
  };

  const handleSubmitReply = () => {
    const subject = `Reply to Issue: ${selectedIssue.title}`;
    const body = `Hello ${selectedIssue.name},\n\nThank you for your feedback. Here is our response:\n\n${replyText}\n\nBest regards, Your Team`;
    
    // Construct the mailto link
    const mailtoLink = `mailto:${selectedIssue.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Trigger the default email client with the mailto link
    window.location.href = mailtoLink;
    
    // Hide the reply input after submitting 
    setIsReplying(false);
  };

  return (
    <div className='p-6'>
      <Button
        variant='link'
        onClick={onBack}
        className='mb-6 text-[#4c735c]'
      >
        ← Back
      </Button>

      <Card className='p-6 w-full'>
        <CardHeader>
          <p className='text-sm font-medium text-gray-700'>{selectedIssue.date}</p>
          <p className={`text-lg font-semibold mb-2 ${feddbackTypeColor}`}>
              <span className='text-gray-700/60'>Status:</span> {selectedIssue.status}
            </p>
        </CardHeader>
        <CardContent>
          <div className='mb-2 border-b-2 border-gray-300 pb-2'>
            <p className='text-xl font-semibold'>{selectedIssue.name}</p>
            <p className='text-md font-medium text-gray-700/80'>{selectedIssue.email} / {selectedIssue.phone}</p>
          </div>
          <div>
            <p className='text-lg font-semibold mb-6'>
              <span className='text-gray-700/60'>Issue About:</span> {selectedIssue.issueAbout}
            </p>
            <p className='text-lg font-semibold mb-6'>
              <span className='text-gray-700/60'>Title:</span> {selectedIssue.title}
            </p>
            <p className='text-gray-700/60'>Description:</p> 
            <div
              className="h-40 overflow-y-auto bg-gray-200/80 p-2 border border-gray-300 rounded"
              style={{ maxHeight: '200px', overflowY: 'auto' }} // You can adjust the height here
            >
              <p className='text-lg font-semibold'>
                {selectedIssue.description}
              </p>
            </div>
          </div>

          {/* Reply button and reply input */}
            <div className='mt-4'>
            {!isReplying ? (
                <div className="flex justify-end">
                <Button
                    variant="outlined"
                    onClick={handleReplyClick}
                    className="w-auto py-2 text-center bg-gray-600 text-white hover:bg-gray-700"
                >
                    <ArrowBendUpLeft size={16} /> Reply
                </Button>
                </div>
            ) : (
                <div>
                <textarea
                    className="w-full p-2 border rounded-md"
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={handleReplyChange}
                />
                <p className="mt-2 text-sm text-gray-600">This reply will be sent via email to {selectedIssue.email}.</p>
                <div className="flex justify-end mt-2">
                    <Button
                    variant="filled"
                    onClick={handleSubmitReply}
                    className="w-auto py-2 text-center bg-gray-600 text-white hover:bg-gray-700"
                    >
                    Submit Reply
                    </Button>
                </div>
                </div>
            )}
            </div>

        </CardContent>
      </Card>
    </div>
  );
}
