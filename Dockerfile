# 使用官方 Node.js 18 Alpine 镜像作为基础镜像
FROM node:18-alpine AS base

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package.json 和 pnpm-lock.yaml（如果存在）
COPY package.json pnpm-lock.yaml* ./

# 安装依赖（仅生产依赖）
FROM base AS deps
RUN pnpm install --frozen-lockfile --prod=false

# 构建阶段
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置构建环境变量
ENV NODE_ENV=production
ENV NITRO_PRESET=node-server

# 构建应用
RUN pnpm build

# 生产阶段
FROM node:18-alpine AS runner
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxt

# 复制构建产物 - 确保完整复制
COPY --from=builder --chown=nuxt:nodejs /app/.output ./
# 复制 public 目录（如果存在）
COPY --from=builder --chown=nuxt:nodejs /app/public ./public
# 复制 package.json
COPY --from=builder --chown=nuxt:nodejs /app/package.json ./package.json

# 设置环境变量
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
ENV NITRO_PRESET=node-server
ENV NUXT_APP_BASE_URL=/

# 暴露端口
EXPOSE 3000

# 切换到非 root 用户
USER nuxt

# 启动应用
CMD ["node", "server/index.mjs"] 