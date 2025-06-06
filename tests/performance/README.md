# Nuxt 3 性能测试工具

本目录包含用于测试Nuxt 3应用性能的核心脚本和工具。

## 📁 文件结构

```
tests/performance/
├── production-test.mjs          # 生产环境性能测试（核心）
├── browser-performance-test.mjs # 浏览器端性能测试
├── performance-test.html        # 浏览器测试页面
├── reports/                     # 测试报告目录（自动生成）
└── README.md                    # 本说明文件
```

## 🚀 快速使用

### 1. 生产环境性能测试

```bash
# 确保生产服务器正在运行
node .output/server/index.mjs

# 在新终端运行测试
node tests/performance/production-test.mjs
```

**测试内容：**

- 静态资源分析
- 页面加载时间
- 首字节时间（TTFB）
- 内容完整性检查

### 2. 浏览器端性能测试

```bash
# 生成测试页面
node tests/performance/browser-performance-test.mjs

# 在浏览器中打开生成的测试页面
open tests/performance/performance-test.html
```

**测试内容：**

- DOM内容加载时间
- 首次绘制时间（FP）
- 首次内容绘制时间（FCP）
- 完整页面加载时间

## 📊 测试报告

测试报告将自动保存在 `reports/` 目录中：

- 按日期时间命名
- 包含详细的性能指标
- 提供性能评价和建议

## 🎯 性能基准

**优秀指标：**

- 首字节时间（TTFB）< 20ms
- 页面加载时间 < 50ms
- 首次内容绘制 < 100ms

**良好指标：**

- 首字节时间（TTFB）< 50ms
- 页面加载时间 < 100ms
- 首次内容绘制 < 300ms

## 💡 使用建议

1. **定期测试**：在每次重要更新后运行性能测试
2. **对比测试**：保存测试报告，对比不同版本的性能表现
3. **环境一致**：在相同的网络和硬件环境下进行测试
4. **多次测试**：运行多次测试取平均值，避免偶然因素

## 🔧 自定义配置

可以修改测试脚本中的配置：

- `testCount`：测试次数
- `baseUrl`：测试目标URL
- 性能阈值设置

## 📝 注意事项

- 测试前确保生产服务器正常运行
- 建议在无其他负载的环境下进行测试
- 测试报告包含敏感信息，请勿提交到版本控制
