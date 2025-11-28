# 构建阶段
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 yarn.lock（如果存在）
COPY package.json yarn.lock* ./

# 安装依赖
RUN yarn install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN yarn build

# 生产运行阶段
FROM node:20-alpine AS production

# 设置工作目录
WORKDIR /app

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# 复制 package.json 和 yarn.lock
COPY package.json yarn.lock* ./

# 只安装生产依赖
RUN yarn install --frozen-lockfile --production && \
    yarn cache clean

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist

# 复制数据文件和上传目录（如果需要）
COPY book.json users.json ./
COPY uploads ./uploads

# 更改文件所有者
RUN chown -R nestjs:nodejs /app

# 切换到非 root 用户
USER nestjs

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 启动应用
CMD ["node", "dist/main"]
