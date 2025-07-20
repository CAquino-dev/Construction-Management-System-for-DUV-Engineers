import React from 'react'
import CreateProposal from '../../components/adminComponents/Engineering/CreateProposal'
import ViewProposals from '../../components/adminComponents/Engineering/ViewProposals'


const Proposal = () => {
  return (
    <div className="p-4">
      <CreateProposal />
      <hr className="my-6 border-gray-300" />
      <ViewProposals />
    </div>
  )
}

export default Proposal
