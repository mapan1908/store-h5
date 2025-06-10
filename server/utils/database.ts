import mysql from "mysql2/promise";

let connection: mysql.Connection | null = null;

// 初始化数据库连接
export async function initDatabase() {
  if (connection) return connection;

  try {
    const config = useRuntimeConfig();

    // 创建数据库连接
    connection = await mysql.createConnection(config.databaseUrl);

    // 创建性能日志表
    await createPerformanceTable();

    console.log("📊 性能监控MySQL数据库已初始化");
    return connection;
  } catch (error) {
    console.error("❌ MySQL数据库初始化失败:", error);
    return null;
  }
}

// 创建性能日志表
async function createPerformanceTable() {
  if (!connection) return;

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS performance_logs (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      session_id VARCHAR(64) NOT NULL,
      user_token VARCHAR(64) DEFAULT NULL,
      store_code VARCHAR(32) DEFAULT NULL,
      page_url VARCHAR(500) NOT NULL,
      page_type VARCHAR(50) NOT NULL,
      
      -- 性能指标
      load_time DECIMAL(10,3) NOT NULL,
      dom_ready_time DECIMAL(10,3) DEFAULT NULL,
      first_paint_time DECIMAL(10,3) DEFAULT NULL,
      first_content_paint DECIMAL(10,3) DEFAULT NULL,
      
      -- 网络信息
      connection_type VARCHAR(20) DEFAULT NULL,
      effective_type VARCHAR(20) DEFAULT NULL,
      
      -- 设备信息
      user_agent TEXT DEFAULT NULL,
      screen_resolution VARCHAR(20) DEFAULT NULL,
      viewport_size VARCHAR(20) DEFAULT NULL,
      
      -- 时间戳
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      INDEX idx_store_code (store_code),
      INDEX idx_page_type (page_type),
      INDEX idx_created_at (created_at),
      INDEX idx_session_id (session_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='页面性能监控日志表'
  `;

  try {
    await connection.execute(createTableSQL);
    console.log("📊 性能日志表创建成功");
  } catch (error) {
    console.error("❌ 创建性能日志表失败:", error);
  }
}

// 保存性能数据
export async function savePerformanceLog(data: any) {
  try {
    const db = await initDatabase();
    if (!db) {
      console.warn("⚠️ 数据库未初始化，跳过性能数据保存");
      return false;
    }

    const insertSQL = `
      INSERT INTO performance_logs (
        session_id, user_token, store_code, page_url, page_type,
        load_time, dom_ready_time, first_paint_time, first_content_paint,
        connection_type, effective_type, user_agent, screen_resolution, viewport_size
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = (await db.execute(insertSQL, [
      data.session_id,
      data.user_token,
      data.store_code,
      data.page_url,
      data.page_type,
      data.load_time,
      data.dom_ready_time,
      data.first_paint_time,
      data.first_content_paint,
      data.connection_type,
      data.effective_type,
      data.user_agent,
      data.screen_resolution,
      data.viewport_size,
    ])) as mysql.ResultSetHeader[];

    console.log("📊 性能数据已保存到MySQL，ID:", result.insertId);
    return true;
  } catch (error) {
    console.error("❌ 保存性能数据失败:", error);
    return false;
  }
}

// 关闭数据库连接
export async function closeDatabase() {
  if (connection) {
    await connection.end();
    connection = null;
    console.log("📊 MySQL数据库连接已关闭");
  }
}
