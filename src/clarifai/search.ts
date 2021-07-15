import { grpc } from "clarifai-nodejs-grpc";
//import { Metadata } from "@grpc/grpc-js";
import { V2Client } from "clarifai-nodejs-grpc/proto/clarifai/api/service_grpc_pb";
import { StatusCode } from "clarifai-nodejs-grpc/proto/clarifai/api/status/status_code_pb";
import service from "clarifai-nodejs-grpc/proto/clarifai/api/service_pb";
import resources from "clarifai-nodejs-grpc/proto/clarifai/api/resources_pb";

import fetch from "node-fetch";
import apiKey from "./constants";

// Construct one of the stubs you want to use
//const stub = ClarifaiStub.grpc;

const clarifai = new V2Client(
  "api.clarifai.com",
  grpc.ChannelCredentials.createSsl()
);

// This will be used by every Clarifai endpoint call.
const metadata = new grpc.Metadata();
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
  const request = new service.PostSearchesRequest();
  request.addSearches(
    new resources.Search().setQuery(
      new resources.Query().setAndsList([
        new resources.And().setOutput(
          new resources.Output().setInput(
            new resources.Input().setData(
              new resources.Data().setImage(
                new resources.Image().setBase64(imageBytes)
              )
            )
          )
        ),
      ])
    )
  );
  return new Promise((resolve, reject) => {
    clarifai.postSearches(
      request,
      metadata,
      (err: any, response: service.MultiSearchResponse) => {
        if (err) {
          reject(err);
        } else if (response.getStatus()?.getCode() !== StatusCode.SUCCESS) {
          reject(
            "Post searches failed, status: " +
              response.getStatus()?.getDescription()
          );
        } else {
          resolve({
            score: response.getHitsList()[0].getScore(),
            id: response.getHitsList()[0].getInput()?.getId(),
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
  const request = new service.PostModelOutputsRequest();
  request.setModelId("aaa03c23b3724a16a56b629203edc62c");
  request.addInputs(
    new resources.Input().setData(
      new resources.Data().setImage(new resources.Image().setBase64(imageBytes))
    )
  );
  return new Promise((resolve, reject) => {
    clarifai.postModelOutputs(
      request,
      metadata,
      (err: any, response: service.MultiOutputResponse) => {
        if (err) {
          reject(err);
        } else if (response.getStatus()?.getCode() !== StatusCode.SUCCESS) {
          reject(
            "Post model outputs failed, status: " +
              response.getStatus()?.getDescription()
          );
        } else {
          const concepts = new Array<string>();
          response
            .getOutputsList()[0]
            .getData()
            ?.getConceptsList()
            .map((c: resources.Concept) => {
              if (c.getValue() > 0.95 && concepts.length < 10) {
                concepts.push(c.getName());
              }
            });
          resolve(concepts || new Array<string>());
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
