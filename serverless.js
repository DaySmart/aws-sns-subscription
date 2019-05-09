const aws = require('aws-sdk')
const { isNil, mergeDeepRight, pick, merge, equals, not } = require('ramda')
const { Component } = require('@serverless/components')
const { getProtocol, getPrevious, configChanged } = require('./utils')

const outputsList = ['arn']

const defaults = {
  topic: undefined,
  protocol: 'https',
  endpoint: 'https://serverless.com',
  subscriptionAttributes: [],
  region: 'us-east-1'
}

class AwsSnsSubscription extends Component {
  async default(inputs = {}) {
    const config = mergeDeepRight(defaults, inputs)

    const awsConfig = {
      region: config.region,
      credentials: this.context.credentials.aws
    }

    const sns = new aws.SNS(awsConfig)

    const prevSubscription = await getPrevious(merge({ sns }, pick(['endpoint', 'topic'], config)))

    config.arn = prevSubscription ? prevSubscription.SubscriptionArn : null

    if (configChanged({ current: config, previous: prevSubscription })) {
      const response = await getProtocol(config.protocol).deploy(merge({ aws, awsConfig }, config))
      config.arn = response.subscriptionArn
    }

    this.state.endpoint = config.endpoint
    this.state.topic = config.topic
    this.state.protocol = config.protocol
    this.state.arn = config.subscriptionArn

    await this.save()

    const outputs = pick(outputsList, config)
    this.cli.outputs(outputs)
    return outputs
  }

  async shouldDeploy(inputs = {}) {
    const config = mergeDeepRight(defaults, inputs)

    console.log('shouldDeploy', this.state.topic, config.topic)

    // if (this.state.topic !== config.topic) {
    //   return 'replace'
    // }

    return undefined

    // const awsConfig = {
    //   region: config.region,
    //   credentials: this.context.credentials.aws
    // }

    // const sns = new aws.SNS(awsConfig)
    // const prevSubscription = await getPrevious(merge({ sns }, pick(['endpoint', 'topic'], config)))

    // if (!prevSubscription) {
    //   return 'deploy'
    // }

    // this.state.endpoint

    // const inputs = {
    //   topic: this.topic,
    //   protocol: this.protocol,
    //   endpoint: this.endpoint,
    //   subscriptionAttributes: this.subscriptionAttributes
    // }
    // const prevInputs = prevInstance ? pick(keys(inputs), prevInstance) : {}
    // const configChanged = not(equals(inputs, prevInputs))
    // if (
    //   not(equals(prevInstance.protocol, inputs.protocol)) ||
    //   not(equals(prevInstance.topic, inputs.topic))
    // ) {
    //   return 'replace'
    // } else if (configChanged) {
    //   return 'deploy'
    // }

    return undefined
  }
  async remove(inputs = {}) {
    const config = mergeDeepRight(defaults, inputs)

    const awsConfig = {
      region: config.region,
      credentials: this.context.credentials.aws
    }

    const sns = new aws.SNS(awsConfig)

    config.endpoint = inputs.endpoint || this.state.endpoint
    config.topic = inputs.topic || this.state.topic

    const { SubscriptionArn } = await getPrevious(
      merge({ sns }, pick(['endpoint', 'topic'], config))
    )

    config.subscriptionArn = SubscriptionArn

    await getProtocol(config.protocol).remove(merge({ aws, awsConfig }, config))

    this.state = {}
    await this.save()
    return {}
  }
}

module.exports = AwsSnsSubscription
