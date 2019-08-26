const tmi = require('tmi.js');
var request = require('request');
var CronJob = require('cron').CronJob;
const database = require('./database');
const config = require('./config').config;

const client = new tmi.client(config);
client.on('connected', onConnectedHandler);
client.on('message', onMessageHandler);

client.connect();

function onConnectedHandler(addr, port) {
    console.log('connected on addr: ' + addr + ' port: ' + port);
    config.channels.forEach(function (channel) {
        // client.action(channel, config.identity.username + ' has connected!');
    });
}

function onMessageHandler(channel, user, message, self) {
    if (self) { // ignore messages for the bot
        return;
    }

    if (message === undefined || message === null) {
        return;
    }

    const command = message.trim().toLowerCase().split(/\b\s+/);
    const username = user['username'];

    if (command.length < 1) {
        return;
    }

    if (command[0] === "!points") {
        database.grabPointsByUser(username).then(function(points) {
            client.action(channel, username + ' has ' + points + ' points');
        });
    } else if (command[0] === "!gamble" && command.length === 2) {
        if (command[1] !== 'all' && !isNaN(parseInt(command[1], 10))) {
            return;
        }
        database.grabPointsByUser(username).then(function (points) {
            let numToGamble;
            if (command[1] === 'all') {
                numToGamble = points;
            } else {
                numToGamble = parseInt(command[1], 10);
            }

            if (num > points) {
                client.action(channel, username + ' doesn\'t have enough points. You have ' + points + ' points');
                return;
            }
            gamble(channel, username, numToGamble);
        });
    }
    if (user === 'rosebananax33' || 'pandalifestyle0') {
        if (command[0] === "!incrementPoints" && command.length > 2 && !isNaN(parseInt(command[1], 10))) {
            const num = parseInt(command[1]);
            if (num <= 0 || num >= 1000) {
                client.action(channel, 'Valid number of points to increment is between 1 and 999');
                return;
            }

            incrementPointsAllUsersForChannel(channel, num);
        }
    }
}

new CronJob('*/5 * * * *', function() {
    config.channels.forEach(function (channel) {
        incrementPointsAllUsersForChannel(channel, 5);
    });
}, null, true);

function incrementPointsAllUsersForChannel(channel, numPoints) {
    request('https://tmi.twitch.tv/group/user/' + channel.replace('#', '') + '/chatters', function (error, response, body) {
        if (error) {
            console.log('Failed to grab viewers');
            return;
        }
        const jsonBody = JSON.parse(body);
        const usernames = jsonBody['chatters'] === undefined ? [] : jsonBody['chatters']['viewers'];
        database.incrementAllUsersPoints(usernames, numPoints);
    });
}

function gamble(channel, username, numPoints) {
    if (doesWinGamble()) {
        client.action(channel, username + ' has won the gamble! You have ' + (numPoints + num) + ' points');
        database.incrementUserPoints(username, num);
    } else {
        client.action(channel, username + ' has lost the gamble BibleThump You have ' + (numPoints - num) + ' points');
        database.decreaseUserPoints(username, num);
    }
}

function doesWinGamble() {
    if (Math.random() < 0.6) {
        return false;
    }

    return true;
}