const AdmZip = require("adm-zip");

const zipPath = "plugin/wdesignkit.zip";
const extractPath = "plugin/extracted";

const zip = new AdmZip(zipPath);
zip.extractAllTo(extractPath, true);

console.log("Plugin extracted successfully");