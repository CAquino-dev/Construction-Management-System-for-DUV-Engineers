import React, { useState } from 'react'

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
    <div className='pt-16 flex items-center justify-center min-h-screen bg-[#f6f6f6]'>
      <div className='bg-white rounded-2xl shadow-2lg p-8 w-full max-w-md'>
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
