import http from "http";
import { performance } from "perf_hooks";
import fs from "fs";
import path from "path";

const baseUrl = "http://localhost:3000";
const testCount = 10; // 测试次数

// 确保reports目录存在
const reportsDir = path.join(process.cwd(), "tests/performance/reports");
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

/**
 * 获取页面加载性能数据
 */
const measurePageLoad = () => {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();

    const req = http.get(baseUrl, (res) => {
      let data = "";
      let firstByteTime = null;

      res.on("data", (chunk) => {
        if (!firstByteTime) {
          firstByteTime = performance.now();
        }
        data += chunk;
      });

      res.on("end", () => {
        const endTime = performance.now();

        resolve({
          statusCode: res.statusCode,
          totalTime: endTime - startTime,
          firstByteTime: firstByteTime - startTime,
          contentLength: data.length,
          headers: res.headers,
          hasContent: data.includes('<div id="__nuxt">'),
          hasVant: data.includes("vant"),
          hasUno: data.includes("uno"),
        });
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Timeout"));
    });
  });
};

/**
 * 分析静态资源
 */
const analyzeAssets = async () => {
  console.log("\n📊 静态资源分析:");

  // 获取主页面内容来分析资源引用
  const mainPage = await measurePageLoad();
  console.log(
    `✅ 主页面大小: ${(mainPage.contentLength / 1024).toFixed(2)} KB`
  );

  // 从构建输出分析资源大小
  try {
    const { execSync } = await import("child_process");
    const clientDist = ".nuxt/dist/client/_nuxt/";

    // 分析 JS 文件
    const jsFiles = execSync(`find ${clientDist} -name "*.js" | head -20`)
      .toString()
      .split("\n")
      .filter(Boolean);
    let totalJsSize = 0;

    console.log("\n📁 主要 JS 文件:");
    for (const file of jsFiles.slice(0, 10)) {
      try {
        const stats = execSync(`stat -f%z "${file}"`).toString().trim();
        const sizeKB = parseInt(stats) / 1024;
        totalJsSize += sizeKB;
        console.log(`  ${file.split("/").pop()}: ${sizeKB.toFixed(2)} KB`);
      } catch (e) {
        // 忽略错误
      }
    }

    // 分析 CSS 文件
    const cssFiles = execSync(`find ${clientDist} -name "*.css" | head -20`)
      .toString()
      .split("\n")
      .filter(Boolean);
    let totalCssSize = 0;

    console.log("\n🎨 主要 CSS 文件:");
    for (const file of cssFiles.slice(0, 10)) {
      try {
        const stats = execSync(`stat -f%z "${file}"`).toString().trim();
        const sizeKB = parseInt(stats) / 1024;
        totalCssSize += sizeKB;
        console.log(`  ${file.split("/").pop()}: ${sizeKB.toFixed(2)} KB`);
      } catch (e) {
        // 忽略错误
      }
    }

    console.log(`\n📈 总计:`);
    console.log(`  JS 文件总大小: ${totalJsSize.toFixed(2)} KB`);
    console.log(`  CSS 文件总大小: ${totalCssSize.toFixed(2)} KB`);
    console.log(`  资源总大小: ${(totalJsSize + totalCssSize).toFixed(2)} KB`);

    return {
      mainPageSize: mainPage.contentLength / 1024,
      totalJsSize,
      totalCssSize,
      totalAssetSize: totalJsSize + totalCssSize,
    };
  } catch (error) {
    console.log("资源分析出错:", error.message);
    return {
      mainPageSize: mainPage.contentLength / 1024,
      totalJsSize: 0,
      totalCssSize: 0,
      totalAssetSize: 0,
    };
  }
};

/**
 * 生成测试报告
 */
