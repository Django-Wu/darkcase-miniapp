-- MySQL Schema for DarkCase

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  telegram_id VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  username VARCHAR(255),
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_telegram_id (telegram_id)
);

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  country VARCHAR(255) NOT NULL,
  year INT NOT NULL,
  duration VARCHAR(50),
  crime_type JSON NOT NULL,
  tags JSON NOT NULL,
  status ENUM('Solved', 'Unsolved', 'Cold Case') NOT NULL,
  victims INT,
  rating DECIMAL(3,1) DEFAULT 0,
  poster TEXT,
  backdrop TEXT,
  video_url TEXT,
  timeline JSON,
  facts JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_country (country),
  INDEX idx_status (status),
  INDEX idx_year (year),
  INDEX idx_rating (rating),
  INDEX idx_created_at (created_at),
  FULLTEXT INDEX idx_search (title, description)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Category-Case relationship
CREATE TABLE IF NOT EXISTS category_cases (
  category_id VARCHAR(255),
  case_id VARCHAR(255),
  PRIMARY KEY (category_id, case_id),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- User favorites
CREATE TABLE IF NOT EXISTS user_favorites (
  user_id CHAR(36),
  case_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, case_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- User watch history
CREATE TABLE IF NOT EXISTS user_history (
  user_id CHAR(36),
  case_id VARCHAR(255),
  progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  last_watched TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, case_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_last_watched (last_watched)
);
