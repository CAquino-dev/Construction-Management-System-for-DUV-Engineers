import React from 'react';

export const AboutUs = () => {
  return (
    <div className="bg-[#f1f1f1] text-[#4c735c] pt-20">
      <h1 className="text-4xl font-bold text-center mb-8">About Us</h1>

      {/* Introduction */}
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-3xl/14 mb-8 text-center font-bold">
            We aim to give the Client utmost satisfaction by continuously keeping up to date with the latest design technology and engineering software.
          </p>
        </div>
      </div>

      {/* Mission and Vision Section */}
      <div className="bg-[#ffffff] py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission */}
            <div>
              <h3 className="text-2xl font-bold mb-4">Mission</h3>
              <p className="text-lg mb-4">
                DUV Engineers is a proud Filipino company born from a strong passion to provide world-class quality engineering works that will satisfy the project’s requirements while incorporating safe yet cost-effective design.
              </p>
              <p className="text-lg">
                We aim to give the Client utmost satisfaction by continuously keeping up to date with the latest design technology and engineering software.
              </p>
            </div>

            {/* Vision */}
            <div>
              <h3 className="text-2xl font-bold mb-4">Vision</h3>
              <p className="text-lg">
                “Where every project exhibits both the world-class quality of our engineering mindset and the uncompromisable integrity of our team.”
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className=" py-12 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-4">Our Values</h2>
          <p className="text-lg mb-4">
            We hear you. And we speak up as well. Clear coordination. Queries on point. We listen to your requests. Furthermore, our technical expertise allows our team to give guidance, explanation when needed, and offer possible design alternatives that will not compromise the safety and main purpose of the structure.
          </p>
          <p className="text-lg mb-4">
            We offer Value Engineering. We do economically-efficient design without sacrificing the quality of our work and the security of the structure. Our team considers the effect of the structural layout on the construction cost.
          </p>
          <p className="text-lg">
            Cost reduction? We can offer appropriate solutions that would cater to the Client’s needs – while assuring the overall safety of all.
          </p>
        </div>
      </div>

      {/* Passion Section */}
      <div className="bg-[#ffffff] py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-4">Our Passion</h2>
          <p className="text-lg text-center">
            We love what we do. And we do what we love. This is our passion. We work hard. We stay focused. We deliver the best quality. We strive for continuous progress.
          </p>
        </div>
      </div>
    </div>
  );
};