const generateReport = (results, assetAnalysis) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportFile = path.join(
    reportsDir,
    `performance-report-${timestamp}.json`
  );
  const markdownFile = path.join(
    reportsDir,
    `performance-report-${timestamp}.md`
  );

  // 计算统计数据
  const totalTimes = results.map((r) => r.totalTime);
  const firstByteTimes = results.map((r) => r.firstByteTime);
  const contentSizes = results.map((r) => r.contentLength);

  const avgTotalTime = totalTimes.reduce((a, b) => a + b) / totalTimes.length;
  const avgFirstByteTime =
    firstByteTimes.reduce((a, b) => a + b) / firstByteTimes.length;
  const avgContentSize =
    contentSizes.reduce((a, b) => a + b) / contentSizes.length;

  const minTotalTime = Math.min(...totalTimes);
  const maxTotalTime = Math.max(...totalTimes);

  const reportData = {
    timestamp: new Date().toISOString(),
    testConfig: {
      baseUrl,
      testCount,
      testType: "production-ssr",
    },
    performance: {
      avgTotalTime: parseFloat(avgTotalTime.toFixed(2)),
      minTotalTime: parseFloat(minTotalTime.toFixed(2)),
      maxTotalTime: parseFloat(maxTotalTime.toFixed(2)),
      avgFirstByteTime: parseFloat(avgFirstByteTime.toFixed(2)),
      avgContentSize: parseFloat((avgContentSize / 1024).toFixed(2)),
    },
    assets: assetAnalysis,
    rawResults: results.map((r) => ({
      totalTime: parseFloat(r.totalTime.toFixed(2)),
      firstByteTime: parseFloat(r.firstByteTime.toFixed(2)),
      contentLength: r.contentLength,
      statusCode: r.statusCode,
    })),
  };

  // 保存JSON报告
  fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));

  // 生成Markdown报告
  const markdownContent = `# Nuxt 3 性能测试报告

**测试时间：** ${new Date().toLocaleString("zh-CN")}  
**测试类型：** SSR生产环境性能测试  
**测试地址：** ${baseUrl}  
**测试次数：** ${testCount}

## 📊 性能指标摘要

| 指标 | 数值 | 评价 |
|------|------|------|
| 平均总时间 | ${avgTotalTime.toFixed(2)}ms | ${avgTotalTime < 50 ? "🟢 优秀" : avgTotalTime < 100 ? "🟡 良好" : "🔴 需优化"} |
| 最快时间 | ${minTotalTime.toFixed(2)}ms | - |
| 最慢时间 | ${maxTotalTime.toFixed(2)}ms | - |
| 平均首字节时间 | ${avgFirstByteTime.toFixed(2)}ms | ${avgFirstByteTime < 20 ? "🟢 优秀" : avgFirstByteTime < 50 ? "🟡 良好" : "🔴 需优化"} |
| 平均内容大小 | ${(avgContentSize / 1024).toFixed(2)}KB | - |

## 📦 资源分析

| 类型 | 大小 |
|------|------|
| 主页面大小 | ${assetAnalysis.mainPageSize.toFixed(2)} KB |
| JS文件总大小 | ${assetAnalysis.totalJsSize.toFixed(2)} KB |
| CSS文件总大小 | ${assetAnalysis.totalCssSize.toFixed(2)} KB |
| 资源总大小 | ${assetAnalysis.totalAssetSize.toFixed(2)} KB |

## 🎯 性能评价

${
  avgTotalTime < 50
    ? "🟢 **优秀** - 页面加载非常快"
    : avgTotalTime < 100
      ? "🟡 **良好** - 页面加载较快"
      : avgTotalTime < 200
        ? "🟠 **一般** - 页面加载速度中等"
        : "🔴 **需要优化** - 页面加载较慢"
}

${
  avgFirstByteTime < 20
    ? "🟢 **服务器响应优秀**"
    : avgFirstByteTime < 50
      ? "🟡 **服务器响应良好**"
      : "🔴 **服务器响应需要优化**"
}

## 📈 详细测试结果

${results
  .map(
    (r, i) => `**测试 ${i + 1}:**
- 总时间: ${r.totalTime.toFixed(2)}ms
- 首字节时间: ${r.firstByteTime.toFixed(2)}ms
- 内容大小: ${(r.contentLength / 1024).toFixed(2)}KB
- 状态码: ${r.statusCode}`
  )
  .join("\n\n")}

## 💡 优化建议

${avgTotalTime > 100 ? "- 考虑进一步优化服务器响应时间\n" : ""}${assetAnalysis.totalJsSize > 500 ? "- JavaScript资源较大，考虑代码分割和懒加载\n" : ""}${assetAnalysis.totalCssSize > 200 ? "- CSS资源较大，考虑样式优化\n" : ""}${avgTotalTime < 50 && avgFirstByteTime < 20 ? "- 性能表现优秀，继续保持！\n" : ""}

---
*报告生成时间：${new Date().toLocaleString("zh-CN")}*
`;

  fs.writeFileSync(markdownFile, markdownContent);

  console.log(`\n📝 测试报告已生成:`);
  console.log(`  JSON报告: ${reportFile}`);
  console.log(`  Markdown报告: ${markdownFile}`);

  return reportData;
};

