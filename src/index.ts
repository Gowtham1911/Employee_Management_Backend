import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import employeeRoutes from "./routes/employees";

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    const allowed = process.env.FRONTEND_URL;
    if (!origin || !allowed || origin === allowed || origin.startsWith(allowed)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));

app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
