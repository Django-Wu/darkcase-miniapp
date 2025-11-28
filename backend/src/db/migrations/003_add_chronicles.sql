-- Миграция для добавления таблиц хроники

-- Таблица хроник (короткие видео)
CREATE TABLE IF NOT EXISTS chronicles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  video_url TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  likes INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  case_id VARCHAR(36),
  tags JSON,
  thumbnail TEXT,
  duration INT, -- в секундах
  status ENUM('draft', 'published') DEFAULT 'draft',
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_case_id (case_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица лайков хроник
CREATE TABLE IF NOT EXISTS chronicle_likes (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id BIGINT NOT NULL,
  chronicle_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chronicle_id) REFERENCES chronicles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_chronicle (user_id, chronicle_id),
  INDEX idx_user_id (user_id),
  INDEX idx_chronicle_id (chronicle_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица комментариев к хроникам
CREATE TABLE IF NOT EXISTS chronicle_comments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  chronicle_id VARCHAR(36) NOT NULL,
  user_id BIGINT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chronicle_id) REFERENCES chronicles(id) ON DELETE CASCADE,
  INDEX idx_chronicle_id (chronicle_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

