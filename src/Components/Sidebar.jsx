import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import * as Icons from "react-icons/fa";
import toast from "react-hot-toast";
import axiosInstance from "../../axiosInstance";
import { MdOutlineArrowDropDown } from "react-icons/md";

const Sidebar = ({ showLogoutConfirm, setShowLogoutConfirm }) => {
  const [menus, setMenus] = useState([]);
  const [openSubMenus, setOpenSubMenus] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  const fetchMenus = useCallback(async () => {
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
    return <Icon />;
  };

  const renderMenu = (menuList, isSub = false) => {
    return menuList.map((menu) => {
      const isActive = location.pathname === menu.path;
      const hasChildren = menu.subMenus && menu.subMenus.length > 0;

      return (
        <li key={menu.id}>
          <div
            onClick={() =>
              hasChildren ? toggleSubMenu(menu.id) : handleNavigate(menu.path)
            }
            className={`flex items-center justify-between p-3 ${
              isSub ? "pl-10" : ""
            } rounded-lg cursor-pointer hover:bg-gray-700 transition ${
              isActive ? "bg-gray-700" : ""
            }`}
          >
            <div className="flex items-center space-x-4">
              {renderIcon(menu.icon)}
              <span className="text-lg font-normal">{menu.title}</span>{" "}
            </div>

            {hasChildren && (
              <span
                className={`transition-transform duration-300 ${
                  openSubMenus[menu.id] ? "rotate-180" : ""
                }`}
              >
                <MdOutlineArrowDropDown size={18} />
              </span>
            )}
          </div>

          {hasChildren && (
            <ul
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openSubMenus[menu.id] ? "max-h-40 mt-2" : "max-h-0"
              }`}
            >
              {renderMenu(menu.subMenus, true)}
            </ul>
          )}
        </li>
      );
    });
  };

  return (
    <>
      <aside className="fixed left-0 top-0 w-72 h-screen bg-gray-900 text-white p-6 shadow-xl flex flex-col">
        <div className="flex items-center space-x-3 mb-8">
          <span className="text-xl font-bold">Dashboard</span>
        </div>
        <nav>
          <ul className="space-y-2 font-sans">
            {menus.length > 0 ? (
              renderMenu(menus)
            ) : (
              <li className="text-gray-400 p-3">No menu items available</li>
            )}
          </ul>
          <li
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center space-x-4 p-3 rounded-lg cursor-pointer hover:bg-red-500 transition mt-4"
          >
            <FaSignOutAlt />
            <span className="text-lg">Logout</span>
          </li>
        </nav>
      </aside>
  
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FaSignOutAlt className="text-red-500 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Confirm Logout
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to logout?
              </p>
              <div className="flex space-x-4 w-full">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("authToken");
                    navigate("/login");
                    toast.success("Logged out successfully");
                  }}
                  className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
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