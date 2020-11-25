import fetch from "node-fetch";

async function googleReverseSearch(url: string): Promise<any> {
  const response = await fetch(
    "https://serpapi.com/search?engine=google_reverse_image&image_url=" +
      encodeURIComponent(url)
  );
  const json = await response.json();
  console.log(json);
  return json;
}

export { googleReverseSearch };
