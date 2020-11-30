import express from "express";
import * as bodyParser from "body-parser";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { searchByImageURL } from "./clarifai/search";
import { uploadImage } from "./clarifai/upload";
//import { googleReverseSearch } from "./google/search";
import { getImageAlt, insertImageWithAlt } from "./lib/database";

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

const SCORE_THRESHOLD = 0.9;

app.get(
  "/clarifai/search/:imageUrl",
  async function (req: express.Request, res: express.Response) {
    try {
      const result = await searchByImageURL(
        decodeURIComponent(req.params.imageUrl)
      );

      if (parseFloat(result.score) > SCORE_THRESHOLD) {
        const alts = await getImageAlt(result.id);

        if (alts.length > 0) {
          res.send({
            status: 1,
            message: "Image exists, alt text found.",
            alts: JSON.stringify(alts),
          });
        } else {
          res.send({ status: 2, message: "No alt text found." });
        }
      } else {
        res.send({ status: 3, message: "No image found." });
      }
    } catch (err) {
      console.error(err);
      res.send({ status: 4, message: "Unexpected error." });
    }
  }
);

app.post(
  "/clarifai/insert",
  async function (req: express.Request, res: express.Response) {
    try {
      const imageUrl = decodeURIComponent(req.body.imageUrl);
      const altText = req.body.altText?.trim();

      if (imageUrl && altText) {
        const result = await searchByImageURL(decodeURIComponent(imageUrl));

        if (parseFloat(result.score) === 1) {
          await insertImageWithAlt(result.id, altText);
          res.send({ status: 1, message: "Image added successfully." });
        } else {
          const clarifaiId = await uploadImage(imageUrl);
          await insertImageWithAlt(clarifaiId, altText);
          res.send({ status: 1, message: "Image added successfully." });
        }
      } else {
        res.send({ status: 2, message: "Invalid image url or alt text." });
      }
    } catch (err) {
      console.error(err);
      res.send({ status: 4, message: "Unexpected error." });
    }
  }
);

app.get(
  "/test/search/:imageUrl",
  async function (req: express.Request, res: express.Response) {
    const result = await searchByImageURL(
      decodeURIComponent(req.params.imageUrl)
    );

    res.send(result);
  }
);

/*app.get(
  "/google/search/:image_url",
  async function (req: express.Request, res: express.Response) {
    const result = await googleReverseSearch(
      decodeURIComponent(req.params.image_url)
    );
    res.send(result);
  }
);*/

app.get("**", function (_, res: express.Response) {
  res.send("Invalid service");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT);
console.log("Listening on port " + PORT);
