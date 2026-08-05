import { Router } from "express";
import { APP_CONFIG } from "../config/constants.js";

const router = Router();
router.get(APP_CONFIG.HEALTH_ROUTE, (req,res) => res.status(200).json({ success:true, data:{ status:"ok", service:APP_CONFIG.APP_NAME } }));
router.get(APP_CONFIG.VERSION_ROUTE, (req,res) => res.status(200).json({ success:true, data:{ name:APP_CONFIG.APP_NAME, version:APP_CONFIG.APP_VERSION } }));
export default router;
