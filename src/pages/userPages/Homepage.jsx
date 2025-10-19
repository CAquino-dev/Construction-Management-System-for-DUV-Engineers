import React from "react";
import Footer from "../../components/userComponents/Footer";
import img1 from "../../assets/img1.png";

const Homepage = () => {
  const services = [
    {
      title: "Residential Construction",
      description:
        "Custom home building and residential projects tailored to your vision and lifestyle needs with quality craftsmanship.",
    },
    {
      title: "Renovation & Repair",
      description:
        "Complete renovation services and structural repairs to transform and maintain your property's value and functionality.",
    },
  ];

  const projects = [
    {
      img: img1,
      desc: "Modern Family Residence - 3,500 sqft contemporary home with sustainable materials",
    },
    {
      img: img1,
      desc: "Office Complex Renovation - Complete overhaul of 10,000 sqft commercial space",
    },
    {
      img: img1,
      desc: "Community Center Project - New construction of multi-purpose community facility",
    },
  ];

  const constructionFeatures = [
    {
      title: "Commercial Construction",
      description:
        "Expert commercial building solutions for offices and facilities with full project management",
    },
    {
      title: "Construction Management",
      description:
        "Professional project oversight from planning to completion ensuring quality and timelines",
    },
    {
      title: "Quality Assurance",
      description:
        "Rigorous quality control and 5-year workmanship warranty on all construction work",
    },
  ];

  const constructionStats = [
    {
      number: "15+",
      label: "Years Experience",
    },
    {
      number: "200+",
      label: "Projects Completed",
    },
    {
      number: "100%",
      label: "Client Satisfaction",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center bg-gray-900 pt-16 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            <div className="text-white text-center lg:text-left lg:w-1/2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                BUILDING YOUR VISION WITH PRECISION
              </h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl leading-relaxed">
                Professional construction services with over 15 years of
                experience in residential and commercial projects. Quality
                craftsmanship meets innovative design in every structure we
                build.
              </p>
            </div>

            <div className="relative w-full max-w-md lg:max-w-lg lg:w-1/2 mt-8 lg:mt-0">
              <div className="absolute -top-4 -left-4 w-full h-full bg-[#4c735c] rounded-2xl -z-10"></div>
              <img
                src={img1}
                alt="Construction Project"
                className="relative z-20 rounded-2xl w-full shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Construction Features Section */}
      <div className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Our Construction Expertise
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {constructionFeatures.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-8 lg:p-10 rounded-2xl transition-all duration-300 bg-gray-50 hover:shadow-lg"
              >
                <div className="bg-[#4c735c] w-16 h-16 rounded-2xl flex items-center justify-center mb-4 lg:mb-6">
                  <span className="text-white text-lg font-bold">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm lg:text-base">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Construction Stats Section */}
      <div className="py-12 lg:py-16 bg-[#4c735c] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Our Construction Journey
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {constructionStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold mb-2">
                  {stat.number}
                </div>
                <div className="text-white/80 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="py-12 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Building Excellence Since 2008
              </h2>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold mt-2 lg:mt-4 text-[#4c735c]">
                Quality Construction You Can Trust
              </h3>
              <p className="mt-4 lg:mt-6 text-base lg:text-lg text-gray-600 leading-relaxed">
                With over 15 years in the construction industry, we've built a
                reputation for quality, reliability, and exceptional
                craftsmanship. Our team of licensed professionals brings
                expertise to every project, big or small.
              </p>
              <p className="mt-4 text-base lg:text-lg text-gray-600 leading-relaxed">
                We believe in transparent communication, strict adherence to
                timelines, and uncompromising quality standards. Your vision is
                our blueprint for success.
              </p>
            </div>

            <div className="lg:w-1/2 mt-8 lg:mt-0">
              <div className="relative">
                <div className="absolute -bottom-4 -right-4 w-full h-full bg-[#4c735c] rounded-2xl -z-10"></div>
                <img
                  src={img1}
                  alt="Construction site"
                  className="relative z-20 rounded-2xl w-full shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-12 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#4c735c]">
              Our Construction Services
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 lg:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="bg-[#4c735c] w-16 h-16 rounded-2xl flex items-center justify-center mb-4 lg:mb-6 mx-auto">
                  <span className="text-white text-lg font-bold">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 lg:mb-4 text-center">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="py-12 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#4c735c] mb-4">
              Our Construction Projects
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Showcasing our expertise in diverse construction projects across
              residential and commercial sectors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {projects.map((project, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={project.img}
                  alt="Construction project"
                  className="w-full h-48 lg:h-56 object-cover"
                />
                <div className="p-6 lg:p-8">
                  <p className="text-gray-700 text-center leading-relaxed">
                    {project.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Homepage;
