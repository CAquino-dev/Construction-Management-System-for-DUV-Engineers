import React, { useEffect, useState } from 'react'
import { MyProjectCard } from '../../components/adminComponents/MyProjectCard' // Assuming MyProjectCard is in this directory
import { ViewMyProject } from '../../components/adminComponents/ViewMyProject' // Assuming ViewMyProject is in this directory
import duvLogo from '../../assets/duvLogo.jpg';

export const MyProject = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchEngineerProjects = async () => {
      try {
        
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/engr/getEngineerProjects/10`);
      if(response.ok){
      const data = await response.json();
      setProjects(data.projects)
      }  else {
        throw new Error("Failed to fetch projects.");
      }        
      } catch (error) {
       console.error(error) 
      }
    };

    fetchEngineerProjects();

  }, []);

  return (
    <div className='container mx-auto p-6 mt-10'>
      {selectedProject ? (
        <ViewMyProject selectedProject={selectedProject} onBack={() => setSelectedProject(null)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Dynamically render MyProjectCard components from projects array */}
          {projects.map((project) => (
            <div key={project.id} onClick={() => setSelectedProject(project)}>
              <MyProjectCard project={project} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
