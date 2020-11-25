///////////////////////////////////////////////////////////////////////////////
// Initialize client
///////////////////////////////////////////////////////////////////////////////

import { ClarifaiStub } from "clarifai-nodejs-grpc";
import { Metadata } from "@grpc/grpc-js";
import fs from "fs";
import readline from "readline";

import apiKey from "./constants";

// Construct one of the stubs you want to use
const stub = ClarifaiStub.json();

// This will be used by every Clarifai endpoint call.
const metadata = new Metadata();
metadata.set("authorization", "Key " + apiKey);

async function uploadFiles(pathToListOfFiles: string): Promise<void> {
  const fileStream = fs.createReadStream(pathToListOfFiles);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  const inputs = new Array<any>();
  for await (const line of rl || []) {
    inputs.push({ data: { image: { base64: fs.readFileSync(`${line}`) } } });
  }

  upload(inputs);
}

async function uploadUrls(pathToListOfURLS: string): Promise<void> {
  const fileStream = fs.createReadStream(pathToListOfURLS);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  const inputArray = new Array<any>();
  for await (const line of rl || []) {
    inputArray.push({
      data: { image: { url: `${line}`, allow_duplicate_url: false } },
    });
  }

  upload(inputArray);
}

function upload(inputArray: Array<any>): void {
  stub.PostInputs(
    { inputs: inputArray },
    metadata,
    (err: any, response: any) => {
      if (err) {
        throw new Error(err);
      }

      if (response.status.code !== 10000) {
        for (const input of response.inputs) {
          console.log("Input " + input.id + " status: ");
          console.log(JSON.stringify(input.status, null, 2) + "\n");
        }

        throw new Error(
          "Post inputs failed, status: " + response.status.description
        );
      }
    }
  );
}

export { uploadFiles, uploadUrls };
