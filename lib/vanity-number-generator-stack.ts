import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import {
  CfnCondition,
  CfnOutput,
  CfnParameter,
  Fn,
  RemovalPolicy
} from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as connect from 'aws-cdk-lib/aws-connect';
import * as cr from 'aws-cdk-lib/custom-resources';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

export class VanityNumberGeneratorStack extends cdk.Stack {
  public readonly vanityResultsTable: dynamodb.Table;
  public readonly vanityGeneratorFunction: nodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const connectInstanceId = new CfnParameter(this, 'ConnectInstanceId', {
      type: 'String',
      default: '',
      description:
        'Optional existing Amazon Connect instance id. Leave blank when CreateConnectInstance is true.'
    });

    const createConnectInstance = new CfnParameter(
      this,
      'CreateConnectInstance',
      {
        type: 'String',
        default: 'false',
        allowedValues: ['true', 'false'],
        description:
          'Set to true to create an Amazon Connect instance in this stack.'
      }
    );

    const connectInstanceAlias = new CfnParameter(
      this,
      'ConnectInstanceAlias',
      {
        type: 'String',
        default: 'vanity-numbers-demo',
        description:
          'Alias for the optional CDK-managed Amazon Connect instance. Must be unique in this AWS account and region.'
      }
    );

    const phoneNumberId = new CfnParameter(this, 'PhoneNumberId', {
      type: 'String',
      default: '',
      description:
        'Optional claimed Amazon Connect phone number id. When provided with ConnectInstanceId, CDK points the number at the vanity contact flow.'
    });

    const shouldCreateConnectInstance = new CfnCondition(
      this,
      'ShouldCreateConnectInstance',
      {
        expression: Fn.conditionEquals(
          createConnectInstance.valueAsString,
          'true'
        )
      }
    );

    const hasConnectInstanceId = new CfnCondition(
      this,
      'HasConnectInstanceId',
      {
        expression: Fn.conditionNot(
          Fn.conditionEquals(connectInstanceId.valueAsString, '')
        )
      }
    );

    const hasConnectInstance = new CfnCondition(this, 'HasConnectInstance', {
      expression: Fn.conditionOr(
        shouldCreateConnectInstance,
        hasConnectInstanceId
      )
    });

    const hasPhoneNumberId = new CfnCondition(this, 'HasPhoneNumberId', {
      expression: Fn.conditionAnd(
        hasConnectInstance,
        Fn.conditionNot(Fn.conditionEquals(phoneNumberId.valueAsString, ''))
      )
    });

    const managedConnectInstance = new connect.CfnInstance(
      this,
      'ManagedConnectInstance',
      {
        identityManagementType: 'CONNECT_MANAGED',
        instanceAlias: connectInstanceAlias.valueAsString,
        attributes: {
          inboundCalls: true,
          outboundCalls: true,
          contactflowLogs: true,
          earlyMedia: true
        }
      }
    );
    managedConnectInstance.cfnOptions.condition = shouldCreateConnectInstance;

    const effectiveConnectInstanceId = cdk.Token.asString(
      Fn.conditionIf(
        'ShouldCreateConnectInstance',
        managedConnectInstance.attrId,
        connectInstanceId.valueAsString
      )
    );

    const connectInstanceArn = cdk.Stack.of(this).formatArn({
      service: 'connect',
      resource: 'instance',
      resourceName: effectiveConnectInstanceId
    });

    this.vanityResultsTable = new dynamodb.Table(this, 'VanityResultsTable', {
      partitionKey: {
        name: 'contactId',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true
      },
      removalPolicy: RemovalPolicy.DESTROY
    });

    this.vanityResultsTable.addGlobalSecondaryIndex({
      indexName: 'RecentCallsIndex',
      partitionKey: {
        name: 'recentCallsPartition',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'createdAt',
        type: dynamodb.AttributeType.STRING
      },
      projectionType: dynamodb.ProjectionType.ALL
    });

    this.vanityGeneratorFunction = new nodejs.NodejsFunction(
      this,
      'VanityGeneratorFunction',
      {
        entry: path.join(
          __dirname,
          '..',
          'src',
          'lambdas',
          'vanity-generator',
          'handler.ts'
        ),
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        architecture: lambda.Architecture.ARM_64,
        memorySize: 256,
        timeout: cdk.Duration.seconds(10),
        environment: {
          VANITY_RESULTS_TABLE_NAME: this.vanityResultsTable.tableName
        },
        bundling: {
          minify: true,
          sourceMap: true,
          target: 'node20'
        }
      }
    );

    this.vanityResultsTable.grantWriteData(this.vanityGeneratorFunction);

