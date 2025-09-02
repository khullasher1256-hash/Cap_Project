pipeline {

    agent any

    environment {
        // Application configuration
        APP_NAME = 'evercart'
        IMAGE_TAG = "${BUILD_NUMBER}"
        DOCKER_IMAGE = "${APP_NAME}:${IMAGE_TAG}"

        // Docker Hub repo (no tag here!)
        DOCKER_HUB_REPO = 'khullasher1256/evercart-app'
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')

        // AWS ECR configuration
        AWS_REGION = 'us-east-1'
        ECR_REGISTRY = '996180474258.dkr.ecr.us-east-1.amazonaws.com'
        ECR_REPOSITORY = 'arunevercart'
        AWS_CREDENTIALS = credentials('aws-eks-creds')
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo 'Building Docker image...'
                    docker.build("${DOCKER_IMAGE}")
                    echo "✅ Docker image built successfully: ${DOCKER_IMAGE}"
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    echo 'Pushing to Docker Hub...'
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
                        // Tag for Docker Hub
                        sh "docker tag ${DOCKER_IMAGE} ${DOCKER_HUB_REPO}:${IMAGE_TAG}"
                        sh "docker tag ${DOCKER_IMAGE} ${DOCKER_HUB_REPO}:latest"

                        // Push to Docker Hub
                        sh "docker push ${DOCKER_HUB_REPO}:${IMAGE_TAG}"
                        sh "docker push ${DOCKER_HUB_REPO}:latest"
                    }
                    echo '✅ Successfully pushed to Docker Hub'
                }
            }
        }

        stage('Push to ECR') {
            steps {
                script {
                    echo 'Pushing to AWS ECR...'
                    withCredentials([aws(credentialsId: 'aws-eks-creds')]) {
                        // Login to ECR
                        sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}"

                        // Tag for ECR
                        sh "docker tag ${DOCKER_IMAGE} ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}"
                        sh "docker tag ${DOCKER_IMAGE} ${ECR_REGISTRY}/${ECR_REPOSITORY}:latest"

                        // Push to ECR
                        sh "docker push ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}"
                        sh "docker push ${ECR_REGISTRY}/${ECR_REPOSITORY}:latest"
                    }
                    echo '✅ Successfully pushed to AWS ECR'
                }
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                script {
                    echo 'Deploying application with Docker Compose...'

                    // Stop any existing containers
                    sh 'docker-compose down || true'

                    // Remove old images to ensure we use the new one
                    sh 'docker image prune -f || true'

                    // Replace build with image in compose file
                    sh """
                        cp docker-compose.yml docker-compose.deploy.yml
                        sed -i 's|build: .|image: ${DOCKER_HUB_REPO}:${IMAGE_TAG}|g' docker-compose.deploy.yml
                    """

                    // Deploy
                    sh 'docker-compose -f docker-compose.deploy.yml up -d'

                    // Verify containers
                    sh 'docker-compose ps'
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    dir('Kubernetes') {
                        withKubeConfig(
                            caCertificate: '',
                            clusterName: '',
                            contextName: '',
                            credentialsId: 'k8s-token',
                            namespace: '',
                            restrictKubeConfigAccess: false,
                            serverUrl: ''
                        ) {
                            sh 'kubectl apply -f mongodb-deployment.yaml'
                            sh 'kubectl apply -f app-deployment.yaml'
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed'
            sh 'docker stop test-container || true'
            sh 'docker rm test-container || true'
            sh 'docker image prune -f || true'
        }
        success {
            echo '✅ Pipeline completed successfully!'
            echo "🌍 Application deployed and accessible at: http://localhost:5000"
        }
        failure {
            echo '❌ Pipeline failed!'
            sh 'docker-compose logs || true'
            sh 'docker-compose down || true'
        }
    }
}
