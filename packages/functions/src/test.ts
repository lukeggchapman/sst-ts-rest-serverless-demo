import { initContract } from "@ts-rest/core";
import { createLambdaHandler, tsr } from "@ts-rest/serverless/aws";
import { z } from "zod";
import { TsRestResponse, TsRestResponseError } from "@ts-rest/serverless";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  Context,
} from "aws-lambda";

const c = initContract();

const contract = c.router({
  test: {
    method: "GET",
    path: "/test",
    query: z.object({
      foo: z.string(),
      throwError: z
        .union([z.literal("custom-json"), z.literal("custom-text")])
        .optional(),
      throwDefinedError: z.boolean().default(false),
      throwHttpError: z.boolean().default(false),
      setCookies: z.boolean().default(false),
    }),
    responses: {
      200: z.object({
        foo: z.string(),
      }),
      402: z.literal("Unauthorized"),
    },
  },
});

type GlobalRequestExtension = {
  context: {
    rawEvent: APIGatewayProxyEvent | APIGatewayProxyEventV2;
    lambdaContext: Context;
  };
};

export const handler = createLambdaHandler(
  contract,
  {
    test: async ({ query }, { appRoute, responseHeaders }) => {
      if (query.throwError) {
        throw new Error(query.throwError);
      }

      if (query.throwDefinedError) {
        throw new TsRestResponseError(appRoute, {
          status: 402,
          body: "Unauthorized",
        });
      }

      if (query.setCookies) {
        responseHeaders.append(
          "set-cookie",
          "foo=bar; path=/; expires=Thu, 21 Oct 2021 07:28:00 GMT; secure; httponly; samesite=strict"
        );

        responseHeaders.append(
          "set-cookie",
          "bar=foo; path=/; expires=Thu, 21 Oct 2021 07:28:00 GMT; secure; httponly; samesite=strict"
        );
      }

      return {
        status: 200,
        body: {
          foo: query.foo,
        },
      };
    },
  },
  {
    jsonQuery: true,
    responseValidation: true,
    cors: {},
    requestMiddleware: [
      tsr.middleware<GlobalRequestExtension>(async (request, lambdaArgs) => {
        request.context = lambdaArgs;
      }),
    ],
    errorHandler: (error) => {
      if (error instanceof Error) {
        if (error.message === "custom-json") {
          return TsRestResponse.fromJson(
            { message: "Custom Error Handler" },
            { status: 422 }
          );
        } else if (error.message === "custom-text") {
          return TsRestResponse.fromText("Custom Error Handler", {
            status: 422,
          });
        }
      }

      // if not returning a response, should pass through to the default error handler
      return;
    },
  }
);
