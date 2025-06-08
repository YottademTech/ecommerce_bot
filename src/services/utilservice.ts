import dotenv from 'dotenv';
import { Context } from 'telegraf';
import { v4 as uuidv4 } from 'uuid';
import { BotSession, SessionStep } from '../types/session';
import redisClient from './redisClient';

dotenv.config();

// Views

export async function sendWelcomeViewMessage(ctx: Context) {
  return ctx.reply('Welcome to Beauty Shop Bot! Please share your phone number to continue.', {
    reply_markup: {
      keyboard: [[{ text: 'Share phone number', request_contact: true }]],
      resize_keyboard: false,
      one_time_keyboard: true
    }
  });
}

export async function reSharePhoneNumberViewMessage(ctx: Context) {
    return ctx.reply('Please click the button to share your phone number to continue.', {
      reply_markup: {
        keyboard: [[{ text: 'Share phone number', request_contact: true }]],
        resize_keyboard: false,
        one_time_keyboard: true,
        
      }
    });
  }

export async function sendOtpViewMessage(ctx: Context, otp: string) {
    return ctx.reply('Please enter the OTP sent to your phone number.', {
      reply_markup: {
        keyboard: [[{ text: `Send OTP (${otp})` }]],
        resize_keyboard: false,
        one_time_keyboard: true
      }
    });
  } 

export async function sessionExists(userId: number | string): Promise<BotSession | null> {
  const sessionKey = `session:${userId}`;
  const sessionStr = await redisClient.get(sessionKey);
  if (!sessionStr) return null;
  try {
    return JSON.parse(sessionStr) as BotSession;
  } catch {
    return null;
  }
}

export async function updateSessionStep(session: BotSession, expirySeconds?: number): Promise<boolean> {
  const sessionKey = `session:${session.id}`;
  let response;
  try {
    if (expirySeconds) {
      response = await redisClient.set(sessionKey, JSON.stringify(session), { EX: expirySeconds });
    } else {
      response = await redisClient.set(sessionKey, JSON.stringify(session));
    }
    return response != null;
  } catch {
    return false;
  }
}

export async function sendServicesMenuViewMessage(message: string,ctx: Context) {
  return ctx.reply(message, {
    reply_markup: {
      keyboard: [
        ['View Products'],
        ['Search Products'],
        ['Contact Support']
      ],
      resize_keyboard: false,
      one_time_keyboard: true
    }
  });
}

export async function startHandler(ctx: Context) {
  const userId = ctx.from?.id;
  const session = userId ? await sessionExists(userId) : null;

  switch (session?.step) {
    case SessionStep.OTP_SENT:
      return ctx.reply('You have already started the process. Please continue with the OTP verification.');
    case SessionStep.OTP_VERIFIED:
      return openShopViewMessage(ctx, 'inline');
    default: {
      const session: BotSession = {
        id: userId,
        requestId: uuidv4(),
        step: SessionStep.USER_CONNECTED,
        dateCreated: new Date().toISOString()
      };
      await updateSessionStep(session, 180);
      return sendWelcomeViewMessage(ctx);
    }
  }
}

export async function openShopViewMessage(ctx: Context, type: 'inline' | 'menu' | 'link' = 'inline') {
  const url = process.env.MINI_APP_URL as string;
  if (type === 'inline') {
    return ctx.reply("<b>Let's get started</b>\n\nPlease tap the button below to order now!", {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Open Shop',
              web_app: { url }
            }
          ]
        ],
        resize_keyboard: false,
        one_time_keyboard: false
      }
    });
  } else if (type === 'menu') {
    return ctx.reply('Open the shop:', {
      reply_markup: {
        keyboard: [
          [
            {
              text: 'Open Shop',
              web_app: { url }
            }
          ]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    });
  } else if (type === 'link') {
    return ctx.reply(`Open the shop: ${url}`);
  }
}