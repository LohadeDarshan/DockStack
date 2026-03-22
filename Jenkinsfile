pipeline {
    agent any

    environment {
        DOCKER_HUB_USER    = 'myserverd'
        BACKEND_IMAGE      = "${DOCKER_HUB_USER}/dockstack-backend-new"
        FRONTEND_IMAGE     = "${DOCKER_HUB_USER}/dockstack-frontend-new"
        IMAGE_TAG          = "v${env.BUILD_NUMBER}"
        PREV_TAG           = "${env.BUILD_NUMBER.toInteger() > 1 ? "v${env.BUILD_NUMBER.toInteger() - 1}" : "v1"}"
        NAMESPACE          = 'dockstack'
        BACKEND_HEALTH_URL = 'http://localhost:5000'
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
                        """
                    }
                }
            }
        }

        // ─── STAGE 3: Build images ───────────────────────────────────
        stage('Build Docker Images') {
            steps {
                echo '🐳 Building Docker images...'
                sh """
                    docker-compose build
                    docker tag ${DOCKER_HUB_USER}/dockstack-backend:latest ${BACKEND_IMAGE}:${IMAGE_TAG}
                    docker tag ${DOCKER_HUB_USER}/dockstack-frontend:latest ${FRONTEND_IMAGE}:${IMAGE_TAG}
                """
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

                sshagent(['remote-server']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no root@192.168.10.6 '
                
                        cd /root/DockStack

                        # Pull latest images
                        docker pull ${BACKEND_IMAGE}:${IMAGE_TAG}
                        docker pull ${FRONTEND_IMAGE}:${IMAGE_TAG}

                        # Update env file
                        echo "IMAGE_TAG=${IMAGE_TAG}" > .env

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
                script {
                    def result = sh(
                        script: """
                        ssh -o StrictHostKeyChecking=no root@192.168.10.6 '
                        curl -s -o /dev/null -w "%{http_code}" ${BACKEND_HEALTH_URL}
                        '
                        """,
                        returnStdout: true
                    ).trim()

                    if (result != '200') {
                        error("❌ Health check FAILED! Triggering rollback...")
                    } else {
                        echo "✅ Health check PASSED!"
                            }
                        }   
                    }
                }
            }
        }

        // ─── AUTO ROLLBACK on failure ─────────────────────────────────────
        post {
            failure {
                echo '🔁 Rolling back on CLIENT SERVER...'

                sshagent(['remote-server']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no root@192.168.10.6 '

                        cd /root/DockStack

                     # Switch to previous version
                        echo "IMAGE_TAG=${PREV_TAG}" > .env

                        # Restart containers with old version
                        docker compose down
                        docker compose up -d
                        '
                    """
                }
            }

            success {
                echo """
                ╔══════════════════════════════════════╗
                ║  ✅ DEPLOYMENT SUCCESSFUL             ║
                ║  Version: ${IMAGE_TAG}                ║
                ║  All health checks passed             ║
                ╚══════════════════════════════════════╝
                """
            }
        }