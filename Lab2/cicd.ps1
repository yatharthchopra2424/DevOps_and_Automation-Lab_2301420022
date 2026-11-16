# Runs the same stages as the Jenkinsfile: build -> load -> apply manifests -> deploy -> verify
param([string]$Build = "3")
Write-Host "[Stage 1] Build Image";        docker build -q -t lab2-python-app:$Build app
Write-Host "[Stage 2] Load to Minikube";   minikube image load lab2-python-app:$Build
Write-Host "[Stage 3] Apply Manifests";    kubectl apply -f k8s/
Write-Host "[Stage 4] Deploy New Image";   kubectl set image deployment/lab2-app web=lab2-python-app:$Build
Write-Host "[Stage 5] Verify";             kubectl rollout status deployment/lab2-app
