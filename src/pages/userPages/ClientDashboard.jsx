import React, { useEffect, useState } from 'react'

export const ClientDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchClientProjects = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/engr/getClientProject/${userId}`)
        if(response.ok){
          const data = await response.json();
          setProjects(data.projects);
        } else {
          throw new Error("Failed to fetch projects.");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchClientProjects();
  }, [])



  return (
    <div className="p-6 mt-15 ">
        <p className="text-2xl font-bold">Welcome, Username</p>
        <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Client's Projects</h2>

      {/* Project Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="px-4 py-2 text-left">Engineer Name</th>
              <th className="px-4 py-2 text-left">Project Name</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Start Date</th>
              <th className="px-4 py-2 text-left">End Date</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Budget</th>
              <th className="px-4 py-2 text-left">Location</th>
              <th className="px-4 py-2 text-left">Project Type</th>
            </tr>
          </thead>
          <tbody>
            {projects.length > 0 ? (
              projects.map((project) => (
                <tr key={project.id} className="border-t border-gray-200">
                  <td className="px-4 py-2">{project.engineer_name}</td>
                  <td className="px-4 py-2">{project.project_name}</td>
                  <td className="px-4 py-2">{project.description}</td>
                  <td className="px-4 py-2">{new Date(project.start_date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{new Date(project.end_date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{project.status || "N/A"}</td>
                  <td className="px-4 py-2">{parseFloat(project.budget).toLocaleString()}</td>
                  <td className="px-4 py-2">{project.location}</td>
                  <td className="px-4 py-2">{project.project_type}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center p-4 text-gray-500">
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {projects.map(project => (
            <div key={project.id}>
              <img src={`${project.project_photo}`} alt={project.project_name} />
            </div>
          ))}

      </div>
    </div>
    </div>
    
  )
}
