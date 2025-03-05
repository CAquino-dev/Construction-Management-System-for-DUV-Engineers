import React, { useState } from 'react'
import img1 from '../../assets/img1.png'

const Login = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(`username: ${username} password:${password}`)
        setUsername("");
        setPassword("");
    }

  return (
    <div className='p-8 flex items-center justify-center min-h-screen bg-cover bg-center relative' style = {{backgroundImage: `url(${img1})`}}>
        <div className='absolute inset-0 bg-[#4c735c]/30 backdrop-blur-sm'></div>
        <div className='relative w-full max-w-md min-h-[500px] h-auto bg-white/30 backdrop-blur-lg rounded-lg shadow-xl p-10 flex flex-col justify-center'>
          <h2 className='text-2xl font-bold text-center mb-6 text-[#4c735c]'>Login</h2>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <input 
            type="text" 
            value={username}
            placeholder='Username'
            onChange={(e) => {setUsername(e.target.value)}}
            className='p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c735c]'
            />
            <input 
            type="password" 
            value={password}
            placeholder='Password'
            onChange={(e) => {setPassword(e.target.value)}}
            className='p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c735c]'
            />
            <button type='submit' className='bg-[#4c735c] text-white py-3 rounded-lg hover:bg-[#4c735c]/90 cursor-pointer' >Login</button>
          </form>
        </div>
    <div className='p-8 flex items-center justify-center min-h-screen bg-cover bg-center relative' style = {{backgroundImage: `url(${img1})`}}>
        <div className='absolute inset-0 bg-[#4c735c]/30 backdrop-blur-sm'></div>
        <div className='relative w-full max-w-md min-h-[500px] h-auto bg-white/30 backdrop-blur-lg rounded-lg shadow-xl p-10 flex flex-col justify-center'>
          <h2 className='text-2xl font-bold text-center mb-6 text-[#4c735c]'>Login</h2>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <input 
            type="text" 
            value={username}
            placeholder='Username'
            onChange={(e) => {setUsername(e.target.value)}}
            className='p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c735c]'
            />
            <input 
            type="password" 
            value={password}
            placeholder='Password'
            onChange={(e) => {setPassword(e.target.value)}}
            className='p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c735c]'
            />
            <button type='submit' className='bg-[#4c735c] text-white py-3 rounded-lg hover:bg-[#4c735c]/90 cursor-pointer' >Login</button>
          </form>
        </div>
    </div>
  )
}

export default Login
