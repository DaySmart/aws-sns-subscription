const { subscribe, unsubscribe } = require('./lib')

const deploy = async ({ aws, awsConfig, topic, protocol, endpoint }) =>
  subscribe({ aws, awsConfig, topic, protocol, endpoint })

const remove = async ({ aws, awsConfig, subscriptionArn }) =>
  unsubscribe({ aws, awsConfig, subscriptionArn })

const types = ['application']

module.exports = {
  deploy,
  remove,
  types
}
