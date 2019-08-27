# PandaBot
Twitch Bot 🤖 for twitch.tv
The purpose of the bot is solely for gambling, but other functionality can easily be added. Currently this Twitch Bot is run on a Google Cloud Compute Engine Instance using Node and for the database using MariaDB! 

Commands:
* !help - commands information
* !points - Show user's points
* !gamble <Num Points OR all> - Gamble points
  * Ex: !gamble 10 , !gamble all

## Installation
Run `npm install` to get your dependencies downloaded

Next create a copy of the `config.example.js` called `config.js` and fill out config.js with correct information
* username: username of the twitch account you will be using as the bot
* password: OAuth Token which can be created at https://twitchapps.com/tmi/
* channels: Array of streamer usernames

## Setting up the bot on Google Cloud
1. Create a Google Cloud Project
2. Create a CentOS 7 - Compute Engine Instance that is of type f1 if you want to ensure that this project remains free
3. SSH into your Compute Engine Instance using the following gcloud command: 
  * `gcloud beta compute --project "project-name" ssh --zone "zone-of-compute-instance" "name-of-compute-instance"`
4. Install mariadb by following this short guide https://linuxize.com/post/install-mariadb-on-centos-7/
5. Update config.js with inputted database paramaeters
6. Run using `node index.js`
