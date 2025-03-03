import React from 'react'

const AdminLogin = () => {
  return (
    <>
      {/* Header Section */}
      <div className='flex justify-between items-center bg-[#4c735c] h-[60px] px-4 text-white font-bold text-xl'>
        <h1>DUV ENGINEERS</h1>
        <h1>ADMIN LOGIN</h1>
      </div>

      {/* Login Form Section */}
      <div className='flex justify-center items-center h-screen bg-[#f4f4f4]'>
        <div className='bg-white shadow-lg rounded-lg p-8 w-[400px]'>
          <h2 className='text-2xl font-bold text-center mb-6 text-[#4c735c]'>Admin Login</h2>

          <form>
            <div className='mb-4'>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Username
              </label>
              <input
                type='text'
                placeholder='Enter Username'
                className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c735c]'
              />
            </div>

            <div className='mb-6'>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Password
              </label>
              <input
                type='password'
                placeholder='Enter Password'
                className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c735c]'
              />
            </div>

            <button
              type='submit'
              className='w-full bg-[#4c735c] text-white p-3 rounded-lg font-semibold hover:bg-[#3a5b4a] transition duration-300'
            >
              Login
            </button>
          </form>

          <p className='text-center text-sm text-gray-500 mt-4'>
            © 2025 DUV ENGINEERS | All Rights Reserved
          </p>
        </div>
      </div>
    </>
  )
}

export default AdminLogin;