import { readFileSync } from "fs";
const apiKey = readFileSync("../clarifai-api.key", "utf-8").trim();
export default apiKey;
