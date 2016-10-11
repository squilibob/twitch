# Squilibob's twitch program source for pokemon live streams

## Installation

Install [Nodejs] (https://nodejs.org/).
Once node is installed on the target machine, type `npm install` in the folder where this code resides.

## Database

You need to install rethinkdb on your server.

Database name : Users
Table names: Users, Pokedex, TypeChart

## Usage
### Authentication

You need to create a file called **clientoptions.js** in the /server directory

Example:

``` javascript
var channels = ['streamerchannel'];
var clientOptions = {
    options: {
        debug: false
      },
      connection: {
          cluster: "aws",
          reconnect: true
      },
    identity: {
            username: "botname",
            password: "oauth:1ykpa2fe3e4edabc5ejdon67h89eq0"
        },
    channels: channels
  }
```

Replace streamerchannel with your channel name.
Replace botname with your bot's login name.
Replace password with your oauth for your bot from http://twitchapps.com/tmi/

### Database

In the scripts folder create a file called `serverip.js` and put the IP address of the node server as follows
``` javascript
var serverIP = 'http://localhost';
```

Use `http://localhost` if you are running this on your own machine or if you are using a remote server use its IP address

### Connecting

In the base folder of the project type `node app.js`.
While the node server is running you can then access it in a web browser.
(for example: `http://localhost/server.html`).

## In chat commands
!cmd

## License

MIT (http://www.opensource.org/licenses/mit-license.php)