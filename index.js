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

const deleteTriggers = process.env.DELETE_TRIGGERS.split(',')
const channelWhitelist = process.env.CHANNEL_IDS.split(',')
const lastResponces = new Map();

bot.on('ready', async () => {
  console.log(`Logged as ${bot.user.tag}`)
  channelWhitelist.map(id => {
    const channel = bot.channels.cache.get(id)
    console.log(`Listening #${channel.name} @${channel.guild.name}`)
  })
});

bot.on('message', async (message) => {
  if (
    !(channelWhitelist.includes(message.channel.id)
      && !message.author.bot
      && message.content)
    || ['$', '!'].some(prefix => message.content.startsWith(prefix))
  ) return;
  
  const text = message.content.replace(/(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)|<.+>|~|_|\||\*|>|`/, '')

  if (text.length < 4 || text.length > 256) return;

  const session = dialogflowClient.projectAgentSessionPath(process.env.PROJECT_ID, message.author.id);
  const dialogflowRequest = {
    session,
    queryInput: {
      text: { text, languageCode: 'ru-RU' }
    }
  };

  const res = await dialogflowClient.detectIntent(dialogflowRequest)

  const trigger = res[0]?.queryResult?.fulfillmentText
  
  if (trigger) {
    console.log(`[${message.author.tag}, '${trigger}'] ${message.cleanContent}`)
    if (!deleteTriggers.includes(trigger) && text.includes(' ')) { //если неудаляющий триггер и сообщение длинное
      if (Date.now() - (lastResponces.get(trigger)?.valueOf() ?? 0) > process.env.TIMEOUT) {
        lastResponces.set(trigger, new Date())
        message.channel.send(`${process.env[`COMMAND_${trigger.toUpperCase()}`]}\n${message.author}`)
      }
    }
    if (deleteTriggers.includes(trigger) || text.includes(' ')) { //если триггер удаляющий и сообщение длинное
      message.delete()
    }
  }
});

