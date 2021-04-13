import express from "express";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import {
  searchByImageURL,
  searchByImageBuffer,
  searchByImageBase64,
  getImageUrlConcepts,
  getImageBufferConcepts,
  getImageBase64Concepts,
} from "./clarifai/search";
import {
  uploadImageUrl,
  uploadImageBuffer,
  uploadImageBase64,
} from "./clarifai/upload";
/*import {
  getTextFromImageURL,
  getTextFromImageBuffer,
  getTextFromImageBase64,
} from "./clarifai/ocr";*/
import {
  getImageAlt,
  getImageConcepts,
  insertImage,
  insertImageWithAlt,
  addAltToImage,
} from "./lib/database";
import getKeywords from "./lib/getKeywords";

const app = express();

app.use(helmet());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(compression());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
  })
);

const SCORE_THRESHOLD = 0.9;

app.get(
  "/clarifai/search/:lang/:imageUrl",
  async function (req: express.Request, res: express.Response) {
    try {
      const result = await searchByImageURL(
        decodeURIComponent(req.params.imageUrl)
      );
      const lang = req.params.lang;

      await search(result, lang, res);
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
      let result = null;
      const lang = req.body.lang;
      let buffer: Buffer | undefined = undefined;
      if (req.body.imageBuffer) {
        buffer = Buffer.from(
          //@ts-ignore
          Object.values<number>(JSON.parse(req.body.imageBuffer))
        );
        result = await searchByImageBuffer(buffer);
      } else {
        result = await searchByImageBase64(req.body.imageBase64);
      }
      
      await search(result, lang, res, buffer, req.body.imageBase64);
    } catch (err) {
      console.error(err);
      res.send({ status: 4, message: "Unexpected error." });
    }
  }
);

async function search(
  result: any,
  lang: string,
  res: express.Response,
  buffer?: Buffer,
  base64?: string
): Promise<void> {
  if (result && parseFloat(result["score"]) > SCORE_THRESHOLD) {
    const alts = await getImageAlt(result["id"], lang);

    if (alts.length > 0) {
      res.send({
        status: 1,
        message: "Image exists, alt text found.",
        alts: alts[0].AltText ? JSON.stringify(alts) : undefined,
        concepts: JSON.stringify(alts[0].ClarifaiConcepts),
      });
    } else {
      const concepts = getImageConcepts(result["id"]);
      res.send({
        status: 2,
        message: "No alt text found.",
        concepts: JSON.stringify(concepts),
      });
    }
  } else if (buffer) {
    const concepts = await getImageBufferConcepts(buffer);
    const clarifaiId = await uploadImageBuffer(buffer);
    await insertImage(clarifaiId, concepts);
    res.send({
      status: 3,
      message: "Image added with concepts.",
      concepts: JSON.stringify(concepts),
    });
  } else if (base64) {
    const concepts = await getImageBase64Concepts(base64);
    const clarifaiId = await uploadImageBase64(base64);
    await insertImage(clarifaiId, concepts);
    res.send({
      status: 3,
      message: "Image added with concepts.",
      concepts: JSON.stringify(concepts.join(', ')),
    });
  }
}

app.post(
  "/clarifai/insertUrl",
  async function (req: express.Request, res: express.Response) {
    try {
      const imageUrl = decodeURIComponent(req.body.imageUrl);
      const altText = req.body.altText?.trim();

      if (imageUrl && altText) {
        const result = await searchByImageURL(imageUrl);
        const keywords = await getKeywords(altText);
        if (parseFloat(result.score) >= 0.99) {
          await addAltToImage(result.id, altText, keywords);
          res.send({ status: 1, message: "Image added successfully." });
        } else {
          const concepts = await getImageUrlConcepts(imageUrl);
          const clarifaiId = await uploadImageUrl(imageUrl);
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

app.post(
  "/clarifai/insertBuffer",
  async function (req: express.Request, res: express.Response) {
    try {
      const buffer = Buffer.from(
        //@ts-ignore
        Object.values<number>(JSON.parse(req.body.imageBuffer))
      );
      const altText = decodeURIComponent(req.body.altText?.trim());

      if (buffer && altText) {
        const result = await searchByImageBuffer(buffer);
        const keywords = await getKeywords(altText);
        if (parseFloat(result.score) >= 0.99) {
          await addAltToImage(result.id, altText, keywords);
          res.send({ status: 1, message: "Image added successfully." });
        } else {
          const concepts = await getImageBufferConcepts(buffer);
          const clarifaiId = await uploadImageBuffer(buffer);
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

app.post(
  "/clarifai/insertBase64",
  async function (req: express.Request, res: express.Response) {
    try {
      const imageBytes = req.body.imageBase64;
      const altText = decodeURIComponent(req.body.altText?.trim());

      if (imageBytes && altText) {
        const result = await searchByImageBase64(imageBytes);
        const keywords = await getKeywords(altText);
        if (parseFloat(result.score) >= 0.99) {
          await addAltToImage(result.id, altText, keywords);
          res.send({ status: 1, message: "Image added successfully." });
        } else {
          const concepts = await getImageBase64Concepts(imageBytes);
          const clarifaiId = await uploadImageBase64(imageBytes);
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

const PORT = process.env.PORT || 3001;

app.listen(PORT);
console.log("Listening on port " + PORT);
