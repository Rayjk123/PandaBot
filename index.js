const tmi = require('tmi.js');
var request = require('request');
var CronJob = require('cron').CronJob;
const database = require('./database');
const config = require('./config').config;
const winston = require('winston');
const {LoggingWinston} = require('@google-cloud/logging-winston');
const loggingWinston = new LoggingWinston();

const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console(),
        // Add Stackdriver Logging
        loggingWinston,
    ],
});


const client = new tmi.client(config);
client.on('connected', onConnectedHandler);
client.on('message', onMessageHandler);

client.connect();

let usersWhoHaveGambled = [];

function onConnectedHandler(addr, port) {
    logger.info('connected on addr: ' + addr + ' port: ' + port);
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
    logger.info(username + " running command: " + command);

    if (command[0] === "!points") {
        database.grabPointsByUser(username).then(function (points) {
            client.action(channel, username + ' has ' + points + ' points');
        });
        return;

    } else if (command[0] === "!gamble" && command.length === 2) {
        if (usersWhoHaveGambled.includes(username)) {
            client.action(channel, username + ' has already gambled in the past 5 minutes, please wait to try again.');
            return;
        }
        if (command[1] !== 'all' && isNaN(parseInt(command[1], 10))) {
            return;
        }

        database.grabPointsByUser(username).then(function (points) {
            let numToGamble;
            if (command[1] === 'all') {
                numToGamble = points;
            } else {
                numToGamble = parseInt(command[1], 10);
            }

            if (numToGamble > points) {
                client.action(channel, username + ' doesn\'t have enough points. You have ' + points + ' points');
                return;
            }
            gamble(channel, username, points, numToGamble);
        });

        usersWhoHaveGambled.push(username);
        return;
    } else if (command[0] === '!help') {
        client.action(channel, 'Possible commands are !points and !gamble and Channel Owners can !incrementAll');
        return;
    }

    if (username === 'rosebananax33' || username === 'pandalifestyle0') {
        if (command[0] === "!incrementall" && command.length >= 2 && !isNaN(parseInt(command[1], 10))) {
            const num = parseInt(command[1]);
            if (num <= 0 || num >= 1000) {
                client.action(channel, 'Valid number of points to increment is between 1 and 999');
                return;
            }

            incrementPointsAllUsersForChannel(channel, num);
            client.action(channel, username + ' has incremented everyone\'s points by ' + num + ' PogChamp');
        }
    }
}

new CronJob('*/5 * * * *', function () {
    usersWhoHaveGambled = [];
    config.channels.forEach(function (channel) {
        incrementPointsAllUsersForChannel(channel, 5);
    });
}, null, true);

function incrementPointsAllUsersForChannel(channel, numPoints) {
    request('https://tmi.twitch.tv/group/user/' + channel.replace('#', '') + '/chatters', function (error, response, body) {
        if (error) {
            logger.error('Failed to grab viewers from tmi on channel: ' + channel);
            return;
        }
        const jsonBody = JSON.parse(body);
        const usernames = jsonBody['chatters'] === undefined ? [] : jsonBody['chatters']['viewers'];
        usernames.push(channel.replace('#', ''));
        database.incrementAllUsersPoints(usernames, numPoints);
    });
}

function gamble(channel, username, curPoints, pointsGambled) {
    if (doesWinGamble()) {
        client.action(channel, username + ' has won the gamble! You have ' + (curPoints + pointsGambled) + ' points');
        database.incrementUserPoints(username, pointsGambled);
    } else {
        client.action(channel, username + ' has lost the gamble BibleThump You have ' + (curPoints - pointsGambled) + ' points');
        database.decreaseUserPoints(username, pointsGambled);
    }
}

function doesWinGamble() {
    if (Math.random() < 0.6) {
        return false;
    }

    return true;
}