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

async function uploadImageUrl(url: string): Promise<string> {
  const imageBuffer = await (await fetch(url)).buffer();
  return uploadImageBuffer(imageBuffer);
}

async function uploadImageBuffer(imageBuffer: Buffer): Promise<string> {
  return uploadImageBase64(imageBuffer.toString("base64"));
}

async function uploadImageBase64(imageBytes: string): Promise<string> {
  const request = new service.PostInputsRequest();
  request.addInputs(
    new resources.Input().setData(
      new resources.Data().setImage(new resources.Image().setBase64(imageBytes))
    )
  );
  return new Promise((resolve, reject) => {
    clarifai.postInputs(
      request,
      metadata,
      (err: any, response: service.MultiInputResponse) => {
        if (err) {
          reject(err);
        } else if (response.getStatus()?.getCode() !== StatusCode.SUCCESS) {
          reject(
            "Post inputs failed, status: " +
              response.getStatus()?.getDescription()
          );
        } else {
          resolve(response.getInputsList()[0].getId());
        }
      }
    );
  });
}

export { uploadImageUrl, uploadImageBuffer, uploadImageBase64 };
