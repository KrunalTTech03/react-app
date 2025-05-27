import React, { useEffect, useState } from "react";
import {
  FaHome,
  FaUserPlus,
  FaSignOutAlt,
  FaUsers,
  FaEye,
  FaFilter,
} from "react-icons/fa";
import { FiSearch, FiBell } from "react-icons/fi";
import axiosInstance from "../../axiosInstance";
import Select from "react-select";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import Pagination from "./Pagination";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { usePermissions } from "../Hooks/UsePermission";
import PERMISSIONS from "../Constants/Permissions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import MimicLogin from "./MimicLogin";
import UserRoles from "../Constants/UserRoles";
import Filter from "./Filter";

export const Listing = () => {
  const [users, setUsers] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [firstName, setUserName] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showMimicModal, setShowMimicModal] = useState(false);
  const { hasPermission } = usePermissions();
  const canShowActions =
    hasPermission(PERMISSIONS.UPDATE_USER) ||
    hasPermission(PERMISSIONS.DELETE_USER);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    roles: [],
  });
  const [userRoleId, setUserRoleId] = useState("");

  useEffect(() => {
    const roleName = localStorage.getItem("Role_Name");
    if (roleName) {
      setUserRoleId(roleName);
    }
  }, []);
  const [openFilterColumn, setOpenFilterColumn] = useState(null);
  const isAdmin = userRoleId === UserRoles.Admin;

  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 5,
    sortBy: "FirstName",
    sortOrder: "asc",
    totalCount: 0,
  });

  useEffect(() => {
  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.get("/Role/");
      const data = response.data?.data;

      if (data && Array.isArray(data.roles)) {
        setRoles(data.roles);
      } else {
        console.error("Roles API did not return an array:", data);
        setRoles([]);
      }
    } catch (error) {
      console.error("Error fetching roles:", error.message);
      setRoles([]); 
    }
  };

  fetchRoles();
}, []);


  const pageSizeOptions = [
    { value: 5, label: "5" },
    { value: 10, label: "10" },
    { value: 20, label: "20" },
    { value: 30, label: "30" },
    { value: 50, label: "50" },
  ];

  const handleRoleChange = (selectedOptions) => {
    setNewUser((prevState) => ({
      ...prevState,
      roles: selectedOptions
        ? selectedOptions.map((option) => option.value)
        : [],
    }));
  };

  // const [userRole, setUserRole] = useState("");

  // useEffect(() => {
  //   const role = localStorage.getItem("Role_Name");
  //   if (role) {
  //     setUserRole(role);
  //   } else {
  //     console.warn("No role found in localStorage");
  //   }
  // }, []);

  useEffect(() => {
    const name = localStorage.getItem("User_Name");
    if (name) {
      setUserName(name);
    }
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { pageNumber, pageSize, sortBy, sortOrder } = pagination;
      let url = `/User/search?sortBy=${sortBy}&sortOrder=${sortOrder}&pageNumber=${pageNumber}&pageSize=${pageSize}`;

      if (searchQuery.trim()) {
        url += `&query=${encodeURIComponent(searchQuery)}`;
      }

      console.log("Fetching users from:", url);
      const response = await axiosInstance.get(url);
      console.log("Users response:", response.data);

      if (!response.data || typeof response.data.data !== "object") {
        console.error("Invalid data format:", response.data);
        toast.error("Unexpected API response format.");
        return;
      }

      const usersArray = Array.isArray(response.data.data.users)
        ? response.data.data.users
        : [];

      console.log("Extracted users:", usersArray);

      const usersWithRoleNames = usersArray.map((user) => ({
        ...user,
        roles:
          user.roles?.map((roleId) => {
            const foundRole = Array.isArray(roles)
              ? roles.find((r) => r.role_Id === roleId)
              : null;
            return foundRole ? foundRole.role_name : roleId;
          }) || [],
      }));

      setUsers(usersWithRoleNames);
      setPagination((prev) => ({
        ...prev,
        totalCount: response.data.data.totalCount,
      }));
    } catch (error) {
      console.error(
        "Error fetching users:",
        error.response?.data || error.message
      );
      toast.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [
    pagination.pageNumber,
    pagination.pageSize,
    pagination.sortBy,
    pagination.sortOrder,
    searchQuery,
  ]);

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    setPagination((prev) => ({
      ...prev,
      pageNumber: 1,
    }));
  };

  const handlePageSizeChange = (selectedOption) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: selectedOption.value,
      pageNumber: 1,
    }));
  };
  const handleSort = (column) => {
    setPagination((prev) => ({
      ...prev,
      sortBy: column,
      sortOrder:
        prev.sortBy === column
          ? prev.sortOrder === "asc"
            ? "desc"
            : "asc"
          : "asc",
      pageNumber: 1,
    }));
  };

  const addUser = async () => {
    if (
      !newUser.firstName ||
      !newUser.lastName ||
      !newUser.email ||
      !newUser.phone ||
      !newUser.password ||
      !newUser.roles
    ) {
      toast.error("First name and email are required.");
      return;
    }

    try {
      const requestBody = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
        password: newUser.password,
        roles: newUser.roles,
      };

      const response = await axiosInstance.post(
        "/User/UpsertUser",
        requestBody
      );

      if (response.data.success) {
        toast.success("User added successfully!");
        setIsModalOpen(false);
        setNewUser({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          roles: [],
        });

        setNotifications((prev) => [
          { id: Date.now(), message: `New user added: ${newUser.firstName}` },
          ...prev,
        ]);

        fetchUsers();
      } else {
        toast.error("Failed to add user.");
      }
    } catch (error) {
      console.error(
        "Error adding user:",
        error.response?.data || error.message
      );
      toast.error("An error occurred while adding the user.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addUser();
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    {
      setSelectedUser((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const updatedUser = {
        ...selectedUser,
        roles: selectedUser.roles,
      };

      const response = await axiosInstance.post(
        "/User/UpsertUser",
        updatedUser
      );

      if (response.data.success) {
        const userWithRoleNames = {
          ...selectedUser,
          roles: selectedUser.roles.map((roleId) => {
            const role = roles.find((r) => r.role_Id === roleId);
            return role ? role.role_name : roleId;
          }),
        };

        toast.success("User updated successfully!");
        setIsEditModalOpen(false);
        setUsers(
          users.map((u) => (u.id === selectedUser.id ? userWithRoleNames : u))
        );

        setNotifications((prev) => [
          {
            id: Date.now(),
            message: `User updated: ${selectedUser.firstName}`,
          },
          ...prev,
        ]);
      } else {
        toast.error("Failed to update user.");
      }
    } catch (error) {
      console.error(
        "Error updating user:",
        error.response?.data || error.message
      );
      toast.error("An error occurred while updating the user.");
    }
  };

  const deleteUser = async (userId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this user!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.delete(`/User/${userId}`);

        if (response.data.success) {
          await Swal.fire("Deleted!", "The user has been deleted.", "success");
          toast.success("The user has been deleted.");

          const deletedUser = users.find((user) => user.id === userId);
          if (deletedUser) {
            setNotifications((prev) => [
              {
                id: Date.now(),
                message: `User deleted: ${deletedUser.firstName}`,
              },
              ...prev,
            ]);
          }

          fetchUsers();
        } else {
          Swal.fire("Error", "Failed to delete user.", "error");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire(
          "Error",
          "An error occurred while deleting the user.",
          "error"
        );
      }
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
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

  const handleMimicLogin = async (email) => {
    try {
      const response = await axiosInstance.post("/auth/mimic-login", { email });

      if (response.data && response.data.success) {
        const { token, role_Name, id, permissions } = response.data.data;

        localStorage.setItem("authToken", token);
        localStorage.setItem("Role_Name", role_Name);
        localStorage.setItem("userId", id);
        localStorage.setItem("userPermissions", JSON.stringify(permissions));

        toast.success("Mimic login successful! Redirecting...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        toast.error(response.data.message || "Mimic login failed.");
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(msg);
    } finally {
      setShowMimicModal(false);
    }
  };

  const [filterPosition, setFilterPosition] = useState({ top: 0, left: 0 });
  // const [filtersApplied, setFiltersApplied] = useState(false);

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
        <Header
          notifications={notifications}
          clearNotifications={clearNotifications}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          userName={firstName}
        />

        <div className="p-6 bg-gray-100 min-h-screen">
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-200 px-4 py-2 rounded-2xl w-1/3 shadow-inner">
              <FiSearch className="text-gray-500" />
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent outline-none ml-3 w-full"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-gray-700 font-medium">Sort By:</label>
              <div className="relative">
                <Select
                  options={[
                    { value: "asc", label: "Ascending" },
                    { value: "desc", label: "Descending" },
                  ]}
                  defaultValue={{ value: "asc", label: "Ascending" }}
                  onChange={(selectedOption) =>
                    setPagination((prev) => ({
                      ...prev,
                      sortOrder: selectedOption.value,
                    }))
                  }
                  isSearchable={false}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: "#D1D5DB",
                      boxShadow: "none",
                      "&:hover": { borderColor: "#A0AEC0" },
                      cursor: "pointer",
                    }),
                    dropdownIndicator: (base) => ({
                      ...base,
                      color: "#4B5563",
                      cursor: "pointer",
                    }),
                    option: (base, { isFocused }) => ({
                      ...base,
                      backgroundColor: isFocused ? "#F3F4F6" : "white",
                      color: "#374151",
                      cursor: "pointer",
                    }),
                  }}
                />
              </div>
              <div class="flex items-center space-x-2 relative">
                <label for="pageSize" class="text-gray-700 font-medium">
                  Page Size:
                </label>
                <div class="relative">
                  <Select
                    options={pageSizeOptions}
                    defaultValue={pageSizeOptions[0]}
                    onChange={handlePageSizeChange}
                    isSearchable={false}
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderColor: "#D1D5DB",
                        boxShadow: "none",
                        "&:hover": { borderColor: "#A0AEC0" },
                        cursor: "pointer",
                      }),
                      dropdownIndicator: (base) => ({
                        ...base,
                        color: "#4B5563",
                        cursor: "pointer",
                      }),
                      option: (base, { isFocused }) => ({
                        ...base,
                        backgroundColor: isFocused ? "#F3F4F6" : "white",
                        color: "#374151",
                        cursor: "pointer",
                      }),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center mb-4"></div>

          <div className="p-6 flex-1 flex justify-center items-center">
            <div className="w-full max-w-7xl bg-white rounded-lg p-6 shadow-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Users</h2>
                  <p className="text-gray-500 text-sm">
                    A list of all users including their name, email, mobile, and
                    role.
                  </p>
                </div>

                <div className="flex space-x-3">
                  {hasPermission(PERMISSIONS.ADD_USER) && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 cursor-pointer rounded-md hover:bg-purple-700 transition"
                    >
                      Add User
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setPagination((prev) => ({
                        ...prev,
                        pageNumber: 1,
                      }));
                      fetchUsers();
                      toast.success("Filter reset.");
                    }}
                    className="flex items-center bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
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
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      {[
                        { key: "firstName", label: "First Name" },
                        { key: "lastName", label: "Last Name" },
                        { key: "email", label: "Email" },
                        { key: "phone", label: "Mobile" },
                        { key: "roles", label: "Role" },
                      ].map(({ key, label }) => (
                        <th
                          key={key}
                          className="px-6 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer relative"
                          onClick={(e) => {
                            const isFilterClick =
                              e.target.closest(".filter-icon") ||
                              e.target.closest(".filter-popup");
                            if (!isFilterClick) handleSort(key);
                          }}
                        >
                          <div className="flex items-center space-x-1">
                            <span>{label}</span>
                            {pagination.sortBy === key && (
                              <span>
                                {pagination.sortOrder === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                            <span
                              className="filter-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                const rect =
                                  e.currentTarget.getBoundingClientRect();

                                setFilterPosition({
                                  top: rect.bottom + window.scrollY + 4,
                                  left: rect.left + window.scrollX,
                                });

                                setOpenFilterColumn(
                                  openFilterColumn === key ? null : key
                                );
                              }}
                            >
                              <FaFilter className="text-gray-500 hover:text-black cursor-pointer" />
                            </span>
                          </div>
                          {openFilterColumn === key && (
                            <Filter
                              column={key}
                              position={filterPosition}
                              onApply={(filter) => {
                                if (Array.isArray(filter)) {
                                  setUsers(filter);
                                  setPagination((prev) => ({
                                    ...prev,
                                    totalCount: filter.length,
                                  }));
                                } else {
                                  fetchUsers();
                                }
                              }}
                              onClose={() => setOpenFilterColumn(null)}
                            />
                          )}
                        </th>
                      ))}
                      {canShowActions && (
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 relative">
                    {" "}
                    {loading ? (
                      <tr>
                        <td colSpan=" 6" className="h-64">
                          {" "}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                          </div>
                        </td>
                      </tr>
                    ) : users.length > 0 ? (
                      users.map((user, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 text-gray-800 font-medium">
                            {user.firstName}
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {user.lastName}
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {user.phone}
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {Array.isArray(user.roles) &&
                            user.roles.length > 0 ? (
                              user.roles.map((roleName, roleIndex) => (
                                <span
                                  key={roleIndex}
                                  className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2"
                                >
                                  {roleName}
                                </span>
                              ))
                            ) : (
                              <span className="text-red-500">No roles</span>
                            )}
                          </td>
                          {canShowActions && (
                            <td className="px-6 py-4 flex space-x-4">
                              {hasPermission(PERMISSIONS.UPDATE_USER) && (
                                <button
                                  onClick={() => handleEditClick(user)}
                                  className="text-purple-600 cursor-pointer hover:underline"
                                >
                                  Edit
                                </button>
                              )}
                              {hasPermission(PERMISSIONS.DELETE_USER) && (
                                <button
                                  onClick={() => deleteUser(user.id)}
                                  className="text-red-600 cursor-pointer hover:underline"
                                >
                                  Delete
                                </button>
                              )}
                              {isAdmin && (
                                <button
                                  className="text-purple-600 cursor-pointer hover:underline"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowMimicModal(true);
                                  }}
                                >
                                  <FontAwesomeIcon icon={faSignInAlt} />
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={canShowActions ? 6 : 5}
                          className="text-center py-4 text-gray-500"
                        >
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {isEditModalOpen && selectedUser && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg p-6 w-[450px] shadow-xl">
                      <h2 className="text-lg font-semibold mb-4">Edit User</h2>
                      <form
                        onSubmit={handleEditSubmit}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div>
                          <label className="text-gray-700">First Name</label>
                          <input
                            type="text"
                            name="firstName"
                            value={selectedUser?.firstName || ""}
                            onChange={handleEditChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-purple-200 outline-none"
                            placeholder="First Name"
                          />
                        </div>
                        <div>
                          <label className="text-gray-700">Last Name</label>
                          <input
                            type="text"
                            name="lastName"
                            value={selectedUser?.lastName || ""}
                            onChange={handleEditChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-purple-200 outline-none"
                            placeholder="Last Name"
                          />
                        </div>
                        <div>
                          <label className="text-gray-700">Email</label>
                          <input
                            type="email"
                            name="email"
                            value={selectedUser?.email || ""}
                            onChange={handleEditChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-purple-200 outline-none"
                            placeholder="Email"
                          />
                        </div>
                        <div>
                          <label className="text-gray-700">Mobile</label>
                          <input
                            type="text"
                            name="phone"
                            value={selectedUser?.phone || ""}
                            onChange={handleEditChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-purple-200 outline-none"
                            placeholder="Phone"
                          />
                        </div>
                        <div>
                          <label className="text-gray-700">Password</label>
                          <input
                            type="password"
                            name="password"
                            value={selectedUser?.password || ""}
                            onChange={handleEditChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-purple-200 outline-none"
                            placeholder="Password"
                          />
                        </div>
                        <div>
                          <label className="text-gray-700">Role</label>
                          <Select
                            options={
                              Array.isArray(roles)
                                ? roles.map((role) => ({
                                    value: role.role_Id,
                                    label: role.role_name,
                                  }))
                                : []
                            }
                            value={
                              Array.isArray(roles)
                                ? roles
                                    .filter((role) =>
                                      Array.isArray(selectedUser.roles)
                                        ? selectedUser.roles.includes(
                                            role.role_Id
                                          )
                                        : selectedUser.roles === role.role_Id
                                    )
                                    .map((role) => ({
                                      value: role.role_Id,
                                      label: role.role_name,
                                    }))
                                : []
                            }
                            onChange={(selectedOptions) => {
                              setSelectedUser((prev) => ({
                                ...prev,
                                roles: selectedOptions
                                  ? selectedOptions.map(
                                      (option) => option.value
                                    )
                                  : [],
                              }));
                            }}
                            isMulti
                            isClearable
                            placeholder="Select Roles"
                            className="basic-multi-select"
                            classNamePrefix="select"
                          />
                        </div>
                        <div className="col-span-2 flex justify-end space-x-4 mt-4">
                          <button
                            type="submit"
                            className="bg-gradient-to-r from-gray-500 to-gray-600 cursor-pointer text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="bg-gray-400 cursor-pointer text-white px-4 py-2 rounded hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
              <div
                className={`flex justify-between items-center mt-4 ${
                  isEditModalOpen ? "hidden" : ""
                }`}
              >
                <div className="flex items-center space-x-2 relative">
                  <label className="text-gray-700 font-medium">
                    Showing{""}
                    <span className="mx-1">
                      {Math.min(
                        (pagination.pageNumber - 1) * pagination.pageSize + 1,
                        pagination.totalCount
                      )}
                    </span>
                    to{""}
                    <span className="mx-1">
                      {Math.min(
                        pagination.pageNumber * pagination.pageSize,
                        pagination.totalCount
                      )}
                    </span>
                    of{""}
                    <span className="mx-1">{pagination.totalCount}</span>
                    entries
                  </label>
                </div>

                <Pagination
                  pagination={pagination}
                  setPagination={setPagination}
                  isLoading={loading}
                />
              </div>
            </div>
          </div>

          {showMimicModal && (
            <MimicLogin
              onClose={() => setShowMimicModal(false)}
              onConfirm={() => handleMimicLogin(selectedUser?.email)}
            />
          )}

          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white rounded-lg p-6 w-[450px] shadow-xl">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Add New User
                </h2>
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <label className="text-gray-700">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={newUser.firstName}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-purple-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={newUser.lastName}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-purple-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={newUser.email}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-purple-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700">Mobile</label>
                    <input
                      type="text"
                      name="phone"
                      value={newUser.phone}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-purple-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={newUser.password}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-purple-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700">Role</label>
                    <Select
                      options={
                        Array.isArray(roles)
                          ? roles.map((role) => ({
                              value: role.role_Id,
                              label: role.role_name,
                            }))
                          : []
                      }
                      value={roles
                        .filter((role) => newUser.roles.includes(role.role_Id))
                        .map((role) => ({
                          value: role.role_Id,
                          label: role.role_name,
                        }))}
                      onChange={handleRoleChange}
                      isMulti
                      isClearable
                      placeholder="Select Role"
                    />
                  </div>
                  <div className="col-span-2 flex justify-end space-x-4 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="bg-gradient-to-r from-gray-500 to-gray-600 cursor-pointer text-white px-4 py-2 rounded-md transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-gray-500 to-gray-600 cursor-pointer text-white px-4 py-2 rounded-md transition"
                    >
                      Add User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};
