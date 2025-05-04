import React, { useState, useEffect } from 'react';
import { ProjectCard } from '../../components/userComponents/ProjectCard'; // Assuming ProjectCard is in this directory
import { ViewProjectClient } from '../../components/userComponents/ViewProjectClient';
import duvLogo from '../../assets/duvLogo.jpg'; // Ensure the correct path to duvLogo

export const ProjectsClient = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // This is where the backend data would come from.
    const fetchedProjects = [
      {
        id: 1,
        projectname_: "Project A",
        Engineer: "John Doe",
        date_started: "2025-01-01",
        date_end: "2025-06-01",
        image: duvLogo 
      },
      {
        id: 2,
        projectname_: "Project B",
        Engineer: "Jane Smith",
        date_started: "2025-02-01",
        date_end: "2025-07-01",
        image: duvLogo 
      },

    ];

    setProjects(fetchedProjects);
  }, []);

  return (
    <div className="container mx-auto p-6 mt-10">
      {selectedProject ? (
        <ViewProjectClient selectedProject={selectedProject} onBack={() => setSelectedProject(null)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Dynamically render ProjectCard components from projects array */}
          {projects.map((project) => (
            <div key={project.id} onClick={() => setSelectedProject(project)}>
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
