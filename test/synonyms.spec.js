import { expect } from 'chai';
import { getSynonyms } from '../dist/lib/quality';

const words = ['radio', 'word', 'bus', 'bench', 'hero', 'fish', 'fox', 'topaz'];

describe("Testing SONAAR Backend server quality functions: synonyms", async function() {

    for (const word of words) {
        describe("Get synonyms of " + word, function() {
            it("Should have synonyms ", async function() {
                this.timeout(10 * 1000);

                const synonyms = await getSynonyms(word);
                console.log(synonyms);

                expect(synonyms).to.not.be.empty;
            });
        });
    }

});