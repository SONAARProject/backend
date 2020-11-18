///////////////////////////////////////////////////////////////////////////////
// Initialize client
///////////////////////////////////////////////////////////////////////////////

const {ClarifaiStub} = require("clarifai-nodejs-grpc");
const grpc = require("@grpc/grpc-js");
const fs = require('fs');
const readline = require('readline');

const apiKey = require('./constants');

// Construct one of the stubs you want to use
const stub = ClarifaiStub.json();

// This will be used by every Clarifai endpoint call.
const metadata = new grpc.Metadata();
metadata.set("authorization", "Key " + apiKey.apiKey);

async function uploadFiles(pathToListOfFiles){

    const fileStream = fs.createReadStream(pathToListOfFiles);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });
      // Note: we use the crlfDelay option to recognize all instances of CR LF
      // ('\r\n') in input.txt as a single line break.

      const inputs = [];
      for await (const line of rl) {
        inputs.push({data: {image: {base64: fs.readFileSync(`${line}`)}}})
    }

    upload(inputs);
}

async function uploadUrls(pathToListOfURLS){

    const fileStream = fs.createReadStream(pathToListOfURLS);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });
      // Note: we use the crlfDelay option to recognize all instances of CR LF
      // ('\r\n') in input.txt as a single line break.

      const inputArray = []
      for await (const line of rl) {
        inputArray.push({data: {image: {url: `${line}`, allow_duplicate_url: false}}})
      }

      upload(inputArray);

}

function upload(inputArray){

    stub.PostInputs(
        { inputs: inputArray },
        metadata,
        (err, response) => {
            if (err) {
                throw new Error(err);
            }

            if (response.status.code !== 10000) {
                for (const input of response.inputs) {
                    console.log("Input " + input.id + " status: ");
                    console.log(JSON.stringify(input.status, null, 2) + "\n");
                }

                throw new Error("Post inputs failed, status: " + response.status.description);
            }
        }
    );
}

module.exports = {
    uploadFiles,
    uploadUrls
  };