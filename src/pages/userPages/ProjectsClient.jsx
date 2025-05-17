import React, { useState, useEffect } from 'react';
import { ProjectCard } from '../../components/userComponents/ProjectCard'; // Assuming ProjectCard is in this directory
import { ViewProjectClient } from '../../components/userComponents/ViewProjectClient';
import duvLogo from '../../assets/duvLogo.jpg'; // Ensure the correct path to duvLogo

export const ProjectsClient = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchClientProjects = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/engr/getClientProject/${userId}`)
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
