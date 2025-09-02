pipeline {

    agent any
 
    environment {

        // Application configuration

        APP_NAME = 'fitness-tracker'

        IMAGE_TAG = "${BUILD_NUMBER}"

        DOCKER_IMAGE = "${APP_NAME}:${IMAGE_TAG}"

        // Docker Hub credentials (configure in Jenkins)

        DOCKER_HUB_REPO = 'khullasher1256/evercart-app:latest'

        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')

        // AWS ECR configuration

        AWS_REGION = 'us-east-1'

        ECR_REGISTRY = '996180474258.dkr.ecr.us-east-1.amazonaws.com/arunevercart'

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

                    def image = docker.build("${DOCKER_IMAGE}")

                    // Also tag with latest

                    sh "docker tag ${DOCKER_IMAGE} ${APP_NAME}:latest"

                    echo "Docker image built successfully: ${DOCKER_IMAGE}"

                }

            }

        }
 
        stage('Test') {

            steps {

                script {

                    echo 'Running basic container test...'

                    // Test if the container can start properly

                    sh """

                        docker run --rm -d --name test-container \

                        -e NODE_ENV=test \

                        -e MONGODB_URI=mongodb://mongodb-service:27017/evercart-test \

                        ${DOCKER_IMAGE}

                        sleep 5

                        # Check if container is running

                        docker ps | grep test-container

                        # Stop test container

                        docker stop test-container || true

                    """

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

                    echo 'Successfully pushed to Docker Hub'

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

                    echo 'Successfully pushed to ECR'

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

                    // Create a temporary docker-compose file for deployment

                    sh """

                        cp docker-compose.yml docker-compose.deploy.yml

                        sed -i 's|build: .|image: ${DOCKER_IMAGE}|g' docker-compose.deploy.yml

                    """

                    // Deploy with docker-compose

                    sh 'docker-compose up -d'

                    // Wait for services to be ready

                    sh 'sleep 10'

                    // Check if services are running

                    sh 'docker-compose ps'

                }

            }

        }
 
        stage('Health Check') {

            steps {

                script {

                    echo 'Performing health check...'

                    // Wait for application to start

                    sh 'sleep 15'

                    // Check if fitness-app container is running

                    sh """

                        if docker-compose ps fitness-app | grep -q 'Up'; then

                            echo 'Fitness Tracker application is running successfully!'

                        else

                            echo 'Health check failed - application is not running'

                            docker-compose logs fitness-app

                            exit 1

                        fi

                    """

                    // Check if MongoDB is running

                    sh """

                        if docker-compose ps mongodb | grep -q 'Up'; then

                            echo 'MongoDB is running successfully!'

                        else

                            echo 'MongoDB health check failed'

                            docker-compose logs mongodb

                            exit 1

                        fi

                    """

                }

            }
            
        }
        stage('Deploy to kubernets'){
            steps{
                script{
                    dir('Kubernetes') {
                        withKubeConfig(caCertificate: '', clusterName: '', contextName: '', credentialsId: 'k8s-token', namespace: '', restrictKubeConfigAccess: false, serverUrl: '') {
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

            // Clean up test containers

            sh 'docker stop test-container || true'

            sh 'docker rm test-container || true'

            // Clean up dangling images

            sh 'docker image prune -f || true'

        }

        success {

            echo 'Pipeline completed successfully!'

            echo "Application deployed and accessible at: http://localhost:5000"

        }

        failure {

            echo 'Pipeline failed!'

            // Show logs for debugging

            sh 'docker-compose logs || true'

            // Clean up on failure

            sh 'docker-compose down || true'

        }

    }

}
 
