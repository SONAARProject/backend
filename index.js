const clarifySearch = require('./search');
const clarifyUpload = require('./upload');
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//upload
//clarifyUpload.uploadUrls("./upload.txt");

//url example
// clarifySearch.searchByImageURL("https://images-gmi-pmc.edge-generalmills.com/cbc3bd78-8797-4ac9-ae98-feafbd36aab7.jpg")

app.post('/search', async function (req, res) {
  const result = await clarifySearch.searchByImageURL(req.body.image_url);
  res.send(result)
})

app.listen(3000)

