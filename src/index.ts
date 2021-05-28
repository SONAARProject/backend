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
import {
  getTextFromImageURL,
  getTextFromImageBuffer,
  getTextFromImageBase64,
} from "./clarifai/ocr";
import {
  getImageAlt,
  getImageConcepts,
  getImageText,
  insertImage,
  insertImageWithAlt,
  addAltToImage,
  updateConsumption,
  updateAuthoring,
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
      await updateConsumption();

      let url = decodeURIComponent(req.params.imageUrl);

      const result = await searchByImageURL(url);
      const lang = req.params.lang;

      await search(result, lang, res, undefined, undefined, url);
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
      const type = req.body.type;

      if (type && type.trim().toLowerCase() === "authoring") {
        await updateAuthoring();
      } else if (type && type.trim().toLowerCase() === "consumption") {
        await updateConsumption();
      }

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
  base64?: string,
  url?: string
): Promise<void> {
  if (result && parseFloat(result["score"]) > SCORE_THRESHOLD) {
    const alts = await getImageAlt(result["id"], lang);

    if (alts.length > 0) {
      res.send({
        status: 1,
        message: "Image exists, alt text found.",
        alts: alts[0].AltText ? JSON.stringify(alts) : undefined,
        concepts: JSON.stringify(alts[0].ClarifaiConcepts),
        text: alts[0].Text ? decodeURIComponent(alts[0].Text) : undefined,
      });
    } else {
      const concepts = await getImageConcepts(result["id"]);
      const text = await getImageText(result["id"]);
      res.send({
        status: 2,
        message: "No alt text found.",
        concepts: JSON.stringify(concepts),
        text: text ? text : undefined,
      });
    }
  } else if (buffer) {
    const concepts = await getImageBufferConcepts(buffer);
    const clarifaiId = await uploadImageBuffer(buffer);
    const textResult = await getTextFromImageBuffer(buffer);
    await insertImage(clarifaiId, concepts, textResult);
    res.send({
      status: 3,
      message: "Image added with concepts.",
      concepts: JSON.stringify(concepts),
      text: textResult ? JSON.stringify(textResult) : undefined,
    });
  } else if (base64) {
    const concepts = await getImageBase64Concepts(base64);
    const clarifaiId = await uploadImageBase64(base64);
    const textResult = await getTextFromImageBase64(base64);
    await insertImage(clarifaiId, concepts, textResult);
    res.send({
      status: 3,
      message: "Image added with concepts.",
      concepts: JSON.stringify(concepts.join(", ")),
      text: textResult ? JSON.stringify(textResult) : undefined,
    });
  } else if (url) {
    const concepts = await getImageUrlConcepts(url);
    const clarifaiId = await uploadImageUrl(url);
    const textResult = await getTextFromImageURL(url);
    await insertImage(clarifaiId, concepts, textResult);
    res.send({
      status: 3,
      message: "Image added with concepts.",
      concepts: JSON.stringify(concepts.join(", ")),
      text: textResult ? JSON.stringify(textResult) : undefined,
    });
  }
}

app.post(
  "/clarifai/insertUrl",
  async function (req: express.Request, res: express.Response) {
    try {
      const imageUrl = decodeURIComponent(req.body.imageUrl);
      const lang = req.body.lang;
      const altText = decodeURIComponent(req.body.altText?.trim());
      const postText = decodeURIComponent(req.body.postText?.trim());

      if (imageUrl && altText) {
        const result = await searchByImageURL(imageUrl);
        const keywords = await getKeywords(altText);
        if (parseFloat(result.score) >= 0.99) {
          await addAltToImage(result.id, altText, keywords, lang, postText);
          res.send({ status: 1, message: "Image added successfully." });
        } else {
          const concepts = await getImageUrlConcepts(imageUrl);
          const clarifaiId = await uploadImageUrl(imageUrl);
          await insertImageWithAlt(
            clarifaiId,
            altText,
            concepts,
            keywords,
            lang,
            postText
          );
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
      const lang = req.body.lang;
      const altText = decodeURIComponent(req.body.altText?.trim());
      const postText = decodeURIComponent(req.body.postText?.trim());

      if (buffer && altText) {
        const result = await searchByImageBuffer(buffer);
        const keywords = await getKeywords(altText);
        if (parseFloat(result.score) >= 0.99) {
          await addAltToImage(result.id, altText, keywords, lang, postText);
          res.send({ status: 1, message: "Image added successfully." });
        } else {
          const concepts = await getImageBufferConcepts(buffer);
          const clarifaiId = await uploadImageBuffer(buffer);
          await insertImageWithAlt(
            clarifaiId,
            altText,
            concepts,
            keywords,
            lang,
            postText
          );
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
      const lang = req.body.lang;
      const altText = decodeURIComponent(req.body.altText?.trim());
      const postText = decodeURIComponent(req.body.postText?.trim());

      if (imageBytes && altText) {
        const result = await searchByImageBase64(imageBytes);
        const keywords = await getKeywords(altText);
        if (parseFloat(result.score) >= 0.99) {
          await addAltToImage(result.id, altText, keywords, lang, postText);
          res.send({ status: 1, message: "Image added successfully." });
        } else {
          const concepts = await getImageBase64Concepts(imageBytes);
          const clarifaiId = await uploadImageBase64(imageBytes);
          await insertImageWithAlt(
            clarifaiId,
            altText,
            concepts,
            keywords,
            lang,
            postText
          );
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