    const lambdaAssociation = new connect.CfnIntegrationAssociation(
      this,
      'VanityGeneratorLambdaAssociation',
      {
        instanceId: connectInstanceArn,
        integrationArn: this.vanityGeneratorFunction.functionArn,
        integrationType: 'LAMBDA_FUNCTION'
      }
    );
    lambdaAssociation.cfnOptions.condition = hasConnectInstance;

    const contactFlow = new connect.CfnContactFlow(
      this,
      'VanityNumbersContactFlow',
      {
        instanceArn: connectInstanceArn,
        name: 'vanity-numbers-flow',
        description:
          'Invokes the vanity number Lambda and speaks the top three results.',
        type: 'CONTACT_FLOW',
        state: 'ACTIVE',
        content: createVanityContactFlowContent(
          this.vanityGeneratorFunction.functionArn
        )
      }
    );
    contactFlow.cfnOptions.condition = hasConnectInstance;
    contactFlow.addDependency(lambdaAssociation);

    const connectInvokePermission = new lambda.CfnPermission(
      this,
      'AllowAmazonConnectInvokeVanityGenerator',
      {
        action: 'lambda:InvokeFunction',
        functionName: this.vanityGeneratorFunction.functionName,
        principal: 'connect.amazonaws.com',
        sourceArn: connectInstanceArn
      }
    );
    connectInvokePermission.cfnOptions.condition = hasConnectInstance;

    const phoneNumberAssociation = new cr.AwsCustomResource(
      this,
      'VanityPhoneNumberContactFlowAssociation',
      {
        onCreate: {
          service: 'Connect',
          action: 'associatePhoneNumberContactFlow',
          parameters: {
            InstanceId: effectiveConnectInstanceId,
            PhoneNumberId: phoneNumberId.valueAsString,
            ContactFlowId: contactFlow.attrContactFlowArn
          },
          physicalResourceId: cr.PhysicalResourceId.of(
            cdk.Fn.join('', [
              effectiveConnectInstanceId,
              '-',
              phoneNumberId.valueAsString,
              '-vanity-flow'
            ])
          )
        },
        onUpdate: {
          service: 'Connect',
          action: 'associatePhoneNumberContactFlow',
          parameters: {
            InstanceId: effectiveConnectInstanceId,
            PhoneNumberId: phoneNumberId.valueAsString,
            ContactFlowId: contactFlow.attrContactFlowArn
          },
          physicalResourceId: cr.PhysicalResourceId.of(
            cdk.Fn.join('', [
              effectiveConnectInstanceId,
              '-',
              phoneNumberId.valueAsString,
              '-vanity-flow'
            ])
          )
        },
        onDelete: {
          service: 'Connect',
          action: 'disassociatePhoneNumberContactFlow',
          parameters: {
            InstanceId: effectiveConnectInstanceId,
            PhoneNumberId: phoneNumberId.valueAsString
          }
        },
        policy: cr.AwsCustomResourcePolicy.fromStatements([
          new iam.PolicyStatement({
            actions: [
              'connect:AssociatePhoneNumberContactFlow',
              'connect:DisassociatePhoneNumberContactFlow'
            ],
            resources: ['*']
          })
        ]),
        installLatestAwsSdk: false
      }
    );
    const phoneNumberAssociationCustomResource = (
      phoneNumberAssociation as unknown as { customResource: cdk.CustomResource }
    ).customResource;
    const phoneNumberAssociationResource =
      phoneNumberAssociationCustomResource.node
        .defaultChild as cdk.CfnResource;
    phoneNumberAssociationResource.cfnOptions.condition = hasPhoneNumberId;

