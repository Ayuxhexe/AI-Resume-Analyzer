const crypto = require('crypto');

const generateOtpCode = () => String(crypto.randomInt(100000, 1000000));

module.exports = generateOtpCode;
