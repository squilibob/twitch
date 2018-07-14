exports.parseUser = (user, userdata) => {
  user.isStreamer =  streamers.includes(user.username)
  user.badges = !!user.badges ? Object.keys(user.badges).map(key => badges[key][user.badges[key]]).filter(item => !!item) : []
  if (userdata.avatar) user.avatar = userdata.avatar
  if (userdata.badge) user.badge = userdata.badge
  if (userdata.card) user.card = userdata.card
  if (user.color) {
    user.color = user.color.match(new RegExp('\([0-9a-fA-F]{6})'))
    .map(item => parseInt(item, 16))
    .pop()
  }
  else {
    user.color = ~~(Math.random()*0xffffff)
  }
  return user
}

exports.getBitImage = (bits) => {
    let list = Object.entries(badges.bits)
    let found = 1
    list.forEach(item => { if (item[0] <= bits) found = item[1] })
    return found
}

let badges = {
    "admin": {
        "1": {url: "9ef7e029-4cdf-4d4d-a0d5-e2b3fb2583fe", color: 0xfaaf19}},
    "bits": {
        "1": {url: "73b5c3fb-24f9-4a82-a852-2f475b59411c", color: 0xcac7d0},
        "100": {url: "09d93036-e7ce-431c-9a9e-7044297133f2", color: 0xc191ff},
        "1000": {url: "0d85a29e-79ad-4c63-a285-3acd2c66f2ba", color: 0x7ecdb7},
        "5000": {url: "57cd97fc-3e9e-4c6d-9d41-60147137234e", color: 0x59b3ff},
        "10000": {url: "68af213b-a771-4124-b6e3-9bb6d98aa732", color: 0xe84b3a},
        "25000": {url: "64ca5920-c663-4bd8-bfb1-751b4caea2dd", color: 0xdf77a8},
        "50000": {url: "62310ba7-9916-4235-9eba-40110d67f85d", color: 0xe7934b},
        "75000": {url: "ce491fa4-b24f-4f3b-b6ff-44b080202792", color: 0x59c241},
        "100000": {url: "96f0540f-aa63-49e1-a8b3-259ece3bd098", color: 0xfdc844},
        "200000": {url: "4a0b90c4-e4ef-407f-84fe-36b14aebdbb6", color: 0x3b3561},
        "300000": {url: "ac13372d-2e94-41d1-ae11-ecd677f69bb6", color: 0x3b3561},
        "400000": {url: "a8f393af-76e6-4aa2-9dd0-7dcc1c34f036", color: 0x3b3561},
        "500000": {url: "f6932b57-6a6e-4062-a770-dfbd9f4302e5", color: 0x3b3561},
        "600000": {url: "4d908059-f91c-4aef-9acb-634434f4c32e", color: 0x3b3561},
        "700000": {url: "a1d2a824-f216-4b9f-9642-3de8ed370957", color: 0x3b3561},
        "800000": {url: "5ec2ee3e-5633-4c2a-8e77-77473fe409e6", color: 0x3b3561},
        "900000": {url: "088c58c6-7c38-45ba-8f73-63ef24189b84", color: 0x3b3561},
        "1000000": {url: "494d1c8e-c3b2-4d88-8528-baff57c9bd3f", color: 0x3b3561},
        "1250000": {url: "ce217209-4615-4bf8-81e3-57d06b8b9dc7", color: 0x3b3561},
        "1500000": {url: "c4eba5b4-17a7-40a1-a668-bc1972c1e24d", color: 0x3b3561},
        "1750000": {url: "183f1fd8-aaf4-450c-a413-e53f839f0f82", color: 0x3b3561},
        "2000000": {url: "7ea89c53-1a3b-45f9-9223-d97ae19089f2", color: 0x3b3561},
        "2500000": {url: "cf061daf-d571-4811-bcc2-c55c8792bc8f", color: 0x3b3561},
        "3000000": {url: "5671797f-5e9f-478c-a2b5-eb086c8928cf", color: 0x3b3561},
        "3500000": {url: "c3d218f5-1e45-419d-9c11-033a1ae54d3a", color: 0x3b3561},
        "4000000": {url: "79fe642a-87f3-40b1-892e-a341747b6e08", color: 0x3b3561},
        "4500000": {url: "736d4156-ac67-4256-a224-3e6e915436db", color: 0x3b3561},
        "5000000": {url: "3f085f85-8d15-4a03-a829-17fca7bf1bc2", color: 0x3b3561}},
    "bits-leader": {
        "1": {url: "8cd8857e-0c6e-11e8-817e-43b3708f4307", color: 0x000000},
        "2": {url: "8d374460-0c6e-11e8-8edf-db32960c541d", color: 0x000000},
        "3": {url: "8d8f58a8-0c6e-11e8-b2b0-9b39baa15cdd", color: 0x000000}},
    "broadcaster": {
        "1": {url: "5527c58c-fb7d-422d-b71b-f309dcb85cc1", color: 0xe71818}},
    "clip-champ": {
        "1": {url: "f38976e0-ffc9-11e7-86d6-7f98b26a9d79", color: 0x6441a4}},
    "global_mod": {
        "1": {url: "9384c43e-4ce7-4e94-b2a1-b93656896eba", color: 0x006f20}},
    "moderator": {
        "1": {url: "3267646d-33f0-4b17-b3df-f923a41db1d0", color: 0x34ae0a}},
    "partner": {
        "1": {url: "d12a2e27-16f6-41d0-ab77-b780518f00a3", color: 0x6441a4}},
    "premium": {
        "1": {url: "a1dd5073-19c3-4911-8cb4-c464a7bc1510", color: 0x009cdc}},
    "staff": {
        "1": {url: "d97c37bd-a6f5-4c38-8f57-4e4bef88af34", color: 0x3b2064}},
    "sub-gifter": {
        "1": {url: "4592e9ea-b4ca-4948-93b8-37ac198c0433", color: 0x000000}},
    "subscriber": {
        "0": {url: "5d9f2208-5dd8-11e7-8513-2ff4adfae661", color: 0x6441a4},
        "1": {url: "5d9f2208-5dd8-11e7-8513-2ff4adfae661", color: 0x6441a4}},
    "turbo": {
        "1": {url: "bd444ec6-8f34-4bf9-91f4-af1e3428d80f", color: 0x6441a4}},
    "twitchbot": {
        "1": {url: "df9095f6-a8a0-4cc2-bb33-d908c0adffb8", color: 0x34ae0a}}
    }