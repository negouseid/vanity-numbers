#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VanityNumberGeneratorStack } from '../lib/vanity-number-generator-stack';

const app = new cdk.App();

new VanityNumberGeneratorStack(app, 'VanityNumberGeneratorStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});
