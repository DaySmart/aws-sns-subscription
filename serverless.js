const aws = require('aws-sdk')
const { isNil, mergeDeepRight, pick, merge, equals, not } = require('ramda')
const { Component } = require('@serverless/core')
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
    this.context.status(`Deploying`)
    const config = mergeDeepRight(defaults, inputs)
    const awsConfig = {
      region: config.region,
      credentials: this.context.credentials.aws
    }

    const sns = new aws.SNS(awsConfig)

    // Temporary should deploy solution
    // until core handles the replacement logic
    const action = this.shouldDeploy(inputs)
    if (action === 'replace' && Object.keys(this.state).length !== 0) {
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
    return outputs
  }

  shouldDeploy(inputs = {}) {
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
    this.context.status(`Removing`)
    const config = mergeDeepRight(defaults, inputs)

    const awsConfig = {
      region: config.region,
      credentials: this.context.credentials.aws
    }

    const sns = new aws.SNS(awsConfig)

    config.endpoint = inputs.endpoint || this.state.endpoint
    config.topic = inputs.topic || this.state.topic

    if (!config.endpoint && !config.topic) {
      return
    }

    try {
      const previousInstance = await getPrevious(
        merge({ sns }, pick(['endpoint', 'topic'], config))
      )

      if (isNil(previousInstance)) {
        const error = new Error('No previous deployment')
        error.code = 'NotFound'
        throw error
      }

      config.subscriptionArn = previousInstance.SubscriptionArn
      await getProtocol(config.protocol).remove(merge({ aws, awsConfig }, config))
    } catch (error) {
      if (error.code !== 'NotFound') {
        throw error
      }
    }

    this.state = {}
    await this.save()
    return {}
  }
}

module.exports = AwsSnsSubscription
