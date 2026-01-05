import express from "express";
import cors from "cors";
import convertRoute from "./routes/convert.js";

const app = express();

app.use(cors());

app.use("/api/convert", convertRoute);

export default app;
