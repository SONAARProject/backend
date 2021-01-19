import { ClarifaiStub } from "clarifai-nodejs-grpc";
import { Metadata } from "@grpc/grpc-js";
import fetch from "node-fetch";
import apiKey from "./constants";

// Construct one of the stubs you want to use
const stub = ClarifaiStub.grpc();

// This will be used by every Clarifai endpoint call.
const metadata = new Metadata();
metadata.set("authorization", "Key " + apiKey);

async function uploadImageUrl(url: string): Promise<string> {
  const imageBuffer = await (await fetch(url)).buffer();
  return uploadImageBuffer(imageBuffer);
}

async function uploadImageBuffer(imageBuffer: Buffer): Promise<string> {
  return uploadImageBase64(imageBuffer.toString("base64"));
}

async function uploadImageBase64(imageBytes: string): Promise<string> {
  return new Promise((resolve, reject) => {
    stub.PostInputs(
      {
        inputs: [{ data: { image: { base64: imageBytes } } }],
      },
      metadata,
      (err: any, response: any) => {
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

export { uploadImageUrl, uploadImageBuffer, uploadImageBase64 };
