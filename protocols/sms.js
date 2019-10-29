const { subscribe, unsubscribe } = require('./lib')

const deploy = async ({ aws, awsConfig, topic, protocol, endpoint, subscriptionAttributes }) => {
  const { SubscriptionArn } = await subscribe({ aws, awsConfig, topic, protocol, endpoint, subscriptionAttributes })
  return { subscriptionArn: SubscriptionArn }
}

const remove = async ({ aws, awsConfig, subscriptionArn }) =>
  unsubscribe({ aws, awsConfig, subscriptionArn })

const types = ['sms']

module.exports = { deploy, remove, types }
