import express from "express";
import { getFaqAnswer  } from "../controllers/aiController.js";

const router = express.Router();

router.post("/ask", getFaqAnswer );

export default router;
