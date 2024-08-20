# Monorepo Template

A demo of @ts-rest/serverless with SST

## Get started

1. Clone the repo.

   ```bash
   git clone git@github.com:lukeggchapman/sst-ts-rest-serverless-demo.git
   cd sst-ts-rest-serverless-demo
   ```

2. Deploy!

   ```bash
   npm install
   npx sst deploy
   ```

3. Call the API Gateway URL provided with `/test` EG: `https://xxxxxxxxxx.execute-api.ap-southeast-2.amazonaws.com/test`

4. Observe the error in the functions tab of the SST terminal

## Parts

1. `infra/api.ts`

   This is where the API Gateway route is defined.

   ```ts
   // Create the API
   export const api = new sst.aws.ApiGatewayV2("Api");
   
   api.route("GET /test", "packages/functions/src/test.handler");
   ```

2. `packages/functions/src/test.ts`

   This is where the handler is defined. It is a copy of one of the test routes defined in the [@ts-rest/serverless lambda test file](https://github.com/ts-rest/ts-rest/blob/main/libs/ts-rest/serverless/src/lib/handlers/ts-rest-lambda.spec.ts).

