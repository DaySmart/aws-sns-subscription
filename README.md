# AWS SNS Subscription

Deploy SNS Subscription to AWS in seconds with [Serverless Components](https://github.com/serverless/components).

&nbsp;

- [AWS SNS Subscription](#aws-sns-subscription)
    - [1. Install](#1-install)
    - [2. Create](#2-create)
    - [3. Configure](#3-configure)
    - [4. Deploy](#4-deploy)
    - [New to Components?](#new-to-components)

&nbsp;


### 1. Install

```console
$ npm install -g @serverless/components
```

### 2. Create

Just create a `serverless.yml` file

```shell
$ touch serverless.yml
$ touch .env      # your development AWS api keys
$ touch .env.prod # your production AWS api keys
```

the `.env` files are not required if you have the aws keys set globally and you want to use a single stage, but they should look like this.

```
AWS_ACCESS_KEY_ID=XXX
AWS_SECRET_ACCESS_KEY=XXX
```

### 3. Configure

```yml
# serverless.yml

name: my-topic
stage: dev

AwsSnsSubscriptionLambda:
  component: '@serverless/aws-sns-subscription'
  inputs:
    topic: arn:aws:sns:us-east-1:123456789012:my-topic
    protocol: lambda
    endpoint: arn:aws:lambda:us-east-1:123456789012:function:my-function
AwsSnsSubscriptionEmail:
  component: '@serverless/aws-sns-subscription'
  inputs:
    topic: arn:aws:sns:us-east-1:123456789012:my-topic
    protocol: email
    endpoint: hello@serverless.com
```

### 4. Deploy

```console
AwsSnsSubscription (master)$ components

  AwsSnsSubscriptionLambda › outputs:
  arn:  'arn:aws:sns:us-east-1:123456789012:my-topic:95e7dbca-9e45-4e4d-84f3-66f282b89b01'

  AwsSnsSubscriptionEmail › outputs:
  arn:  'arn:aws:sns:us-east-1:123456789012:my-topic:2495cad9-928a-4853-84b1-fcf613df61e7'


  2s › dev › AwsSnsSubscription › done

AwsSnsSubscription (master)$

```

### New to Components?

Checkout the [Serverless Components](https://github.com/serverless/components) repo for more information.