/**
 * 运行性能测试
 */
const runPerformanceTest = async () => {
  console.log("🚀 开始生产环境性能测试...");
  console.log(`📍 测试地址: ${baseUrl}`);
  console.log(`🔄 测试次数: ${testCount} 次\n`);

  const results = [];

  // 先进行资源分析
  const assetAnalysis = await analyzeAssets();

  console.log("\n⏱️  页面加载性能测试:");

  for (let i = 0; i < testCount; i++) {
    try {
      console.log(`测试 ${i + 1}/${testCount}...`);
      const result = await measurePageLoad();
      results.push(result);

      console.log(`  状态码: ${result.statusCode}`);
      console.log(`  总时间: ${result.totalTime.toFixed(2)}ms`);
      console.log(`  首字节时间: ${result.firstByteTime.toFixed(2)}ms`);
      console.log(`  内容大小: ${(result.contentLength / 1024).toFixed(2)}KB`);
      console.log("");

      // 避免过于频繁的请求
      if (i < testCount - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`测试 ${i + 1} 失败:`, error.message);
    }
  }

  // 计算统计数据
  if (results.length > 0) {
    const totalTimes = results.map((r) => r.totalTime);
    const firstByteTimes = results.map((r) => r.firstByteTime);
    const contentSizes = results.map((r) => r.contentLength);

    const avgTotalTime = totalTimes.reduce((a, b) => a + b) / totalTimes.length;
    const avgFirstByteTime =
      firstByteTimes.reduce((a, b) => a + b) / firstByteTimes.length;
    const avgContentSize =
      contentSizes.reduce((a, b) => a + b) / contentSizes.length;

    const minTotalTime = Math.min(...totalTimes);
    const maxTotalTime = Math.max(...totalTimes);

    console.log("📊 测试结果统计:");
    console.log("=".repeat(50));
    console.log(`✅ 成功请求: ${results.length}/${testCount}`);
    console.log(`⚡ 平均总时间: ${avgTotalTime.toFixed(2)}ms`);
    console.log(`⚡ 最快时间: ${minTotalTime.toFixed(2)}ms`);
    console.log(`⚡ 最慢时间: ${maxTotalTime.toFixed(2)}ms`);
    console.log(`🚀 平均首字节时间: ${avgFirstByteTime.toFixed(2)}ms`);
    console.log(`📦 平均内容大小: ${(avgContentSize / 1024).toFixed(2)}KB`);

    // 性能评价
    console.log("\n🎯 性能评价:");
    if (avgTotalTime < 50) {
      console.log("🟢 优秀 - 页面加载非常快");
    } else if (avgTotalTime < 100) {
      console.log("🟡 良好 - 页面加载较快");
    } else if (avgTotalTime < 200) {
      console.log("🟠 一般 - 页面加载速度中等");
    } else {
      console.log("🔴 需要优化 - 页面加载较慢");
    }

    if (avgFirstByteTime < 20) {
      console.log("🟢 服务器响应优秀");
    } else if (avgFirstByteTime < 50) {
      console.log("🟡 服务器响应良好");
    } else {
      console.log("🔴 服务器响应需要优化");
    }

    // 检查内容
    const firstResult = results[0];
    console.log("\n🔍 内容检查:");
    console.log(`Nuxt 根节点: ${firstResult.hasContent ? "✅" : "❌"}`);
    console.log(`Vant 引用: ${firstResult.hasVant ? "✅" : "❌"}`);
    console.log(`UnoCSS 引用: ${firstResult.hasUno ? "✅" : "❌"}`);

    // 生成测试报告
    generateReport(results, assetAnalysis);
  } else {
    console.log("❌ 所有测试都失败了！");
  }
};

// 运行测试
runPerformanceTest().catch(console.error);
