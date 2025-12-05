import { Router } from "express";
import { AuthControllers } from "./auth.controller";

const router = Router();

router.post("/signup", AuthControllers.registerUser);

router.post("/signin", AuthControllers.loginUser);

export const AuthRoutes = router;
