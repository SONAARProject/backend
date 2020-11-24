import { searchByImageURL } from "./search";
//import clarifyUpload from "./upload";
import express from "express";
import * as bodyParser from "body-parser";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";

const app = express();

app.use(helmet());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(compression());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
  })
);

//upload
//clarifyUpload.uploadUrls("./upload.txt");

//url example
// searchByImageURL("https://images-gmi-pmc.edge-generalmills.com/cbc3bd78-8797-4ac9-ae98-feafbd36aab7.jpg")

app.post("/search", async function (req, res) {
  const result = await searchByImageURL(req.body.image_url);
  res.send(result);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT);
console.log("Listening on port " + PORT);
