import React from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Eye } from '@phosphor-icons/react';

const initialReportedIssuesData = [
  {
    id: 1,
    name: "John Doe",
    email: "a8EoT@example.com",
    phone: "123-456-7890",
    title: "Why the Website is not working proberly?",
    issueAbout: "Website",
    description: "The website is not working proberly. It is showing errors and cannot be accessed. Please fix the issue as soon as possible. Thank you for your help in this matter.",
    date: "Thursday, April 27, 2025",
    status: "Pending",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "Lz6bS@example.com",
    phone: "987-654-3210",
    title: "The engineer in my site sucks!",
    issueAbout: "Engineers",
    description: "The engineer in my site is not working proberly. He is showing errors and cannot be accessed. Please fix the issue as soon as possible. Thank you for your help in this matter.",
    date: "Friday, May 5, 2025",
    status: "Pending",
  }
]

const getStatusColor = (status) => {
  if (status === "Pending") return "text-yellow-400";
  if (status === "Replied") return "text-green-400"; 
  return "";
};

export const ReportedIssuesTable = ({ setSelectedIssue }) => {
  return (
    <div className='p-6'>
      <Table>
        <TableHeader>
          <TableRow className='bg-[#4c735c] text-white hover:bg-[#4c735c]'>
            <TableHead className='text-center text-white'>Name</TableHead>
            <TableHead className='text-center text-white'>Email</TableHead>
            <TableHead className='text-center text-white'>Phone</TableHead>
            <TableHead className='text-center text-white'>Issue About</TableHead>
            <TableHead className='text-center text-white'>Date</TableHead>
            <TableHead className='text-center text-white'>Status</TableHead>
            <TableHead className='text-center text-white'>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialReportedIssuesData.map((issues) => (
            <TableRow key={issues.id}>
              <TableCell className='text-center'>{issues.name}</TableCell>
              <TableCell className='text-center'>{issues.email}</TableCell>
              <TableCell className='text-center'>{issues.phone}</TableCell>
              <TableCell className='text-center'>{issues.issueAbout}</TableCell>
              <TableCell className='text-center'>{issues.date}</TableCell>
              <TableCell className={`text-center ${getStatusColor(issues.status)}`}>{issues.status}</TableCell>
              <TableCell className='text-center'>
                <button onClick={() => setSelectedIssue(issues)} className='bg-gray-600 text-white p-1 rounded-md '>
                  <Eye size={20} />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
