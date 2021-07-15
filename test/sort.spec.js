import { expect } from 'chai';
import { getImageAlt } from '../dist/lib/database';

const imageId = "ef0f456efced4547a1ebe6dd3d73024e"; //42
//const imageId = "1a181cb760b54eafadb324b874da01d1"; //48
const lang = "en";

describe("Testing SONAAR Backend server quality functions: sorting alts", async function() {

    describe("Get sorted descriptions", function() {
        it("Should sort", async function() {
            this.timeout(10 * 1000);

            const alts = await getImageAlt(imageId, lang);
            console.log(alts);

            expect(alts).to.not.be.empty;
        });
    });

});