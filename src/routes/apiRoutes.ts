import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { UsersRoutes } from "../modules/users/user.routes";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/users", UsersRoutes);

export const allApiRoutes = router;
