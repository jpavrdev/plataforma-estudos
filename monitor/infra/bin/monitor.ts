import path from "node:path";
import { App } from "aws-cdk-lib";
import { lerContexto } from "../src/contexto.ts";
import { MonitorStack } from "../src/monitor-stack.ts";

const app = new App();

new MonitorStack(app, "MonitorStack", {
    ...lerContexto(app.node),
    raizDoMonitor: path.resolve(import.meta.dirname, "..", ".."),
});
