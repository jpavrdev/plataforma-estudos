import express from "express";
import type { Request, Response } from "express";

const app = express();

app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok" });
});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});