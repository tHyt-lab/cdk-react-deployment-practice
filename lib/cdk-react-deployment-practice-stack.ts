import * as cdk from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export class CdkReactDeploymentPracticeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // frontend
    const webSiteBucket = new cdk.aws_s3.Bucket(this, 'CDKReactDeployPracticeBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      websiteIndexDocument: 'index.html',
      publicReadAccess: true
    })

    // CloudFront
    const originAccessIdentity = new cdk.aws_cloudfront.OriginAccessIdentity(this, 'OriginAccessIdentity', {
      comment: 'website-distribution-originAccessIdentity'
    })

    const webSiteBucketPolicyStatement = new cdk.aws_iam.PolicyStatement({
      actions: ['s3:GetObject'],
      effect: cdk.aws_iam.Effect.ALLOW,
      principals: [
        new cdk.aws_iam.CanonicalUserPrincipal(
          originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
        )
      ],
      resources: [`${webSiteBucket.bucketArn}/*`]
    })

    webSiteBucket.addToResourcePolicy(webSiteBucketPolicyStatement)

    const distribution = new cdk.aws_cloudfront.Distribution(this, 'distribution', {
      comment: 'website-distribution',
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          ttl: Duration.seconds(0),
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/'
        },
        {
          ttl: Duration.seconds(300),
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: '/error.html'
        }
      ],
      defaultBehavior: {
        allowedMethods: cdk.aws_cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: cdk.aws_cloudfront.CachedMethods.CACHE_GET_HEAD,
        cachePolicy: cdk.aws_cloudfront.CachePolicy.CACHING_OPTIMIZED,
        viewerProtocolPolicy: cdk.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        origin: new cdk.aws_cloudfront_origins.S3Origin(webSiteBucket, { originAccessIdentity })
      },
      priceClass: cdk.aws_cloudfront.PriceClass.PRICE_CLASS_ALL
    })

    new cdk.aws_s3_deployment.BucketDeployment(this, 'CDKReactDeployPractice', {
      sources: [cdk.aws_s3_deployment.Source.asset('./react-app/dist')],
      destinationBucket: webSiteBucket,
      distribution: distribution,
      distributionPaths: ['/*']
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
    const lambdaRestApi = new LambdaRestApi(this, 'CDKReactDeployPracticeLambdaAPIGateway', {
      handler: lambda,
      parameters: {
        'id': ''
      },
      deployOptions: {
        stageName: 'dev'
      }
    })

    lambdaRestApi.url
  }
}

const app = new cdk.App()
new CdkReactDeploymentPracticeStack(app, 'CdkReactDeploymentPracticeStack')
app.synth()
