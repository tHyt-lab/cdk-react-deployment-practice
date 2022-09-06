import { APIGatewayProxyHandlerV2 } from "aws-lambda"

const AWS = require('aws-sdk')
const dynamoDb = new AWS.DynamoDB.DocumentClient()
const TABLE_NAME = process.env.TABLE_NAME || ""
const PRIMARY_KEY = process.env.PRIMARY_KEY || ""

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const requestedItemId = event.queryStringParameters?.id;
  if (!requestedItemId) {
    return {
      statusCode: 400,
      body: `Error: You are missing the path parameter id`,
    }
  }

  const params = {
    TableName: TABLE_NAME,
    Key: {
      [PRIMARY_KEY]: requestedItemId,
    }
  }

  const response = {
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET"
    },
  }

  try {
    const dbResponse = await dynamoDb.get(params).promise()
    return {
      ...response,
      statusCode: 200,
      body: JSON.stringify(dbResponse.Item)
    }
  } catch (dbError) {
    return {
      ...response,
      statusCode: 500,
      body: JSON.stringify(dbError)
    }
  }
}