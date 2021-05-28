import { grpc } from "clarifai-nodejs-grpc";
//import { Metadata } from "@grpc/grpc-js";
import { V2Client } from "clarifai-nodejs-grpc/proto/clarifai/api/service_grpc_pb";
import { StatusCode } from "clarifai-nodejs-grpc/proto/clarifai/api/status/status_code_pb";
import service from "clarifai-nodejs-grpc/proto/clarifai/api/service_pb";
import resources from "clarifai-nodejs-grpc/proto/clarifai/api/resources_pb";

import fetch from "node-fetch";
import apiKey from "./constants";

// Construct one of the stubs you want to use
//const stub = ClarifaiStub.grpc();

const clarifai = new V2Client(
  "api.clarifai.com",
  grpc.ChannelCredentials.createSsl()
);

// This will be used by every Clarifai endpoint call.
const metadata = new grpc.Metadata();
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
  const request = new service.PostWorkflowResultsRequest();
  request.setWorkflowId("visual-text-recognition-id");
  request.addInputs(
    new resources.Input().setData(
      new resources.Data().setImage(new resources.Image().setBase64(imageBytes))
    )
  );
  return new Promise((resolve, reject) => {
    clarifai.postWorkflowResults(
      request,
      metadata,
      (err: any, response: service.PostWorkflowResultsResponse) => {
        if (err) {
          reject(err);
        }

        if (response.getStatus()?.getCode() !== StatusCode.SUCCESS) {
          reject(
            "Post workflow results failed, status: " +
              response.getStatus()?.getDescription()
          );
        }

        const words = new Array<string>();
        const phrases = new Array<string>();

        for (const output of response.getResultsList()[0].getOutputsList()) {
          const model = output.getModel();
          if (model?.getName() === "Visual Text Recognition") {
            for (const region of output.getData()?.getRegionsList() || []) {
              const raw = region.getData()?.getText()?.getRaw();
              if (raw !== undefined) {
                words.push(raw);
              }
            }
          }
          if (model?.getName() === "text-aggregator") {
            const raw = output?.getData()?.getText()?.getRaw();
            if (raw !== undefined) {
              phrases.push(raw);
            }
          }
        }
        resolve({ words: words, phrases: phrases });
      }
    );
  });
}

export { getTextFromImageURL, getTextFromImageBuffer, getTextFromImageBase64 };
