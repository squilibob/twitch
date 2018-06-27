const request = require('request')
const clientOptions = require('./chat/clientoptions')

const leaseSeconds = 864000
const mode = 'subscribe'
const callback = 'http://squi.li/webhook'

exports.followerhook = async function (id) {
  return await hook(id, `https://api.twitch.tv/helix/users/follows?first=1%26to_id=${id}`, leaseSeconds)
}

exports.streaminghook = async function (id) {
  return await hook(id, `https://api.twitch.tv/helix/streams?user_id=${id}`, leaseSeconds)
}

async function hook(id, topic, lease){
  return new Promise(function (resolve, reject) {
    lease = lease || leaseSeconds
    let hub = [
      `hub.mode=${mode}`,
      `hub.callback=${callback}`,
      `hub.lease_seconds=${lease}`,
      `hub.topic=${topic}`
    ].join('&')

    request(({ method: 'POST', json: true, url: 'https://api.twitch.tv/helix/webhooks/hub?' + hub, headers: {'Client-ID': clientOptions.options.clientId}}),
     (err, res, body) => {
      err && reject('webhooks failed')
      resolve(res.toJSON().statusCode === 202 ? 'webhook connected' : res.toJSON().statusCode + ' Error: ' + body.message)
    })
  })
}