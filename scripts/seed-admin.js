/**
 * Seed script for creating initial admin user
 * This script generates SQL to insert an admin user with hashed password
 * 
 * Usage:
 * 1. Run: node scripts/seed-admin.js > seed.sql
 * 2. Execute: wrangler d1 execute bhavan-db --file=./seed.sql
 * 
 * Default credentials:
 * Email: admin@bhavan.ai
 * Password: Admin@123
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function generateAdminSeed() {
  const adminUser = {
    id: crypto.randomUUID(),
    name: 'Admin User',
    email: 'admin@bhavan.ai',
    phone: '+911234567890',
    password: 'Admin@123', // This will be hashed
    role: 'admin',
    status: 'active',
  };

  // Hash password with bcrypt (salt rounds = 12)
  const hashedPassword = await bcrypt.hash(adminUser.password, 12);
  const now = Math.floor(Date.now() / 1000); // Unix timestamp in seconds

  // Generate SQL INSERT statement
  const sql = `-- Seed initial admin user
INSERT INTO users (id, name, email, phone, password, role, status, created_at, updated_at) 
VALUES (
  '${adminUser.id}', 
  '${adminUser.name}', 
  '${adminUser.email}', 
  '${adminUser.phone}', 
  '${hashedPassword}', 
  '${adminUser.role}', 
  '${adminUser.status}', 
  ${now}, 
  ${now}
);

-- Verify admin user was created
SELECT id, name, email, role, status FROM users WHERE email = '${adminUser.email}';
`;

  console.log(sql);
  console.error('\n✅ Admin user seed SQL generated successfully!');
  console.error(`📧 Email: ${adminUser.email}`);
  console.error(`🔑 Password: ${adminUser.password}`);
  console.error('\n⚠️  IMPORTANT: Change this password after first login!\n');
}

generateAdminSeed().catch(error => {
  console.error('Error generating seed:', error);
  process.exit(1);
});
