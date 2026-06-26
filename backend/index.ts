import { env } from "./src/config/env.ts";
import { app } from "./app.ts";

const PORT = Number(env.PORT) || 3001;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});
