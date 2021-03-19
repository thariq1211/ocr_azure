const sleep = require("util").promisify(setTimeout);

const STATUS_SUCCEEDED = "succeeded";
const STATUS_FAILED = "failed";
async function readTextFromURL(client, url) {
  // To recognize text in a local image, replace client.read() with readTextInStream() as shown:
  let result = await client.read(url);
  // Operation ID is last path segment of operationLocation (a URL)
  let operation = result.operationLocation.split("/").slice(-1)[0];

  // Wait for read recognition to complete
  // result.status is initially undefined, since it's the result of read
  while (result.status !== STATUS_SUCCEEDED) {
    await sleep(1000);
    result = await client.getReadResult(operation);
  }
  return result.analyzeResult.readResults; // Return the first page of result. Replace [0] with the desired page if this is a multi-page file such as .pdf or .tiff.
}

function printRecText(readResults) {
  // console.log("Recognized text:");
  let output = [];
  for (const page in readResults) {
    if (readResults.length > 1) {
      console.log(`==== Page: ${page}`);
    }
    const result = readResults[page];
    if (result.lines.length) {
      for (const line of result.lines) {
        output.push(line.words.map((w) => w.text).join(" "));
      }
      return output;
    } else {
      return "No recognized text";
    }
  }
}
const searchInArray = (searchQuery, array, objectKey = null) => {
  return array.filter((d) => {
    let data = objectKey ? d[objectKey] : d; //Incase If It's Array Of Objects.
    let dataWords =
      typeof data == "string" &&
      data
        ?.split(" ")
        ?.map((b) => b && b.toLowerCase().trim())
        .filter((b) => b);
    let searchWords =
      typeof searchQuery == "string" &&
      searchQuery
        ?.split(" ")
        .map((b) => b && b.toLowerCase().trim())
        .filter((b) => b);

    let matchingWords = searchWords.filter((word) => dataWords.includes(word));

    return matchingWords.length;
  });
};

module.exports = { readTextFromURL, printRecText, searchInArray };
