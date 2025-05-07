import React, { useEffect, useState } from 'react'
import { MyProjectCard } from '../../components/adminComponents/MyProjectCard' // Assuming MyProjectCard is in this directory
import { ViewMyProject } from '../../components/adminComponents/ViewMyProject' // Assuming ViewMyProject is in this directory
import duvLogo from '../../assets/duvLogo.jpg';

export const MyProject = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // This is where the backend data would come from.
    const fetchedProjects = [
      {
        id: 1,
        projectname_: "Project A",
        Client: "King kong",
        date_started: "2025-01-01",
        date_end: "2025-06-01",
        image: duvLogo 
      },
      {
        id: 2,
        projectname_: "Project B",
        Client: "Monkey D Luffy",
        date_started: "2025-02-01",
        date_end: "2025-07-01",
        image: duvLogo 
      },

    ];

    setProjects(fetchedProjects);
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
