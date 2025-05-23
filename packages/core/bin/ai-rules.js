#!/usr/bin/env node
import("../dist/index.js")
    .then((mod) => mod.run())
    .catch((err) => {
        console.error("Failed to run AI Rules script:", err);
        process.exit(1);
    });
