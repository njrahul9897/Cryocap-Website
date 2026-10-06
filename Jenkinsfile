pipeline {
  agent {
    node {
    label "slave-1"
      }
      }
    environment {
        AWS_ACCOUNT_ID="320624297832"
        AWS_DEFAULT_REGION="ap-south-1"
        IMAGE_REPO_NAME="cryocap-website"
        REPOSITORY_URL="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${IMAGE_REPO_NAME}"
        BUILD_TIMESTAMP = sh(script: 'date +%Y%m%d%H%M%S', returnStdout: true).trim()
    }
    stages {
        stage("SCM CHECKOUT") {
            steps {
             checkout scmGit(branches: [[name: 'main']], extensions: [], userRemoteConfigs: [[credentialsId: 'Gitea Token', url: 'https://git.aone.ai/atsuya/cryocap-website.git']])
            }
       }
        stage("DOCKER IMAGE BUILD") {
           steps {
                sh 'docker build -t ${IMAGE_REPO_NAME}:${BUILD_TIMESTAMP} -f Dockerfile  .'
           }
       }
        stage("DOCKER IMAGE TAG") {
           steps {
                sh 'docker tag ${IMAGE_REPO_NAME}:${BUILD_TIMESTAMP} ${REPOSITORY_URL}:${BUILD_TIMESTAMP}'
           }
       }
       stage("ECR LOGIN") {
            steps {
                sh "aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
            }
            }
        stage ("IMAGE PUSH TO ECR") {
            steps {
                sh "docker push ${REPOSITORY_URL}:${BUILD_TIMESTAMP}"
            }
            }
     	stage ("CHECKOUT IMAGE-VERSION-PROD REPO") {
            steps {	
                git branch: 'deploy/iv-prod', credentialsId: 'Gitea Token', url: 'https://git.aone.ai/atsuya/aone-igotit-image-versions-prod.git'
            }
        }
        stage('Update Porduction Deployment file for Argocd') {
            environment {
                GIT_REPO_NAME = "aone-igotit-image-versions-prod"
                GIT_USER_NAME = "atsuya"
            }
            steps {
                dir('igotit-services') {
                 //   withCredentials([string(credentialsId: 'github', variable: 'GITHUB_TOKEN')])
                    withCredentials([string(credentialsId: 'argocd', variable: 'argocd')]){
                        sh '''
                            git config user.email "jenkins@atsuyatech.com"
                            git config user.name "jenkins"
                            git checkout deploy/iv-prod
                            BUILD_NUMBER=${BUILD_TIMESTAMP}
                            echo $BUILD_NUMBER
                            imageTag=$(grep -oP '(?<=cryocap-website:)[^ ]+' cryocap-website-deps.yaml | head -n1)
                            echo $imageTag
                            sed -i "s|${REPOSITORY_URL}:${imageTag}|${REPOSITORY_URL}:${BUILD_NUMBER}|g" cryocap-website-deps.yaml
                            git add cryocap-website-deps.yaml
                            git commit -m "Update cryocap-website deployment Image to version \${BUILD_NUMBER}"
                            git push https://${argocd}@git.aone.ai/${GIT_USER_NAME}/${GIT_REPO_NAME} HEAD:deploy/iv-prod
                        '''
                    }
                }
            }
        }
    }
     post { 
     success { 
            script {
            googlechatnotification (
              message: '$JOB_NAME ${BUILD_TIMESTAMP} is SUCCESS and deployed in in prod environment.See build results at ${BUILD_URL}', 
              //notifyAborted: true, 
              //notifyFailure: true, 
              notifySuccess: true, 
              url: 'id:igotit-dep-alert-space-wh'
        )
        }
	}
	 failure {
            script {
            googlechatnotification (
              message: '$JOB_NAME ${BUILD_TIMESTAMP} is FAILED.See build results at ${BUILD_URL}',
              //notifyAborted: true,
              notifyFailure: true,
              //notifySuccess: true,
              url: 'id:igotit-dep-alert-space-wh'
        )
        }
        }
	 aborted {
            script {
            googlechatnotification (
              message: '$JOB_NAME ${BUILD_TIMESTAMP} is ABORTED.See build results at ${BUILD_URL}',
              notifyAborted: true,
              //notifyFailure: true,
              //notifySuccess: true,
              url: 'id:igotit-dep-alert-space-wh'
        )
        }
        }
        always { 
            cleanWs()
        }
    }
}
