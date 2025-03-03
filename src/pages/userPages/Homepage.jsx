import React from 'react';
import Footer from '../../components/userComponents/Footer';
import img1 from '../../assets/img1.png';
import { Gear, User, ThumbsUp, House, Hammer } from '@phosphor-icons/react';

const Homepage = () => {
  const services = [
    {
      title: 'Architecture',
      icon: Gear,
      description: 'Lorem ipsum dolor sit amet. Eum velit omnis ut cupiditate nihil ea tenetur quam ut repellat velit in perspiciatis rerum? Et adipisci ipsam ut voluptatem nulla ad nihil quas ex reiciendis explicabo.'
    },
    {
      title: 'Houses',
      icon: House,
      description: 'Lorem ipsum dolor sit amet. Eum velit omnis ut cupiditate nihil ea tenetur quam ut repellat velit in perspiciatis rerum? Et adipisci ipsam ut voluptatem nulla ad nihil quas ex reiciendis explicabo.'
    },
    {
      title: 'Repairing',
      icon: Hammer,
      description: 'Lorem ipsum dolor sit amet. Eum velit omnis ut cupiditate nihil ea tenetur quam ut repellat velit in perspiciatis rerum? Et adipisci ipsam ut voluptatem nulla ad nihil quas ex reiciendis explicabo.'
    }
  ];

  const projects = [
    { img: img1, desc: 'Design of 40,000 sqm prefabricated steel logistics building' },
    { img: img1, desc: 'Design and construction Management of 1,00 sqm Religious Regional House' },
    { img: img1, desc: 'Design of 40 ton Crane Turbine Generator Building for 1x30MW Geothermal Plant' }
  ];

  return (
    <>
      <div className="relative pt-16">
        <div className="absolute -top-10 -left-4 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-[#4c735c] rounded-lg z-10"></div>
        <div className="bg-gray-900 flex flex-col md:flex-row justify-between px-6 sm:px-10 md:px-20 py-10 relative z-10 items-center gap-y-15">
          <div className="text-white text-center md:text-left md:w-1/2">
            <h2 className="text-2xl md:text-4xl font-bold">CRAFTING ARCHITECTURAL WONDERS</h2>
            <p className="mt-4 text-sm md:text-base">
              Lorem ipsum dolor sit amet. Eum velit omnis ut cupiditate nihil ea tenetur quam ut repellat velit in perspiciatis rerum? Et adipisci ipsam ut voluptatem nulla ad nihil quas ex reiciendis explicabo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <button className="bg-[#4c735c] text-black px-6 py-2 rounded-md">Contact Us</button>
              <button className="border text-[#4c735c] px-6 py-2 rounded-md">Free Consultation</button>
            </div>
          </div>
          <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg md:w-1/2">
            <div className="absolute -top-4 -left-4 w-full h-full bg-[#4c735c] rounded-lg -z-10"></div>
            <img src={img1} alt="" className="relative z-20 rounded-lg w-full" />
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center pt-10">
        <div className='flex flex-col md:flex-row border-2 border shadow-2xl'>
          {[{ icon: Gear, text: 'Who we are' }, { icon: User, text: 'What we do' }, { icon: ThumbsUp, text: 'Why choose us?' }].map((item, index) => (
            <div key={index} className={`flex flex-col items-center font-semibold px-10 py-8 md:px-20 md:py-10 text-xl md:text-2xl ${index === 1 ? 'bg-gray-100' : ''}`}>
              <item.icon className='bg-[#4c735c] text-white p-2 rounded-full mb-2' size={82} />
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className='mt-4'>
        <div className='flex flex-col md:flex-row justify-between px-6 sm:px-10 md:px-20 py-10 relative z-10 items-center gap-y-15'>
          <div>
            <h3 className='text-2xl md:text-4xl font-bold'>About us</h3>
            <h4 className='text-xl md:text-2xl font-semibold mt-2 text-[#4c735c]'>We Build for your comfort</h4>
            <p className="mt-4 text-sm md:text-base">
              Lorem ipsum dolor sit amet. Eum velit omnis ut cupiditate nihil ea tenetur quam ut repellat velit in perspiciatis rerum? Et adipisci ipsam ut voluptatem nulla ad nihil quas ex reiciendis explicabo.
            </p>
          </div>
          <div>
            <img src={img1} alt="" className="relative z-20 rounded-lg w-full" />
          </div>
        </div>
      </div>

      <div className='py-10 bg-gray-100'>
        <div className='text-center mb-10'>
          <p className='text-3xl font-semibold text-[#4c735c]'>What We Do</p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-5'>
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div key={index} className='bg-white p-6 shadow-lg rounded-lg text-center'>
                <Icon className='bg-[#4c735c] text-white p-4 rounded-full mb-4 mx-auto' size={82} />
                <p className='text-xl font-bold mb-2'>{service.title}</p>
                <p className='text-gray-600'>{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className='pt-10'>
        <div className='text-center mb-10'>
          <p className='text-3xl font-semibold text-[#4c735c]'>Our Projects</p>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-5'>
            {projects.map((project, index) => (
              <div key={index} className='bg-white p-6 shadow-lg rounded-lg text-center'>
                <img src={project.img} alt='' className='rounded-lg mb-4 mx-auto' />
                <p>{project.desc}</p>
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
