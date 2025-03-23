import React from 'react';
import ceo1 from '../../assets/duv1.jpg';
import ceo2 from '../../assets/duv2.jpg';

export const OurTeam = () => {
  const teamSections = [
    {
      name: 'Dante Usis Varias Jr.',
      role: 'Owner / Structural Engineer',
      imgSrc: ceo1,
      description: [
        'Dante U. Varias Jr. is a Civil Engineering graduate from Mapua Institute of Technology and a licensed engineer since 2005. He began his career at D.L. VARIAS Engineering Consultants before joining a Japanese-affiliated firm specializing in industrial and petrochemical plant design, where he became a Director in 2008.',
        'With experience as a freelance structural engineer in the Philippines, he worked on commercial, residential, and government projects. In 2013, he moved to Japan as a Structural Design Manager, overseeing major projects in steel and reinforced concrete structures for power and petrochemical plants.',
        'Now, Dante leads structural engineering projects at MRS Engineering, including high-rise boiler steel structures in Japan, the Philippines, and Indonesia.',
      ],
      layout: 'left', // Image on the left
    },
    {
      name: 'Ria Pamela M. Varias',
      role: 'CFO / Senior Engineer',
      imgSrc: ceo2,
      description: [
        'Ria Pamela M. Varias is the Chief Financial Officer and Senior Engineer, overseeing financial strategies and project execution.',
        'With extensive experience in engineering and management, she ensures operational efficiency, budget optimization, and structural integrity in all projects.',
        'Her leadership helps drive innovation and maintain high industry standards in engineering and finance.',
      ],
      layout: 'right', // Image on the right
    },
  ];

  return (
    <div className="bg-[#f1f1f1] text-white py-12 pt-20">
      <h1 className="text-4xl font-bold text-center mb-8 text-[#4c735c]">Our Team</h1>
      <div className="flex flex-col items-center gap-8">
        {teamSections.map((member, index) => (
          <div
            key={index}
            className={`flex items-start max-w-4xl w-full text-[#4c735c] p-6 gap-6 ${
              member.layout === 'right' ? 'flex-row-reverse' : ''
            }`}
          >
            {/* Description Section */}
            <div className="flex-grow text-left font-medium">
              {member.description.map((paragraph, idx) => (
                <p key={idx} className="text-lg mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Image, Name, and Role Section */}
            <div className="flex-shrink-0 w-48 h-auto text-center">
              <img
                src={member.imgSrc}
                alt={`${member.name}'s profile`}
                className="w-full h-auto object-cover rounded-md mb-4"
              />
              <h3 className="text-2xl font-bold">{member.name}</h3>
              <p className="text-gray-500 font-medium">{member.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
