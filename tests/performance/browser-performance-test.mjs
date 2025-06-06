import { spawn } from "child_process";
import fs from "fs";

const testUrl = "http://localhost:3000";
const testCount = 5;

/**
 * 使用 curl 测试资源加载时间
 */
const testResourceLoading = async () => {
  console.log("🌐 测试静态资源加载时间...\n");

  // 获取主页面以找到资源引用
  const curlProcess = spawn("curl", ["-s", testUrl]);
  let htmlContent = "";

  curlProcess.stdout.on("data", (data) => {
    htmlContent += data.toString();
  });

  return new Promise((resolve) => {
    curlProcess.on("close", async (code) => {
      if (code !== 0) {
        console.log("❌ 无法获取页面内容");
        resolve();
        return;
      }

      // 从 HTML 中提取资源 URL
      const jsMatches = htmlContent.match(/_nuxt\/[^"']*\.js/g) || [];
      const cssMatches = htmlContent.match(/_nuxt\/[^"']*\.css/g) || [];

      console.log(`📁 找到 ${jsMatches.length} 个 JS 文件`);
      console.log(`🎨 找到 ${cssMatches.length} 个 CSS 文件`);

      // 测试主要资源加载时间
      const resources = [...jsMatches.slice(0, 5), ...cssMatches.slice(0, 5)];

      for (const resource of resources) {
        const resourceUrl = `${testUrl}/${resource}`;
        const startTime = Date.now();

        try {
          const curlResource = spawn("curl", [
            "-s",
            "-o",
            "/dev/null",
            "-w",
            "%{time_total}",
            resourceUrl,
          ]);

          curlResource.on("close", (code) => {
            const endTime = Date.now();
            const loadTime = endTime - startTime;
            console.log(`  ${resource.split("/").pop()}: ${loadTime}ms`);
          });
        } catch (error) {
          console.log(`  ${resource.split("/").pop()}: 加载失败`);
        }
      }

      resolve();
    });
  });
};

/**
 * 创建完整的性能测试HTML文件
 */
const createPerformanceTestPage = () => {
  const testPageContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuxt 3 首屏性能测试</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .test-frame {
      width: 100%;
      height: 600px;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      margin: 20px 0;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    .metric {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      text-align: center;
    }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #2c3e50;
    }
    .metric-label {
      font-size: 14px;
      color: #666;
      margin-top: 5px;
    }
    .controls {
      text-align: center;
      margin: 20px 0;
    }
    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      margin: 0 10px;
    }
    button:hover {
      background: #0056b3;
    }
    .loading {
      display: none;
      text-align: center;
      margin: 20px 0;
      color: #666;
    }
    .results {
      margin-top: 20px;
      font-family: monospace;
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Nuxt 3 首屏加载性能测试</h1>
    <p>这个测试页面会在 iframe 中加载你的 Nuxt 应用，并测量真实的首屏加载性能。</p>
    
    <div class="controls">
      <button onclick="runTest()">开始测试</button>
      <button onclick="clearResults()">清除结果</button>
    </div>
    
    <div class="loading" id="loading">
      🔄 测试进行中，请稍候...
    </div>
    
    <div class="metrics">
      <div class="metric">
        <div class="metric-value" id="domContentLoaded">--</div>
        <div class="metric-label">DOM 内容加载时间 (ms)</div>
      </div>
      <div class="metric">
        <div class="metric-value" id="loadComplete">--</div>
        <div class="metric-label">页面完全加载时间 (ms)</div>
      </div>
      <div class="metric">
        <div class="metric-value" id="firstPaint">--</div>
        <div class="metric-label">首次绘制时间 (ms)</div>
      </div>
      <div class="metric">
        <div class="metric-value" id="firstContentfulPaint">--</div>
        <div class="metric-label">首次内容绘制时间 (ms)</div>
      </div>
    </div>
    
    <iframe 
      id="testFrame" 
      class="test-frame" 
      style="display: none;"
      src="about:blank">
    </iframe>
    
    <div class="results" id="results"></div>
  </div>

  <script>
    let testResults = [];
    
    function runTest() {
      const loading = document.getElementById('loading');
      const frame = document.getElementById('testFrame');
      const results = document.getElementById('results');
      
      loading.style.display = 'block';
      frame.style.display = 'block';
      
      // 记录开始时间
      const testStartTime = performance.now();
      
      // 重新加载 iframe
      frame.src = 'about:blank';
      
      setTimeout(() => {
        // 开始加载测试页面
        const loadStartTime = performance.now();
        
        frame.onload = function() {
          try {
            // 尝试访问 iframe 内容获取性能数据
            const iframeWindow = frame.contentWindow;
            const iframePerformance = iframeWindow.performance;
            
            if (iframePerformance) {
              const navigation = iframePerformance.getEntriesByType('navigation')[0];
              const paint = iframePerformance.getEntriesByType('paint');
              
              const domContentLoaded = navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0;
              const loadComplete = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;
              
              let firstPaint = 0;
              let firstContentfulPaint = 0;
              
              paint.forEach(entry => {
                if (entry.name === 'first-paint') {
                  firstPaint = entry.startTime;
                } else if (entry.name === 'first-contentful-paint') {
                  firstContentfulPaint = entry.startTime;
                }
              });
              
              // 更新显示
              document.getElementById('domContentLoaded').textContent = Math.round(domContentLoaded);
              document.getElementById('loadComplete').textContent = Math.round(loadComplete);
              document.getElementById('firstPaint').textContent = Math.round(firstPaint);
              document.getElementById('firstContentfulPaint').textContent = Math.round(firstContentfulPaint);
              
              // 记录结果
              const testResult = {
                timestamp: new Date().toLocaleTimeString(),
                domContentLoaded: Math.round(domContentLoaded),
                loadComplete: Math.round(loadComplete),
                firstPaint: Math.round(firstPaint),
                firstContentfulPaint: Math.round(firstContentfulPaint),
                manualLoadTime: Math.round(performance.now() - loadStartTime)
              };
              
              testResults.push(testResult);
              updateResults();
              
            } else {
              // 如果无法获取详细性能数据，至少记录加载时间
              const manualLoadTime = Math.round(performance.now() - loadStartTime);
              document.getElementById('loadComplete').textContent = manualLoadTime;
              
              testResults.push({
                timestamp: new Date().toLocaleTimeString(),
                manualLoadTime: manualLoadTime,
                note: '无法获取详细性能数据（可能由于跨域限制）'
              });
              updateResults();
            }
          } catch (error) {
            console.log('获取性能数据时出错:', error);
            const manualLoadTime = Math.round(performance.now() - loadStartTime);
            document.getElementById('loadComplete').textContent = manualLoadTime;
            
            testResults.push({
              timestamp: new Date().toLocaleTimeString(),
              manualLoadTime: manualLoadTime,
              error: error.message
            });
            updateResults();
          }
          
          loading.style.display = 'none';
        };
        
        // 开始加载
        frame.src = '${testUrl}';
        
      }, 100);
    }
    
    function updateResults() {
      const resultsDiv = document.getElementById('results');
      
      if (testResults.length === 0) {
        resultsDiv.textContent = '暂无测试结果';
        return;
      }
      
      let output = '📊 测试结果历史:\\n\\n';
      
      testResults.forEach((result, index) => {
        output += \`测试 \${index + 1} (\${result.timestamp}):\\n\`;
        if (result.domContentLoaded) output += \`  DOM 内容加载: \${result.domContentLoaded}ms\\n\`;
        if (result.loadComplete) output += \`  完全加载: \${result.loadComplete}ms\\n\`;
        if (result.firstPaint) output += \`  首次绘制: \${result.firstPaint}ms\\n\`;
        if (result.firstContentfulPaint) output += \`  首次内容绘制: \${result.firstContentfulPaint}ms\\n\`;
        if (result.manualLoadTime) output += \`  手动计时: \${result.manualLoadTime}ms\\n\`;
        if (result.note) output += \`  注意: \${result.note}\\n\`;
        if (result.error) output += \`  错误: \${result.error}\\n\`;
        output += '\\n';
      });
      
      // 计算平均值
      if (testResults.length > 1) {
        const avgLoadTime = testResults
          .filter(r => r.manualLoadTime)
          .reduce((sum, r) => sum + r.manualLoadTime, 0) / testResults.filter(r => r.manualLoadTime).length;
        
        output += \`📈 平均加载时间: \${Math.round(avgLoadTime)}ms\\n\`;
        
        if (avgLoadTime < 100) {
          output += '🟢 性能评价: 优秀\\n';
        } else if (avgLoadTime < 300) {
          output += '🟡 性能评价: 良好\\n';
        } else if (avgLoadTime < 1000) {
          output += '🟠 性能评价: 一般\\n';
        } else {
          output += '🔴 性能评价: 需要优化\\n';
        }
      }
      
      resultsDiv.textContent = output;
    }
    
    function clearResults() {
      testResults = [];
      document.getElementById('domContentLoaded').textContent = '--';
      document.getElementById('loadComplete').textContent = '--';
      document.getElementById('firstPaint').textContent = '--';
      document.getElementById('firstContentfulPaint').textContent = '--';
      document.getElementById('results').textContent = '暂无测试结果';
    }
    
    // 页面加载完成后显示说明
    window.addEventListener('load', () => {
      document.getElementById('results').textContent = '点击"开始测试"按钮来测试 Nuxt 应用的首屏加载性能';
    });
  </script>
</body>
</html>
  `;

  fs.writeFileSync("performance-test.html", testPageContent);
  console.log("✅ 创建了性能测试页面: performance-test.html");
};

/**
 * 运行完整性能测试
 */
const runCompleteTest = async () => {
  console.log("🚀 开始完整的首屏性能测试");
  console.log("=".repeat(60));

  // 1. 创建测试页面
  createPerformanceTestPage();

  // 2. 测试静态资源
  await testResourceLoading();

  console.log("\n📄 接下来请：");
  console.log("1. 在浏览器中打开 performance-test.html 文件");
  console.log('2. 点击"开始测试"按钮进行真实的浏览器性能测试');
  console.log("3. 多次测试以获得更准确的平均值");

  console.log("\n🔗 或者直接在浏览器中访问：");
  console.log(`   file://${process.cwd()}/performance-test.html`);

  console.log("\n💡 测试建议：");
  console.log("- 使用无痕模式避免缓存影响");
  console.log("- 关闭其他标签页减少资源竞争");
  console.log("- 测试多次取平均值");
  console.log("- 对比不同设备和网络条件");
};

// 运行测试
runCompleteTest().catch(console.error);