    const dashboardApi = new appsync.GraphqlApi(this, 'VanityDashboardApi', {
      name: 'vanity-numbers-dashboard-api',
      definition: appsync.Definition.fromFile(
        path.join(__dirname, '..', 'graphql', 'schema.graphql')
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            name: 'DashboardApiKey',
            description: 'API key for the static vanity numbers dashboard',
            expires: cdk.Expiration.after(cdk.Duration.days(30))
          }
        }
      },
      xrayEnabled: true
    });

    const dashboardDataSource = dashboardApi.addDynamoDbDataSource(
      'VanityResultsDataSource',
      this.vanityResultsTable
    );

    dashboardDataSource.createResolver('RecentCallsResolver', {
      typeName: 'Query',
      fieldName: 'recentCalls',
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        {
          "version": "2018-05-29",
          "operation": "Query",
          "index": "RecentCallsIndex",
          "query": {
            "expression": "recentCallsPartition = :partition",
            "expressionValues": {
              ":partition": $util.dynamodb.toDynamoDBJson("RECENT_CALLS")
            }
          },
          "scanIndexForward": false,
          "limit": $util.defaultIfNull($ctx.args.limit, 5)
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.fromString(
        '$util.toJson($ctx.result.items)'
      )
    });

    const dashboardBucket = new s3.Bucket(this, 'DashboardBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    const dashboardDistribution = new cloudfront.Distribution(
      this,
      'DashboardDistribution',
      {
        defaultRootObject: 'index.html',
        defaultBehavior: {
          origin: origins.S3BucketOrigin.withOriginAccessControl(
            dashboardBucket
          ),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
        },
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
            ttl: cdk.Duration.minutes(5)
          },
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
            ttl: cdk.Duration.minutes(5)
          }
        ]
      }
    );

    new s3deploy.BucketDeployment(this, 'DashboardDeployment', {
      destinationBucket: dashboardBucket,
      distribution: dashboardDistribution,
      distributionPaths: ['/*'],
      sources: [
        s3deploy.Source.asset(
          path.join(__dirname, '..', 'frontend', 'dashboard')
        ),
        s3deploy.Source.data(
          'config.js',
          `window.VANITY_DASHBOARD_CONFIG = {
  graphqlUrl: ${JSON.stringify(dashboardApi.graphqlUrl)},
  apiKey: ${JSON.stringify(dashboardApi.apiKey ?? '')}
};`
        )
      ]
    });

    new CfnOutput(this, 'VanityResultsTableName', {
      value: this.vanityResultsTable.tableName
    });

    new CfnOutput(this, 'VanityGeneratorFunctionName', {
      value: this.vanityGeneratorFunction.functionName
    });

    new CfnOutput(this, 'VanityGeneratorFunctionArn', {
      value: this.vanityGeneratorFunction.functionArn
    });

    new CfnOutput(this, 'VanityContactFlowArn', {
      value: contactFlow.attrContactFlowArn,
      condition: hasConnectInstance
    });

    new CfnOutput(this, 'ManagedConnectInstanceId', {
      value: managedConnectInstance.attrId,
      condition: shouldCreateConnectInstance
    });

    new CfnOutput(this, 'ManagedConnectInstanceArn', {
      value: managedConnectInstance.attrArn,
      condition: shouldCreateConnectInstance
    });

    new CfnOutput(this, 'DashboardUrl', {
      value: `https://${dashboardDistribution.distributionDomainName}`
    });

    new CfnOutput(this, 'DashboardGraphqlUrl', {
      value: dashboardApi.graphqlUrl
    });
  }
}

function createVanityContactFlowContent(lambdaArn: string): string {
  return JSON.stringify({
    Version: '2019-10-30',
    StartAction: 'invoke-vanity-generator',
    Metadata: {
      EntryPointPosition: {
        x: 40,
        y: 40
      },
      ActionMetadata: {
        'invoke-vanity-generator': {
          Position: {
            x: 180,
            y: 40
          }
        },
        'speak-vanity-results': {
          Position: {
            x: 420,
            y: 40
          }
        },
        'speak-error': {
          Position: {
            x: 420,
            y: 220
          }
        },
        disconnect: {
          Position: {
            x: 700,
            y: 40
          }
        }
      }
    },
    Actions: [
      {
        Identifier: 'invoke-vanity-generator',
        Type: 'InvokeLambdaFunction',
        Parameters: {
          LambdaFunctionARN: lambdaArn,
          InvocationTimeLimitSeconds: '8',
          InvocationType: 'SYNCHRONOUS',
          ResponseValidation: {
            ResponseType: 'STRING_MAP'
          }
        },
        Transitions: {
          NextAction: 'speak-vanity-results',
          Errors: [
            {
              ErrorType: 'NoMatchingError',
              NextAction: 'speak-error'
            }
          ],
          Conditions: []
        }
      },
      {
        Identifier: 'speak-vanity-results',
        Type: 'MessageParticipant',
        Parameters: {
          Text: 'Your vanity number options are $.External.vanity1, $.External.vanity2, and $.External.vanity3.'
        },
        Transitions: {
          NextAction: 'disconnect',
          Errors: [
            {
              ErrorType: 'NoMatchingError',
              NextAction: 'disconnect'
            }
          ],
          Conditions: []
        }
      },
      {
        Identifier: 'speak-error',
        Type: 'MessageParticipant',
        Parameters: {
          Text: 'Sorry, we could not generate vanity number options for your phone number.'
        },
        Transitions: {
          NextAction: 'disconnect',
          Errors: [],
          Conditions: []
        }
      },
      {
        Identifier: 'disconnect',
        Type: 'DisconnectParticipant',
        Parameters: {},
        Transitions: {}
      }
    ]
  });
}
