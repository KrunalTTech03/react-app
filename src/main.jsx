import './index.css'; 
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Signup } from './Components/Signup';
import { Signin } from './Components/Signin';
import 'react-toastify/dist/ReactToastify.css';
import { Listing } from './Components/Listing';
import { Dashboard } from './Components/Dashboard';
import Role from './Components/Role';
import Permission from './Components/Permission';
import Menu from './Components/Menu';
import Unauthorized from './Components/Unauthorized';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <Routes>
    <Route path='/' element={<Signup />}/>
    <Route path='/Login' element={<Signin />}/>
    <Route path='/Listing' element={<Listing />}/>
    <Route path='/Dashboard' element={<Dashboard />}/>
    <Route path='/Role' element={<Role />}/>
    <Route path='/Permission' element={<Permission />}/>
    <Route path='/Menu' element={<Menu />}/>
    <Route path='/Unauthorized' element={<Unauthorized />}/>
  </Routes>
  </BrowserRouter>,
)