import React, { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import axiosInstance from "../../axiosInstance";

function UserProfile() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get("/auth/profile");
        if (response.data.success) {
          setUser(response.data.data);
        } else {
          console.error("Failed to load profile:", response.data.message);
        }
      } catch (error) {
        console.error("API error:", error);
      }
    };

    fetchUserProfile();
  }, []);

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

    if (!user) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        Loading user profile...
      </div>
    );
  }

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

        <main className="flex-grow p-4 md:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-gray-100">
              <div className="p-5 flex items-center space-x-4">
                <div className="relative">
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/2202/2202112.png"
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-500"
                  />
                  <div className="absolute bottom-0 right-0 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {user.firstName} {user.lastName}
                    </h2>
                    <div className="flex flex-col md:flex-row md:items-center text-sm space-y-1 md:space-y-0 md:space-x-2">
                      {user.userRole?.map((role, idx) => (
                      <span key={role.role_Id} className="text-gray-700 font-medium">
                        {role.role_Name}{idx < user.userRole.length - 1 && ", "}
                      </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100">
                <div className="px-6 py-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Personal Information
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-500">
                      First Name
                    </label>
                    <p className="text-gray-800">{user.firstName}</p>
                    <div className="h-0.5 bg-gray-100 mt-2"></div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-500">
                      Last Name
                    </label>
                    <p className="text-gray-800">{user.lastName}</p>
                    <div className="h-0.5 bg-gray-100 mt-2"></div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-500">
                      User Role
                    </label>
                    {user.userRole.map(role => (
                    <p key={role.role_Id} className="text-gray-800">{role.role_Name}</p>
                    ))}
                    <div className="h-0.5 bg-gray-100 mt-2"></div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-500">
                      Email Address
                    </label>
                    <p className="text-gray-800">{user.email}</p>
                    <div className="h-0.5 bg-gray-100 mt-2"></div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-500">
                      Phone Number
                    </label>
                    <p className="text-gray-800">{user.phone}</p>
                    <div className="h-0.5 bg-gray-100 mt-2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default UserProfile;
