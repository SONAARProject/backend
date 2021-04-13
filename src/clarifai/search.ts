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
async function searchByImageURL(url: string): Promise<any> {
  const imageBuffer = await (await fetch(url)).buffer();
  return searchByImageBuffer(imageBuffer);
}

async function searchByImageBuffer(imageBuffer: Buffer): Promise<any> {
  return searchByImageBase64(imageBuffer.toString("base64"));
}

async function searchByImageBase64(imageBytes: string): Promise<any> {
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

async function getImageUrlConcepts(url: string): Promise<any> {
  const imageBuffer = await (await fetch(url)).buffer();
  return getImageBufferConcepts(imageBuffer);
}

async function getImageBufferConcepts(imageBuffer: Buffer): Promise<any> {
  return getImageBase64Concepts(imageBuffer.toString("base64"));
}

async function getImageBase64Concepts(
  imageBytes: string
): Promise<Array<string>> {
  //return getImageBase64Text(imageBytes);
  return new Promise((resolve, reject) => {
    stub.PostModelOutputs(
      {
        model_id: "aaa03c23b3724a16a56b629203edc62c", // This is model ID of the clarifai/main General model
        inputs: [
          {
            data: {
              image: { base64: imageBytes },
            },
          },
        ],
        model: { output_info: { output_config: { min_value: 0.95 } } },
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
          ).join(', ');
          resolve(concepts);
        }
      }
    );
  });
}

/*async function getImageBase64Text(imageBytes: string): Promise<Array<string>> {
  return new Promise((resolve) => {
    stub.PostWorkflows(
      {
        workflows: [
          {
            id: "visual-text-recognition-id",
            nodes: [
              {
                id: "detect-concept",
                model: {
                  id: "2419e2eae04d04f820e5cf3aba42d0c7",
                  model_version: {
                    id: "75a5b92a0dec436a891b5ad224ac9170",
                  },
                },
                inputs: [
                  {
                    data: {
                      image: { base64: imageBytes },
                    },
                  },
                ],
              },
              {
                id: "image-crop",
                model: {
                  id: "ce3f5832af7a4e56ae310d696cbbefd8",
                  model_version: {
                    id: "a78efb13f7774433aa2fd4864f41f0e6",
                  },
                },
                node_inputs: [{ node_id: "detect-concept" }],
              },
              {
                id: "image-to-text",
                model: {
                  id: "9fe78b4150a52794f86f237770141b33",
                  model_version: {
                    id: "d94413e582f341f68884cac72dbd2c7b",
                  },
                },
                node_inputs: [{ node_id: "image-crop" }],
              },
            ],
          },
        ],
      },
      metadata,
      (err, response) => {
        if (err) {
          throw new Error(err);
        }

        if (response.status.code !== 10000) {
          console.log(response.status);
          throw new Error(
            "Post workflows failed, status: " + response.status.description
          );
        } else {
          console.log(response.outputs[0].data);
          resolve([]);
        }
      }
    );
  });
}*/

export {
  searchByImageURL,
  searchByImageBuffer,
  searchByImageBase64,
  getImageUrlConcepts,
  getImageBufferConcepts,
  getImageBase64Concepts,
};
