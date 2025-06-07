# Beauty Shop Telegram Bot

This is a Telegram bot service for Beauty Shop, built with Node.js, TypeScript, and Telegraf.

## Features
- User authentication via OTP
- Session management with Redis
- Service menu and product search

## Prerequisites
- Node.js 18+
- Redis instance (local or cloud)
- Telegram Bot Token

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your environment variables:
   - `DAVIDEMS_ECOMMERCE_BOT_TOKEN` (Telegram Bot Token)
   - `BACKEND_URL` (Backend API URL)
   - `REDIS_URL` (Redis connection string)
   - `APP_PORT` (Port for Express health check, default: 6194)
3. Start the bot locally:
   ```bash
   npx ts-node src/index.ts
   ```

## Docker
Build and run with Docker:
```bash
docker build -t beauty-shop-bot .
docker run --env-file .env -p 6194:6194 beauty-shop-bot
```

## Folder Structure
```
bot/
├── src/
│   ├── index.ts            # Main bot entry point
│   ├── services/
│   │   ├── redisClient.ts
│   │   ├── redisClientservice.ts
│   │   └── utilservice.ts
│   └── types/
│       └── session.ts
├── .env.example            # Example environment file
├── .gitignore
├── Dockerfile
├── package.json
├── README.md
```

## License
MIT 