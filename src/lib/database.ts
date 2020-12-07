import { readFileSync } from "fs";
import { createConnection } from "mysql";

const config = JSON.parse(readFileSync("../clarifai-db.json", "utf-8").trim());

async function getImageAlt(clarifaiId: string): Promise<Array<string>> {
  const alts = await executeQuery(
    `SELECT
      i.ClarifaiConcepts,
      at.AltText,
      at.Keywords
    FROM 
      Image as i
      LEFT OUTER JOIN AltText as at ON at.ImageId = i.ImageId
    WHERE 
      i.ClarifaiId = "${clarifaiId}"`
  );
  return alts;
}

async function insertImageWithAlt(
  clarifaiId: string,
  alt: string,
  concepts: Array<string>,
  keywords: Array<string>
): Promise<void> {
  await executeQuery(
    `INSERT INTO Image (ClarifaiId, ClarifaiConcepts, CreationDate) VALUES ("${clarifaiId}", "${concepts.join(
      ","
    )}", "${new Date().toISOString().replace(/T/, " ").replace(/\..+/, "")}")`
  );

  await addAltToImage(clarifaiId, alt, keywords);
}

async function addAltToImage(
  clarifaiId: string,
  alt: string,
  keywords: Array<string>
): Promise<void> {
  await executeQuery(
    `
    INSERT INTO AltText (ImageId, AltText, Keywords, CreationDate) 
    SELECT ImageId, "${alt}", "${keywords.join(
      ","
    )}", "${new Date().toISOString().replace(/T/, " ").replace(/\..+/, "")}" 
    FROM Image WHERE ClarifaiId = "${clarifaiId}"`
  );
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

export { getImageAlt, insertImageWithAlt, addAltToImage };
