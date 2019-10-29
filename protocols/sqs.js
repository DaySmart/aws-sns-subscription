const { subscribe, unsubscribe, splitArn } = require('./lib')

const deploy = async ({ aws, awsConfig, topic, protocol, endpoint, subscriptionAttributes }) => {
  const sqs = new aws.SQS(awsConfig)
  const { region, accountId, resource } = splitArn(endpoint)
  const queueUrl = `https://sqs.${region}.amazonaws.com/${accountId}/${resource}`
  const { SubscriptionArn } = await subscribe({ aws, awsConfig, topic, protocol, endpoint, subscriptionAttributes })
  const permission = {
    QueueUrl: queueUrl,
    Attributes: {
      Policy: JSON.stringify({
        Version: '2012-10-17',
        Id: `SQSQueuePolicy${Date.now()}`,
        Statement: [
          {
            Sid: `SQSStatement${Date.now()}`,
            Effect: 'Allow',
            Principal: '*',
            Action: ['sqs:SendMessage'],
            Resource: endpoint,
            Condition: {
              ArnEquals: {
                'aws:SourceArn': topic
              }
            }
          }
        ]
      })
    }
  }
  await sqs.setQueueAttributes(permission).promise()
  return {
    subscriptionArn: SubscriptionArn,
    permission
  }
}

const remove = async ({ aws, awsConfig, subscriptionArn, endpoint }) => {
  const sqs = new aws.SQS(awsConfig)
  const { region, accountId, resource } = splitArn(endpoint)
  const queueUrl = `https://sqs.${region}.amazonaws.com/${accountId}/${resource}`
  const response = Promise.all([
    unsubscribe({ aws, awsConfig, subscriptionArn }),
    sqs
      .setQueueAttributes({
        QueueUrl: queueUrl,
        Attributes: {
          Policy: ''
        }
      })
      .promise()
  ])
  return response
}

const types = ['sqs']

module.exports = { deploy, remove, types }
