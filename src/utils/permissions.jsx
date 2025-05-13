export const getUserPermissions = () => {
    const permissions = localStorage.getItem("userPermissions");
    try {
      return permissions ? JSON.parse(permissions) : [];
    } catch (err) {
      console.error("Invalid permission format in localStorage:", err);
      return [];
    }
  };