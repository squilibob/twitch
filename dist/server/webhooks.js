const request = require('request')

const leaseSeconds = 300 //864000
const mode = 'subscribe'
const callback = 'http://6260b045.ngrok.io/webhook'

exports.followerhook = async function(id) {
  return await hook(id, leaseSeconds, `https://api.twitch.tv/helix/users/follows?first=1%26to_id=${id}`)
}

exports.streaminghook = async function(id) {
  return await hook(id, leaseSeconds, `https://api.twitch.tv/helix/streams?user_id=${id}`)
}

async function hook(id, lease, topic){
  return new Promise(function(resolve, reject) {
    lease = lease || leaseSeconds
    let hub = [
      `hub.mode=${mode}`,
      `hub.callback=${callback}`,
      `hub.lease_seconds=${lease}`,
      `hub.topic=${topic}`
    ].join('&')

    request(({ method: 'POST', json: true, url: 'https://api.twitch.tv/helix/webhooks/hub?' + hub, headers: {'Client-ID': 'io9mxavi6gydth1syn160qyymeyc8fl'}}),
     (err, res, body) => {
      err && reject('webhooks failed')
      resolve(res.toJSON().statusCode === 202 ? 'webhook connected' : res.toJSON().statusCode + ' Error: ' + body.message)
    })
  })
}