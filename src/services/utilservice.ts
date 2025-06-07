import { Context } from 'telegraf';
import { BotSession } from '../types/session';
import redisClient from './redisClient';

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
        one_time_keyboard: true
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

