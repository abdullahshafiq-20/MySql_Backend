import crypto from 'crypto';

export const generateItemId = (ItemName) => {
  // Clean the shop name: remove non-alphanumeric characters and convert to uppercase
  const cleanName = ItemName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  // Take up to the first 8 characters from the clean name
  const namePrefix = cleanName.slice(0, 8);

  // Generate random numbers for the remaining length
  const remainingLength = 16 - namePrefix.length;
  const randomNumbers = crypto.randomBytes(remainingLength)
    .toString('hex')
    .toUpperCase()
    .slice(0, remainingLength);

  // Combine the name prefix and random numbers
  return namePrefix + randomNumbers;
};