import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router'
import Homepage from './pages/userPages/Homepage'
import Login from './pages/userPages/Login'
import Register from './pages/userPages/Register'

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path='/' element={<Homepage/>}></Route>
          <Route path='/login' element={<Login/>}></Route>
          <Route path='/register' element={<Register/>}></Route>
        </Routes>
      </Router>


    </div>
  )
}

export default App