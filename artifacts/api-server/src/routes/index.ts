import { Router, type IRouter } from "express";
import healthRouter from "./health";
import casesRouter from "./cases";
import statsRouter from "./stats";
import investigateRouter from "./investigate";
import adminRouter from "./admin";
import leaderboardRouter from "./leaderboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(casesRouter);
router.use(statsRouter);
router.use(investigateRouter);
router.use(adminRouter);
router.use(leaderboardRouter);

export default router;
