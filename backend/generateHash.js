const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'owner123'; // ඔයාට ඕනෑම password එකක් දාන්න
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  
  console.log('Password:', password);
  console.log('Bcrypt Hash:', hash);
}

generateHash();