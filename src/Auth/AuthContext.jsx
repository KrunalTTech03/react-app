import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");

    if (authToken) {
      const userData = {
        id: localStorage.getItem("userId"),
        roles: [localStorage.getItem("Role_Name")],
        permissions: JSON.parse(
          localStorage.getItem("userPermissions") || "[]"
        ),
      };
      setUser(userData);
    }

    setLoading(false);
  }, []);

  const isLoggedIn = () => !!localStorage.getItem("authToken");

  const hasPermission = (permission) => user?.permissions?.includes(permission);

  const hasRole = (roles) => user?.roles?.some((role) => roles.includes(role));

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoggedIn,
        hasPermission,
        hasRole,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
