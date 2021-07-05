import { expect } from 'chai';
import { calcAltTextQualityForImage } from '../dist/lib/quality';

const imageId = "ef0f456efced4547a1ebe6dd3d73024e"; //42
//const imageId = "1a181cb760b54eafadb324b874da01d1"; //48
//const imageId = "5a9057ae39e8410486a0e833214b3599"; //65
//const imageId = "79a26718d20b4d2bbb5189db91887d52"; //196
const altId = "55";

describe("Testing SONAAR Backend server quality functions", function() {

    describe("Get quality of description", function() {
        it("Should receive an answer", async function() {
            this.timeout(10 * 1000);

            const quality = await calcAltTextQualityForImage(imageId, altId);
            console.log("Quality:", quality);

            expect(quality).to.be.a('number');
        });
    });

});