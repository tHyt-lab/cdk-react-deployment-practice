import * as cdk from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export class CdkReactDeploymentPracticeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // frontend
    const s3Bucket = new cdk.aws_s3.Bucket(this, 'CDKReactDeployPracticeBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      websiteIndexDocument: 'index.html',
      publicReadAccess: true
    })

    new cdk.aws_s3_deployment.BucketDeployment(this, 'CDKReactDeployPractice', {
      sources: [cdk.aws_s3_deployment.Source.asset('./react-app/dist')],
      destinationBucket: s3Bucket,

    })

    // backend
    // DynamoDB
    const dynamoDB = new Table(this, 'CDKReactDeployPracticeDynamoDB', {
      partitionKey: {
        name: 'id',
        type: cdk.aws_dynamodb.AttributeType.STRING
      },
      tableName: 'items',
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })

    // Lambda
    const lambda = new NodejsFunction(this, 'CDKReactDeployPracticeLambda', {
      entry: './functions/index.ts',
      runtime: Runtime.NODEJS_16_X,
      environment: {
        TABLE_NAME: dynamoDB.tableName,
        PRIMARY_KEY: 'id'
      }
    })

    dynamoDB.grantReadData(lambda)

    // APIGateway
    new LambdaRestApi(this, 'CDKReactDeployPracticeLambdaAPIGateway', {
      handler: lambda,
      parameters: {
        'id': ''
      },
      deployOptions: {
        stageName: 'dev'
      }
    })
  }
}

const app = new cdk.App()
new CdkReactDeploymentPracticeStack(app, 'CdkReactDeploymentPracticeStack')
app.synth()
