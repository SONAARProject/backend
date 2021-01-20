'use strict';

const { ClarifaiStub } = require("clarifai-nodejs-grpc");
const { Metadata } = require("@grpc/grpc-js");
const fs = require('fs');
const gm = require('gm').subClass({imageMagick: true});
const sizeOf = require('image-size');

const IMAGES_DIRECTORY = './test/images';

(async () => {
  if (!fs.existsSync(IMAGES_DIRECTORY)) {
    fs.mkdirSync(IMAGES_DIRECTORY);
  }

  const path = process.argv[2];
  const segments = path.split('/');
  const img = segments.length > 1 ? segments[segments.length - 1] : segments[0];
  
  if (!fs.existsSync(IMAGES_DIRECTORY + '/' + img)) {
    fs.mkdirSync(IMAGES_DIRECTORY + '/' + img);
  }

  try {
    await uploadOriginalImage(path);
    copyOriginalImage(path, img);
    await createResizedSamples(path, img);
    await createRotatedSamples(path,img);
    await createReducedQualitySamples(path, img);
    await createCroppedSamples(path, img);
    await createDrawnSamples(path, img);
    await createBlurredSample(path, img);
    await createSingleColorSamples(path, img);
  } catch (err) {
    console.error(err);
  }
})();

function copyOriginalImage(path, img) {
  const segments = img.split('.');
  const newName = 'original';
  fs.copyFileSync(path, IMAGES_DIRECTORY + '/' + img + '/' + newName + '.' + segments[segments.length - 1]);
}

async function createResizedSamples(path, img) {
  const segments = img.split('.');
  const extension = '.' + segments[segments.length - 1];

  const { width, height } = sizeOf(path);
  
  const resize80 = IMAGES_DIRECTORY + '/' + img + '/resize-80' + extension;
  await resize(path, resize80, width * 0.8, height * 0.8);

  const resize50 = IMAGES_DIRECTORY + '/' + img + '/resize-50' + extension;
  await resize(path, resize50, width * 0.5, height * 0.5);

  const resize25 = IMAGES_DIRECTORY + '/' + img + '/resize-25' + extension;
  await resize(path, resize25, width * 0.25, height * 0.25);

  const resizeAR1 = IMAGES_DIRECTORY + '/' + img + '/resize-ar1' + extension;
  await resize(path, resizeAR1, width * 0.8, height * 0.4, '!');

  const resizeAR2 = IMAGES_DIRECTORY + '/' + img + '/resize-ar2' + extension;
  await resize(path, resizeAR2, width * 0.5, height * 0.7, '!');

  const resizeAR3 = IMAGES_DIRECTORY + '/' + img + '/resize-ar3' + extension;
  await resize(path, resizeAR3, width * 0.25, height * 0.60, '!');

  const resizeAR4 = IMAGES_DIRECTORY + '/' + img + '/resize-ar4' + extension;
  await resize(path, resizeAR4, width * 0.8, height * 0.15, '!');
}

async function createRotatedSamples(path, img) {
  const segments = img.split('.');
  const extension = '.' + segments[segments.length - 1];

  const rotate90 = IMAGES_DIRECTORY + '/' + img + '/rotate-90' + extension;
  await rotate(path, rotate90, 90);

  const rotate180 = IMAGES_DIRECTORY + '/' + img + '/rotate-180' + extension;
  await rotate(path, rotate180, 180);
}

async function createReducedQualitySamples(path, img) {
  const segments = img.split('.');
  const extension = '.' + segments[segments.length - 1];

  const quality50 = IMAGES_DIRECTORY + '/' + img + '/quality-50' + extension;
  await reduceQuality(path, quality50, 50);

  const quality10 = IMAGES_DIRECTORY + '/' + img + '/quality-10' + extension;
  await reduceQuality(path, quality10, 10);
}

async function createCroppedSamples(path, img) {
  const segments = img.split('.');
  const extension = '.' + segments[segments.length - 1];

  const { width, height } = sizeOf(path);

  const crop1 = IMAGES_DIRECTORY + '/' + img + '/crop-1' + extension;
  await crop(path, crop1, width * 0.8, height, undefined, undefined);

  const crop2 = IMAGES_DIRECTORY + '/' + img + '/crop-2' + extension;
  await crop(path, crop2, width, height * 0.8, undefined, undefined);

  const crop3 = IMAGES_DIRECTORY + '/' + img + '/crop-3' + extension;
  await crop(path, crop3, width * 0.4, height * 0.6, width * 0.2, height * 0.2);

  const crop4 = IMAGES_DIRECTORY + '/' + img + '/crop-4' + extension;
  await crop(path, crop4, width, height, width * 0.1, height * 0.4);
}

async function createDrawnSamples(path, img) {
  const segments = img.split('.');
  const extension = '.' + segments[segments.length - 1];

  const { width, height } = sizeOf(path);

  const draw1 = IMAGES_DIRECTORY + '/' + img + '/draw-1' + extension;
  await drawText(path, draw1, getRandomInt(width), getRandomInt(height));

  const draw2 = IMAGES_DIRECTORY + '/' + img + '/draw-2' + extension;
  await drawRectangle(path, draw2, getRandomInt(width), getRandomInt(height), getRandomInt(width), getRandomInt(height));
}

