import fetch from "node-fetch";
import { getImageConcepts } from "./database";
import { readFileSync } from "fs";

const token = readFileSync("../dandelion.key", "utf-8").trim();

async function calcAltTextQualityForImage(clarifaiId: string, altText: string) {
    const imageConcepts = await getImageConcepts(clarifaiId);

    let totalConcepts = 0;
    let conceptsInAlt = 0;
    let synonymsInAlt = 0;
    let conceptString = "";
    for (const concept of imageConcepts) {
        conceptString += concept;
        conceptString += " ";
        totalConcepts++;
        if (isConceptInAlt(concept, altText)) {
            conceptsInAlt++;
        } else if (await isSynonymInAlt(concept, altText)) {
            synonymsInAlt++;
        }
    }
    const similarity = await getSimilarity(conceptString, altText);
    let penalty = 0;
    if (conceptsInAlt === totalConcepts) {
        penalty += 0.5;
    }
    if (altText.includes("The image may contain")) {
        penalty += 1;
    }
    const quality = similarity - penalty + (conceptsInAlt + synonymsInAlt) / totalConcepts;
    return quality;
}


function isConceptInAlt(concept: string, alt: string): boolean {
    const description = alt.toLowerCase();
    let found = description.includes(concept);
    if (!found) {
        found = checkPlurals(concept, description);
    }
    return found;
}

async function isSynonymInAlt(concept: string, alt: string): Promise<boolean> {
    const description = alt.toLowerCase();
    const synonymList = await getSynonyms(concept);
    for (const synonym of synonymList) {
        if (description.includes(synonym)) {
            return true;
        }
    }
    return false;
}

function checkPlurals(word: string, sentence: string): boolean {
    const plural = getPlural(word);
    return sentence.includes(plural);
}

function getPlural(word: string): string {
    if (word.length < 3) {
        return word;
    }
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const termination11 = ['s', 'x', 'z'];
    const termination12 = ['ss', 'ch', 'sh'];
    const termination13 = 'o';
    const termination14 = ['calf', 'half', 'leaf', 'loaf', 'self', 'sheaf', 'shelf', 'thief', 'wolf'];
    const termination15 = ['wife', 'life', 'knife']
    const termination16 = ['ief', 'oof', 'eef', 'ff', 'rf'];
    const lastChar = word.substr(word.length - 1, 1);
    const lastTwoChar = word.substr(word.length - 2, 2);
    const lastThreeChar = word.substr(word.length - 3, 3);
    const irregular = ['goose', 'foot', 'mouse', 'woman', 'louse', 'man', 'tooth', 'die', 'child', 'ox'];

    if (irregular.includes(word)) {
        return getIrregularPlural(word);
    } else if (termination11.includes(lastChar) || termination12.includes(lastTwoChar)) {
        return word + 'es';
    } else if (lastChar === termination13) {
        const beforeLastChar = word.substr(word.length - 2, 1);
        if (vowels.includes(beforeLastChar)) {
            return word + 's';
        } else {
            return word + 'es';
        }
    } else if (lastChar === 'y') {
        const beforeLastChar = word.substr(word.length - 2, 1);
        if (vowels.includes(beforeLastChar)) {
            return word + 's';
        } else {
            return word.substr(0, word.length - 1) + 'ies';
        }
    } else if (termination14.includes(word)) {
        return word.substr(0, word.length - 1) + 'ves';
    } else if (termination15.includes(word)) {
        return word.substr(0, word.length - 2) + 'ves';
    } else if (termination16.includes(lastTwoChar) || termination16.includes(lastThreeChar)) {
        return word + 's';
    } else {
        return word + 's';
    }
}

function getIrregularPlural(word: string): string {
    switch (word) {
        case 'goose': return 'geese';
        case 'foot': return 'feet';
        case 'mouse': return 'mice';
        case 'woman': return 'women';
        case 'louse': return 'lice';
        case 'man': return 'men';
        case 'tooth': return 'teeth';
        case 'die': return 'dice';
        case 'child': return 'children';
        case 'ox': return 'oxen';
    }
    return '';
}

async function getSynonyms(word: string): Promise<Array<string>> {
    let synonyms: string[] = [];
    const url = 'https://api.datamuse.com/words?ml=' + encodeURIComponent(word);
    const response: any = await (await fetch(url)).json();
    for (const entry of response) {
        if (entry.tags && entry.tags.includes("syn")) {
            synonyms.push(entry.word);
        }
    }
    return synonyms;
}

async function getSimilarity(text1: string, text2: string): Promise<number> {
    const url = 'https://api.dandelion.eu/datatxt/sim/v1/?text1=' + encodeURIComponent(text1) + '&text2=' + encodeURIComponent(text2) + '&lang=en&token=' + encodeURIComponent(token);
    const response: any = await (await fetch(url)).json();
    return response.similarity;
}

export {
    calcAltTextQualityForImage,
    getSynonyms
}