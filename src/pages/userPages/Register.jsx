import React, { useState } from 'react'

const Register = () => {
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();
    const [confirmPassword, setConfirmPassword] = useState();

    const handleSubmit = (e) => {
        e.preventDefault(); //prevent the page from reloading

        if(!username || !password || !confirmPassword){
            return alert("All fields are required")
        }

        if(password !== confirmPassword){
            return alert("passwords dont match");
        }

        console.log("registered Successfully")
        console.log(`username: ${username} password: ${password}`)
        setUsername("")
        setPassword("")
        setConfirmPassword("")
        
    }

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" 
        value={username}
        placeholder='Username'
        onChange={(e) => setUsername(e.target.value)}
        />
        <input type="password" 
        value={password}
        placeholder='Password'
        onChange={(e) => setPassword(e.target.value)}
        />
        <input type="password" 
        value={confirmPassword}
        placeholder='Confirm Password'
        onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type='submit'>Register</button>
      </form>

    </div>
  )
}

export default Register
