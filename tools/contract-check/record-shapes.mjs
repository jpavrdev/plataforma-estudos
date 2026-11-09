// Preload for the integration suite: records the shape of every JSON response
// (method, route pattern, status and each key path with its type), so a rename
// that changes the API contract shows up as a diff between two runs.
// Usage: NODE_OPTIONS="--import <this file>" SHAPES_OUT=<file> SHAPES_BACKEND=<backend dir>
import fs from "node:fs";
import { createRequire } from "node:module";

const out = process.env.SHAPES_OUT;
const backend = process.env.SHAPES_BACKEND;

if (out && backend) {
    const require = createRequire(`${backend}/package.json`);
    const express = require("express");
    const original = express.response.json;

    const shape = (value, path, lines, depth) => {
        if (depth > 8) return;
        if (value === null || value === undefined) {
            lines.add(`${path}:null`);
        } else if (Array.isArray(value)) {
            lines.add(`${path}:array`);
            for (const item of value.slice(0, 25)) shape(item, `${path}[]`, lines, depth + 1);
        } else if (value instanceof Date) {
            lines.add(`${path}:string`);
        } else if (typeof value === "object") {
            lines.add(`${path}:object`);
            for (const key of Object.keys(value)) shape(value[key], `${path}.${key}`, lines, depth + 1);
        } else {
            lines.add(`${path}:${typeof value}`);
        }
    };

    express.response.json = function (body) {
        try {
            const route = this.req?.route?.path ?? "NO_ROUTE";
            const prefix = `${this.req?.method} ${route} ${this.statusCode}`;
            const lines = new Set();
            shape(JSON.parse(JSON.stringify(body ?? null)), "$", lines, 0);
            fs.appendFileSync(out, [...lines].map((l) => `${prefix} ${l}`).join("\n") + "\n");
        } catch (e) {
            console.error("shape recorder failed", e);
        }
        return original.call(this, body);
    };
}
