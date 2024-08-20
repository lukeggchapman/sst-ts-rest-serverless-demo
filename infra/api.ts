// Create the API
export const api = new sst.aws.ApiGatewayV2("Api");

api.route("GET /test", "packages/functions/src/test.handler");
