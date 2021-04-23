import { ClarifaiStub } from "clarifai-nodejs-grpc";
import { Metadata } from "@grpc/grpc-js";
import fetch from "node-fetch";
import apiKey from "./constants";

// Construct one of the stubs you want to use
const stub = ClarifaiStub.grpc();

// This will be used by every Clarifai endpoint call.
const metadata = new Metadata();
metadata.set("authorization", "Key " + apiKey);

//By Image URL
async function getTextFromImageURL(url: string): Promise<any> {
  const imageBuffer = await (await fetch(url)).buffer();
  return getTextFromImageBuffer(imageBuffer);
}

async function getTextFromImageBuffer(imageBuffer: Buffer): Promise<any> {
  return getTextFromImageBase64(imageBuffer.toString("base64"));
}

async function getTextFromImageBase64(imageBytes: string): Promise<any> {
  return new Promise((resolve, reject) => {
    stub.PostWorkflowResults(
      {
          workflow_id: "visual-text-recognition-id",
          inputs: [
              {data: {image: {base64: imageBytes}}}
          ]
      },
      metadata,
      (err, response) => {
          if (err) {
            reject(err);
          }

          if (response.status.code !== 10000) {
            reject(
              "Post workflow results failed, status: " + response.status.description
            );
          }

          const words = new Array<string>();
          const phrases = new Array<string>();

          for (const output of response.results[0].outputs) {
            const model = output.model;
            if(model.name === "Visual Text Recognition"){
              for(const region of output.data.regions || []){
                words.push(region.data.text.raw);
              }
            }
            if(model.name === "text-aggregator"){
							phrases.push(output.data.text.raw);
            }
          }
          resolve({"words": words, "phrases": phrases});
        }
      );
  });
}

export {
  getTextFromImageURL,
  getTextFromImageBuffer,
  getTextFromImageBase64,
};
