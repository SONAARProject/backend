import { readFileSync } from "fs";
import { createConnection } from "mysql";
import franc from "franc-min";
import iso6393To1 from "./iso-639-3-to-1";
import { calcAltTextQualityForImage } from "./quality"

const config = JSON.parse(readFileSync("../clarifai-db.json", "utf-8").trim());

async function getImageAlt(
    clarifaiId: string,
    lang: string
): Promise<Array<any>> {
    const alts = await executeQuery(
        `SELECT
      i.ClarifaiConcepts,
      i.Text,
      at.AltText,
      at.Keywords,
      at.Counter,
      at.Quality
    FROM 
      Image as i
      LEFT OUTER JOIN AltText as at ON at.ImageId = i.ImageId AND at.Language = "${lang}"
    WHERE 
      i.ClarifaiId = "${clarifaiId}"
    ORDER BY at.Counter DESC
    LIMIT 5`
    );
    return sortAlts(alts);
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

async function getImageText(clarifaiId: string): Promise<any> {
    const text = await executeQuery(
        `SELECT
      Text
    FROM 
      Image
    WHERE 
      ClarifaiId = "${clarifaiId}"`
    );

    return text.length > 0 ? decodeURIComponent(text[0].Text) : {};
}

async function insertImage(
    clarifaiId: string,
    concepts: Array<string>,
    text?: any
): Promise<void> {
    await executeQuery(
        `INSERT INTO Image (ClarifaiId, ClarifaiConcepts, Text, CreationDate) VALUES ("${clarifaiId}", "${concepts.join(
            ","
        )}", "${text ? encodeURIComponent(JSON.stringify(text)) : null
        }", "${new Date().toISOString().replace(/T/, " ").replace(/\..+/, "")}")`
    );
}

async function insertImageWithAlt(
    clarifaiId: string,
    alt: string,
    concepts: Array<string>,
    keywords: Array<string>,
    deviceLang?: string,
    postText?: string,
    userId?: string | null
): Promise<number> {
    await executeQuery(
        `INSERT INTO Image (ClarifaiId, ClarifaiConcepts, CreationDate) VALUES ("${clarifaiId}", "${concepts.join(
            ","
        )}", "${new Date().toISOString().replace(/T/, " ").replace(/\..+/, "")}")`
    );

    return await addAltToImage(clarifaiId, alt, keywords, deviceLang, postText, userId);
}

async function addAltToImage(
    clarifaiId: string,
    alt: string,
    keywords: Array<string>,
    deviceLang?: string,
    postText?: string,
    userId?: string | null
): Promise<number> {
    let lang = franc(alt);

    if (lang === "und") {
        lang = franc(postText ?? "");
        if (lang === "und") {
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
          UPDATE AltText SET Counter = "${parseInt(altText[0].Counter) + 1
            }" WHERE AltTextId = "${altText[0].AltTextId}"`
        );
        return 0;
    } else {
        await executeQuery(`
          INSERT INTO AltText (ImageId, AltText, Keywords, Language, UserId, CreationDate) 
          SELECT ImageId, "${alt.trim()}", "${keywords.join(",")}", "${iso6393To1[lang]
            }", "${userId}", "${new Date().toISOString().replace(/T/, " ").replace(/\..+/, "")}" 
          FROM Image WHERE ClarifaiId = "${clarifaiId}"`
        );
        const newAltTextId = await executeQuery(`SELECT MAX(AltTextId) FROM AltText`);
        const quality = await calcAltTextQualityForImage(clarifaiId, newAltTextId);
        await executeQuery(`
            UPDATE AltText SET Quality = '${quality}' WHERE AltTextId = '${newAltTextId}}';
        `);
        return 1;
    }
}

async function getAltText(altTextId: string): Promise<string> {
    const query = `SELECT AltText FROM AltText as at WHERE at.AltTextId = "${altTextId}"`;
    const altText = await executeQuery(query);
    return altText.length > 0 ? altText[0].AltText : "";
}

function sortAlts(alts: Array<any>): Array<any> {
    const totalCounts = alts.reduce(function(prev, curr) {
        return prev + curr.Counter;
    }, 0);
    return alts.sort((elemA, elemB) => {
        const wA = ((elemA.Counter / totalCounts) + elemA.Quality) / 2;
        const wB = ((elemB.Counter / totalCounts) + elemB.Quality) / 2;
        return wB - wA;
    });
}

async function updateConsumption(): Promise<void> {
    await executeQuery(
        `UPDATE Counter SET Consumption = Consumption + 1, ConsumptionLastUpdated = NOW()`
    );
}

async function updateAuthoring(): Promise<void> {
    await executeQuery(
        `UPDATE Counter SET Authoring = Authoring + 1, AuthoringLastUpdated = NOW()`
    );
}

async function updateSuggestion(): Promise<void> {
    await executeQuery(
        `UPDATE Counter SET Suggestion = Suggestion + 1, SuggestionLastUpdated = NOW()`
    );
}

async function updateLog(userId: string, platform: string, type: string, socialMedia: string | null, altText: number): Promise<void> {
    await executeQuery(`
    INSERT INTO Log (UserId, Platform, SocialMedia, RequestType, AltTextContribution, CreationDate) VALUES ("${userId}", "${platform}", "${socialMedia}", "${type}", "${altText}", NOW())
  `);
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
    getImageText,
    insertImage,
    insertImageWithAlt,
    addAltToImage,
    getAltText,
    updateConsumption,
    updateAuthoring,
    updateSuggestion,
    updateLog
};
