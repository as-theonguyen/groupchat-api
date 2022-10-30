import { Application } from 'express';
import * as request from 'supertest';

type GraphQLRequestInput = {
  app: Application;
  query: string;
  operationName: string;
  variables?: Record<string, any>;
  headers?: Record<string, string>;
};

export const sendGraphQLRequest = async (input: GraphQLRequestInput) => {
  const headers = input.headers || {};
  const variables = input.variables || {};

  const { app, query, operationName } = input;

  const response = await request(app)
    .post('/api/graphql')
    .send({
      query,
      operationName,
      variables,
    })
    .set(headers);

  return response.body;
};
