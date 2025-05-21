import React, { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { MdAssignmentInd } from "react-icons/md";
import axiosInstance from "../../axiosInstance";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import AssignRoleToUserModal from "../Components/AssignRoleToUserModal";
import RemoveRoleFromUserModal from "../Components/RemoveRoleFromUserModal";
import AssignPermissionModal from "../Components/AssignPermission";
import RemovePermissionfromRole from "../Components/RemovePermissionfromRole";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { usePermissions } from "../Hooks/UsePermission";
import PERMISSIONS from "../Constants/Permissions";

function Role() {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [roles, setRoles] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectedRoleName, setSelectedRoleName] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRole, setNewRole] = useState({ role_name: "" });
  const [showEditModal, setShowEditModal] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const dropdownRef = useRef(null);
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [showRemoveRoleModal, setShowRemoveRoleModal] = useState(false);
  const [removeRolePayload, setRemoveRolePayload] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedRoleIdForPermission, setSelectedRoleIdForPermission] =
    useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showRemovePermissionModal, setShowRemovePermissionModal] =
    useState(false);
  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const { hasPermission } = usePermissions();
  const canCreateRole = hasPermission(PERMISSIONS.ADD_ROLE);
  const canEditRole = hasPermission(PERMISSIONS.UPDATE_ROLE);
  const canDeleteRole = hasPermission(PERMISSIONS.DELETE_ROLE);
  const canManagePermissions = hasPermission(
    PERMISSIONS.MANAGE_ROLE_PERMISSIONS
  );

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/Role/");
      console.log("Roles fetched:", response.data.data);
      setRoles(response.data.data);
    } catch (error) {
      console.error("Error fetching roles:", error.message);
      toast.error("Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/Permission/role-permissions");
      console.log("Role Permissions fetched:", response.data.data);
      setRolePermissions(response.data.data);
    } catch (error) {
      console.error("Error fetching role permissions:", error.message);
      toast.error("Failed to fetch role permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchRolePermissions();
  }, []);

  const handleRoleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRole((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const addRole = async () => {
    if (!newRole.role_name.trim()) {
      toast.error("Role name is required.");
      return;
    }

    try {
      const response = await axiosInstance.post("/Role", newRole);

      if (response.data.success) {
        toast.success("Role created successfully!");
        setShowCreateModal(false);
        setNewRole({ role_name: "" });

        fetchRoles();
      } else {
        toast.error(response.data.message || "Failed to create role.");
      }
    } catch (error) {
      console.error(
        "Error adding role:",
        error.response?.data || error.message
      );
      toast.error("An error occurred while creating the role.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoleToEdit((prevRole) => ({
      ...prevRole,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!roleToEdit.role_name.trim()) {
      toast.error("Role name is required.");
      return;
    }

    if (!roleToEdit.role_Id) {
      toast.error("Role ID is missing.");
      return;
    }

    try {
      const response = await axiosInstance.put(
        `/Role/${roleToEdit.role_Id}`,
        roleToEdit
      );
      console.log(response.data);
      if (response.data.success) {
        toast.success("Role updated successfully!");
        fetchRoles();
        handleCloseModal();
      } else {
        toast.error(response.data.message || "Failed to update role.");
      }
    } catch (error) {
      console.error(
        "Error updating role:",
        error.response?.data || error.message
      );
      toast.error("An error occurred while updating the role.");
    }
  };

  const handleEditClick = (role) => {
    setRoleToEdit(role);
    setShowEditModal(true);
    setOpenMenu(null);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setRoleToEdit(null);
  };

  const handleViewPermissions = (permissions, roleName) => {
    setSelectedPermissions(permissions);
    setSelectedRoleName(roleName);
    setShowModal(true);
  };

  const handleDeleteRole = async (roleId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to restore this role easily!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.delete(`/Role/${roleId}`);

        if (response.data.success) {
          toast.success("Role deleted successfully!");
          fetchRoles();
        } else {
          toast.error(response.data.message || "Failed to delete role.");
        }
      } catch (error) {
        console.error(
          "Error deleting role:",
          error.response?.data || error.message
        );
        toast.error("An error occurred while deleting the role.");
      }
    }
    setOpenMenu(null);
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

  const handleReassignRole = () => {
    setShowAssignRoleModal(true);
  };

  const handleRemoveRoleClick = (userId, roleId) => {
    setRemoveRolePayload({ userId, roleId });
    setShowRemoveRoleModal(true);
    setOpenMenu(null);
  };

  const handleOpenAssignModal = (roleId) => {
    setSelectedRoleIdForPermission(roleId);
    setShowAssignModal(true);
  };

  const handleRemovePermission = () => {
    setShowRemovePermissionModal(true);
    setShowDropdown(false);
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

        <main className="flex-1 p-10 bg-white mx-8 my-5 rounded-xl shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-700">
              Manage Roles & Permissions
            </h2>

            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-5 py-2 rounded-md cursor-pointer font-medium shadow flex items-center space-x-2"
              >
                <span>Actions</span>
                <MdKeyboardArrowDown size={16} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    {canCreateRole && (
                      <button
                        onClick={() => {
                          setShowCreateModal(true);
                          setShowDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        + Create Role
                      </button>
                    )}

                    {canCreateRole && (
                      <button
                        onClick={() => {
                          if (roles && roles.length > 0) {
                            handleReassignRole(roles[0]);
                            setShowDropdown(false);
                          } else {
                            toast.error("No roles available to assign");
                            setShowDropdown(false);
                          }
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        + Assign Role
                      </button>
                    )}

                    {canCreateRole && (
                      <button
                        onClick={() => {
                          if (roles && roles.length > 0) {
                            handleOpenAssignModal(roles[0]?.role_Id);
                            setShowDropdown(false);
                          } else {
                            toast.error(
                              "No roles available to manage permissions"
                            );
                            setShowDropdown(false);
                          }
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        + Manage Permission
                      </button>
                    )}

                    {canCreateRole && (
                      <button
                        onClick={() => {
                          handleRemovePermission();
                          setShowDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        + Remove Permission
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {showRemovePermissionModal && (
            <RemovePermissionfromRole
              isOpen={showRemovePermissionModal}
              onClose={() => {
                setShowRemovePermissionModal(false);
                fetchRoles();
                fetchRolePermissions();
              }}
              roles={roles || []}
            />
          )}

          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Create New Role
                </h2>

                <input
                  type="text"
                  name="role_name"
                  value={newRole.role_name}
                  onChange={handleRoleInputChange}
                  placeholder="Enter role name"
                  className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg cursor-pointer bg-gray-300 text-gray-800 hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addRole}
                    className="px-4 py-2 rounded-lg cursor-pointer bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200 relative">
              <div className="min-h-[200px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Available Roles
              </h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                      No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                      Role Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                      Permissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roles && roles.length > 0 ? (
                    roles.map((role, index) => {
                      const rolePermissionList = rolePermissions.filter(
                        (permission) => permission.roleId === role.role_Id
                      );
                      return (
                        <tr
                          key={role.role_Id}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-4 text-gray-800 font-medium">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 text-gray-800 font-medium">
                            {role.role_name}
                          </td>
                          <td className="px-6 py-4 text-gray-800 font-medium">
                            {rolePermissionList.length > 0 ? (
                              <button
                                onClick={() =>
                                  handleViewPermissions(
                                    rolePermissionList.map(
                                      (p) => p.permissionName
                                    ),
                                    role.role_name
                                  )
                                }
                                className="text-gray-600 cursor-pointer hover:underline"
                              >
                                View Permissions
                              </button>
                            ) : (
                              "No permissions"
                            )}
                          </td>
                          {showModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs">
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
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                  Permissions for{" "}
                                  <span className="text-purple-600">
                                    {selectedRoleName}
                                  </span>
                                </h2>
                                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
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
                          <td className="px-6 py-4 text-center relative">
                            <div className="flex justify-left space-x-4">
                              <div
                                className="relative inline-block text-left"
                                ref={dropdownRef}
                              >
                                <button
                                  onClick={() =>
                                    setOpenMenu(
                                      openMenu === role.role_Id
                                        ? null
                                        : role.role_Id
                                    )
                                  }
                                  className="rounded-full border border-blue-500 w-10 h-10 flex items-center justify-center hover:bg-blue-50"
                                >
                                  <span className="text-blue-500 text-xl font-bold">
                                    ⋮
                                  </span>
                                </button>

                                <AnimatePresence>
                                  {openMenu === role.role_Id && (
                                    <motion.div
                                      initial={{
                                        opacity: 0,
                                        scale: 0.95,
                                        y: -10,
                                      }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                      transition={{ duration: 0.2 }}
                                      className="origin-top-right absolute right-0 w-56 shadow-lg bg-white ring-1 ring-gray-200 ring-opacity-5 z-20"
                                    >
                                      <div className="py-1">
                                        {canEditRole ||
                                        canDeleteRole ||
                                        canManagePermissions ? (
                                          <>
                                            {canEditRole && (
                                              <button
                                                onClick={() =>
                                                  handleEditClick(role)
                                                }
                                                className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                                              >
                                                Edit
                                              </button>
                                            )}
                                            {canDeleteRole && (
                                              <button
                                                onClick={() =>
                                                  handleDeleteRole(role.role_Id)
                                                }
                                                className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                                              >
                                                Delete
                                              </button>
                                            )}
                                            {canManagePermissions && (
                                              <button
                                                onClick={() =>
                                                  handleRemoveRoleClick(
                                                    null,
                                                    role.role_Id
                                                  )
                                                }
                                                className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                                              >
                                                Manage User Roles
                                              </button>
                                            )}
                                          </>
                                        ) : (
                                          <div className="px-4 py-2 text-center text-sm text-gray-500 italic">
                                            🚫 You are not authorized. Access
                                            Denied!
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>

                            {showAssignRoleModal && (
                              <AssignRoleToUserModal
                                onClose={() => setShowAssignRoleModal(false)}
                                fetchRoles={fetchRoles}
                              />
                            )}

                            {showRemoveRoleModal && (
                              <RemoveRoleFromUserModal
                                isOpen={showRemoveRoleModal}
                                payload={removeRolePayload}
                                onClose={() => setShowRemoveRoleModal(false)}
                                onSuccess={() => {
                                  fetchRoles();
                                  toast.success(
                                    "User roles updated successfully"
                                  );
                                }}
                              />
                            )}

                            {showAssignModal && (
                              <AssignPermissionModal
                                roleId={selectedRoleIdForPermission}
                                onClose={() => setShowAssignModal(false)}
                                roles={roles}
                              />
                            )}
                          </td>

                          {showEditModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                              <div className="bg-white rounded-xl border-2 border-gray-500 shadow-lg w-full max-w-md p-6 relative">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                  Edit Role
                                </h2>

                                <form onSubmit={handleEditSubmit}>
                                  <input
                                    type="hidden"
                                    name="id"
                                    value={roleToEdit?.role_Id || ""}
                                    placeholder="Role-Id"
                                    className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  />

                                  <input
                                    type="text"
                                    name="role_name"
                                    value={roleToEdit?.role_name || ""}
                                    onChange={handleInputChange}
                                    placeholder="Enter role name"
                                    className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  />

                                  <div className="flex justify-end space-x-2">
                                    <button
                                      onClick={() => setShowEditModal(false)}
                                      className="px-4 py-2 rounded-lg cursor-pointer bg-gray-300 text-gray-800 hover:bg-gray-400"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="submit"
                                      className="px-4 py-2 rounded-lg cursor-pointer bg-purple-600 text-white hover:bg-purple-700"
                                    >
                                      Update
                                    </button>
                                  </div>
                                </form>
                              </div>
                            </div>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-4 text-gray-500"
                      >
                        No roles found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}

export default Role;
