import crypto from 'crypto';

export const generateOrderId = () => {
  // Generate 12 random bytes (96 bits), then convert to a hex string
  const randomString = crypto.randomBytes(6).toString('hex'); // 6 bytes = 12 hex characters

  // Split the random string into groups of 4 characters and join with '-'
  const OrderId = randomString.match(/.{1,4}/g).join('-');

  return OrderId;
};