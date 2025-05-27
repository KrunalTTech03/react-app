import React, { useState, useRef, useEffect } from "react";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowRight,
  MdAdd,
  MdClose,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import Select from "react-select";
import Sidebar from "./Sidebar";
import Header from "./Header";
import axiosInstance from "../../axiosInstance";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "react-hot-toast";
import AssignMenuPermission from "../Components/AssignMenuPermission";
import DeleteMenu from "../Components/DeleteMenu";
import CreateMenuPermission from "./CreateMenuPermission";
import ViewMenuPermissions from "./ViewMenuPermissions";
import DeleteMenuPermissions from "./DeleteMenuPermissions";
import EditMenu from "./EditMenu";
import Filter from "./Filter";
import { FaFilter } from "react-icons/fa";

function Menu() {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectedRoleName, setSelectedRoleName] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedSubmenus, setExpandedSubmenus] = useState([]);
  const [menus, setMenus] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [parentMenuOptions, setParentMenuOptions] = useState([]);
  const [showAssignPermissionModal, setShowAssignPermissionModal] =
    useState(false);
  const [showCreatePermissionModal, setShowCreatePermissionModal] =
    useState(false);
  const [showViewMenuPermissionModal, setShowViewMenuPermissionModal] =
    useState(false);
  const [showDeleteMenuPermissionModal, setShowDeleteMenuPermissionModal] =
    useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [menuOptions, setMenuOptions] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      title: "",
      icon: "",
      path: "",
      order: 0,
      parentMenuId: null,
    },
  });

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchMenus = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/Menu/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        setMenus(response.data.data);

        const parentOptions = response.data.data.map((menu) => ({
          value: menu.id,
          label: menu.title,
        }));
        setParentMenuOptions(parentOptions);

        const allMenuOptions = response.data.data.map((menu) => ({
          value: menu.id,
          label: menu.title,
        }));
        setMenuOptions(allMenuOptions);
      } else {
        toast.error("Failed to fetch menus: " + response.data.message);
      }
    } catch (error) {
      toast.error("Error fetching menus");
      console.error("Error fetching menus:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMenu = async (formData) => {
    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/Menu/create", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        toast.success("Menu created successfully!");
        reset();
        fetchMenus();
        setTimeout(() => {
          setShowCreateModal(false);
        }, 1000);
      } else {
        toast.error(response.data.message || "Failed to create menu");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating menu");
      console.error("Error creating menu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParentMenuChange = (selectedOption) => {
    setValue("parentMenuId", selectedOption ? selectedOption.value : null);
  };

  const handleViewPermissions = (permissions, roleName) => {
    setSelectedPermissions(permissions);
    setSelectedRoleName(roleName);
    setShowModal(true);
  };

  const handleDeleteMenuClick = (menu) => {
    setMenuToDelete(menu);
    setShowDeleteModal(true);
    setOpenMenu(null);
  };

  const handleDeleteSuccess = () => {
    fetchMenus();
  };

  const toggleSubmenu = (menuId) => {
    setExpandedSubmenus((prev) => {
      if (prev.includes(menuId)) {
        return prev.filter((id) => id !== menuId);
      } else {
        return [...prev, menuId];
      }
    });
  };

  const handlePermissionsAssigned = () => {
    fetchMenus();
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleEditClick = (menu) => {
    setSelectedMenu(menu);
    setEditModalOpen(true);
  };

  const handleMenuUpdated = (updatedMenu) => {
    setMenus((prevMenus) => {
      return prevMenus.map((menu) => {
        if (menu.id === updatedMenu.id) {
          return { ...menu, ...updatedMenu };
        }

        if (menu.subMenus && menu.subMenus.length > 0) {
          const updatedSubMenus = menu.subMenus.map((subMenu) => {
            if (subMenu.id === updatedMenu.id) {
              return { ...subMenu, ...updatedMenu };
            }
            return subMenu;
          });

          return { ...menu, subMenus: updatedSubMenus };
        }

        return menu;
      });
    });
  };

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

  const renderMenuItems = (menuItems, depth = 0) => {
    return menuItems.map((menu, index) => {
      const hasSubmenus = menu.subMenus && menu.subMenus.length > 0;
      const isExpanded = expandedSubmenus.includes(menu.id);

      return (
        <React.Fragment key={menu.id}>
          <tr
            className={
              depth > 0 ? "bg-gray-50 hover:bg-gray-100" : "hover:bg-gray-50"
            }
          >
            <td className="px-6 py-4 text-gray-800 font-medium">
              {depth === 0 ? index + 1 : ""}
            </td>
            <td className="px-6 py-4 text-gray-800 font-medium">
              <div
                className="flex items-center"
                style={{ paddingLeft: `${depth * 20}px` }}
              >
                {hasSubmenus && (
                  <button
                    onClick={() => toggleSubmenu(menu.id)}
                    className="mr-2 text-gray-500 hover:text-gray-700"
                  >
                    {isExpanded ? (
                      <MdKeyboardArrowDown
                        className="text-blue-500"
                        size={20}
                      />
                    ) : (
                      <MdKeyboardArrowRight
                        className="text-gray-500"
                        size={20}
                      />
                    )}
                  </button>
                )}
                {depth > 0 && !hasSubmenus && (
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                )}
                {menu.title}
              </div>
            </td>
            <td className="px-6 py-4 text-gray-800 font-medium">{menu.icon}</td>
            <td className="px-6 py-4 text-gray-800 font-medium">
              {menu.path || "N.A"}
            </td>
            <td className="px-6 py-4 text-gray-800 font-medium">
              {menu.order}
            </td>
            <td className="px-6 py-4 text-gray-800 font-medium">
              {depth === 0 ? "Parent Menu" : "Sub Menu"}
            </td>
            <td className="px-6 py-4 text-gray-800 font-medium">
              <button
                onClick={() =>
                  handleViewPermissions(["View", "Edit", "Delete"], menu.title)
                }
                className="text-blue-600 cursor-pointer hover:underline"
              >
                View Permissions
              </button>
            </td>
            <td className="px-6 py-4 text-center relative">
              <div className="flex justify-left space-x-4">
                <div
                  className="relative inline-block text-left"
                  ref={dropdownRef}
                >
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === menu.id ? null : menu.id)
                    }
                    className="rounded-full border border-blue-500 w-10 h-10 flex items-center justify-center hover:bg-blue-50"
                  >
                    <span className="text-blue-500 text-xl font-bold">⋮</span>
                  </button>

                  <AnimatePresence>
                    {openMenu === menu.id && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          scale: 0.95,
                          y: -10,
                        }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="origin-top-right absolute right-0 mt-2 w-48 shadow-lg bg-white ring-1 ring-gray-200 ring-opacity-5 z-20"
                      >
                        <div className="py-1">
                          <button
                            onClick={() => handleEditClick(menu)}
                            className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDeleteMenuClick(menu)}
                            className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>

                          <button
                            onClick={() => setOpenMenu(null)}
                            className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                          >
                            Manage Permissions
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </td>
          </tr>

          {isExpanded &&
            hasSubmenus &&
            renderMenuItems(menu.subMenus, depth + 1)}
        </React.Fragment>
      );
    });
  };

  const selectStyles = {
    control: (provided) => ({
      ...provided,
      boxShadow: "none",
      borderColor: "#e2e8f0",
      "&:hover": {
        borderColor: "#cbd5e0",
      },
      padding: "2px",
      borderRadius: "0.5rem",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? "#dbeafe"
        : "white",
      color: state.isSelected ? "white" : "#4b5563",
      cursor: "pointer",
      ":active": {
        backgroundColor: "#3b82f6",
        color: "white",
      },
    }),
    menu: (provided) => ({
      ...provided,
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      borderRadius: "0.5rem",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9ca3af",
    }),
  };

  const [openFilterColumn, setOpenFilterColumn] = useState(null);
  const [filterPopupPosition, setFilterPopupPosition] = useState({
    top: 0,
    left: 0,
  });

  const handleFilterIconClick = (column, event) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();

    setFilterPopupPosition({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
    });

    setOpenFilterColumn(openFilterColumn === column ? null : column);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest(".filter-popup") &&
        !e.target.closest(".filter-icon")
      ) {
        setOpenFilterColumn(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuFilter = async (filters) => {
    try {
      const response = await axiosInstance.post("/Menu/filter", filters, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        toast.error(response.data.message || "Filter failed.");
        return null;
      }
    } catch (error) {
      toast.error("Error applying menu filter.");
      console.error("Filter error:", error);
      return null;
    }
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
        <Toaster position="top-right" />
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

        <main className="flex-1 p-4 sm:p-6 md:p-10 bg-white mx-2 sm:mx-4 md:mx-8 my-2 sm:my-3 md:my-5 rounded-xl shadow-lg border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-700">
              Menu List
            </h2>

            {/* Buttons Grouped Side-by-Side */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  fetchMenus();
                  setOpenFilterColumn(null);
                  toast.success("Filter reset.");
                }}
                className="flex items-center bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 mr-2 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 4h18l-7 8v5l-4 2v-7L3 4z"
                  />
                  <circle
                    cx="18"
                    cy="6"
                    r="4"
                    fill="white"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="16.5"
                    y1="4.5"
                    x2="19.5"
                    y2="7.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="19.5"
                    y1="4.5"
                    x2="16.5"
                    y2="7.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                Reset Filter
              </button>

              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 sm:px-5 py-2 rounded-md cursor-pointer font-medium shadow flex items-center space-x-2"
                >
                  <span>Actions</span>
                  <MdKeyboardArrowDown size={16} />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowCreateModal(true);
                          setShowDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        + Create Menu
                      </button>

                      <button
                        onClick={() => {
                          setShowViewMenuPermissionModal(true);
                          setShowDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        + View Permission
                      </button>

                      <button
                        onClick={() => {
                          setShowCreatePermissionModal(true);
                          setShowDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        + Create Permission
                      </button>

                      <button
                        onClick={() => {
                          setShowAssignPermissionModal(true);
                          setShowDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        + Assign Menu Permission
                      </button>

                      <button
                        onClick={() => {
                          setShowDeleteMenuPermissionModal(true);
                          setShowDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        + Remove Permission
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow border border-gray-200 relative">
              <div className="min-h-[200px] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 sm:h-12 w-10 sm:w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                <p className="text-gray-500">Loading menu data...</p>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow border border-gray-200">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                Available Menus
              </h3>
              <div className="overflow-x-auto -mx-4 sm:-mx-6">
                <div className="inline-block min-w-full align-middle px-4 sm:px-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          No.
                        </th>
                        <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative">
                          <div className="flex items-center gap-1">
                            Title
                            <span
                              className="filter-icon"
                              onClick={(e) => handleFilterIconClick("Title", e)}
                            >
                              <FaFilter className="text-gray-500 hover:text-black cursor-pointer" />
                            </span>
                          </div>
                        </th>
                        <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative">
                          <div className="flex items-center gap-1">
                            Icon
                            <span
                              className="filter-icon"
                              onClick={(e) => handleFilterIconClick("Icon", e)}
                            >
                              <FaFilter className="text-gray-500 hover:text-black cursor-pointer" />
                            </span>
                          </div>
                        </th>
                        <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative">
                          <div className="flex items-center gap-1">
                            Path
                            <span
                              className="filter-icon"
                              onClick={(e) => handleFilterIconClick("Path", e)}
                            >
                              <FaFilter className="text-gray-500 hover:text-black cursor-pointer" />
                            </span>
                          </div>
                        </th>
                        <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative">
                          <div className="flex items-center gap-1">
                            Order
                            <span
                              className="filter-icon"
                              onClick={(e) => handleFilterIconClick("Order", e)}
                            >
                              <FaFilter className="text-gray-500 hover:text-black cursor-pointer" />
                            </span>
                          </div>
                        </th>
                        <th className="hidden sm:table-cell px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Menu Type
                        </th>
                        <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Permissions
                        </th>
                        <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {menus.length > 0 ? (
                        renderMenuItems(menus)
                      ) : (
                        <tr>
                          <td
                            colSpan="8"
                            className="px-2 sm:px-6 py-4 text-center text-gray-500"
                          >
                            No menus found. Click on "Create Menu" to add a new
                            menu.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {openFilterColumn && (
                    <Filter
                      column={openFilterColumn}
                      position={filterPopupPosition}
                      onFilterRequest={handleMenuFilter}
                      onApply={(filteredData) => {
                        if (filteredData) setMenus(filteredData);
                        else fetchMenus();
                        setOpenFilterColumn(null);
                      }}
                      onClose={() => setOpenFilterColumn(null)}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-0 relative overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-5">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center">
                      <MdAdd className="mr-2" size={22} />
                      Create New Menu
                    </h2>
                    <button
                      className="text-white hover:text-gray-200 transition-colors"
                      onClick={() => setShowCreateModal(false)}
                      aria-label="Close Modal"
                    >
                      <MdClose size={22} />
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <form onSubmit={handleSubmit(handleCreateMenu)}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("title", {
                            required: "Title is required",
                            minLength: {
                              value: 2,
                              message: "Title must be at least 2 characters",
                            },
                          })}
                          type="text"
                          placeholder="Enter menu title"
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                            errors.title ? "border-red-500" : ""
                          }`}
                        />
                        {errors.title && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.title.message}
                          </p>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Icon
                        </label>
                        <input
                          {...register("icon")}
                          type="text"
                          placeholder="Enter icon name or emoji"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Path
                        </label>
                        <input
                          {...register("path", {
                            pattern: {
                              value: /^\/.*$/,
                              message: "Path should start with /",
                            },
                          })}
                          type="text"
                          placeholder="Enter menu path (e.g. /admin/dashboard)"
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                            errors.path ? "border-red-500" : ""
                          }`}
                        />
                        {errors.path && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.path.message}
                          </p>
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Display Order
                        </label>
                        <input
                          {...register("order", {
                            valueAsNumber: true,
                            min: {
                              value: 0,
                              message: "Order must be a positive number",
                            },
                          })}
                          type="number"
                          min="0"
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                            errors.order ? "border-red-500" : ""
                          }`}
                        />
                        {errors.order && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.order.message}
                          </p>
                        )}
                      </div>

                      <div className="mb-4 col-span-1 sm:col-span-2">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Parent Menu (optional)
                        </label>
                        <Select
                          isClearable
                          onChange={handleParentMenuChange}
                          options={parentMenuOptions}
                          placeholder="Select parent menu (optional)"
                          styles={selectStyles}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          noOptionsMessage={() => "No parent menus available"}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Leave empty to create a top-level menu
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium shadow-sm flex items-center justify-center min-w-[100px] ${
                          isLoading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            <span>Creating...</span>
                          </>
                        ) : (
                          <span>Create Menu</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}

          {showCreatePermissionModal && (
            <CreateMenuPermission
              onClose={() => setShowCreatePermissionModal(false)}
            />
          )}

          {showViewMenuPermissionModal && (
            <ViewMenuPermissions
              onClose={() => setShowViewMenuPermissionModal(false)}
            />
          )}

          <EditMenu
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            menuData={selectedMenu}
            onMenuUpdated={handleMenuUpdated}
          />

          {showDeleteMenuPermissionModal && (
            <DeleteMenuPermissions
              onClick={() => setShowDeleteMenuPermissionModal(false)}
            />
          )}

          {showDeleteModal && menuToDelete && (
            <DeleteMenu
              menuId={menuToDelete.id}
              menuTitle={menuToDelete.title}
              onClose={() => setShowDeleteModal(false)}
              onDeleteSuccess={handleDeleteSuccess}
              hasSubMenus={
                menuToDelete.subMenus && menuToDelete.subMenus.length > 0
              }
            />
          )}

          {showAssignPermissionModal && (
            <AssignMenuPermission
              onClose={() => setShowAssignPermissionModal(false)}
              onPermissionsAssigned={handlePermissionsAssigned}
              menuOptions={menuOptions}
            />
          )}

          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs p-4">
              <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg mx-4 sm:mx-0 p-6 relative animate-fade-in">
                <button
                  className="absolute top-4 right-4 text-gray-400 cursor-pointer hover:text-gray-700 transition"
                  onClick={() => setShowModal(false)}
                  aria-label="Close Modal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                  Permissions for{" "}
                  <span className="text-purple-600">{selectedRoleName}</span>
                </h2>
                <div className="space-y-3 max-h-60 sm:max-h-72 overflow-y-auto pr-2">
                  {selectedPermissions.length > 0 ? (
                    selectedPermissions
                      .reduce((acc, curr, idx) => {
                        const groupIdx = Math.floor(idx / 3);
                        if (!acc[groupIdx]) acc[groupIdx] = [];
                        acc[groupIdx].push(curr);
                        return acc;
                      }, [])
                      .map((group, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg"
                        >
                          {group.join(", ")}
                        </div>
                      ))
                  ) : (
                    <p className="text-gray-500 italic">
                      No permissions assigned.
                    </p>
                  )}
                </div>

                <div className="mt-6 text-right">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg bg-purple-600 cursor-pointer text-white hover:bg-purple-700 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Menu;
