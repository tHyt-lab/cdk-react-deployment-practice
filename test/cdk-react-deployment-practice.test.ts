import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CdkReactDeploymentPracticeStack } from '../lib/cdk-react-deployment-practice-stack';

test('snapshot test', () => {
  const app = new cdk.App()
  const stack = new CdkReactDeploymentPracticeStack(app, "TestStack")
  const template = Template.fromStack(stack).toJSON()

  expect(template).toMatchSnapshot()
})
