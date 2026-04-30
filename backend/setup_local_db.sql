CREATE DATABASE IF NOT EXISTS rootsEgypt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'adminEgypt'@'localhost' IDENTIFIED BY 'Egypt20252026$$$';
GRANT ALL PRIVILEGES ON rootsEgypt.* TO 'adminEgypt'@'localhost';
FLUSH PRIVILEGES;
SELECT 'DB ready' as status;
