import User from '../models/User.js';

const DEFAULTS = {
  admin: {
    name: process.env.DEFAULT_ADMIN_NAME || 'PAPA Admin',
    email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@paparooms.com',
    password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@12345',
    role: 'admin',
  },
  user: {
    name: process.env.DEFAULT_USER_NAME || 'PAPA Guest',
    email: process.env.DEFAULT_USER_EMAIL || 'guest@paparooms.com',
    password: process.env.DEFAULT_USER_PASSWORD || 'Guest@12345',
    role: 'guest',
  },
};

const ensureAccount = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) return { created: false, user: existing };

  const user = await User.create({
    name,
    email,
    password,
    role,
    authProvider: 'local',
    isVerified: true,
    lastLogin: new Date(),
  });
  return { created: true, user };
};

export default async function ensureDefaultAccounts() {
  try {
    const adminResult = await ensureAccount(DEFAULTS.admin);
    const userResult = await ensureAccount(DEFAULTS.user);

    if (adminResult.created) {
      console.log(`✅ Default admin created (${adminResult.user.email})`);
    } else {
      console.log(`ℹ️ Admin exists (${adminResult.user.email})`);
    }

    if (userResult.created) {
      console.log(`✅ Default user created (${userResult.user.email})`);
    } else {
      console.log(`ℹ️ User exists (${userResult.user.email})`);
    }
  } catch (err) {
    console.error('Failed to ensure default accounts:', err?.message || err);
  }
}
