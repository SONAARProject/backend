import { readFileSync } from "fs";
import { createConnection } from "mysql";
import franc from "franc-min";
import iso6393To1 from './iso-639-3-to-1';

const config = JSON.parse(readFileSync("../clarifai-db.json", "utf-8").trim());

async function getImageAlt(clarifaiId: string, lang: string): Promise<Array<any>> {
  const alts = await executeQuery(
    `SELECT
      i.ClarifaiConcepts,
      at.AltText,
      at.Keywords
    FROM 
      Image as i
      LEFT OUTER JOIN AltText as at ON at.ImageId = i.ImageId AND at.Language = "${lang}"
    WHERE 
      i.ClarifaiId = "${clarifaiId}"
    ORDER BY at.Counter DESC
    LIMIT 5`
  );
  return alts;
}

async function getImageConcepts(clarifaiId: string): Promise<Array<string>> {
  const concepts = await executeQuery(
    `SELECT
      ClarifaiConcepts
    FROM 
      Image
    WHERE 
      ClarifaiId = "${clarifaiId}"`
  );
  
  return concepts.length > 0 ? concepts[0].ClarifaiConcepts.split(",") : [];
}

async function insertImage(
  clarifaiId: string,
  concepts: Array<string>,
  text?: any
): Promise<void> {
  await executeQuery(
    `INSERT INTO Image (ClarifaiId, ClarifaiConcepts, Text, CreationDate) VALUES ("${clarifaiId}", "${concepts.join(
      ","
    )}", "${text?.phrases?.join("\n")}", "${new Date().toISOString().replace(/T/, " ").replace(/\..+/, "")}")`
  );
}

async function insertImageWithAlt(
  clarifaiId: string,
  alt: string,
  concepts: Array<string>,
  keywords: Array<string>,
  deviceLang?: string,
  postText?: string
): Promise<void> {
  await executeQuery(
    `INSERT INTO Image (ClarifaiId, ClarifaiConcepts, CreationDate) VALUES ("${clarifaiId}", "${concepts.join(
      ","
    )}", "${new Date().toISOString().replace(/T/, " ").replace(/\..+/, "")}")`
  );

  await addAltToImage(clarifaiId, alt, keywords, deviceLang, postText);
}

async function addAltToImage(
  clarifaiId: string,
  alt: string,
  keywords: Array<string>,
  deviceLang?: string,
  postText?: string
): Promise<void> {
  let lang = franc(alt);
  
  if (lang === 'und') {
    lang = franc(postText ?? '');
    if (lang === 'und') {
      lang = deviceLang ?? lang;
    }
  }

  const altText = await executeQuery(`
    SELECT * 
    FROM
      Image as i,
      AltText as at
    WHERE
      i.ClarifaiId = "${clarifaiId}" AND
      at.ImageId = i.ImageId AND
      at.AltText = "${alt.trim()}"
    LIMIT 1
  `);

  if (altText.length > 0) {
    await executeQuery(`
      UPDATE AltText SET Counter = "${parseInt(altText[0].Counter) + 1}" WHERE AltTextId = "${altText[0].AltTextId}"
    `);
  } else {
    await executeQuery(
      `
      INSERT INTO AltText (ImageId, AltText, Keywords, Language, CreationDate) 
      SELECT ImageId, "${alt.trim()}", "${keywords.join(
        ","
      )}", "${iso6393To1[lang]}", "${new Date().toISOString().replace(/T/, " ").replace(/\..+/, "")}" 
      FROM Image WHERE ClarifaiId = "${clarifaiId}"`
    );
  }
}

function executeQuery(query: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const connection = createConnection(config);
    connection.connect();

    connection.query(query, (err, res) => {
      connection.end();

      if (err) reject(err);
      else resolve(res);
    });
  });
}

export {
  getImageAlt,
  getImageConcepts,
  insertImage,
  insertImageWithAlt,
  addAltToImage,
};
