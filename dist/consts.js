const websiteurl = 'squi.li';

const maxpokes = 802,
 Tiers = ['lc','pu','bl4','nu','bl3','ru','bl2','uu','bl','ou','uber'],
// chatwidth = 400,
 chatheight = 1050,
 minfollowerstoshoutout = 100,
 TwitchID = '32218175',
 defaultavatar = 'http://www-cdn.jtvnw.net/images/xarth/footer_glitch.png',
 bttvemotesurl = 'https://api.betterttv.net/2/emotes',
 ffzemotesurl= 'https://api.frankerfacez.com/v1/set/global',
 fadeDelay = 5000, // Set to false to disable chat fade
 botDelay = 1, // Number of seconds between each bot message
 showChannel = true, // Show repespective channels if the channels is longer than 1
 useColor = true, // Use chatters' colors or to inherit
 // colorbrightness = 0.4,
 // chatopacity = 0.4,
 whitethreshold = 192,
 showBadges = true, // Show chatters' badges
 showEmotes = true, // Show emotes in the chat
 doTimeouts = true, // Hide the messages of people who are timed-out
 doChatClears = true, // Hide the chat from an entire channel
 showHosting = true, // Show when the channel is hosting or not
 showConnectionNotices = true, // Show messages like "Connected" and "Disconnected"
 autocry = false, // Play the pokemon's cry sound whenever it is mentioned in chat
 response_length = 12,
 star = "★",
 points_system = {
  score_for_kill: 50,
  score_for_crit: 50,
  score_for_hax: 50,
  penalty_for_clause: 100
 },

 buttonstyle = {
   x: 8,
   y: 8,
   horizontalorientation: true
 };

// Colors
const buttonborder =  0x4090ff,
 sectioncolors = [
  0xeb485b,
  0x1f9b76,
  0x9f5fff,
  0xd39e14,
  0x1688c7,
  0x7f7f7f
 ],
// const HPcolor =0xFF0000;
// const Attcolor =0xF08030;
// const Defcolor=0xF8D030;
// const SpAttcolor =0x6890F0;
// const SpDefcolor=0x78C850;
// const Specolor=0xF85888;
HPcolor = 0x53c60c,
Attcolor = 0xebcd42,
Defcolor= 0xf87c27,
SpAttcolor = 0x1eaeea,
SpDefcolor= 0x4e77d8,
Specolor= 0xe246db,

Femalecolor=0xF85888,
Malecolor =0x6890F0,

colors = {
   "Bug" : 0xA8B820,
   "Dark" : 0x705848,
   "Dragon" : 0x7038F8,
   "Electric" : 0xF8D030,
   "Fairy" : 0xEE99AC,
   "Fighting" : 0xC03028,
   "Fire" : 0xF08030,
   "Flying" : 0xA890F0,
   "Ghost" : 0x705898,
   "Grass" : 0x78C850,
   "Ground" : 0xE0C068,
   "Ice" : 0x98D8D8,
   "Normal" : 0xA8A878,
   "Poison" : 0xA040A0,
   "Psychic" : 0xF85880,
   "Rock" : 0xB8A038,
   "Steel" : 0xB8B8D0,
   "Water" : 0x6890F0
 };

 //Spritesheets
 const Useravatars = {
   src:'/img/avatars.png',
   x:256,
   y:256,
   total:49
 }

 const spritesheet = {
   src: "/img/pokemonsumo.png",
   x: 38,
   y: 38,
   rowlen: 26,
 }

 // const spritesheet = {
 //   src: "/img/pokemonxy.png",
 //   x: 38,
 //   y: 38,
 //   rowlen: 26,
 // }

 // const spritesheet = {
 //   src: "/img/troz128.png",
 //   x: 128,
 //   y: 128,
 // }

 const playersprite = {
   src: "/img/gen6.png",
   x: 32,
   y: 32,
 }

 // const dexspritesheet = {
 //   src: "/img/pikafan2000.png",
 //   x: 109,
 //   y: 117,
 // }
 //const dexspritesheetrowlen = 25;

 const dexspritesheet = {
   src: "/img/pikafanSuMo.png",
   x: 109,
   y: 112,
 }

 const dexspritesheetrowlen = 35;
 const dexmaxpokes = 802;
