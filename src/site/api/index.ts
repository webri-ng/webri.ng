import { Handler, APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

/**
 * AWS API Gateway function handler type.
 * This is used to correctly type AWS Lambda functions.
 */
export type ApiGatewayHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;
