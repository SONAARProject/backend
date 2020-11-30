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
                      base64: imageBytes.toString("base64"),
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

export { searchByImageURL };
