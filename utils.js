const { concat, find, isNil, propEq, contains, flatten, map } = require('ramda')

const application = require('./protocols/application')
const email = require('./protocols/email')
const http = require('./protocols/http')
const lambda = require('./protocols/lambda')
const sms = require('./protocols/sms')
const sqs = require('./protocols/sqs')

const protocols = [application, email, http, lambda, sms, sqs]

const types = flatten(map((protocol) => protocol.types, protocols))

const getProtocol = (protocol) => {
  if (!contains(protocol, types)) {
    throw new Error(`Invalid protocol "${protocol}"`)
  }
  return find(({ types: deployTypes }) => contains(protocol, deployTypes), protocols)
}

const getPrevious = async ({ sns, topic, endpoint }) => {
  let nextToken
  let subscriptions = []
  do {
    const params = {
      TopicArn: topic
    }
    if (!isNil(nextToken)) {
      params.NextToken = nextToken
    }
    const { Subscriptions, NextToken } = await sns.listSubscriptionsByTopic(params).promise()
    subscriptions = concat(subscriptions, Subscriptions)
    nextToken = NextToken
  } while (!isNil(nextToken))
  const subscription = find(propEq('Endpoint', endpoint), subscriptions)
  return subscription
}

module.exports = {
  getPrevious,
  getProtocol
}
