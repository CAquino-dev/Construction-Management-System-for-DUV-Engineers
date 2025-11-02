import React from "react";
import ceo1 from "../../assets/duv1.jpg";
import ceo2 from "../../assets/duv2.jpg";

export const OurTeam = () => {
  const teamSections = [
    {
      name: "Dante Usis Varias Jr.",
      role: "Owner / Structural Engineer",
      imgSrc: ceo1,
      description: [
        "Dante U. Varias Jr. is a Civil Engineering graduate from Mapua Institute of Technology and a licensed engineer since 2005. He began his career at D.L. VARIAS Engineering Consultants before joining a Japanese-affiliated firm specializing in industrial and petrochemical plant design, where he became a Director in 2008.",
        "With experience as a freelance structural engineer in the Philippines, he worked on commercial, residential, and government projects. In 2013, he moved to Japan as a Structural Design Manager, overseeing major projects in steel and reinforced concrete structures for power and petrochemical plants.",
        "Now, Dante leads structural engineering projects at MRS Engineering, including high-rise boiler steel structures in Japan, the Philippines, and Indonesia.",
      ],
      layout: "left",
    },
    {
      name: "Ria Pamela M. Varias",
      role: "CFO / Senior Engineer",
      imgSrc: ceo2,
      description: [
        "Ria Pamela M. Varias is the Chief Financial Officer and Senior Engineer, overseeing financial strategies and project execution.",
        "With extensive experience in engineering and management, she ensures operational efficiency, budget optimization, and structural integrity in all projects.",
        "Her leadership helps drive innovation and maintain high industry standards in engineering and finance.",
      ],
      layout: "right",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-12 pt-20 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Meet Our Team
        </h1>
        <div className="w-24 h-1 bg-[#4c735c] mx-auto mb-6"></div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Dedicated professionals with decades of combined experience in
          structural engineering and project management
        </p>
      </div>

      {/* Team Members */}
      <div className="max-w-6xl mx-auto space-y-16">
        {teamSections.map((member, index) => (
          <div
            key={index}
            className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl ${
              member.layout === "right" ? "md:flex-row-reverse" : ""
            }`}
          >
            <div className="flex flex-col lg:flex-row items-stretch">
              {/* Image Section */}
              <div className="lg:w-2/5 relative">
                <div className="aspect-square lg:aspect-auto lg:h-full relative overflow-hidden">
                  <img
                    src={member.imgSrc}
                    alt={`${member.name}'s profile`}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent lg:bg-gradient-to-r lg:from-black/10 lg:to-transparent"></div>

                  {/* Mobile Name & Role */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 lg:hidden">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {member.name}
                    </h3>
                    <p className="text-gray-200 font-medium">{member.role}</p>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="lg:w-3/5 p-8 sm:p-10 lg:p-12">
                {/* Desktop Name & Role */}
                <div className="hidden lg:block mb-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">
                    {member.name}
                  </h3>
                  <div className="flex items-center">
                    <div className="w-12 h-1 bg-[#4c735c] mr-4"></div>
                    <p className="text-xl text-gray-600 font-semibold">
                      {member.role}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-6">
                  {member.description.map((paragraph, idx) => (
                    <div key={idx} className="flex items-start">
                      {/* Bullet point */}
                      <div className="flex-shrink-0 w-2 h-2 bg-[#4c735c] rounded-full mt-3 mr-4"></div>
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {paragraph}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Experience Highlights */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex flex-wrap gap-4">
                    <span className="inline-flex items-center px-4 py-2 rounded-full bg-[#4c735c]/10 text-[#4c735c] text-sm font-medium">
                      🏢 Structural Engineering
                    </span>
                    <span className="inline-flex items-center px-4 py-2 rounded-full bg-[#4c735c]/10 text-[#4c735c] text-sm font-medium">
                      🌏 International Projects
                    </span>
                    <span className="inline-flex items-center px-4 py-2 rounded-full bg-[#4c735c]/10 text-[#4c735c] text-sm font-medium">
                      📊 Project Management
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div
              className={`absolute top-0 bottom-0 w-1 bg-gradient-to-b from-[#4c735c] to-green-300 ${
                member.layout === "right"
                  ? "left-0 lg:left-auto lg:right-0"
                  : "left-0"
              }`}
            ></div>
          </div>
        ))}
      </div>

      {/* Company Values Section */}
      <div className="max-w-4xl mx-auto mt-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">
          Our Commitment
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-[#4c735c] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Innovation
            </h3>
            <p className="text-gray-600">
              Cutting-edge engineering solutions for complex challenges
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-[#4c735c] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Precision
            </h3>
            <p className="text-gray-600">
              Meticulous attention to detail in every project
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-[#4c735c] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl">🤝</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Collaboration
            </h3>
            <p className="text-gray-600">
              Working together to achieve exceptional results
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
