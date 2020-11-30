import { ClarifaiStub } from "clarifai-nodejs-grpc";
import { Metadata } from "@grpc/grpc-js";
import apiKey from "./constants";

// Construct one of the stubs you want to use
const stub = ClarifaiStub.json();

// This will be used by every Clarifai endpoint call.
const metadata = new Metadata();
metadata.set("authorization", "Key " + apiKey);

function uploadImage(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    stub.PostInputs(
      { inputs: [imageUrl] },
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

export { uploadImage };
