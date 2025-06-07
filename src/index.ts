import dotenv from 'dotenv';
import express from 'express';
import { Telegraf } from 'telegraf';
import { v4 as uuidv4 } from 'uuid';
import redisClient from './services/redisClient';
import { verifyOtp } from './services/redisClientservice';
import { reSharePhoneNumberViewMessage, sendOtpViewMessage, sendServicesMenuViewMessage, sendWelcomeViewMessage, sessionExists, startHandler, updateSessionStep } from './services/utilservice';
import { BotSession, SessionStep } from './types/session';

dotenv.config();

const app = express();
const PORT = process.env.APP_PORT as unknown as number;

// Replace with your actual Telegram bot token
const BOT_TOKEN = process.env.DAVIDEMS_ECOMMERCE_BOT_TOKEN as string;
const bot = new Telegraf(BOT_TOKEN);
const BACKEND_URL = process.env.BACKEND_URL as string;

// Simple bot command for testing
bot.start(startHandler);

// Handle contact message (when user shares their phone number)
bot.on('contact', async (ctx) => {
  const userId = ctx.from?.id;
  console.log("on contact",userId);
  const session = userId ? await sessionExists(userId) : null;

  if(!session){
    return await startHandler(ctx);
  }

  const phone = ctx.message.contact?.phone_number;
  if (phone) {
    ctx.reply(`Thank you! Your phone number (${phone}) has been received.`);
    // Here you can store the phone number in Redis or perform other actions

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.set(`otp:${phone}`, otp, { EX: 180 }); // Set OTP with 3-minute expiration

    const userId = ctx.from?.id;

    // create session:
    const session = {
      id: userId,
      requestId: uuidv4(),
      phone: phone,
      step: SessionStep.OTP_SENT,
      dateCreated: new Date().toISOString()
    }

    await sendOtpViewMessage(ctx, otp);

    const sessionUpdated = await updateSessionStep(session,180);

    if(!sessionUpdated){
      return sendWelcomeViewMessage(ctx)
    }

  } else {
     console.log('Failed to receive your phone number. Please try again.');
     return sendWelcomeViewMessage(ctx)
  }
});

bot.help((ctx) => ctx.reply('Send me a product name to search.'));


// Handle OTP submission (button or manual entry)
bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  const userId = ctx.from?.id;
  let phone = '';

  let session: BotSession | null = null;

  if (userId) {
    session = await sessionExists(userId);
    if (session?.phone) {
      phone = session.phone;
    }else{
      return await reSharePhoneNumberViewMessage(ctx);
    }
  }
  // Switch based on session step
  switch (session?.step) {
    case SessionStep.OTP_SENT:
      // If the user clicked the button, extract OTP from button text
      const otpButtonMatch = text.match(/^Send OTP \((\d{6})\)$/);
      let otpInput = '';
      if (otpButtonMatch) {
        otpInput = otpButtonMatch[1];
      } else if (/^\d{6}$/.test(text)) {
        // If the user typed a 6-digit OTP
        otpInput = text;
      }

      if (otpInput && phone) {
        const isVerified = await verifyOtp(phone, otpInput);
        if (isVerified) {
          session.step = SessionStep.OTP_VERIFIED;
          session.dateCreated = new Date().toISOString();
          session.requestId = uuidv4();

          const sessionUpdated = await updateSessionStep(session);

          if(!sessionUpdated){
            return sendWelcomeViewMessage(ctx)
          }

          ctx.reply('OTP verified successfully!');

          return sendServicesMenuViewMessage("Choose an option",ctx);
          // You can update the session or proceed to the next step here
        } else {
          ctx.reply('Invalid or expired OTP. Please try again.');
        }
      } else if (otpInput && !phone) {
        ctx.reply('Could not find your phone number. Please restart the process.');
      } else {
        // If the message is not an OTP or button, you can ignore or prompt again
        ctx.reply('Please enter the 6-digit OTP sent to your phone number or use the provided button.');
      }
      break;
    case SessionStep.USER_CONNECTED:
    default:
      // Handle other steps or default behavior
      break;
  }
});

// Launch the bot (polling mode for development)
bot.launch().then(() => {
  // Replace YOUR_CHAT_ID with your actual Telegram user ID
  bot.telegram.sendMessage(process.env.ADMIN_CHAT_ID as string, 'Beauty Shop Bot has started and is ready!');
});

// Express health check endpoint
app.get('/', (_req, res) => {
  res.send('Beauty Shop Telegram Bot is running.');
});

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 