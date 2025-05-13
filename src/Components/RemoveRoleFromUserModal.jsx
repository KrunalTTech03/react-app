import React from "react";
import { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import toast from "react-hot-toast";

const RemoveRoleFromUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [usersWithRoles, setUsersWithRoles] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedRole) {
      fetchUsersByRoleId(selectedRole.role_Id);
    }
  }, [selectedRole]);

  useEffect(() => {
    if (searchTerm.trim() !== "") {
      filterUsersBySearchTerm();
    } else if (usersWithRoles.length > 0) {
      setFilteredUsers(usersWithRoles);
    }
  }, [searchTerm, usersWithRoles]);

  const fetchRoles = async () => {
    setLoadingData(true);
    try {
      const response = await axiosInstance.get("/Role/");
      if (response.data && response.data.data) {
        setRoles(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to fetch roles");
    } finally {
      setLoadingData(false);
    }
  };

  const fetchUsersByRoleId = async (role_Id) => {
    setLoadingData(true);
    setFilteredUsers([]);
    try {
      const response = await axiosInstance.post("/Role/all-assigned-role", { roleID: role_Id });
  
      if (response.data && response.data.data) {
        setUsersWithRoles(response.data.data);
        setFilteredUsers(response.data.data);
      } else {
        setUsersWithRoles([]);
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users by role:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoadingData(false);
    }
  };
  

  const filterUsersBySearchTerm = () => {
    if (!usersWithRoles.length) return;

    const searchFiltered = usersWithRoles.filter(
      (user) =>
        (user.firstName?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (user.lastName?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (user.email?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        )
    );

    setFilteredUsers(searchFiltered);
  };

  const handleRemoveRole = async () => {
    if (!selectedRole || !selectedUser) {
      toast.error("Please select both a role and a user");
      return;
    }
  
    setLoading(true);
    try {
      const response = await axiosInstance.delete("/Role/remove", {
        data: {
          userId: selectedUser.id || selectedUser.userId,
          roleId: selectedRole.role_Id,
        },
      });
  
      if (response.data.success || response.status === 200) {
        toast.success(
          `Role "${selectedRole.role_name}" removed from user successfully`
        );
  
        fetchUsersByRoleId(selectedRole.role_Id);
  
        setSelectedUser(null);
  
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Error removing role:", error);
      toast.error(error.response?.data?.message || "Failed to remove role");
    } finally {
      setLoading(false);
    }
  };  
  
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setSelectedUser(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Remove User Role
        </h2>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
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

        {loadingData && !roles.length ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Available Roles
              </h3>

              <div className="max-h-96 overflow-y-auto pr-2">
                {roles.map((role) => (
                  <div
                    key={role.role_Id}
                    className={`p-4 mb-2 rounded-lg cursor-pointer transition-all ${
                      selectedRole?.role_Id === role.role_Id
                        ? "bg-blue-100 border-l-4 border-blue-500"
                        : "bg-white hover:bg-gray-100 border border-gray-200"
                    }`}
                    onClick={() => handleRoleSelect(role)}
                  >
                    <div className="font-medium text-lg">{role.role_name}</div>
                  </div>
                ))}

                {roles.length === 0 && !loadingData && (
                  <div className="text-center py-8 text-gray-500">
                    No roles available
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              {selectedRole ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    Users with "{selectedRole.role_name}" Role
                  </h3>
                  
                  <div className="mb-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="absolute left-3 top-2.5 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Select a role to see assigned users
                </h3>
              )}

              {selectedRole ? (
                loadingData ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto pr-2">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id || user.userId}
                        className={`p-4 mb-2 rounded-lg cursor-pointer transition-all flex items-center ${
                          selectedUser?.Id === user.Id ||
                          selectedUser?.Id === user.Id
                            ? "bg-blue-100 border-l-4 border-blue-500"
                            : "bg-white hover:bg-gray-100 border border-gray-200"
                        }`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-lg font-semibold">
                          {user.firstName?.charAt(0) ||
                            user.email?.charAt(0) ||
                            "?"}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.firstName || "Unnamed User"}
                          </div>
                          {user.email && (
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          )}
                          {user.Roles && user.Roles.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {user.Roles.map((role) => (
                                <span
                                  key={role.role_Id}
                                  className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                                >
                                  {role.role_name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {(selectedUser?.id === user.id ||
                          selectedUser?.userId === user.userId) && (
                          <div className="text-blue-500">
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}

                    {filteredUsers.length === 0 && !loadingData && (
                      <div className="text-center py-8 text-gray-500">
                        {searchTerm.trim() !== ""
                          ? "No matching users found"
                          : "No users have been assigned this role"}
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <p>Select a role from the left panel</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleRemoveRole}
            disabled={loading || !selectedRole || !selectedUser}
            className={`px-5 py-2 rounded-lg font-medium flex items-center ${
              loading || !selectedRole || !selectedUser
                ? "bg-red-300 cursor-not-allowed text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {loading && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {loading ? "Removing..." : "Remove Role from User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveRoleFromUserModal;