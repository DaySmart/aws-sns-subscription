const { subscribe, unsubscribe } = require('./lib')

const deploy = async ({ aws, awsConfig, topic, protocol, endpoint }) =>{
  const { SubscriptionArn } = await subscribe({ aws, awsConfig, topic, protocol, endpoint })
  return { subscriptionArn: SubscriptionArn }
}


const remove = async ({ aws, awsConfig, subscriptionArn }) =>
  unsubscribe({ aws, awsConfig, subscriptionArn })

const types = ['application']

module.exports = {
  deploy,
  remove,
  types
}
