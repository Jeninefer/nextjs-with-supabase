#!/bin/bash
# SonarQube Docker Management Script
# Manages SonarQube container for code quality analysis

echo "🐳 SONARQUBE DOCKER MANAGEMENT"
echo "=============================="

SONARQUBE_IDE_PORT="64120"

case "${1:-start}" in
    start)
        echo "🚀 Starting SonarQube container..."
        docker run -d \
            --name sonarqube \
            -p 9000:9000 \
            -p ${SONARQUBE_IDE_PORT}:${SONARQUBE_IDE_PORT} \
            -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true \
            -v sonarqube_data:/opt/sonarqube/data \
            -v sonarqube_extensions:/opt/sonarqube/extensions \
            -v sonarqube_logs:/opt/sonarqube/logs \
            sonarqube:latest
        
        echo ""
        echo "⏳ Waiting for SonarQube to start..."
        sleep 10
        
        echo ""
        echo "✅ SonarQube started"
        echo "🌐 Admin UI: http://localhost:9000"
        echo "📊 Default credentials:"
        echo "   Username: admin"
        echo "   Password: admin"
        ;;
    
    stop)
        echo "🛑 Stopping SonarQube..."
        docker stop sonarqube
        echo "✅ SonarQube stopped"
        ;;
    
    restart)
        echo "🔄 Restarting SonarQube..."
        docker restart sonarqube
        echo "✅ SonarQube restarted"
        ;;
    
    logs)
        echo "📋 Showing SonarQube logs..."
        docker logs -f sonarqube
        ;;
    
    status)
        echo "📊 SonarQube status:"
        docker ps --filter name=sonarqube --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        ;;
    
    clean)
        echo "🗑️ Removing SonarQube container and data..."
        docker rm -f sonarqube
        docker volume rm sonarqube_data sonarqube_extensions sonarqube_logs 2>/dev/null || true
        echo "✅ SonarQube removed"
        ;;
    
    *)
        echo "Usage: $0 {start|stop|restart|logs|status|clean}"
        echo ""
        echo "Commands:"
        echo "  start   - Start SonarQube container"
        echo "  stop    - Stop SonarQube container"
        echo "  restart - Restart SonarQube container"
        echo "  logs    - Show SonarQube logs"
        echo "  status  - Show SonarQube container status"
        echo "  clean   - Remove SonarQube container and volumes"
        exit 1
        ;;
esac
