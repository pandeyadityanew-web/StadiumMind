const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log("=== StadiumMind CI/CD Build & Accessibility Validation ===");

try {
    // 1. Verify files exist
    const projectRoot = path.join(__dirname, '..', '..');
    const layoutPath = path.join(projectRoot, 'src', 'app', 'layout.tsx');
    const globalsCssPath = path.join(projectRoot, 'src', 'app', 'globals.css');
    const postcssConfigPath = path.join(projectRoot, 'postcss.config.js');
    const tailwindConfigPath = path.join(projectRoot, 'tailwind.config.js');

    console.log("Checking critical file presence...");
    assert.ok(fs.existsSync(layoutPath), "layout.tsx is missing!");
    assert.ok(fs.existsSync(globalsCssPath), "globals.css is missing!");
    assert.ok(fs.existsSync(postcssConfigPath), "postcss.config.js is missing!");
    assert.ok(fs.existsSync(tailwindConfigPath), "tailwind.config.js is missing!");
    console.log("✓ All critical configuration files present.");

    // 2. Verify globals.css contains tailwind base directives
    console.log("Checking globals.css contents...");
    const globalsCssContent = fs.readFileSync(globalsCssPath, 'utf8');
    assert.ok(globalsCssContent.includes('@tailwind base'), "globals.css does not import tailwind base!");
    assert.ok(globalsCssContent.includes('@tailwind components'), "globals.css does not import tailwind components!");
    assert.ok(globalsCssContent.includes('@tailwind utilities'), "globals.css does not import tailwind utilities!");
    console.log("✓ globals.css contains correct Tailwind directives.");

    // 3. Verify tailwind.config.js has correct content paths
    console.log("Checking tailwind.config.js content paths...");
    const tailwindConfigContent = fs.readFileSync(tailwindConfigPath, 'utf8');
    assert.ok(tailwindConfigContent.includes('src/app'), "tailwind.config.js does not scan src/app!");
    console.log("✓ tailwind.config.js content directories correct.");

    console.log("=== All CI/CD checks passed successfully ===");
    process.exit(0);

} catch (err) {
    console.error("❌ CI/CD Validation Failed:", err.message);
    process.exit(1);
}
