-- Create database
CREATE DATABASE IF NOT EXISTS abuhisham_kitchen CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE abuhisham_kitchen;

-- Dishes table
CREATE TABLE IF NOT EXISTS dishes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(500) DEFAULT '',
  available TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  order_type ENUM('delivery','pickup') DEFAULT 'pickup',
  address TEXT,
  notes TEXT,
  status ENUM('new','in_progress','completed','cancelled') DEFAULT 'new',
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  dish_id INT NOT NULL,
  dish_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed dishes
INSERT INTO dishes (name, description, price, image_url, available, sort_order) VALUES
('مندي لحم', 'لحم طازج مطبوخ على الطريقة التقليدية مع أرز بسمتي مبهر', 45.00, '/images/mandi-lamb.jpg', 1, 1),
('مندي دجاج', 'دجاج كامل مدخن ومطهو ببطء مع أرز المندي المميز', 35.00, '/images/mandi-chicken.jpg', 1, 2),
('كبسة لحم', 'كبسة لحم سعودية أصيلة مع أرز مبهر وصلصة طماطم', 45.00, '/images/kabsa-lamb.jpg', 1, 3),
('كبسة دجاج', 'كبسة دجاج شهية مع أرز بنكهة الزعفران والبهارات', 35.00, '/images/kabsa-chicken.jpg', 1, 4),
('مظبي دجاج', 'دجاج مظبي مشوي على الفحم مع أرز أبيض وصلصة خاصة', 38.00, '/images/madhbi-chicken.jpg', 1, 5),
('حنيذ لحم', 'لحم حنيذ يمني أصيل مطبوخ ببطء حتى النضج الكامل مع أرز', 50.00, '/images/haneedh-lamb.jpg', 1, 6);
