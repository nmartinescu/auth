import express from "express";
import loginRouter from "./login.js";
import registerRouter from "./register.js";
import passwordRouter from "./password.js";
import accountRouter from "./account.js";
import refreshRouter from "./refresh.js";

const router = express.Router();

// Mount sub-routes
router.use("/login", loginRouter);
router.use("/register", registerRouter);
router.use("/password", passwordRouter);
router.use("/account", accountRouter);
router.use("/refresh", refreshRouter);

export default router;