import { v4 as uuidv4 } from 'uuid';

// ================== GENERATE RANDOM PASSWORD(6 CHARACTER) ================ //
const generateRandomPassword = () =>
  Math.floor(
    Math.random() * (Math.floor(999999) - Math.ceil(100000) + 1) +
      Math.ceil(100000),
  );

// ================== GENERATE INVITE CODE(UUID) ========================== //
const generateRandomInviteCode = () => uuidv4();
