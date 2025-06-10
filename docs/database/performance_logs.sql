-- 页面性能监控表
-- 当前使用 SQLite 作为轻量级本地数据库，位置：data/performance.db
-- 如需切换到 MySQL，请使用以下 SQL 语句：

-- MySQL 版本
CREATE TABLE IF NOT EXISTS `performance_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `session_id` varchar(64) NOT NULL COMMENT '会话ID',
  `user_token` varchar(64) DEFAULT NULL COMMENT '用户token',
  `store_code` varchar(32) DEFAULT NULL COMMENT '店铺编码',
  `page_url` varchar(500) NOT NULL COMMENT '页面URL',
  `page_type` varchar(50) NOT NULL COMMENT '页面类型(home,store,order)',
  
  -- 性能指标
  `load_time` decimal(10,3) NOT NULL COMMENT '页面加载时间(毫秒)',
  `dom_ready_time` decimal(10,3) DEFAULT NULL COMMENT 'DOM准备时间(毫秒)',
  `first_paint_time` decimal(10,3) DEFAULT NULL COMMENT '首次绘制时间(毫秒)',
  `first_content_paint` decimal(10,3) DEFAULT NULL COMMENT '首次内容绘制时间(毫秒)',
  
  -- 网络信息
  `connection_type` varchar(20) DEFAULT NULL COMMENT '网络类型',
  `effective_type` varchar(20) DEFAULT NULL COMMENT '有效网络类型',
  
  -- 设备信息
  `user_agent` text DEFAULT NULL COMMENT '用户代理',
  `screen_resolution` varchar(20) DEFAULT NULL COMMENT '屏幕分辨率',
  `viewport_size` varchar(20) DEFAULT NULL COMMENT '视口大小',
  
  -- 时间戳
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_store_code` (`store_code`),
  KEY `idx_page_type` (`page_type`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_session_id` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='页面性能监控日志表';

-- SQLite 版本（当前使用）
-- 表结构已在 server/utils/database.ts 中定义
-- 数据文件：data/performance.db

-- 查询示例：
-- 查看最新性能记录
-- SELECT * FROM performance_logs ORDER BY created_at DESC LIMIT 10;

-- 按门店查询平均加载时间
-- SELECT store_code, AVG(load_time) as avg_load_time, COUNT(*) as record_count 
-- FROM performance_logs 
-- WHERE store_code IS NOT NULL 
-- GROUP BY store_code; 