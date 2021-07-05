import { expect } from 'chai';
import { getPlural } from '../dist/lib/quality';

const words = {
    'word': 'words',
    'bus': 'buses',
    'bench': 'benches',
    'hero': 'heroes',
    'radio': 'radios',
    'fish': 'fishes',
    'fox': 'foxes',
    'topaz': 'topazes',
    'glass': 'glasses',
    'city': 'cities',
    'day': 'days',
    'self': 'selves',
    'knife': 'knives',
    'gulf': 'gulfs',
    'child': 'children'
}

describe("Testing SONAAR Backend server quality functions: plurals", function() {

    for (const word in words) {
        if (Object.hasOwnProperty.call(words, word)) {
            const plural = words[word];

            describe("Get plural of " + word, function() {
                it("Should be equal to " + plural, async function() {
                    this.timeout(10 * 1000);

                    const result = getPlural(word);

                    expect(result).to.equal(plural);
                });
            });

        }
    }

});