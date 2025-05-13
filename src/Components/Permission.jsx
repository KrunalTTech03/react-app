import React, { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "../../axiosInstance";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Header from "./Header";

function Permission() {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPermission, setNewPermission] = useState({ name: "" });
  const [openMenu, setOpenMenu] = useState(null);
  const dropdownRef = useRef(null);
  const [permissionRoles, setPermissionRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedPermissionName, setSelectedPermissionName] = useState("");

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/Permission/permissions");
      console.log("Permissions fetched:", response.data.data);
      setPermissions(response.data.data);
    } catch (error) {
      console.error("Error fetching permissions:", error.message);
      toast.error("Failed to fetch permissions");
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissionRoles = async () => {
    try {
      const response = await axiosInstance.get("/Permission/role-permissions");
      console.log("Permission Roles fetched:", response.data.data);
      setPermissionRoles(response.data.data);
    } catch (error) {
      console.error("Error fetching permission roles:", error.message);
      toast.error("Failed to fetch permission roles");
    }
  };

  useEffect(() => {
    fetchPermissions();
    fetchPermissionRoles();
  }, []);

  const handlePermissionInputChange = (e) => {
    const { name, value } = e.target;
    setNewPermission((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const addPermission = async () => {
    if (!newPermission.name.trim()) {
      toast.error("Permission name is required.");
      return;
    }

    try {
      const response = await axiosInstance.post("/Permission", newPermission);

      if (response.data.success) {
        toast.success("Permission created successfully!");
        setShowCreateModal(false);
        setNewPermission({ name: "" });

        fetchPermissions();
      } else {
        toast.error(response.data.message || "Failed to create permission.");
      }
    } catch (error) {
      console.error(
        "Error adding permission:",
        error.response?.data || error.message
      );
      toast.error("An error occurred while creating the permission.");
    }
  };

  const handleViewRoles = (roles, permissionName) => {
    setSelectedRoles(roles);
    setSelectedPermissionName(permissionName);
    setShowModal(true);
  };

  const handleDeletePermission = async (permissionId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to restore this permission easily!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.delete(
          `/Permission/${permissionId}`
        );

        if (response.data.success) {
          toast.success("Permission deleted successfully!");
          fetchPermissions();
        } else {
          toast.error(response.data.message || "Failed to delete permission.");
        }
      } catch (error) {
        console.error(
          "Error deleting permission:",
          error.response?.data || error.message
        );
        toast.error("An error occurred while deleting the permission.");
      }
    }
  };

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

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        showLogoutConfirm={showLogoutConfirm}
        setShowLogoutConfirm={setShowLogoutConfirm}
      />

      <div className="flex-1 flex flex-col md:ml-72 overflow-auto">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-10 bg-white mx-2 sm:mx-4 lg:mx-8 my-3 sm:my-5 rounded-xl shadow-lg border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-700">
              Manage Permissions
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-5 py-2 rounded-md cursor-pointer font-medium shadow"
            >
              Create Permission
            </button>
          </div>

          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-4 sm:p-6 relative">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Create New Permission
                </h2>

                <input
                  type="text"
                  name="name"
                  value={newPermission.name}
                  onChange={handlePermissionInputChange}
                  placeholder="Enter permission name"
                  className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-3 sm:px-4 py-2 rounded-lg cursor-pointer bg-gray-300 text-gray-800 hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addPermission}
                    className="px-3 sm:px-4 py-2 rounded-lg cursor-pointer bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow border border-gray-200 relative">
              <div className="min-h-[200px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow border border-gray-200">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                Available Permissions
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        No.
                      </th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Permission Name
                      </th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Assigned Permissions
                      </th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {permissions && permissions.length > 0 ? (
                      permissions.map((permission, index) => {
                        const permissionRoleList = permissionRoles.filter(
                          (role) => role.permissionId === permission.id
                        );
                        return (
                          <tr
                            key={permission.id}
                            className="hover:bg-gray-50 transition"
                          >
                            <td className="px-2 sm:px-6 py-3 sm:py-4 text-gray-800 text-sm sm:text-base font-medium">
                              {index + 1}
                            </td>
                            <td className="px-2 sm:px-6 py-3 sm:py-4 text-gray-800 text-sm sm:text-base font-medium">
                              {permission.name}
                            </td>
                            <td className="px-2 sm:px-6 py-3 sm:py-4 text-gray-800 text-sm sm:text-base font-medium">
                              {permissionRoleList.length > 0 ? (
                                <button
                                  onClick={() =>
                                    handleViewRoles(
                                      permissionRoleList.map((r) => r.roleName),
                                      permission.name
                                    )
                                  }
                                  className="text-gray-600 cursor-pointer hover:underline text-sm sm:text-base"
                                >
                                  View Permissions
                                </button>
                              ) : (
                                "No roles"
                              )}
                            </td>
                            <td className="px-2 sm:px-6 py-3 sm:py-4">
                              <div className="flex justify-center">
                                <div
                                  className="relative inline-block text-left"
                                  ref={dropdownRef}
                                >
                                  <button
                                    onClick={() =>
                                      setOpenMenu(
                                        openMenu === permission.id
                                          ? null
                                          : permission.id
                                      )
                                    }
                                    className="rounded-full border border-blue-500 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-blue-50"
                                  >
                                    <span className="text-blue-500 text-lg sm:text-xl font-bold">
                                      ⋮
                                    </span>
                                  </button>

                                  <AnimatePresence>
                                    {openMenu === permission.id && (
                                      <motion.div
                                        initial={{
                                          opacity: 0,
                                          scale: 0.95,
                                          y: -10,
                                        }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{
                                          opacity: 0,
                                          scale: 0.95,
                                          y: -10,
                                        }}
                                        transition={{ duration: 0.2 }}
                                        className="origin-top-right absolute right-0 mt-2 w-40 sm:w-48 shadow-lg bg-white ring-1 ring-gray-200 ring-opacity-5 z-20"
                                      >
                                        <div className="py-1">
                                          <button
                                            onClick={() =>
                                              handleDeletePermission(
                                                permission.id
                                              )
                                            }
                                            className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-100 text-sm sm:text-base"
                                          >
                                            Delete Permission
                                          </button>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center py-4 text-gray-500 text-sm sm:text-base"
                        >
                          No permissions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs p-4">
              <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-4 sm:p-6 relative">
                <button
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 cursor-pointer hover:text-gray-700 transition"
                  onClick={() => setShowModal(false)}
                  aria-label="Close Modal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 sm:h-6 sm:w-6"
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
                  Roles with{" "}
                  <span className="text-purple-600">
                    {selectedPermissionName}
                  </span>{" "}
                  Permission
                </h2>
                <div className="space-y-3 max-h-60 sm:max-h-72 overflow-y-auto pr-2">
                  {selectedRoles.length > 0 ? (
                    selectedRoles
                      .reduce((acc, curr, idx) => {
                        const groupIdx = Math.floor(
                          idx / (window.innerWidth < 640 ? 2 : 3)
                        );
                        if (!acc[groupIdx]) acc[groupIdx] = [];
                        acc[groupIdx].push(curr);
                        return acc;
                      }, [])
                      .map((group, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base"
                        >
                          {group.join(", ")}
                        </div>
                      ))
                  ) : (
                    <p className="text-gray-500 italic text-sm sm:text-base">
                      No roles assigned.
                    </p>
                  )}
                </div>

                <div className="mt-5 sm:mt-6 text-right">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-3 sm:px-4 py-2 rounded-lg bg-purple-600 cursor-pointer text-white hover:bg-purple-700 transition text-sm sm:text-base"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}
export default Permission;
