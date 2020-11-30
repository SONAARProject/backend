import { expect } from 'chai';
import fetch from 'node-fetch';

const directory = process.argv[3];

const segments = directory.split('.');
const extension = '.' + segments[segments.length - 1];

describe("Testing SONAAR Backend server samples", function() {

  let ORIGINAL_IMAGE_ID = null;

  before(async function() {
    this.timeout(10 * 1000);
    const url = "http://localhost:8080/" + directory + "/original" + extension;
    const result = await (await fetch("http://localhost:3000/test/search/" + encodeURIComponent(url))).json();
    
    ORIGINAL_IMAGE_ID = result.id;
  });

  describe("Resize 80%", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://localhost:8080/" + directory + "/resize-80" + extension;
      const result = await (await fetch("http://localhost:3000/test/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(ORIGINAL_IMAGE_ID);
    });
  });

  describe("Resize 50%", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://localhost:8080/" + directory + "/resize-50" + extension;
      const result = await (await fetch("http://localhost:3000/test/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(ORIGINAL_IMAGE_ID);
    });
  });

  describe("Resize 25%", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://localhost:8080/" + directory + "/resize-25" + extension;
      const result = await (await fetch("http://localhost:3000/test/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(ORIGINAL_IMAGE_ID);
    });
  });

  describe("Resize different aspect ration 1", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://localhost:8080/" + directory + "/resize-ar1" + extension;
      const result = await (await fetch("http://localhost:3000/test/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(ORIGINAL_IMAGE_ID);
    });
  });

  describe("Resize different aspect ration 2", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://localhost:8080/" + directory + "/resize-ar2" + extension;
      const result = await (await fetch("http://localhost:3000/test/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(ORIGINAL_IMAGE_ID);
    });
  });

  describe("Resize different aspect ration 3", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://localhost:8080/" + directory + "/resize-ar3" + extension;
      const result = await (await fetch("http://localhost:3000/test/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(ORIGINAL_IMAGE_ID);
    });
  });

  describe("Resize different aspect ration 4", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://localhost:8080/" + directory + "/resize-ar4" + extension;
      const result = await (await fetch("http://localhost:3000/test/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(ORIGINAL_IMAGE_ID);
    });
  });

  describe("Rotate 90º", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://localhost:8080/" + directory + "/rotate-90" + extension;
      const result = await (await fetch("http://localhost:3000/test/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(ORIGINAL_IMAGE_ID);
    });
  });

  describe("Rotate 180º", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://localhost:8080/" + directory + "/rotate-180" + extension;
      const result = await (await fetch("http://localhost:3000/test/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(ORIGINAL_IMAGE_ID);
    });
  });

  describe("Reduced quality 50%", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://localhost:8080/" + directory + "/quality-50" + extension;
      const result = await (await fetch("http://localhost:3000/test/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(ORIGINAL_IMAGE_ID);
    });
  });

  describe("Reduced quality 10%", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://localhost:8080/" + directory + "/quality-10" + extension;
      const result = await (await fetch("http://localhost:3000/test/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(ORIGINAL_IMAGE_ID);
    });
  });

  describe("Crop 1", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://localhost:8080/" + directory + "/crop-1" + extension;
      const result = await (await fetch("http://localhost:3000/test/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(ORIGINAL_IMAGE_ID);
    });
  });

  describe("Crop 2", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://localhost:8080/" + directory + "/crop-2" + extension;
      const result = await (await fetch("http://localhost:3000/test/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(ORIGINAL_IMAGE_ID);
    });
  });

  describe("Crop 3", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://localhost:8080/" + directory + "/crop-3" + extension;
      const result = await (await fetch("http://localhost:3000/test/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(ORIGINAL_IMAGE_ID);
    });
  });

  describe("Crop 4", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://localhost:8080/" + directory + "/crop-4" + extension;
      const result = await (await fetch("http://localhost:3000/test/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(ORIGINAL_IMAGE_ID);
    });
  });

  describe("Draw 1", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://localhost:8080/" + directory + "/draw-1" + extension;
      const result = await (await fetch("http://localhost:3000/test/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(ORIGINAL_IMAGE_ID);
    });
  });

  describe("Draw 2", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://localhost:8080/" + directory + "/draw-2" + extension;
      const result = await (await fetch("http://localhost:3000/test/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(ORIGINAL_IMAGE_ID);
    });
  });

  describe("Blurred 5%", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://localhost:8080/" + directory + "/blur-5" + extension;
      const result = await (await fetch("http://localhost:3000/test/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(ORIGINAL_IMAGE_ID);
    });
  });

  describe("Blurred 10%", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://localhost:8080/" + directory + "/blur-10" + extension;
      const result = await (await fetch("http://localhost:3000/test/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(ORIGINAL_IMAGE_ID);
    });
  });

  describe("Blurred 15%", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://localhost:8080/" + directory + "/blur-15" + extension;
      const result = await (await fetch("http://localhost:3000/test/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(ORIGINAL_IMAGE_ID);
    });
  });

  describe("Space color: gray", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://localhost:8080/" + directory + "/color-gray" + extension;
      const result = await (await fetch("http://localhost:3000/test/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(ORIGINAL_IMAGE_ID);
    });
  });
});