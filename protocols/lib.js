const { find, isNil, whereEq } = require('ramda')

const subscribe = async ({ aws, awsConfig, topic, protocol, endpoint }) => {
  const sns = new aws.SNS(awsConfig)
  const response = await sns
    .subscribe({
      TopicArn: topic,
      Protocol: protocol,
      Endpoint: endpoint
    })
    .promise()
  return response
}

const unsubscribe = async ({ aws, awsConfig, subscriptionArn }) => {
  const sns = new aws.SNS(awsConfig)
  const response = await sns
    .unsubscribe({
      SubscriptionArn: subscriptionArn
    })
    .promise()
  return response
}

const setSubscriptionAttributes = async ({
  sns,
  subscriptionArn,
  attributeName,
  attributeValue
}) => {
  try {
    const response = await sns
      .setSubscriptionAttributes({
        AttributeName: attributeName,
        SubscriptionArn: subscriptionArn,
        AttributeValue:
          typeof attributeValue === 'string' ? attributeValue : JSON.stringify(attributeValue)
      })
      .promise()
    return response
  } catch (error) {
    if (!error.message.includes('does not support raw message delivery')) {
      // raw message delivery is only supported in http/s and SQS protocols
      // this will suppress the error if RawMessageDelivery is defined
      throw error
    }
  }
}

const waitForConfirmation = async (
  { aws, awsConfig, topic, protocol, endpoint },
  interval = 5000,
  timeout = 60000
) =>
  new Promise((resolve, reject) => {
    const sns = new aws.SNS(awsConfig)
    const startTime = Date.now()
    // TODO: This poller has a flaw where the duration of the call to the API could last longer than the interval. It should instead wait until the previous call is complete before executing the next call.
    const pollInterval = setInterval(async () => {
      if (Date.now() - startTime > timeout) {
        clearInterval(pollInterval)
        return reject('Confirmation timed out')
      }
      const subscriptions = await sns
        .listSubscriptionsByTopic({
          TopicArn: topic
        })
        .promise()
      // topic can have only one subscription with same protocol and endpoint
      const created = find(whereEq({ Protocol: protocol, Endpoint: endpoint }))(
        subscriptions.Subscriptions
      )
      if (
        !isNil(created) &&
        (created.SubscriptionArn !== 'pending confirmation' &&
          created.SubscriptionArn !== 'PendingConfirmation')
      ) {
        clearInterval(pollInterval)
        return resolve({ subscriptionArn: created.SubscriptionArn })
      }
    }, interval)
  })

function splitArn(arnToSplit) {
  const [arn, partition, service, region, accountId, ...resources] = arnToSplit.split(':')
  let resourceType
  let resource

  if (resources.length === 1 && resources[0].includes('/')) {
    const split = resources[0].split('/')
    resourceType = split[0]
    resource = split[1]
  } else if (resources.length === 1) {
    resource = resources[0]
  } else {
    resourceType = resources[0]
    resource = resources[1]
  }
  return {
    arn,
    partition,
    service,
    region,
    accountId,
    resourceType,
    resource
  }
}

module.exports = {
  subscribe,
  unsubscribe,
  setSubscriptionAttributes,
  waitForConfirmation,
  splitArn
}
