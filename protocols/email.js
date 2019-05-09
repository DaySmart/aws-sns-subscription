const { subscribe, unsubscribe } = require('./lib')

const deploy = async ({ aws, awsConfig, topic, protocol, endpoint }) =>
  subscribe({ aws, awsConfig, topic, protocol, endpoint })

const remove = async ({ aws, awsConfig, subscriptionArn }) => {
  if (subscriptionArn !== 'PendingConfirmation') {
    return unsubscribe({ aws, awsConfig, subscriptionArn })
  }
}

const types = ['email', 'email-json']

module.exports = { deploy, remove, types }
