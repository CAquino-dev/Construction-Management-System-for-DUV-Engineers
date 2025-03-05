import React, { useState } from 'react'
import img1 from '../../assets/img1.png'

const Login = () => {

    const [loginForm, setLoginForm] = useState({
      username: "",
      password: "",
    });
    
    const [error, setError] = useState(""); 
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
      setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    }
    

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
          const response = await fetch(`http://localhost:5000/api/auth/login`, {
            method:'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: loginForm.username,
              password: loginForm.password
            }),
          });
          const data = await response.json();

          if(response.ok){
            setSuccess("Login Successful")
            setTimeout(() => setSuccess(""), 3000);
            setLoginForm({ username: "", password: "" });
          }else{
            setError(data.error || "Login failed");
            setTimeout(() => setError(""), 3000);
          }
        } catch (error) {
          setError("Server error. Please try again.");
          setTimeout(() => setError(""), 3000);
        }
    }

  return (
    <div className='p-8 flex items-center justify-center min-h-screen bg-cover bg-center relative' style = {{backgroundImage: `url(${img1})`}}>
        <div className='absolute inset-0 bg-[#4c735c]/30 backdrop-blur-sm'></div>
        <div className='relative w-full max-w-md min-h-[500px] h-auto bg-white/30 backdrop-blur-lg rounded-lg shadow-xl p-10 flex flex-col justify-center'>
          <h2 className='text-2xl font-bold text-center mb-6 text-[#4c735c]'>Login</h2>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <input
            name='username' 
            type="text" 
            value={loginForm.username}
            placeholder='Username'
            onChange={handleChange}
            className='p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c735c]'
            />
            <input 
            name='password'
            type="password" 
            value={loginForm.password}
            placeholder='Password'
            onChange={handleChange}
            className='p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c735c]'
            />
              {error && <p style={{ color: "red" }}>{error}</p>}
              {success && <p style={{ color: "green" }}>{success}</p>}
            <button type='submit' className='bg-[#4c735c] text-white py-3 rounded-lg hover:bg-[#4c735c]/90 cursor-pointer' >Login</button>
          </form>
        </div>
    </div>
  )
}

export default Login
