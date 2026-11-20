pipeline {
    agent any

    environment {
        IMAGE = "hamad14/tailoring-frontend"
        TAG   = "${env.GIT_COMMIT}"
    }

    stages {
        stage('Build image') {
            steps {
                sh 'docker build -t $IMAGE:$TAG .'
            }
        }

        stage('Show images') {
            steps {
                sh 'docker images | head -5'
            }
        }
    }
}