async function createBlurredSample(path, img) {
  const segments = img.split('.');
  const extension = '.' + segments[segments.length - 1];

  const blur5 = IMAGES_DIRECTORY + '/' + img + '/blur-5' + extension;
  await blur(path, blur5, 5);

  const blur10 = IMAGES_DIRECTORY + '/' + img + '/blur-10' + extension;
  await blur(path, blur10, 10);

  const blur15 = IMAGES_DIRECTORY + '/' + img + '/blur-15' + extension;
  await blur(path, blur15, 15);
}

async function createSingleColorSamples(path, img) {
  const segments = img.split('.');
  const extension = '.' + segments[segments.length - 1];

  const colorGray = IMAGES_DIRECTORY + '/' + img + '/color-gray' + extension;
  await colorSpace(path, colorGray, 'gray');
}

function resize(path, path2, width, height, options = undefined) {
  return new Promise((resolve, reject) => {
    gm(path)
    .resize(width, height, options)
    .write(path2, function (err) {
      if (err) {
        reject(err);
      } else { 
        resolve();
      }
    });
  });
}

function rotate(path, path2, degree) {
  return new Promise((resolve, reject) => {
    gm(path)
    .rotate('transparent', degree)
    .write(path2, function (err) {
      if (err) {
        reject(err);
      } else { 
        resolve();
      }
    });
  });
}

function reduceQuality(path, path2, percentage) {
  return new Promise((resolve, reject) => {
    gm(path)
    .quality(percentage)
    .write(path2, function (err) {
      if (err) {
        reject(err);
      } else { 
        resolve();
      }
    });
  });
}

function crop(path, path2, c1, c2, c3, c4) {
  return new Promise((resolve, reject) => {
    gm(path)
    .crop(c1, c2, c3, c4)
    .write(path2, function (err) {
      if (err) {
        reject(err);
      } else { 
        resolve();
      }
    });
  });
}

function drawText(path, path2, c1, c2) {
  return new Promise((resolve, reject) => {
    gm(path)
    .fontSize(18)
    .drawText(c1, c2, 'I\'m a text written randomly')
    .write(path2, function (err) {
      if (err) {
        reject(err);
      } else { 
        resolve();
      }
    });
  });
}

function drawRectangle(path, path2, c1, c2, c3, c4) {
  return new Promise((resolve, reject) => {
    gm(path)
    .stroke('black', 18)
    .drawRectangle(c1, c2, c3, c4)
    .write(path2, function (err) {
      if (err) {
        reject(err);
      } else { 
        resolve();
      }
    });
  });
}

function blur(path, path2, percentage) {
  return new Promise((resolve, reject) => {
    gm(path)
    .blur(percentage, percentage)
    .write(path2, function (err) {
      if (err) {
        reject(err);
      } else { 
        resolve();
      }
    });
  });
}

function colorSpace(path, path2, color) {
  return new Promise((resolve, reject) => {
    gm(path)
    .colorspace(color)
    .write(path2, function (err) {
      if (err) {
        reject(err);
      } else { 
        resolve();
      }
    });
  });
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

async function uploadOriginalImage(path) {
  const SCORE_THRESHOLD = 0.9;

  const exists = await searchByImage(path);

  if (exists && parseFloat(exists.score) >= SCORE_THRESHOLD) {
    return;
  }

  const imageBytes = fs.readFileSync(path);

  const apiKey = fs.readFileSync("../clarifai-api.key", "utf-8").trim();

  // Construct one of the stubs you want to use
  const stub = ClarifaiStub.grpc();

  // This will be used by every Clarifai endpoint call.
  const metadata = new Metadata();
  metadata.set("authorization", "Key " + apiKey);

  return new Promise((resolve, reject) => {
    stub.PostInputs(
      { inputs: [{ data: { image: { base64: imageBytes } } }] },
      metadata,
      (err, response) => {
        if (err) {
          reject(err);
        } else if (response.status.code !== 10000) {
          reject("Post inputs failed, status: " + response.status.description);
        } else {
          resolve(response.inputs[0].id);
        }
      }
    );
  });
}

async function searchByImage(path) {

  const imageBytes = fs.readFileSync(path);

  const apiKey = fs.readFileSync("../clarifai-api.key", "utf-8").trim();

  // Construct one of the stubs you want to use
  const stub = ClarifaiStub.grpc();

  // This will be used by every Clarifai endpoint call.
  const metadata = new Metadata();
  metadata.set("authorization", "Key " + apiKey);

  return new Promise((resolve, reject) => {
    stub.PostSearches(
      {
        query: {
          ands: [
            {
              output: {
                input: {
                  data: {
                    image: {
                      base64: imageBytes
                    },
                  },
                },
              },
            },
          ],
        },
      },
      metadata,
      (err, response) => {
        if (err) {
          reject(err);
        }
        if (response.status.code !== 10000) {
          reject(
            "Post searches failed, status: " + response.status.description
          );
        }
        resolve({
          score: response.hits[0].score,
          id: response.hits[0].input.id,
        });
      }
    );
  });
}