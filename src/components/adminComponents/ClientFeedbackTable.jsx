import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Eye } from '@phosphor-icons/react';

const initialFeedbackData = [
  {
    id: 1,
    name: "John Doe",
    email: "a8EoT@example.com",
    phone: "123-456-7890",
    feedbackType: "Positive",
    feedbackAbout: "Service",
    description: "I recently had the opportunity to use your services, and I wanted to share my experience. From the moment I reached out for assistance, I was impressed by the professionalism and responsiveness of the team. The customer service representatives were knowledgeable, patient, and friendly, which immediately made me feel at ease. I had a few questions about the process, and they took the time to explain everything thoroughly. It was clear that they genuinely cared about my needs and wanted to ensure I had a positive experience. The service itself was top-notch. The team worked efficiently and effectively, and I was amazed at how quickly they resolved my issue. I appreciate the attention to detail and the commitment to quality that your company demonstrates. Overall, I am extremely satisfied with the service I received. Thank you for going above and beyond to make my experience a positive one!",
    date: "Thursday, April 27, 2025",
    status: "Pending",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "Lz6bS@example.com",
    phone: "987-654-3210",
    feedbackType: "Negative",
    feedbackAbout: "Quality",
    description: "Could be better.",
    date: "Friday, May 5, 2025",
    status: "Pending",
  },
  {
    id: 3,
    name: "Alice Johnson",
    email: "cE4M7@example.com",
    phone: "555-555-5555",
    feedbackType: "Positive",
    feedbackAbout: "Website",
    description: "Excellent Website!",
    date: "Saturday, June 10, 2025",
    status: "Replied",
  },
];

export const ClientFeedbackTable = ({ setSelectedFeedback }) => {
  // Helper function to determine row color
  const getFeedbackColor = (feedbackType) => {
    if (feedbackType === "Positive") return "text-green-600";
    if (feedbackType === "Negative") return "text-red-600";
    return ""; // Default color
  };

  const getStatusColor = (status) => {
    if (status === "Pending") return "text-yellow-400";
    if (status === "Replied") return "text-green-400"; 
    return "";
  };

  return (
    <div className='p-6'>
      <Table>
        <TableHeader>
          <TableRow className='bg-[#4c735c] text-white hover:bg-[#4c735c]'>
            <TableHead className='text-center text-white'>Name</TableHead>
            <TableHead className='text-center text-white'>Email</TableHead>
            <TableHead className='text-center text-white'>Phone</TableHead>
            <TableHead className='text-center text-white'>Feedback Type</TableHead>
            <TableHead className='text-center text-white'>Feedback About</TableHead>
            <TableHead className='text-center text-white'>Date</TableHead>
            <TableHead className='text-center text-white'>Status</TableHead>
            <TableHead className='text-center text-white'>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialFeedbackData.map((feedback) => (
            <TableRow key={feedback.id}>
              <TableCell className='text-center'>{feedback.name}</TableCell>
              <TableCell className='text-center'>{feedback.email}</TableCell>
              <TableCell className='text-center'>{feedback.phone}</TableCell>
              <TableCell className={`text-center ${getFeedbackColor(feedback.feedbackType)}`}>{feedback.feedbackType}</TableCell>
              <TableCell className='text-center'>{feedback.feedbackAbout}</TableCell>
              <TableCell className='text-center'>{feedback.date}</TableCell>
              <TableCell className={`text-center ${getStatusColor(feedback.status)}`}>{feedback.status}</TableCell>
              <TableCell className='text-center'>
                <button onClick={() => setSelectedFeedback(feedback)} className='bg-gray-600 text-white p-1 rounded-md'>
                  <Eye size={20} />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
