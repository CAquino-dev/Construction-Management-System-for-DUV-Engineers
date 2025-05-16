import React from 'react'

export const MyprojectLegals = ({selectedProject}) => {
  console.log('legal selected', selectedProject.project_photo)

  return (
    <div>
      <h2 className='' >Contract</h2>
      <div className="flex overflow-x-auto space-x-2 py-2">
        <img src={`http://localhost:5000${selectedProject.project_photo}`} 
        alt="Contract" />

      </div>      
    </div>
    
  )
}
