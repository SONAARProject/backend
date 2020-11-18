const {ClarifaiStub} = require("clarifai-nodejs-grpc");
const grpc = require("@grpc/grpc-js");
const fs = require("fs");
const apiKey = require('./constants');

// Construct one of the stubs you want to use
const stub = ClarifaiStub.json();

// This will be used by every Clarifai endpoint call.
const metadata = new grpc.Metadata();
metadata.set("authorization", "Key " + apiKey.apiKey);

//By Image URL
async function searchByImageURL(url){
  return new Promise( (resolve, reject) => {
    stub.PostAnnotationsSearches(
      {
          searches: [{query: {ranks: [{annotation: {data: {image: {url: url}}}}]}}]
      },
      metadata,
      (err, response) => {
          if (err) {
              reject(err);
          }
          if (response.status.code !== 10000) {
              reject("Post annotations searches failed, status: " + response.status.description);
          }
          resolve({score: response.hits[0].score, id: response.hits[0].input.id});
          // console.log(JSON.stringify(response.hits[0], null, 2));
          // console.log(JSON.stringify(response.hits[1], null, 2));
          // console.log(JSON.stringify(response.hits[2], null, 2));
          // for (const hit of response.hits) {
          //   console.log(hit);
          // }
          // return {response.hits[0].score] response.hits[0].input.id]}
      }
    );
  });
}

//By Image Bytes
function searchByImageBytes(path){
  const imageBytes = fs.readFileSync(path);

  stub.PostAnnotationsSearches(
    {searches: [{query: { ranks: [{annotation: {data: { image: { base64: imageBytes} }}}]}}]
      },
      metadata,
      (err, response) => {
          if (err) {
              throw new Error(err);
          }

          if (response.status.code !== 10000) {
              throw new Error("Post annotations searches failed, status: " + response.status.description);
          }

          console.log(typeof response.hits);
          // console.log(JSON.stringify(response.hits[0], null, 2));

          // for (const hit of response.hits) {
          //     console.log("\tScore " + hit.score + " for annotation: " + hit.annotation.id + " of input: ", hit.input.id);
          // }
      }
  );
}

module.exports = {
  searchByImageURL,
  searchByImageBytes
};