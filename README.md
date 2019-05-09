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
...
```

### 4. Deploy

```console
AwsSnsSubscription (master)$ components

  AwsSnsSubscription › outputs:
  ....


  4s › dev › AwsSnsSubscription › done

AwsSnsSubscription (master)$

```

### New to Components?

Checkout the [Serverless Components](https://github.com/serverless/components) repo for more information.
