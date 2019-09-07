const { subscribe, unsubscribe, waitForConfirmation } = require('./lib')

// info https://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.html`

const deploy = async ({ aws, awsConfig, topic, protocol, endpoint }) => {
  const { SubscriptionArn } = await subscribe({ aws, awsConfig, topic, protocol, endpoint })
  if (SubscriptionArn === 'pending confirmation') {
    const confirmationResponse = await waitForConfirmation(
      { aws, awsConfig, topic, protocol, endpoint },
      2000
    )
    return confirmationResponse
  }
  return { subscriptionArn: SubscriptionArn }
}

const remove = async ({ aws, awsConfig, subscriptionArn }) => {
  if (subscriptionArn !== 'pending confirmation') {
    return unsubscribe({ aws, awsConfig, subscriptionArn })
  }
}
const types = ['http', 'https']

module.exports = { deploy, remove, types }
