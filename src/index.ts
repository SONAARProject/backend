import express from "express";
import * as bodyParser from "body-parser";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { searchByImageURL } from "./clarifai/search";
import { googleReverseSearch } from "./google/search";

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

app.post(
  "/clarifai/search",
  async function (req: express.Request, res: express.Response) {
    const result = await searchByImageURL(
      decodeURIComponent(req.body.image_url)
    );
    res.send(result);
  }
);

app.get(
  "/clarifai/search/:image_url",
  async function (req: express.Request, res: express.Response) {
    const result = await searchByImageURL(
      decodeURIComponent(req.params.image_url)
    );
    res.send(result);
  }
);

app.post(
  "/google/search/",
  async function (req: express.Request, res: express.Response) {
    const result = await googleReverseSearch(
      decodeURIComponent(req.body.image_url)
    );
    res.send(result);
  }
);

app.get(
  "/google/search/:image_url",
  async function (req: express.Request, res: express.Response) {
    const result = await googleReverseSearch(
      decodeURIComponent(req.params.image_url)
    );
    res.send(result);
  }
);

app.get("**", function (_, res: express.Response) {
  res.send("Invalid service");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT);
console.log("Listening on port " + PORT);
