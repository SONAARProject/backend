import fs from "fs";
const apiKey = fs.readFileSync("../api.key", "utf-8").trim();
export default apiKey;
