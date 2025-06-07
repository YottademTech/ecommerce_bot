import redisClient from './redisClient';

export async function verifyOtp(phone: string, otp: string): Promise<boolean> {
  const storedOtp = await redisClient.get(`otp:${phone}`);
  return storedOtp === otp;
} 