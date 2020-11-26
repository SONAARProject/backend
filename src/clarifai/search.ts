import { ClarifaiStub } from "clarifai-nodejs-grpc";
import { Metadata } from "@grpc/grpc-js";
import apiKey from "./constants";

// Construct one of the stubs you want to use
const stub = ClarifaiStub.json();

// This will be used by every Clarifai endpoint call.
const metadata = new Metadata();
metadata.set("authorization", "Key " + apiKey);

//By Image URL
async function searchByImageURL(url: string): Promise<any> {
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
                      url,
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
        }
        if (response.status.code !== 10000) {
          reject(
            "Post searches failed, status: " + response.status.description
          );
        }
        resolve({
          score: response.hits[0].score,
          id: response.hits[0].input.id,
        });
      }
    );
  });
}

export { searchByImageURL };
