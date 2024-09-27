import crypto from 'crypto';

 const generateItemId = (ItemName) => {
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

const generateOrderId = () => {
    // Generate 12 random bytes (96 bits), then convert to a hex string
    const randomString = crypto.randomBytes(6).toString('hex'); // 6 bytes = 12 hex characters
  
    // Split the random string into groups of 4 characters and join with '-'
    const OrderId = randomString.match(/.{1,4}/g).join('-');
  
    return OrderId;
  };

 const generateShopId = (shopName) => {
    // Clean the shop name: remove non-alphanumeric characters and convert to uppercase
    const cleanName = shopName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
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
  

  export {generateItemId, generateOrderId, generateShopId};