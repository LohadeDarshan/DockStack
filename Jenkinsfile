pipeline {
    agent any
    environment {
        DOCKER_HUB_USER = 'myserverd'
        BACKEND_IMAGE = "${DOCKER_HUB_USER}/dockstack-backend-new"
        FRONTEND_IMAGE = "${DOCKER_HUB_USER}/dockstack-frontend-new"
        IMAGE_TAG = "v${env.BUILD_NUMBER}"
        NAMESPACE = 'dockstack'
        BACKEND_HEALTH_URL = 'http://localhost:5000/health'
        CLIENT_SERVER_IP = '192.168.10.7'
        MAX_RETRIES = 24
        RETRY_INTERVAL = 5
    }
    stages {
        // ─── STAGE 1: Checkout code ───────────────────────────────────
        stage('Checkout') {
            steps {
                echo '📥 Pulling latest code from GitHub...'
                git branch: 'main', url: 'https://github.com/LohadeDarshan/DockStack.git'
            }
        }
        // ─── STAGE 2: SonarQube Scan ───────────────────────────────────
        stage('SonarQube Scan') {
            steps {
                script {
                    def scannerHome = tool 'sonar'
                    withSonarQubeEnv('sonar') {
                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=dockstack \
                        -Dsonar.projectName=DockStack \
                        -Dsonar.sources=backend,frontend
                        -Dsonar.javascript.skip=true
                        """
                    }
                }
            }
        }
        // ─── STAGE 3: Build images ───────────────────────────────────
        stage('Build Docker Images') {
            parallel {
                stage('Backend Build') {
                    steps {
                        sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} ./backend"
                    }
                }
                stage('Frontend Build') {
                    steps {
                        sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} ./frontend"
                    }
                }
            }
        }
        // ─── STAGE 4: Push to Docker Hub ─────────────────────────────
        stage('Push to Docker Hub') {
            steps {
                withDockerRegistry(url: 'https://index.docker.io/v1/', credentialsId: 'dockerHubCred') {
                    sh """
                        docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                        docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                    """
                }
            }
        }
        // ─── STAGE 5: Deploy new version ─────────────────────────────
        stage('Deploy using Docker Compose') {
            steps {
                echo "🚀 Deploying to CLIENT SERVER..."
                sshagent(['DevCICD']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no root@${CLIENT_SERVER_IP} '
                        cd /root/DockStack

                        # Pull latest images
                        docker pull ${BACKEND_IMAGE}:${IMAGE_TAG}
                        docker pull ${FRONTEND_IMAGE}:${IMAGE_TAG}

                        # Update env file safely
                        grep -q "^IMAGE_TAG=" .env && \
                        sed -i "s/^IMAGE_TAG=.*/IMAGE_TAG=${IMAGE_TAG}/" .env || \
                        echo "IMAGE_TAG=${IMAGE_TAG}" >> .env

                        # Restart containers
                        docker compose down
                        docker compose up -d
                        '
                    """
                }
            }
        }
        // ─── STAGE 6: Health Check ────────────────────────────────────
        stage('Health Check') {
            steps {
                echo '🔍 Running health checks on CLIENT SERVER...'
                sshagent(['DevCICD']) {
                    script {
                        def result = sh(
                            script: """
                                ssh -o StrictHostKeyChecking=no root@${CLIENT_SERVER_IP} '
                                for i in \$(seq 1 $MAX_RETRIES); do
                                    HTTP_STATUS=\$(curl -s -o /dev/null -w "%{http_code}" ${BACKEND_HEALTH_URL})
                                    if [ "\$HTTP_STATUS" -eq 200 ]; then
                                        echo "✅ Health check PASSED (HTTP \$HTTP_STATUS)"
                                        exit 0
                                    else
                                        echo "❌ Health check FAILED (HTTP \$HTTP_STATUS) — retrying in $RETRY_INTERVAL s"
                                        sleep $RETRY_INTERVAL
                                    fi
                                done
                                echo "🚨 All retries exhausted. Deployment UNHEALTHY."
                                exit 1
                                '
                            """,
                            returnStdout: true
                        ).trim()
                        echo result
                    }
                }
            }
        }
    }
    // ─── AUTO ROLLBACK on failure ─────────────────────────────────────
    post {
        failure {
            echo '🔁 Rolling back on CLIENT SERVER...'
            sshagent(['DevCICD']) {
                script {
                    // Step 1: Auto-detect previous IMAGE_TAG
                    def prevTag = sh(
                        script: """
                        ssh -o StrictHostKeyChecking=no root@${CLIENT_SERVER_IP} '
                        grep IMAGE_TAG /root/DockStack/.env | cut -d "=" -f2
                        '
                        """,
                        returnStdout: true
                    ).trim()
                    echo "Previous image tag detected: ${prevTag}"

                    // Step 2: Rollback safely
                    sh """
                        ssh -o StrictHostKeyChecking=no root@${CLIENT_SERVER_IP} '
                        cd /root/DockStack

                        # Update IMAGE_TAG in env safely
                        grep -q "^IMAGE_TAG=" .env && \
                        sed -i "s/^IMAGE_TAG=.*/IMAGE_TAG=${prevTag}/" .env || \
                        echo "IMAGE_TAG=${prevTag}" >> .env

                        # Restart containers with old version
                        docker compose down
                        docker compose up -d
                        '
                    """
                }
            }
        }
        success {
            echo """
                ╔══════════════════════════════════════╗
                ║  ✅ DEPLOYMENT SUCCESSFUL            ║  
                ║  Version: ${IMAGE_TAG}               ║
                ║  All health checks passed            ║
                ╚══════════════════════════════════════╝
                """
        }
    }
}