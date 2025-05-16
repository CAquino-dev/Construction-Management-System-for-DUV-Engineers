import React, { useState } from 'react'
import { ReportedIssuesTable } from '../../components/adminComponents/ReportedIssuesTable'
import { ViewReportedIssues } from '../../components/adminComponents/ViewReportedIssues'

export const ReportedIssues = () => {
  const [selectedIssue, setSelectedIssue] = useState(null);
  return (
    <div className='container mx-auto mt-15 bg-white shadow-md rounded-lg'>
      {selectedIssue ? (
        <ViewReportedIssues selectedIssue={selectedIssue} onBack={() => setSelectedIssue(null)} />
      ) : (
        <ReportedIssuesTable setSelectedIssue={setSelectedIssue} />
      )}
    </div>
  )
}
