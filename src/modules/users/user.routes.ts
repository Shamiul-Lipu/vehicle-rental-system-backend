import { Router } from "express";
import { UsersControllers } from "./user.controller";
import auth from "../../middleware/auth";

const router = Router();

router.get("/", auth("admin"), UsersControllers.getUsers);

router.put("/:userId", auth("admin", "customer"), UsersControllers.updateUser);

router.delete("/:userId", auth("admin"), UsersControllers.deleteUser);

export const UsersRoutes = router;
