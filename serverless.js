const aws = require('aws-sdk')
const { isNil, mergeDeepRight, pick, merge, equals, not } = require('ramda')
const { Component } = require('@serverless/components')
const { getProtocol, getPrevious } = require('./utils')

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

    // Temporary should deploy solution
    // until core handles the replacement logic
    const action = await this.shouldDeploy(inputs)
    if (action === 'replace') {
      await this.remove(this.state)
    } else {
      const prevSubscription = await getPrevious(
        merge({ sns }, pick(['endpoint', 'topic'], config))
      )
      config.arn = prevSubscription ? prevSubscription.SubscriptionArn : null
    }

    if (!isNil(action)) {
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

    if (
      not(equals(this.state.endpoint, config.endpoint)) ||
      not(equals(this.state.protocol, config.protocol)) ||
      not(equals(this.state.topic, config.topic))
    ) {
      return 'replace'
    }

    if (not(equals(this.state.subscriptionAttributes || [], config.subscriptionAttributes))) {
      return 'deploy'
    }

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
