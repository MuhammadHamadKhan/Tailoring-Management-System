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
        stage('Push image') {
    steps {
        withCredentials([usernamePassword(
            credentialsId: 'dockerhub',
            usernameVariable: 'DH_USER',
            passwordVariable: 'DH_PASS')]) {
            sh 'echo $DH_PASS | docker login -u $DH_USER --password-stdin'
            sh 'docker tag $IMAGE:$TAG $IMAGE:latest'
            sh 'docker push $IMAGE:$TAG'
            sh 'docker push $IMAGE:latest'
        }
    }
}
    }
}
