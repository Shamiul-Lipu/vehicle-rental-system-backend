export const allowedRoles = ["admin", "customer"] as const;

export type UserRole = (typeof allowedRoles)[number];
