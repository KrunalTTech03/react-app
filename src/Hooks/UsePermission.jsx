import { useEffect, useState } from "react";
import { getUserPermissions } from "../utils/permissions";

export const usePermissions = () => {
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    setPermissions(getUserPermissions());
  }, []);

  const hasPermission = (perm) => permissions.includes(perm);

  return { permissions, hasPermission };
};