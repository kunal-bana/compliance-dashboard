import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { PERMISSIONS, type Role } from "../config/permissions";

type Feature = keyof typeof PERMISSIONS;
type Action<F extends Feature> = keyof (typeof PERMISSIONS)[F];

export function usePermission<F extends Feature>(
  feature: F,
  action: Action<F>
): boolean {
  const role = useSelector((state: RootState) => state.auth.role);

  if (!role) return false;

  const allowedRoles = PERMISSIONS[feature][action] as readonly Role[];

  return allowedRoles.includes(role);
}