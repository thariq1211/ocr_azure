const ComputerVisionClient = require("@azure/cognitiveservices-computervision")
  .ComputerVisionClient;
const ApiKeyCredentials = require("@azure/ms-rest-js").ApiKeyCredentials;

const key = "b0b4911bde2e4e5f902be610eb3165b8";
const endpoint = "https://tes-cvission.cognitiveservices.azure.com/";

const computerVisionClient = new ComputerVisionClient(
  new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
  endpoint
);

module.exports = computerVisionClient;
