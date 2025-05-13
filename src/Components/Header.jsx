import React, { useState, useEffect, useRef } from "react";
import { FiBell, FiChevronDown, FiList } from "react-icons/fi";

const Header = ({ notifications = [], clearNotifications = () => {} }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [FirstName, setUserName] = useState("");

  const dropdownRef = useRef();

  useEffect(() => {
    const name = localStorage.getItem("FirstName");
    if (name) setUserName(name);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-md px-8 py-5 flex items-center">
      <div className="ml-auto flex items-center space-x-6">
        <div className="relative">
          <div
            onClick={() => setShowNotifications(!showNotifications)}
            className="cursor-pointer relative"
          >
            <FiBell className="text-gray-600 text-2xl hover:text-gray-800 transition" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 animate-bounce">
                {notifications.length}
              </span>
            )}
          </div>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-96 bg-white/90 backdrop-blur-md shadow-2xl rounded-xl p-4 z-50 border border-gray-200 animate-fadeIn">
              <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                <h3 className="text-lg font-semibold text-gray-800">
                  Notifications
                </h3>
                <button
                  onClick={() => {
                    clearNotifications();
                    setShowNotifications(false);
                  }}
                  className="text-xs text-red-500 font-semibold hover:underline"
                >
                  Clear All
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto mt-3 space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No new notifications
                  </p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 border-l-4 border-blue-500 rounded-md shadow-sm transition duration-300 transform hover:scale-105 hover:shadow-md"
                    >
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <p className="text-sm text-gray-700">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/128/2202/2202112.png"
              alt="User"
              className="h-11 w-11 rounded-full border-2 border-gray-300 shadow-sm group-hover:scale-105 transition-transform"
            />
            <span className="text-gray-800 font-medium text-lg group-hover:text-blue-600 transition">
              {FirstName || "User"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
