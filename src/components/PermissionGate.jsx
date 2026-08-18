import { useAuth } from "../context/AuthContext";

export default function PermissionGate({
  permission,
  children,
  fallback = null,
}) {
  const { user } = useAuth();

  if (!permission) {
    return children;
  }

  const roles =
    user?.roles || [];

  const isSuperAdmin =
    roles.some((role) => {
      const value =
        typeof role === "string"
          ? role
          : role?.slug ||
            role?.name;

      return value === "super_admin";
    }) ||
    user?.role === "super_admin" ||
    user?.role?.slug ===
      "super_admin";

  if (isSuperAdmin) {
    return children;
  }

  const permissions =
    user?.permissions ||
    user?.permissionSlugs ||
    [];

  const allowed =
    permissions.some((item) => {
      const value =
        typeof item === "string"
          ? item
          : item?.slug ||
            item?.name;

      return value === permission;
    });

  return allowed
    ? children
    : fallback;
}