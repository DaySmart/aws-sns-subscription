const { subscribe, unsubscribe } = require('./lib')
const crypto = require('crypto')

const removePermission = async ({ lambda, endpoint, topic }) => {
  const statementId = `InvokeLamda${crypto
    .createHash('md5')
    .update(topic)
    .digest('hex')}`

  return lambda
    .removePermission({
      FunctionName: endpoint,
      StatementId: statementId,
      Qualifier: undefined, // todo
      RevisionId: undefined // todo
    })
    .promise()
}

const updatePermission = async ({ lambda, endpoint, topic }) => {
  const statementId = `InvokeLamda${crypto
    .createHash('md5')
    .update(topic)
    .digest('hex')}`

  try {
    await removePermission({ lambda, endpoint, topic })
  } catch (error) {
    if (error.code !== 'ResourceNotFoundException') {
      throw error
    }
  }

  return lambda
    .addPermission({
      Action: 'lambda:InvokeFunction',
      FunctionName: endpoint,
      Principal: 'sns.amazonaws.com',
      SourceArn: topic,
      StatementId: statementId
    })
    .promise()
}

const deploy = async ({ aws, awsConfig, topic, protocol, endpoint, subscriptionAttributes }) => {
  const lambda = new aws.Lambda(awsConfig)
  const [subscription, permission] = await Promise.all([
    subscribe({ aws, awsConfig, topic, protocol, endpoint, subscriptionAttributes }),
    updatePermission({ lambda, endpoint, topic })
  ])
  return {
    subscriptionArn: subscription.SubscriptionArn,
    statement: permission.Statement
  }
}

const remove = async ({ aws, awsConfig, topic, endpoint, subscriptionArn }) => {
  const lambda = new aws.Lambda(awsConfig)
  const response = Promise.all([
    unsubscribe({ aws, awsConfig, subscriptionArn }),
    removePermission({ lambda, endpoint, topic })
  ])
  return response
}

const types = ['lambda']

module.exports = { deploy, remove, types }
