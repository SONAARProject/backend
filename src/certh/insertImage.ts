import fetch from "node-fetch";
import { URLSearchParams } from "url";

const certhURL = 'https://mever.iti.gr/ndd/api/v2_sonaar/';

async function insertImageinCerth(imageUrl: string): Promise<number> {
    const encodedURL = encodeURIComponent(imageUrl);
    const postURL = certhURL + 'images/jobs/';
    const params = new URLSearchParams();
    params.append('url', encodedURL);
    params.append('collection_id', 'SONAAR');
    const response = await fetch(postURL, { method: 'POST', body: params })
    const data = await response.json();
    console.log(data);
    if (data.status === 'REQUEST RECEIVED') {
        return data.id;
    } else {
        return -1;
    }
}

async function checkJobCerth(id: number) {
    const getURL = certhURL + 'images/jobs/' + id;
    const response = await fetch(getURL);
    const data = await response.json();
    console.log(data);
    if (data.status === 'JOB COMPLETED') {
        return data.submitted_images[0];
    } else if (data.status === 'JOB NOT FOUND') {
        return [-1];
    } else if (data.status === 'INVALID ARGUMENT') {
        return [-1];
    } else {
        return await checkJobCerth(id);
    }
}

async function searchImageCerth(imageId: number) {
    // TODO: fine tune similariry measure
    const getURL = certhURL + 'images/search/' + imageId + '?t_sim=0.7&t_rank=1&collection_id=SONAAR';
    const response = await fetch(getURL)
    const data = await response.json();
    console.log(data);
    if (data.status === 'SEARCH COMPLETED') {
        return data.relevant_images[0];
    } else {
        return -1;
    }
}

async function deleteImageCerth(imageId: number) {
    const getURL = certhURL + 'images/indices/' + imageId;
    const params = new URLSearchParams();
    params.append('collection_id', 'SONAAR');
    const response = await fetch(getURL, { method: 'DELETE', body: params });
    const data = await response.json();
    console.log(data);
    if (data.status === 'IMAGE DELETED') {
        return 1;
    } else {
        return -1;
    }
}

export {
    insertImageinCerth,
    checkJobCerth,
    searchImageCerth,
    deleteImageCerth
}