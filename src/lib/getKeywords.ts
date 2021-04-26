import retext from "retext";
import pos from "retext-pos";
import keywords from "retext-keywords";
import { toString } from "nlcst-to-string";

function getKeywords(text: string): Promise<Array<string>> {
  return new Promise((resolve, reject) => {
    retext()
      .use(pos) // Make sure to use `retext-pos` before `retext-keywords`.
      .use(keywords)
      .process(text, function (err: any, file: any) {
        const keywordsFound = new Array<string>();
        if (err) {
          reject(err);
        } else {
          file.data.keywords.forEach(function (keyword: any) {
            const words = keyword.matches[0].node.children.map(
              (c: any) => c.value
            );
            for (const word of words || []) {
              if (!keywordsFound.includes(word.trim())) {
                keywordsFound.push(word.trim());
              }
            }
          });

          file.data.keyphrases.forEach(function (phrase: any) {
            const completePhrase = phrase.matches[0].nodes
              .map(stringify)
              .join("");
            function stringify(value: any) {
              return toString(value);
            }

            if (!keywordsFound.includes(completePhrase.trim())) {
              keywordsFound.push(completePhrase.trim());
            }
          });

          resolve(keywordsFound);
        }
      });
  });
}

export default getKeywords;
