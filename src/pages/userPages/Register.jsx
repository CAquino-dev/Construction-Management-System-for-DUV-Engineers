import React, { useState } from 'react'
import img1 from '../../assets/img1.png'

const Register = () => {
    const [formData, setFormData] = useState({
      username: "",
      password: "",
      confirmPassword: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value }); 
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); //prevent the page from reloading

        if(formData.password !== formData.confirmPassword){
          setError("Passwords don't match, please try again.");
          setTimeout(() => setError(""), 3000);
          return;  
        }

        try {
          const response = await fetch(`http://localhost:5000/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: formData.username,
              password: formData.password
            }),
          });
          const data = await response.json();
          if (response.ok) {
            setSuccess("Registration successful! Please log in.");
            setTimeout(() => setSuccess(""), 3000);
            setFormData({ username: "", password: "", confirmPassword: "" });
          } else {
            setError(data.error || "Registration failed.");
            setTimeout(() => setError(""), 3000);
          }
        } catch (error) {
          setError("Server error. Please try again.");
          setTimeout(() => setError(""), 3000);
        }
        
    }

  return (
    <div className='bg-gray-200 gap-8 flex items-center justify-center min-h-screen bg-cover bg-center relative' >
      <div className='elative w-full max-w-md min-h-[500px] h-auto bg-white backdrop-blur-lg rounded-lg shadow-xl p-10 flex flex-col justify-center'>
      <h2 className='text-2xl font-bold text-center mb-6 text-[#4c735c]'>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input type="text"
        name='username' 
        value={formData.username}
        placeholder='Username'
        onChange={handleChange}
        required
        className='p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c735c]'
        />
        <input type="password" 
        name='password'
        value={formData.password}
        placeholder='Password'
        onChange={handleChange}
        required
        className='p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c735c]'
        />
        <input type="password" 
        name='confirmPassword'
        value={formData.confirmPassword}
        placeholder='Confirm Password'
        onChange={handleChange}
        required
        className='p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c735c]'
        />
        <button type='submit' className='bg-[#4c735c] text-white py-3 rounded-lg hover:bg-[#4c735c]/90 cursor-pointer'>Register</button>
      </form>
      <p className='mt-4 text-center'>Already have an account? <a href="/login" className='text-[#4c735c]'>Login</a></p>
      </div>
      
    </div>
  )
}

export default Register