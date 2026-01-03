-- Seed initial admin user
INSERT INTO users (id, name, email, phone, password, role, status, created_at, updated_at) 
VALUES (
  'c4f5559e-b266-4cd0-97d6-2c1c2a1378dc', 
  'Admin User', 
  'admin@bhavan.ai', 
  '+911234567890', 
  '$2a$12$yFmn.LJnjjuphfj23816JenX3/0XiD4CDEyvgvZ7nvK.6qZ7.GvRu', 
  'admin', 
  'active', 
  1766560839, 
  1766560839
);

-- Seed NO_AFFILIATE_ID affiliate for organic traffic tracking
INSERT INTO affiliates (id, name, description, status, created_at, updated_at)
VALUES (
  'NO_AFFILIATE_ID',
  'No Affiliate',
  'Default affiliate for organic traffic and events without affiliate attribution',
  'active',
  unixepoch(),
  unixepoch()
);

-- Verify admin user was created
SELECT id, name, email, role, status FROM users WHERE email = 'admin@bhavan.ai';

-- Verify NO_AFFILIATE_ID affiliate was created
SELECT id, name, description, status FROM affiliates WHERE id = 'NO_AFFILIATE_ID';

