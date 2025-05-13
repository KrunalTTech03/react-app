import React, { useState } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import { Toaster } from "react-hot-toast";

const Layout = ({ children, notifications = [], clearNotifications = () => {} }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        showLogoutConfirm={showLogoutConfirm} 
        setShowLogoutConfirm={setShowLogoutConfirm}
      />
      
      <div className="flex-1 flex flex-col ml-72 overflow-auto">
        <Header 
          notifications={notifications} 
          clearNotifications={clearNotifications} 
        />
        
        <div className="p-6 bg-gray-100 min-h-screen">
          {children}
        </div>
      </div>
      
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default Layout;