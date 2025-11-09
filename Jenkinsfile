pipeline {
  agent any

  environment {
    REGISTRY_DOMAIN = "docker.io"
    BACKEND_IMAGE = "kiran1703/survey-backend:${BUILD_NUMBER}"
    FRONTEND_IMAGE = "kiran1703/survey-frontend:${BUILD_NUMBER}"
    VITE_API_BASE_URL = "https://survey.example.com/api"
    VITE_API_TIMEOUT_MS = "15000"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Backend Dependencies') {
      steps {
        dir('backend') {
          sh '''
            python3 -m venv .venv
            . .venv/bin/activate
            pip install --upgrade pip
            pip install -r requirements.txt pytest
          '''
        }
      }
    }

    stage('Frontend Build') {
      steps {
        dir('frontend') {
          sh '''
            npm ci
            npm run build
          '''
        }
      }
    }

    stage('Docker Build & Push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'docker-registry-creds', passwordVariable: 'REGISTRY_PASSWORD', usernameVariable: 'REGISTRY_USERNAME')]) {
          sh '''
            echo "$REGISTRY_PASSWORD" | docker login $REGISTRY_DOMAIN -u "$REGISTRY_USERNAME" --password-stdin
            docker build -t $BACKEND_IMAGE backend
            docker build \
              --build-arg VITE_API_BASE_URL=$VITE_API_BASE_URL \
              --build-arg VITE_API_TIMEOUT_MS=$VITE_API_TIMEOUT_MS \
              -t $FRONTEND_IMAGE frontend
            docker push $BACKEND_IMAGE
            docker push $FRONTEND_IMAGE
            docker logout $REGISTRY_DOMAIN
          '''
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        withKubeConfig(credentialsId: 'rancher-kubeconfig') {
          sh '''
            kubectl apply -f k8s/namespace.yaml
            kubectl apply -f k8s/backend-configmap.yaml
            kubectl apply -f k8s/backend-secret.yaml
            kubectl apply -f k8s/frontend-configmap.yaml
            kubectl apply -f k8s/backend-deployment.yaml
            kubectl apply -f k8s/frontend-deployment.yaml
          '''
          sh '''
            kubectl set image deployment/survey-backend survey-backend=$BACKEND_IMAGE -n student-survey
            kubectl set image deployment/survey-frontend survey-frontend=$FRONTEND_IMAGE -n student-survey
          '''
          sh '''
            kubectl rollout restart deployment/survey-backend -n student-survey
          '''
        }
      }
    }
  }
}
