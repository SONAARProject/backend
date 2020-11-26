import { readFileSync } from "fs";
import { createConnection } from "mysql";

const config = JSON.parse(readFileSync("../clarifai-db.json", "utf-8").trim());

async function getImageAlt(clarifaiId: string): Promise<Array<string>> {
  const images = await executeQuery(
    `SELECT * from Images WHERE ClarifaiId = "${clarifaiId}"`
  );
  return images.map((img: any) => img.Alt);
}

async function insertImageWithAlt(
  clarifaiId: string,
  alt: string
): Promise<void> {
  await executeQuery(
    `INSERT INTO Images (ClarifaiId, Alt, CreationDate) VALUES ("${clarifaiId}", "${alt}", "${new Date()
      .toISOString()
      .replace(/T/, " ")
      .replace(/\..+/, "")}")`
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

export { getImageAlt, insertImageWithAlt };
