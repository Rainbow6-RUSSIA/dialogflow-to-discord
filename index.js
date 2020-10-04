require('dotenv').config()

const Discord = require('discord.js');
const Dialogflow = require('@google-cloud/dialogflow');

const bot = new Discord.Client();
bot.login(process.env.DISCORD_TOKEN);

const dialogflowClient = new Dialogflow.SessionsClient({
  credentials: {
    client_email: process.env.CLIENT_EMAIL,
    private_key: process.env.PRIVATE_KEY,
  },
  projectId: process.env.PROJECT_ID
});
const sessionPath = dialogflowClient.projectAgentSessionPath(process.env.PROJECT_ID, 'discordbot');

let lastResponce = new Date('2000');
const responces = {
  "party": process.env.COMMAND_PARTY,
  "registration": process.env.COMMAND_REGISTRATION
}

bot.on('ready', async () => {
  const channel = bot.channels.cache.get(process.env.CHANNEL_ID)
  console.log(`Logged as ${bot.user.tag}, listening #${channel.name} @ ${channel.guild.name}`);
});

bot.on('message', async (message) => {
  if (!(message.channel.id === process.env.CHANNEL_ID && !message.author.bot && message.content && Date.now() - lastResponce.valueOf() > process.env.TIMEOUT)) return;

  const dialogflowRequest = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message.cleanContent,
        languageCode: 'ru-RU'
      }
    }
  };

  const res = await dialogflowClient.detectIntent(dialogflowRequest)

  const trigger = res[0]?.queryResult?.fulfillmentText
  
  if (trigger) {
    lastResponce = new Date();
    console.log(`[${message.author.tag}] ${message.cleanContent}`)
    message.channel.send(`${responces[trigger]}\n${message.author}`)
    message.delete()
  }
});

