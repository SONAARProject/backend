import express from "express";
import * as bodyParser from "body-parser";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import {
  searchByImageURL,
  searchByImageBase64,
  getImageConcepts,
} from "./clarifai/search";
import { uploadImage } from "./clarifai/upload";
import { getImageAlt, insertImageWithAlt, addAltToImage } from "./lib/database";
import getKeywords from "./lib/getKeywords";

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
  "/clarifai/search/",
  async function (req: express.Request, res: express.Response) {
    try {
      const result = await searchByImageBase64(req.body.imageBase64);

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
        const result = await searchByImageURL(imageUrl);
        const keywords = await getKeywords(altText);
        if (parseFloat(result.score) === 1) {
          await addAltToImage(result.id, altText, keywords);
          res.send({ status: 1, message: "Image added successfully." });
        } else {
          const concepts = await getImageConcepts(imageUrl);
          const clarifaiId = await uploadImage(imageUrl);
          await insertImageWithAlt(clarifaiId, altText, concepts, keywords);
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
    if (process.env.NODE_ENV !== "production") {
      try {
        const result = await searchByImageURL(
          decodeURIComponent(req.params.imageUrl)
        );
        res.send({ result });
      } catch (err) {
        console.error(err);
        res.send("Error");
      }
    } else {
      res.send("Invalid service");
    }
  }
);

app.get("**", function (_, res: express.Response) {
  res.send("Invalid service");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT);
console.log("Listening on port " + PORT);
