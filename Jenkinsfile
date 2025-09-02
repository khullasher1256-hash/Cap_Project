pipeline {
    agent any
    environment {
        DOCKER_IMAGE = "khullasher1256/evercart-app"
        DOCKER_TAG   = "latest"
    }
    stages {
        stage('Checkout') {
            steps {
                git credentialsId: 'github_credentials',
                    branch: 'master',
                    url: 'https://github.com/khullasher1256-hash/Cap_Project.git'
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    echo "🛠️ Building Docker image..."
                    docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                }
            }
        }
 
        stage('Docker Compose Build & Up') {
            steps {
                script {
                    echo "🛠️ Building and starting services using Docker Compose..."
                    sh """
                        docker-compose down
                        docker-compose build
                        docker-compose up -d
                        docker-compose ps
                    """
                }
            }
        }
 
        stage('Push Docker Image') {
            steps {
                script {
                    echo "📦 Logging in and pushing Docker image..."
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
                        sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
                    }
                    echo "✅ Docker image pushed: ${DOCKER_IMAGE}:${DOCKER_TAG}"
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                withAWS(credentials: 'aws-eks-creds', region: 'us-east-1') {
                    script {
                        sh """
                            echo "🔄 Updating kubeconfig..."
                            aws eks update-kubeconfig --region us-east-1 --name arun-project-cluster
                            echo "🚀 Updating deployment image in Kubernetes..."
                            kubectl set image deployment/evercart-app \
                                evercart-app=${DOCKER_IMAGE}:${DOCKER_TAG} --record
                            echo "⏳ Waiting for rollout to complete..."
                            kubectl rollout status deployment/evercart-app
                        """
                    }
                }
            }
        }
    }
    post {
        success {
            echo "✅ Deployment successful!"
        }
        failure {
            echo "❌ Deployment failed!"
        }
    }
}
