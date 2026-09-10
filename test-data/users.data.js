module.exports = {
  admin: {
    username: 'Admin',
    password: 'admin123',
  },
  // placeholders for ESS and Manager entries (created via Admin UI)
  ess: {
    username: process.env.ESS_USERNAME || '',
    password: process.env.ESS_PASSWORD || '',
  },
  manager: {
    username: process.env.MANAGER_USERNAME || '',
    password: process.env.MANAGER_PASSWORD || '',
  },
};
