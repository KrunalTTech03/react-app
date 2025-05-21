import React, { useState, useEffect } from "react";
import { PiUsersLight } from "react-icons/pi";
import Sidebar from "./Sidebar";
import Header from "./Header";

export const Dashboard = () => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const storedState = localStorage.getItem("sidebarCollapsed");
    if (storedState !== null) {
      setSidebarCollapsed(JSON.parse(storedState));
    }
  }, []);

  useEffect(() => {
    const handleSidebarStateChange = (event) => {
      setSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener("sidebarStateChanged", handleSidebarStateChange);

    return () => {
      window.removeEventListener(
        "sidebarStateChanged",
        handleSidebarStateChange
      );
    };
  }, []);

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div
        className={`lg:block ${mobileSidebarOpen ? "block" : "hidden"} z-30`}
      >
        <Sidebar
          showLogoutConfirm={showLogoutConfirm}
          setShowLogoutConfirm={setShowLogoutConfirm}
          toggleMobileSidebar={toggleMobileSidebar}
        />
      </div>

      <div
        className={`flex-1 flex flex-col transition-all duration-300 
        ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"} 
        md:ml-0 sm:ml-0 overflow-auto`}
      >
        <Header />

        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 bg-white mx-2 sm:mx-4 md:mx-6 lg:mx-8 my-2 sm:my-3 md:my-4 lg:my-5 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-700">
            Welcome to Your Dashboard
          </h2>
          <p className="text-gray-500 mt-2 sm:mt-3 text-base sm:text-lg">
            Manage your projects, teams, and reports efficiently.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6 sm:mt-8">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-100 border border-purple-200 p-5 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-transform transform hover:scale-[1.02] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-bl-full opacity-20"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 bg-gradient-to-tr from-indigo-400 to-purple-300 rounded-tr-full opacity-20"></div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                <div className="text-center sm:text-left">
                  <h4 className="text-base sm:text-lg font-medium text-gray-800">
                    Total Users
                  </h4>
                  <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mt-2">
                    150
                  </p>
                  <p className="text-sm mt-1 text-gray-500">Active accounts</p>
                </div>

                <div className="w-20 h-20">
                  <svg
                    viewBox="0 0 400 400"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                  >
                    <circle cx="200" cy="200" r="180" fill="#f8fafc" />
                    <circle
                      cx="200"
                      cy="200"
                      r="170"
                      fill="#f1f5f9"
                      stroke="#e2e8f0"
                      stroke-width="1"
                    />

                    <path
                      d="M200,200 L100,150"
                      stroke="#cbd5e1"
                      stroke-width="3"
                      stroke-dasharray="6,3"
                    />
                    <path
                      d="M200,200 L300,150"
                      stroke="#cbd5e1"
                      stroke-width="3"
                      stroke-dasharray="6,3"
                    />
                    <path
                      d="M200,200 L150,300"
                      stroke="#cbd5e1"
                      stroke-width="3"
                      stroke-dasharray="6,3"
                    />
                    <path
                      d="M200,200 L250,300"
                      stroke="#cbd5e1"
                      stroke-width="3"
                      stroke-dasharray="6,3"
                    />

                    <g>
                      <filter
                        id="primaryShadow"
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                      >
                        <feDropShadow
                          dx="0"
                          dy="4"
                          stdDeviation="6"
                          flood-color="#4ADE80"
                          flood-opacity="0.3"
                        />
                      </filter>

                      <circle
                        cx="200"
                        cy="200"
                        r="50"
                        fill="white"
                        stroke="#4ADE80"
                        stroke-width="3"
                        filter="url(#primaryShadow)"
                      />

                      <circle cx="200" cy="185" r="20" fill="#4ADE80" />

                      <path d="M170,225 Q200,260 230,225" fill="#4ADE80" />

                      <circle
                        cx="200"
                        cy="200"
                        r="60"
                        stroke="#4ADE80"
                        stroke-width="3"
                        stroke-dasharray="10,5"
                        fill="none"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          from="0"
                          to="30"
                          dur="3s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>

                    <g>
                      <circle
                        cx="100"
                        cy="150"
                        r="30"
                        fill="white"
                        stroke="#64748b"
                        stroke-width="2"
                      />
                      <circle cx="100" cy="140" r="12" fill="#64748b" />
                      <path d="M80,170 Q100,190 120,170" fill="#64748b" />
                    </g>

                    <g>
                      <circle
                        cx="300"
                        cy="150"
                        r="30"
                        fill="white"
                        stroke="#64748b"
                        stroke-width="2"
                      />
                      <circle cx="300" cy="140" r="12" fill="#64748b" />
                      <path d="M280,170 Q300,190 320,170" fill="#64748b" />
                    </g>

                    <g>
                      <circle
                        cx="150"
                        cy="300"
                        r="25"
                        fill="white"
                        stroke="#94a3b8"
                        stroke-width="2"
                      />
                      <circle cx="150" cy="292" r="10" fill="#94a3b8" />
                      <path d="M135,315 Q150,330 165,315" fill="#94a3b8" />
                    </g>

                    <g>
                      <circle
                        cx="250"
                        cy="300"
                        r="25"
                        fill="white"
                        stroke="#94a3b8"
                        stroke-width="2"
                      />
                      <circle cx="250" cy="292" r="10" fill="#94a3b8" />
                      <path d="M235,315 Q250,330 265,315" fill="#94a3b8" />
                    </g>

                    <g>
                      <circle
                        cx="150"
                        cy="175"
                        r="5"
                        fill="#4ADE80"
                        opacity="0.7"
                      >
                        <animate
                          attributeName="opacity"
                          values="0.5;1;0.5"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="r"
                          values="4;6;4"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle
                        cx="250"
                        cy="175"
                        r="5"
                        fill="#4ADE80"
                        opacity="0.7"
                      >
                        <animate
                          attributeName="opacity"
                          values="0.5;1;0.5"
                          dur="2s"
                          repeatCount="indefinite"
                          begin="0.3s"
                        />
                        <animate
                          attributeName="r"
                          values="4;6;4"
                          dur="2s"
                          repeatCount="indefinite"
                          begin="0.3s"
                        />
                      </circle>
                      <circle
                        cx="175"
                        cy="250"
                        r="4"
                        fill="#4ADE80"
                        opacity="0.7"
                      >
                        <animate
                          attributeName="opacity"
                          values="0.5;1;0.5"
                          dur="2s"
                          repeatCount="indefinite"
                          begin="0.6s"
                        />
                        <animate
                          attributeName="r"
                          values="3;5;3"
                          dur="2s"
                          repeatCount="indefinite"
                          begin="0.6s"
                        />
                      </circle>
                      <circle
                        cx="225"
                        cy="250"
                        r="4"
                        fill="#4ADE80"
                        opacity="0.7"
                      >
                        <animate
                          attributeName="opacity"
                          values="0.5;1;0.5"
                          dur="2s"
                          repeatCount="indefinite"
                          begin="0.9s"
                        />
                        <animate
                          attributeName="r"
                          values="3;5;3"
                          dur="2s"
                          repeatCount="indefinite"
                          begin="0.9s"
                        />
                      </circle>
                    </g>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white text-gray-800 border border-gray-200 p-5 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-transform transform hover:scale-[1.02]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h4 className="text-base sm:text-lg font-medium">
                    Total Roles
                  </h4>
                  <p className="text-3xl sm:text-4xl font-bold text-emerald-600 mt-2">
                    24
                  </p>
                  <p className="text-sm mt-1 text-gray-500">User Roles</p>
                </div>
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow border border-gray-200 mt-4 sm:mt-6 overflow-x-auto">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">
              Top 10 Users
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">
                      First Name
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">
                      Last Name
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">
                      Email
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">
                      Mobile
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">
                      Role
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50 transition">
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-gray-800 font-medium text-sm">
                      firstName
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-gray-500 text-sm">
                      lastName
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-gray-500 text-sm">
                      email
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-gray-500 text-sm">
                      phone
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-gray-500 text-sm">
                      <span className="inline-block bg-gray-100 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold text-gray-700 mr-2"></span>
                      <span className="text-red-500">No roles</span>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 flex space-x-2 sm:space-x-4">
                      <button className="text-purple-600 cursor-pointer hover:underline text-sm">
                        Edit
                      </button>
                      <button className="text-red-600 cursor-pointer hover:underline text-sm">
                        Delete
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-3 sm:py-4 text-gray-500 text-sm"
                    >
                      No users found
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
