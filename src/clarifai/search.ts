import { ClarifaiStub } from "clarifai-nodejs-grpc";
import { Metadata } from "@grpc/grpc-js";
import fetch from "node-fetch";
import apiKey from "./constants";

// Construct one of the stubs you want to use
const stub = ClarifaiStub.json();

// This will be used by every Clarifai endpoint call.
const metadata = new Metadata();
metadata.set("authorization", "Key " + apiKey);

//By Image URL
async function searchByImageURL(url: string): Promise<any> {
  const imageBytes = await (await fetch(url)).buffer();
  return searchByImageBase64(imageBytes);
}

async function searchByImageBase64(imageBytes: Buffer | string): Promise<any> {
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
                      base64: imageBytes,
                    },
                  },
                },
              },
            },
          ],
        },
      },
      metadata,
      (err: any, response: any) => {
        if (err) {
          reject(err);
        } else if (response.status.code !== 10000) {
          reject(
            "Post searches failed, status: " + response.status.description
          );
        } else {
          resolve({
            score: response.hits[0].score,
            id: response.hits[0].input.id,
          });
        }
      }
    );
  });
}

async function getImageConcepts(imageBytes: Buffer): Promise<Array<string>> {
  return new Promise((resolve, reject) => {
    stub.PostModelOutputs(
      {
        model_id: "aaa03c23b3724a16a56b629203edc62c", // This is model ID of the clarifai/main General model
        inputs: [
          {
            data: {
              image: { base64: imageBytes.toString("base64") },
            },
          },
        ],
        model: { output_info: { output_config: { min_value: 0.9 } } },
      },
      metadata,
      (err: any, response: any) => {
        if (err) {
          reject(err);
        } else if (response.status.code !== 10000) {
          reject(
            "Post model outputs failed, status: " + response.status.description
          );
        } else {
          const concepts = response.outputs[0].data.concepts.map(
            (c: any) => c.name
          );
          resolve(concepts);
        }
      }
    );
  });
}

export { searchByImageURL, searchByImageBase64, getImageConcepts };
