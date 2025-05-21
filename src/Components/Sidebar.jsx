import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import * as Icons from "react-icons/fa";
import toast from "react-hot-toast";
import axiosInstance from "../../axiosInstance";
import { MdOutlineArrowDropDown, MdDashboard, MdMenu } from "react-icons/md";

const Sidebar = ({ showLogoutConfirm, setShowLogoutConfirm, toggleMobileSidebar }) => {
  const [menus, setMenus] = useState([]);
  const [openSubMenus, setOpenSubMenus] = useState({});
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const event = new CustomEvent('sidebarStateChanged', { 
      detail: { collapsed } 
    });
    window.dispatchEvent(event);
    
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  }, [collapsed]);
  
  useEffect(() => {
    const storedState = localStorage.getItem('sidebarCollapsed');
    if (storedState !== null) {
      setCollapsed(JSON.parse(storedState));
    }
  }, []);

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/Menu/${userId}`);
      if (res.data.data) {
        setMenus(res.data.data);
        console.log("Menus fetched successfully:", res.data.data);
      } else {
        console.warn("No menu data returned from API");
        setMenus([]);
      }
    } catch (err) {
      toast.error("Failed to fetch menu");
      console.error("Error fetching menus:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  useEffect(() => {
    const handleMenuUpdate = () => {
      console.log("Menu update event detected, refreshing menus");
      fetchMenus();
    };

    window.addEventListener("menuPermissionsUpdated", handleMenuUpdate);

    return () => {
      window.removeEventListener("menuPermissionsUpdated", handleMenuUpdate);
    };
  }, [fetchMenus]);

  const toggleSubMenu = (id) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleNavigate = (path) => {
    if (path) navigate(path);
  };

  const renderIcon = (iconName) => {
    const Icon = Icons[iconName] || Icons.FaRegSquare;
    return <Icon className={`${collapsed ? "text-xl" : "text-lg"}`} />;
  };

  const renderMenu = (menuList, isSub = false) => {
    return menuList.map((menu) => {
      const isActive = location.pathname === menu.path;
      const hasChildren = menu.subMenus && menu.subMenus.length > 0;

      return (
        <li key={menu.id} className="relative group">
          <div
            onClick={() =>
              hasChildren ? toggleSubMenu(menu.id) : handleNavigate(menu.path)
            }
            className={`flex items-center justify-between ${
              isSub ? "pl-8" : "pl-4"
            } pr-4 py-3 rounded-lg cursor-pointer transition-all duration-200
            ${
              isActive
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-300 hover:bg-gray-800"
            }
            ${collapsed && !isSub ? "justify-center" : ""}`}
          >
            <div className={`flex items-center ${collapsed && !isSub ? "" : "space-x-3"}`}>
              <span className={`${isActive ? "text-white" : "text-gray-400"}`}>
                {renderIcon(menu.icon)}
              </span>
              {(!collapsed || isSub) && (
                <span className={`font-medium ${isActive ? "text-white" : ""}`}>
                  {menu.title}
                </span>
              )}
            </div>

            {hasChildren && !collapsed && (
              <span
                className={`transition-transform duration-300 ${
                  openSubMenus[menu.id] ? "rotate-180" : ""
                }`}
              >
                <MdOutlineArrowDropDown className="text-lg" />
              </span>
            )}
            
            {collapsed && !isSub && (
              <div className="absolute left-full ml-2 z-10 w-auto px-3 py-2 rounded-md bg-gray-800 text-white text-sm 
                opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 whitespace-nowrap">
                {menu.title}
              </div>
            )}
          </div>

          {hasChildren && (
            <ul
              className={`overflow-hidden transition-all duration-300 ease-in-out rounded-md mt-1 mb-1 
              ${openSubMenus[menu.id] ? "max-h-60 bg-gray-800/50" : "max-h-0"}
              ${collapsed ? "absolute left-full ml-2 z-10 w-48 bg-gray-800" : "ml-2"}`}
            >
              {openSubMenus[menu.id] && renderMenu(menu.subMenus, true)}
            </ul>
          )}
        </li>
      );
    });
  };

  const renderSkeletonMenu = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <li key={index} className="animate-pulse">
          <div className="flex items-center space-x-3 pl-4 pr-4 py-3">
            <div className="w-5 h-5 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-28"></div>
          </div>
        </li>
      ));
  };

  return (
    <>
      <aside 
        className={`fixed left-0 top-0 h-screen bg-gray-900 text-white shadow-xl flex flex-col transition-all duration-300 z-10
        ${collapsed ? "w-16" : "w-64"}`}
      >
        <div className={`flex items-center justify-between p-4 border-b border-gray-700 ${collapsed ? "justify-center" : ""}`}>
          {!collapsed && (
            <div className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Dashboard</span>
              <button
                onClick={() => fetchMenus()}
                className="ml-2 p-1 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
                title="Refresh Menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
          {collapsed && <MdDashboard className="text-2xl text-blue-400" />}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className={`p-1 rounded-full hover:bg-gray-800 transition-colors ${collapsed ? "hidden" : "block"}`}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M15.707 4.293a1 1 0 010 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          {collapsed && (
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="absolute -right-3 top-10 bg-blue-500 p-1 rounded-full shadow-lg border border-gray-700"
              title="Expand Sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        
        <nav className={`flex-1 overflow-y-auto py-4 ${collapsed ? "px-2" : "px-4"}`}>
          {loading ? (
            <ul className="space-y-1">
              {renderSkeletonMenu()}
            </ul>
          ) : (
            <ul className="space-y-1">
              {menus.length > 0 ? (
                renderMenu(menus)
              ) : (
                <li className="text-gray-400 p-3 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>No menu items</span>
                    <button 
                      onClick={fetchMenus}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </li>
              )}
            </ul>
          )}
        </nav>
        
        <div className={`p-4 border-t border-gray-700 ${collapsed ? "flex justify-center" : ""}`}>
          <div
            onClick={() => setShowLogoutConfirm(true)}
            className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all
              hover:bg-red-500/20 hover:text-red-400 group
              ${collapsed ? "justify-center" : ""}`}
          >
            <FaSignOutAlt className="text-lg group-hover:text-red-400" />
            {!collapsed && <span>Logout</span>}
            
            {collapsed && (
              <div className="absolute left-full ml-2 bottom-16 z-10 w-auto px-3 py-2 rounded-md bg-gray-800 text-white text-sm 
                opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300">
                Logout
              </div>
            )}
          </div>
        </div>
      </aside>
  
      <button
        onClick={toggleMobileSidebar}
        className="fixed bottom-6 right-6 lg:hidden bg-blue-600 text-white p-3 rounded-full shadow-lg z-30"
      >
        <MdMenu className="text-2xl" />
      </button>
  
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl animate-fade-in-up">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FaSignOutAlt className="text-red-500 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Confirm Logout
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to logout from your account?
              </p>
              <div className="flex space-x-4 w-full">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("authToken");
                    navigate("/login");
                    toast.success("Logged out successfully");
                  }}
                  className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
