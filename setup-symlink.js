const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "docs");
const link = path.join(__dirname, "dsf-assessment-checklist");

if (!fs.existsSync(link)) {
  try {
    if (process.platform === "win32") {
      fs.symlinkSync(target, link, "junction"); // Windows (Junction works for directories)
    } else {
      fs.symlinkSync(target, link, "dir"); // macOS/Linux
    }
    console.log("Symlink created: dsf-assessment-checklist → docs");
  } catch (err) {
    console.error("Failed to create symlink:", err);
  }
} else {
  console.log("Symlink already exists.");
}
