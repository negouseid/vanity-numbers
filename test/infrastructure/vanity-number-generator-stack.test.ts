import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { VanityNumberGeneratorStack } from '../../lib/vanity-number-generator-stack';

describe('VanityNumberGeneratorStack', () => {
  function synthesizeTemplate(): Template {
    const app = new cdk.App();
    const stack = new VanityNumberGeneratorStack(
      app,
      'TestVanityNumberGeneratorStack'
    );

    return Template.fromStack(stack);
  }

  it('creates a DynamoDB table for vanity results with a recent calls index', () => {
    const template = synthesizeTemplate();

    template.hasResourceProperties('AWS::DynamoDB::Table', {
      BillingMode: 'PAY_PER_REQUEST',
      KeySchema: [
        {
          AttributeName: 'contactId',
          KeyType: 'HASH'
        }
      ],
      GlobalSecondaryIndexes: [
        Match.objectLike({
          IndexName: 'RecentCallsIndex',
          KeySchema: [
            {
              AttributeName: 'recentCallsPartition',
              KeyType: 'HASH'
            },
            {
              AttributeName: 'createdAt',
              KeyType: 'RANGE'
            }
          ],
          Projection: {
            ProjectionType: 'ALL'
          }
        })
      ],
      PointInTimeRecoverySpecification: {
        PointInTimeRecoveryEnabled: true
      }
    });
  });

  it('creates the vanity generator Lambda with the table name environment variable', () => {
    const template = synthesizeTemplate();

    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'index.handler',
      Runtime: 'nodejs20.x',
      Architectures: ['arm64'],
      Environment: {
        Variables: {
          VANITY_RESULTS_TABLE_NAME: {
            Ref: Match.stringLikeRegexp('VanityResultsTable')
          }
        }
      }
    });
  });

  it('grants the Lambda write access to DynamoDB', () => {
    const template = synthesizeTemplate();

    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: Match.arrayWith([
              'dynamodb:BatchWriteItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem'
            ]),
            Effect: 'Allow'
          })
        ])
      }
    });
  });

  it('can associate the Lambda with Amazon Connect when an instance id is provided', () => {
    const template = synthesizeTemplate();

    template.hasResourceProperties('AWS::Connect::IntegrationAssociation', {
      InstanceId: Match.anyValue(),
      IntegrationType: 'LAMBDA_FUNCTION',
      IntegrationArn: {
        'Fn::GetAtt': [
          Match.stringLikeRegexp('VanityGeneratorFunction'),
          'Arn'
        ]
      }
    });
  });

  it('can create an Amazon Connect instance when requested', () => {
    const template = synthesizeTemplate();

    template.hasParameter('CreateConnectInstance', {
      Type: 'String',
      Default: 'false',
      AllowedValues: ['true', 'false']
    });

    template.hasResourceProperties('AWS::Connect::Instance', {
      IdentityManagementType: 'CONNECT_MANAGED',
      Attributes: {
        InboundCalls: true,
        OutboundCalls: true,
        ContactflowLogs: true,
        EarlyMedia: true
      }
    });
  });

  it('outputs the managed Amazon Connect instance id when CDK creates it', () => {
    const template = synthesizeTemplate();

    template.hasOutput('ManagedConnectInstanceId', {
      Value: {
        'Fn::GetAtt': [
          Match.stringLikeRegexp('ManagedConnectInstance'),
          'Id'
        ]
      },
      Condition: 'ShouldCreateConnectInstance'
    });
  });

  it('allows Amazon Connect to invoke the Lambda when association is enabled', () => {
    const template = synthesizeTemplate();

    template.hasResourceProperties('AWS::Lambda::Permission', {
      Action: 'lambda:InvokeFunction',
      Principal: 'connect.amazonaws.com',
      SourceArn: Match.anyValue()
    });
  });

  it('creates a vanity numbers contact flow for the Connect instance', () => {
    const template = synthesizeTemplate();

    template.hasResourceProperties('AWS::Connect::ContactFlow', {
      Name: 'vanity-numbers-flow',
      Type: 'CONTACT_FLOW',
      State: 'ACTIVE',
      InstanceArn: Match.anyValue(),
      Content: Match.anyValue()
    });
  });

  it('can point a claimed phone number at the vanity contact flow', () => {
    const template = synthesizeTemplate();

    template.hasParameter('PhoneNumberId', {
      Type: 'String',
      Default: ''
    });

    template.hasResourceProperties('Custom::AWS', {
      Create: Match.anyValue(),
      Delete: Match.anyValue(),
      InstallLatestAwsSdk: false
    });
  });

  it('creates an AppSync GraphQL API for the dashboard', () => {
    const template = synthesizeTemplate();

    template.hasResourceProperties('AWS::AppSync::GraphQLApi', {
      Name: 'vanity-numbers-dashboard-api',
      AuthenticationType: 'API_KEY',
      XrayEnabled: true
    });

    template.hasResourceProperties('AWS::AppSync::ApiKey', {
      Description: 'API key for the static vanity numbers dashboard'
    });
  });

  it('creates a recent calls resolver backed by DynamoDB', () => {
    const template = synthesizeTemplate();

    template.hasResourceProperties('AWS::AppSync::DataSource', {
      Type: 'AMAZON_DYNAMODB',
      DynamoDBConfig: {
        TableName: {
          Ref: Match.stringLikeRegexp('VanityResultsTable')
        }
      }
    });

    template.hasResourceProperties('AWS::AppSync::Resolver', {
      TypeName: 'Query',
      FieldName: 'recentCalls',
      RequestMappingTemplate: Match.stringLikeRegexp('RecentCallsIndex')
    });
  });

  it('creates private S3 and CloudFront resources for the dashboard', () => {
    const template = synthesizeTemplate();

    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true
      }
    });

    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        DefaultRootObject: 'index.html',
        Enabled: true
      })
    });

    template.hasResourceProperties('AWS::CloudFront::OriginAccessControl', {
      OriginAccessControlConfig: Match.objectLike({
        OriginAccessControlOriginType: 's3',
        SigningBehavior: 'always',
        SigningProtocol: 'sigv4'
      })
    });
  });
});
