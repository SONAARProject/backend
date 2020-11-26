import { expect } from 'chai';
import fetch from 'node-fetch';

const CLARIFAI_IMAGE_ID = "2b5cd77fc7604a611882d584b49430a3";

describe("Testing SONAAR Backend server", function() {

  describe("Original image", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://accessible-serv.lasige.di.fc.ul.pt/~jvicente/clarifai/cookie-original.jpg";
      const result = await (await fetch("http://localhost:3000/clarifai/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(CLARIFAI_IMAGE_ID);
    });
  });

  describe("Resize 80%", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://accessible-serv.lasige.di.fc.ul.pt/~jvicente/clarifai/cookie-resized-80.jpg";
      const result = await (await fetch("http://localhost:3000/clarifai/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(CLARIFAI_IMAGE_ID);
    });
  });

  describe("Resize 50%", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://accessible-serv.lasige.di.fc.ul.pt/~jvicente/clarifai/cookie-resized-50.jpg";
      const result = await (await fetch("http://localhost:3000/clarifai/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(CLARIFAI_IMAGE_ID);
    });
  });

  describe("Resize 25%", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://accessible-serv.lasige.di.fc.ul.pt/~jvicente/clarifai/cookie-resized-25.jpg";
      const result = await (await fetch("http://localhost:3000/clarifai/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(CLARIFAI_IMAGE_ID);
    });
  });

  describe("Resize different aspect ration 1", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://accessible-serv.lasige.di.fc.ul.pt/~jvicente/clarifai/cookie-resize-ar-1.jpg";
      const result = await (await fetch("http://localhost:3000/clarifai/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(CLARIFAI_IMAGE_ID);
    });
  });

  describe("Resize different aspect ration 2", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://accessible-serv.lasige.di.fc.ul.pt/~jvicente/clarifai/cookie-resize-ar-2.jpg";
      const result = await (await fetch("http://localhost:3000/clarifai/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(CLARIFAI_IMAGE_ID);
    });
  });

  describe("Resize different aspect ration 3", function() {
    it("Should not find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://accessible-serv.lasige.di.fc.ul.pt/~jvicente/clarifai/cookie-resize-ar-3.jpg";
      const result = await (await fetch("http://localhost:3000/clarifai/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.not.equal(CLARIFAI_IMAGE_ID);
    });
  });

  describe("Resize different aspect ration 4", function() {
    it("Should not find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://accessible-serv.lasige.di.fc.ul.pt/~jvicente/clarifai/cookie-resize-ar-4.jpg";
      const result = await (await fetch("http://localhost:3000/clarifai/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.not.equal(CLARIFAI_IMAGE_ID);
    });
  });

  describe("Rotate 90º", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://accessible-serv.lasige.di.fc.ul.pt/~jvicente/clarifai/cookie-rotate-90.jpg";
      const result = await (await fetch("http://localhost:3000/clarifai/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(CLARIFAI_IMAGE_ID);
    });
  });

  describe("Rotate 180", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://accessible-serv.lasige.di.fc.ul.pt/~jvicente/clarifai/cookie-rotate-180.jpg";
      const result = await (await fetch("http://localhost:3000/clarifai/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(CLARIFAI_IMAGE_ID);
    });
  });

  describe("Reduced quality 50%", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://accessible-serv.lasige.di.fc.ul.pt/~jvicente/clarifai/cookie-compress-50.jpg";
      const result = await (await fetch("http://localhost:3000/clarifai/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(CLARIFAI_IMAGE_ID);
    });
  });

  describe("Reduced quality 10%", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://accessible-serv.lasige.di.fc.ul.pt/~jvicente/clarifai/cookie-compress-10.jpg";
      const result = await (await fetch("http://localhost:3000/clarifai/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(CLARIFAI_IMAGE_ID);
    });
  });

  describe("Crop 1", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://accessible-serv.lasige.di.fc.ul.pt/~jvicente/clarifai/cookie-crop-1.jpg";
      const result = await (await fetch("http://localhost:3000/clarifai/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(CLARIFAI_IMAGE_ID);
    });
  });

  describe("Crop 2", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://accessible-serv.lasige.di.fc.ul.pt/~jvicente/clarifai/cookie-crop-2.jpg";
      const result = await (await fetch("http://localhost:3000/clarifai/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(CLARIFAI_IMAGE_ID);
    });
  });

  describe("Crop 3", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://accessible-serv.lasige.di.fc.ul.pt/~jvicente/clarifai/cookie-crop-3.jpg";
      const result = await (await fetch("http://localhost:3000/clarifai/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(CLARIFAI_IMAGE_ID);
    });
  });

  describe("Draw 1", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://accessible-serv.lasige.di.fc.ul.pt/~jvicente/clarifai/cookie-draw-1.jpg";
      const result = await (await fetch("http://localhost:3000/clarifai/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(CLARIFAI_IMAGE_ID);
    });
  });

  describe("Draw 2", function() {
    it("Should find the correct image", async function() {
      this.timeout(10 * 1000);

      const url = "http://accessible-serv.lasige.di.fc.ul.pt/~jvicente/clarifai/cookie-draw-2.jpg";
      const result = await (await fetch("http://localhost:3000/clarifai/search/" + encodeURIComponent(url))).json();
      expect(result.id).to.be.equal(CLARIFAI_IMAGE_ID);
    });
  });
});