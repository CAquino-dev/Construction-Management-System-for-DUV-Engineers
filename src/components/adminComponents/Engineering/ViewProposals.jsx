import React, { useEffect, useState } from 'react'

const ViewProposals = () => {
  const [proposals, setProposals] = useState([])

  useEffect(() => {
    const fetchProposalResponse = async () => {
        const results = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/projectManager/getProposalResponse`);
        if(results.ok){
            const data = await results.json();
            setProposals(data);
        }
    }

    fetchProposalResponse();
  }, [])

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Submitted Proposals</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Title</th>
            <th className="border p-2">Client</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Responded At</th>
            <th className="border p-2">IP Address</th>
          </tr>
        </thead>
        <tbody>
          {proposals.map((p) => (
            <tr key={p.id}>
              <td className="border p-2">{p.title}</td>
              <td className="border p-2">{p.client_name}</td>
              <td className="border p-2 capitalize">{p.status}</td>
              <td className="border p-2">{p.responded_at || 'Pending'}</td>
              <td className="border p-2">{p.approved_by_ip || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ViewProposals
