import React, { useState } from "react";
import { PiUsersLight } from "react-icons/pi";
import Sidebar from "./Sidebar";
import Header from "./Header";

export const Dashboard = () => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        showLogoutConfirm={showLogoutConfirm}
        setShowLogoutConfirm={setShowLogoutConfirm}
      />

      {/* Responsive Dashboard */}
<div className="flex-1 flex flex-col lg:ml-72 md:ml-64 sm:ml-0 overflow-auto">
        <Header />

        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 bg-white mx-2 sm:mx-4 md:mx-6 lg:mx-8 my-2 sm:my-3 md:my-4 lg:my-5 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-700">
            Welcome to Your Dashboard
          </h2>
          <p className="text-gray-500 mt-2 sm:mt-3 text-base sm:text-lg">
            Manage your projects, teams, and reports efficiently.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6 sm:mt-8">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-4 sm:p-6 rounded-xl shadow-md transition-transform transform hover:scale-105">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-base sm:text-lg font-medium">Total Users</h4>
                  <p className="text-3xl sm:text-4xl font-bold mt-2">150</p>
                </div>
                <div className="text-4xl sm:text-5xl">
                  <PiUsersLight />
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
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-gray-500 text-sm">lastName</td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-gray-500 text-sm">email</td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-gray-500 text-sm">phone</td>
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
                    <td colSpan="6" className="text-center py-3 sm:py-4 text-gray-500 text-sm">
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