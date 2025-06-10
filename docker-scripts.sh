#!/bin/bash

# Docker 操作脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目名称
PROJECT_NAME="store-h5"
IMAGE_NAME="store-h5"
CONTAINER_NAME="store-h5-container"

# 显示帮助信息
show_help() {
    echo "Docker 操作脚本"
    echo ""
    echo "用法: ./docker-scripts.sh [命令]"
    echo ""
    echo "命令:"
    echo "  build     构建 Docker 镜像"
    echo "  run       运行容器"
    echo "  stop      停止容器"
    echo "  restart   重启容器"
    echo "  logs      查看容器日志"
    echo "  shell     进入容器终端"
    echo "  clean     清理镜像和容器"
    echo "  compose   使用 docker-compose 运行"
    echo "  help      显示此帮助信息"
}

# 构建镜像
build_image() {
    echo -e "${GREEN}构建 Docker 镜像...${NC}"
    docker build -t $IMAGE_NAME .
    echo -e "${GREEN}镜像构建完成！${NC}"
}

# 运行容器
run_container() {
    echo -e "${GREEN}启动容器...${NC}"
    docker run -d \
        --name $CONTAINER_NAME \
        -p 3000:3000 \
        -e NODE_ENV=production \
        -e NUXT_API_BASE=https://api.diantd.com/api \
        -e NUXT_PUBLIC_API_BASE=https://api.diantd.com/api \
        -e NITRO_PRESET=node-server \
        -e NUXT_APP_BASE_URL=/ \
        -e NUXT_HOST=0.0.0.0 \
        -e NUXT_PORT=3000 \
        --restart unless-stopped \
        $IMAGE_NAME
    echo -e "${GREEN}容器启动完成！访问 http://localhost:3000${NC}"
}

# 停止容器
stop_container() {
    echo -e "${YELLOW}停止容器...${NC}"
    docker stop $CONTAINER_NAME || true
    docker rm $CONTAINER_NAME || true
    echo -e "${GREEN}容器已停止${NC}"
}

# 重启容器
restart_container() {
    stop_container
    run_container
}

# 查看日志
show_logs() {
    echo -e "${GREEN}查看容器日志...${NC}"
    docker logs -f $CONTAINER_NAME
}

# 进入容器
enter_shell() {
    echo -e "${GREEN}进入容器终端...${NC}"
    docker exec -it $CONTAINER_NAME /bin/sh
}

# 清理
clean_up() {
    echo -e "${YELLOW}清理容器和镜像...${NC}"
    docker stop $CONTAINER_NAME || true
    docker rm $CONTAINER_NAME || true
    docker rmi $IMAGE_NAME || true
    echo -e "${GREEN}清理完成${NC}"
}

# 使用 docker-compose
run_compose() {
    echo -e "${GREEN}使用 docker-compose 启动...${NC}"
    docker-compose up -d
    echo -e "${GREEN}服务启动完成！访问 http://localhost:3000${NC}"
}

# 主逻辑
case "${1:-help}" in
    build)
        build_image
        ;;
    run)
        build_image
        stop_container
        run_container
        ;;
    stop)
        stop_container
        ;;
    restart)
        restart_container
        ;;
    logs)
        show_logs
        ;;
    shell)
        enter_shell
        ;;
    clean)
        clean_up
        ;;
    compose)
        run_compose
        ;;
    help|*)
        show_help
        ;;
esac 