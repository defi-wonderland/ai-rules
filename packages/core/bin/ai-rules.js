#!/usr/bin/env node
// The above shebang directive tells the system to use the node interpreter found in the user's PATH to run the script
import("../dist/index.js")
    .then((mod) => mod.run())
    .catch((err) => {
        console.error("Failed to run AI Rules script:", err);
        process.exit(1);
    });
