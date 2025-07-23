import React from 'react'
import CreateProposal from '../../components/adminComponents/Engineering/CreateProposal'
import ViewProposals from '../../components/adminComponents/Engineering/ViewProposals'


const Proposal = () => {
  return (
    <div className="p-4 h-screen">
      <div className='h-1/2'>
        <CreateProposal />
      </div>
      <div>
        <ViewProposals />
      </div>
    </div>
  )
}

export default Proposal
