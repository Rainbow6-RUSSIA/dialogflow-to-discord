🎙 dialogflow-to-discord
========================

Enrich Discord chat with Dialogflow powered moderation and autoresponding.

## Usage

You'll need to set some environment variables:
- `DISCORD_TOKEN` - your bot's token
- `CLIENT_EMAIL` - from `projectId-somesymbols.json` credentials file
- `PRIVATE_KEY` - from the same file
- `PROJECT_ID` - your project ID in Google Cloud
- `CHANNEL_IDS` - CSV of channels which messages will be whitelisted
- `TIMEOUT` - time between bot replies per trigger (msec)
- `COMMAND_[...your trigger here...]` - text of reply to user's message. Dialogflow agent should return a single short string which will be considered as a trigger. You can add these vars as much as required.
- `DELETE_TRIGGERS` - CSV of triggers that deletes a message without reply

Then, just run `yarn start`.

