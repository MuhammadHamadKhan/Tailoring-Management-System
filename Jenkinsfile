pipeline {
    agent any

  environment {
    IMAGE    = "hamad14/tailoring-frontend"
    TAG      = "${env.GIT_COMMIT}"
    APP_HOST = "ubuntu@172.31.43.253"
}

    stages {
        stage('Build image') {
            steps {
                sh 'docker build -t $IMAGE:$TAG -t $IMAGE:latest .'
            }
        }

        stage('Push image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DH_USER',
                    passwordVariable: 'DH_PASS')]) {
                    sh 'echo $DH_PASS | docker login -u $DH_USER --password-stdin'
                    sh 'docker push $IMAGE:$TAG'
                    sh 'docker push $IMAGE:latest'
                }
            }
        }
        stage('Deploy') {
    steps {
        sshagent(['ec2-key']) {
            sh '''
                ssh -o StrictHostKeyChecking=no $APP_HOST "
                    cd ~/tailoring &&
                    docker compose pull frontend &&
                    docker compose up -d frontend
                "
            '''
        }
    }
}
    }
}
