# Vanity Number Generator

A serverless AWS application that generates vanity phone numbers for Amazon Connect callers.

When a caller dials the Amazon Connect phone number, the contact flow invokes a Lambda function. The Lambda function reads the caller's phone number, generates vanity number options, stores the caller number and best five vanity numbers in DynamoDB, and returns the top three options back to Amazon Connect to be spoken to the caller.

The project also includes a lightweight dashboard hosted from S3/CloudFront. The dashboard calls AWS AppSync to display vanity numbers from the last five callers.

## Architecture

![Architecture Diagram](./diagrams/architecture.png)



### Voice Flow

1. Caller dials the Amazon Connect phone number.
2. Amazon Connect Contact Flow invokes the Vanity Generator Lambda.
3. Lambda reads the caller's phone number from the Amazon Connect event.
4. Lambda generates and scores vanity number candidates.
5. Lambda stores the caller number and best five vanity numbers in DynamoDB.
6. Lambda returns `vanity1`, `vanity2`, and `vanity3` to Amazon Connect.
7. Amazon Connect speaks the three vanity number options to the caller.

### Dashboard Flow

1. Reviewer opens the dashboard URL.
2. CloudFront serves the static frontend from a private S3 bucket.
3. The frontend calls AppSync with a `recentCalls(limit: 5)` GraphQL query.
4. AppSync queries DynamoDB using the `RecentCallsIndex`.
5. The dashboard displays the last five callers and generated vanity numbers.

## Tech Stack

- AWS CDK v2
- TypeScript
- AWS Lambda
- Amazon Connect
- Amazon DynamoDB
- AWS AppSync
- Amazon S3
- Amazon CloudFront
- Jest
