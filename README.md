# Discord ElevenLabs TTS Bot

A Discord bot that uses ElevenLabs text-to-speech API to generate and play speech in voice channels using slash commands.

## Features

- `/speak` slash command with ElevenLabs TTS integration
- Auto-join user's current voice channel
- Auto-disconnect after playback completes
- Comprehensive error handling
- TypeScript with strict type checking
- Production-ready logging with Winston

## Prerequisites

- Node.js 18.x or higher
- Discord Bot Token
- ElevenLabs API Key
- FFmpeg (bundled via ffmpeg-static)

## Setup

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to "Bot" section and click "Add Bot"
4. Under "Privileged Gateway Intents", enable:
   - Server Members Intent (optional, for better error messages)
5. Copy the bot token for later
6. Go to "OAuth2" > "URL Generator"
7. Select scopes: `bot` and `applications.commands`
8. Select bot permissions:
   - Connect
   - Speak
   - Use Slash Commands
9. Copy the generated URL and open it to invite the bot to your server

### 3. Get ElevenLabs API Key

1. Go to [ElevenLabs](https://elevenlabs.io)
2. Sign up or log in
3. Go to your profile and copy your API key
4. Find voice IDs at [Voice Library](https://elevenlabs.io/voice-library)

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_application_id_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
NODE_ENV=development
LOG_LEVEL=info
```

### 5. Deploy Slash Commands

Register all commands with Discord (`/set`, `/join`, `/speak`, `/speakas`, `/leave`):

```bash
npm run deploy-commands
```

### 6. Start the Bot

Development mode (auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## Usage

### Available Commands

#### `/join`
Join your current voice channel.

**Usage:**
```
/join
```

You must be in a voice channel when running this command.

---

#### `/set [voiceid]`
Set your default ElevenLabs voice ID for the `/speak` command.

**Parameters:**
- `voiceid` (required): ElevenLabs voice ID (e.g., "21m00Tcm4TlvDq8ikWAM")

**Example:**
```
/set 21m00Tcm4TlvDq8ikWAM
```

---

#### `/speak [text]`
Text-to-speech using your default voice (set with `/set`).

**Parameters:**
- `text` (required): Text to speak (max 5000 characters)

**Example:**
```
/speak "Hello, this is a test of the text to speech system."
```

**Note:** You must use `/set` first to configure your default voice.

---

#### `/speakas [voiceid] [text]`
Text-to-speech using a specific voice ID (without setting it as default).

**Parameters:**
- `voiceid` (required): ElevenLabs voice ID
- `text` (required): Text to speak (max 5000 characters)

**Example:**
```
/speakas 21m00Tcm4TlvDq8ikWAM "Hello with a different voice!"
```

---

#### `/leave`
Leave the current voice channel.

**Usage:**
```
/leave
```

---

### Typical Workflow

1. **Join a voice channel** (in Discord)
2. **Join with the bot:** `/join`
3. **Set your default voice:** `/set 21m00Tcm4TlvDq8ikWAM`
4. **Speak with default voice:** `/speak "Hello everyone!"`
5. **Or use a different voice:** `/speakas pNInz6obpgDQGcFmaJgB "Testing another voice"`
6. **Leave when done:** `/leave`

---

### How to Find Voice IDs

1. Go to [ElevenLabs Voice Library](https://elevenlabs.io/voice-library)
2. Click on a voice you like
3. The voice ID is shown in the voice details

Some popular voice IDs:
- Rachel: `21m00Tcm4TlvDq8ikWAM`
- Adam: `pNInz6obpgDQGcFmaJgB`
- Domi: `AZnzlk1XvdvUeBnXmlld`

## Project Structure

```
bot/
├── src/
│   ├── config/
│   │   └── environment.ts      # Environment variable validation
│   ├── commands/
│   │   ├── types.ts            # Command type definitions
│   │   ├── speak.ts            # /speak command implementation
│   │   └── index.ts            # Command registry
│   ├── services/
│   │   ├── elevenlabs.ts       # ElevenLabs API integration
│   │   └── voice.ts            # Discord voice connection management
│   ├── utils/
│   │   ├── errors.ts           # Custom error classes
│   │   └── logger.ts           # Winston logger setup
│   ├── bot.ts                  # Discord client initialization
│   └── index.ts                # Application entry point
├── scripts/
│   └── deploy-commands.ts      # Slash command registration
├── .env.example                # Environment variable template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## How It Works

### Basic Flow

1. **Setup:** User runs `/set [voiceid]` to configure their default voice
2. **Join:** User runs `/join` while in a voice channel
3. **Speak:** User runs `/speak "text"` or `/speakas [voiceid] "text"`
4. **Processing:** Bot generates TTS audio using ElevenLabs API
5. **Playback:** Bot plays the generated audio in the voice channel
6. **Repeat:** User can run `/speak` or `/speakas` multiple times
7. **Leave:** User runs `/leave` when done

### Command Details

- **Manual Control:** Bot only joins/leaves when explicitly commanded
- **Voice Persistence:** Bot remembers your default voice ID per user
- **Flexible Speaking:** Choose between default voice (`/speak`) or specific voice (`/speakas`)

## Error Handling

The bot handles various error scenarios:

- **Bot not in voice channel**: Prompts user to run `/join` first
- **No default voice set**: Prompts user to run `/set [voiceid]` first
- **User not in voice channel** (for `/join`): Displays friendly message
- **Invalid voice ID**: Shows which voice ID was invalid
- **ElevenLabs API errors**:
  - Invalid API key (validated on startup)
  - Rate limiting
  - Server errors
- **Voice connection issues**: Automatic reconnection with cleanup

## Logging

Logs are stored in the `logs/` directory:
- `combined.log`: All logs
- `error.log`: Error-level logs only

Console output includes colored, timestamped logs for easy debugging.

## Development

### Build TypeScript

```bash
npm run build
```

### Run in Development Mode

```bash
npm run dev
```

### Lint Code

```bash
npm run lint
npm run lint:fix
```

## Troubleshooting

### Bot doesn't respond to commands

1. Make sure you ran `npm run deploy-commands`
2. Wait up to 1 hour for Discord to propagate commands globally
3. Try kicking and re-inviting the bot

### No audio in voice channel

1. Ensure the bot has "Connect" and "Speak" permissions
2. Check that FFmpeg is working (bundled via ffmpeg-static)
3. Verify the voice channel isn't full
4. Check logs for audio player errors

### ElevenLabs API errors

1. Verify your API key is correct in `.env`
2. Check your ElevenLabs quota/usage
3. Ensure the voice ID exists and you have access to it

### Bot crashes on startup

1. Verify all environment variables are set in `.env`
2. Check that your Discord token is valid
3. Review logs in `logs/combined.log`

## Security Notes

- Never commit `.env` file to version control
- Keep your Discord token and ElevenLabs API key secret
- Regenerate tokens immediately if they are exposed

## License

MIT

## Support

For issues or questions, check the logs in `logs/` directory or review the error messages in Discord.
