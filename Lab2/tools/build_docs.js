const fs = require("fs"), path = require("path");
const NM = "C:/Users/yatha/OneDrive/Desktop/devops_sem_7/Old_Lab1_2/lab2-docker/node_modules/docx";
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType,
  ShadingType, ImageRun, BorderStyle, AlignmentType } = require(NM);
const ROOT = path.resolve(__dirname, ".."), SHOTS = path.join(ROOT, "shots"), OUT = path.join(ROOT, "docs");
const ID = "2301420022";
const rd = f => fs.readFileSync(path.join(ROOT, f), "utf8").replace(/\r\n/g, "\n").trimEnd();

const h1 = t => new Paragraph({ text: t, heading: HeadingLevel.HEADING_1, spacing: { before: 240, after: 120 } });
const h2 = t => new Paragraph({ text: t, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } });
const p = t => new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: t, font: "Calibri", size: 22 })] });
const bl = items => items.map(t => new Paragraph({ bullet: { level: 0 }, spacing: { after: 50 },
  children: [new TextRun({ text: t, font: "Calibri", size: 22 })] }));
function code(text) {
  const b = { style: BorderStyle.SINGLE, size: 6, color: "D0D0D0" };
  return [new Table({ width: { size: 9000, type: WidthType.DXA }, columnWidths: [9000], rows: [new TableRow({ children: [
    new TableCell({ width: { size: 9000, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: "F6F6F6" },
      margins: { top: 120, bottom: 120, left: 180, right: 180 }, borders: { top: b, bottom: b, left: b, right: b },
      children: text.split("\n").map(l => new Paragraph({ spacing: { after: 0, line: 240 },
        children: [new TextRun({ text: l || " ", font: "Consolas", size: 18 })] })) })] })] }),
    new Paragraph({ text: "", spacing: { after: 100 } })];
}
function shot(name, caption) {
  const buf = fs.readFileSync(path.join(SHOTS, name + ".png"));
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
  let W = 600, H = Math.round(h * W / w); if (H > 820) { H = 820; W = Math.round(w * H / h); }
  return [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
      children: [new ImageRun({ type: "png", data: buf, transformation: { width: W, height: H } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 },
      children: [new TextRun({ text: caption, italics: true, size: 18, color: "555555", font: "Calibri" })] })];
}
function build(file, title, kids) {
  const doc = new Document({ sections: [{ children: [
    new Paragraph({ text: "Lab 2: Containerization & Kubernetes Orchestration", heading: HeadingLevel.TITLE, spacing: { after: 60 } }),
    new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 28, font: "Calibri" })], spacing: { after: 200 } }),
    ...kids] }] });
  return Packer.toBuffer(doc).then(b => { fs.writeFileSync(path.join(OUT, file), b); console.log("wrote", file); });
}
const S = (...a) => a.flat();

const docs = [];
// ---- 1
docs.push([`Task1_Deploy_to_Kubernetes_${ID}.docx`, "Task 1: Deploy an application to Kubernetes", S(
  h1("1. Objective"), p("Deploy the containerized Flask app to a Minikube cluster using Deployment and Service manifests and verify the running pods."),
  h1("2. Start the cluster"), p("Minikube was started with the Docker driver, and the app image was loaded into the cluster."),
  code("minikube start --driver=docker\nminikube image load lab2-python-app:1.0\nkubectl get nodes"), ...shot("t1a_cluster", "Figure 1: Minikube cluster is running, node is Ready"),
  h1("3. Manifests and deployment"), p("deployment.yaml runs 2 replicas of the app; service.yaml exposes it as a NodePort service on port 30080."),
  code("kubectl apply -f k8s/\nkubectl rollout status deployment/lab2-app"), ...shot("t1b_deploy", "Figure 2: Deployment and Service manifests applied"),
  h1("4. Verify running pods"), code("kubectl get deployments\nkubectl get pods -o wide\nkubectl get svc lab2-service"),
  ...shot("t1c_verify", "Figure 3: 2/2 pods Running, service created, app responds inside the pod"),
  h1("5. Conclusion"), p("Both pods are in Running state (2/2 READY), the NodePort service is created, and the app returns its JSON response from inside the pod."))]);
// ---- 2
docs.push([`Task2_Kubernetes_Deployment_Strategies_${ID}.docx`, "Task 2: Implement Kubernetes deployment", S(
  h1("1. Objective"), p("Perform a rolling update, a rollback, and scale the application replicas."),
  h1("2. Rolling update"), p("A version 2.0 image was built (different welcome message) and the deployment image was updated. Kubernetes replaced the pods gradually (maxSurge 1, maxUnavailable 1)."),
  code("docker build -t lab2-python-app:2.0 app-v2\nminikube image load lab2-python-app:2.0\nkubectl set image deployment/lab2-app web=lab2-python-app:2.0\nkubectl rollout status deployment/lab2-app\nkubectl rollout history deployment/lab2-app"),
  ...shot("t2a_rolling", "Figure 1: Rolling update to v2.0; app now returns the VERSION 2.0 message"),
  h1("3. Rollback"), p("The rollout was undone and the deployment returned to image v1.0."),
  code("kubectl rollout undo deployment/lab2-app\nkubectl rollout status deployment/lab2-app"),
  ...shot("t2b_rollback", "Figure 2: Rollback from v2.0 to v1.0"),
  h1("4. Scaling"), p("The deployment was scaled up from 2 to 5 replicas and then down to 3."),
  code("kubectl scale deployment/lab2-app --replicas=5\nkubectl scale deployment/lab2-app --replicas=3"),
  ...shot("t2c_scaling", "Figure 3: Scaling to 5 replicas and back to 3"),
  h1("5. Conclusion"), p("Rolling update, rollback and scaling were all completed successfully."))]);
// ---- 3 report
docs.push([`Task3_Containerization_Orchestration_Report_${ID}.docx`, "Task 3: Containerization and orchestration report", S(
  h1("1. Introduction"), p("This report describes how a Flask web application was containerized with Docker and orchestrated on a local Kubernetes (Minikube) cluster."),
  h1("2. Architecture"),
  code("Dockerfile -> Docker image (lab2-python-app)\n                      |\n           minikube image load\n                      v\nMinikube node -> Deployment (ReplicaSet, 2-5 pods) <- Service (NodePort 30080)"),
  ...bl(["Application: Flask app with / and /health endpoints (port 5000).", "Image: python:3.12-slim base, 7 layers, tagged 1.0 / 2.0 / 3.",
    "Cluster: single-node Minikube (Docker driver, Kubernetes v1.37.0).", "Deployment: 2 replicas, readiness probe on /health, RollingUpdate strategy.",
    "Service: NodePort 30080 -> container port 5000."]),
  ...shot("t1c_verify", "Figure 1: Running deployment, pods and service"),
  h1("3. Deployment strategy"), p("RollingUpdate with maxSurge=1 and maxUnavailable=1: new pods start before old ones are removed, and the readiness probe keeps traffic away from pods that are not ready. A rollback uses the previous ReplicaSet."),
  ...shot("t2a_rolling", "Figure 2: Rolling update from v1.0 to v2.0"),
  h1("4. Scaling results"), p("Scaling from 3 to 5 replicas brought all new pods to Ready within about 15 seconds; scaling back to 3 removed the extra pods."),
  ...shot("t2c_scaling", "Figure 3: Scale up to 5 and down to 3"),
  h1("5. Observations"),
  ...bl(["Rolling update and rollback both completed successfully (rollout status confirmed).", "imagePullPolicy: Never is needed because the images exist only inside Minikube.",
    "Each pod has its own hostname and its own container-layer data, so state must not be stored inside pods.", "The CI/CD script re-applies the manifests and rolls out a new image automatically (see Task 8)."]),
  ...shot("t8b_cicd_run", "Figure 4: Automated deployment through the pipeline"),
  h1("6. Conclusion"), p("The app was successfully containerized, deployed, updated, rolled back and scaled on Kubernetes."))]);
// ---- 4
docs.push([`Task4_Containerize_with_Docker_${ID}.docx`, "Task 4: Containerize a sample application using Docker", S(
  h1("1. Objective"), p("Write a Dockerfile for a Flask app, build the image, run the container and document the image layers and behaviour."),
  h1("2. Application"), p("app.py exposes GET / (welcome message, hostname, visit counter stored in /data/counter.txt) and GET /health."),
  h1("3. Dockerfile and build"), ...code(rd("app/Dockerfile")), ...code("docker build -t lab2-python-app:1.0 app"),
  ...shot("t4a_build", "Figure 1: Dockerfile and image build"),
  h1("4. Run, layers and behaviour"), ...code("docker run -d --name lab2-app -p 5000:5000 lab2-python-app:1.0\ncurl localhost:5000/\ncurl localhost:5000/health\ndocker history lab2-python-app:1.0"),
  ...shot("t4b_run", "Figure 2: Container running, endpoints tested, image layers"),
  h1("5. Layer description"), ...bl(["FROM python:3.12-slim: base OS and Python (largest layers).", "WORKDIR, COPY requirements.txt: small metadata/file layers.", "RUN pip install: installs Flask (15.3 MB).", "COPY app.py, RUN mkdir /data: application code and data directory.", "EXPOSE and CMD: metadata only (0 B)."]),
  h1("6. Conclusion"), p("The image was built, the container ran and served requests, and docker history shows each Dockerfile instruction as a layer."))]);
// ---- 5
docs.push([`Task5_Manage_Docker_Containers_Images_${ID}.docx`, "Task 5: Manage Docker containers and images", S(
  h1("1. Objective"), p("List, start, stop and remove containers, tag and push an image to a registry, and use Docker Compose for a multi-container setup."),
  h1("2. Container management"), ...code("docker ps\ndocker stop lab2-app\ndocker ps -a\ndocker start lab2-app\ndocker exec lab2-app ls /app\ndocker rm lab2-app\ndocker images lab2-python-app"),
  ...shot("t5a_manage", "Figure 1: Listing, stopping, starting and removing a container"),
  h1("3. Tag and push to a registry"), p("A local registry container (registry:2) was started and the image was tagged and pushed to it."),
  ...code("docker run -d -p 5050:5000 --name lab2-registry registry:2\ndocker tag lab2-python-app:1.0 localhost:5050/lab2-python-app:1.0\ndocker push localhost:5050/lab2-python-app:1.0\ncurl localhost:5050/v2/_catalog"),
  ...shot("t5b_registry", "Figure 2: Image tagged and pushed; registry catalog lists it"),
  h1("4. Docker Compose"), p("A web service (Flask) and a redis service were started together with one command. The visit counter is stored in redis."),
  ...code(rd("compose-app/docker-compose.yml") + "\n\ndocker compose up -d --build\ndocker compose ps\ndocker compose down"),
  ...shot("t5c_compose", "Figure 3: Compose app running (visit counter 1 -> 2) and torn down"),
  h1("5. Conclusion"), p("Container lifecycle commands, tagging/pushing to a registry and a two-service Compose application all worked as expected."))]);
// ---- 6
docs.push([`Task6_Docker_Storage_${ID}.docx`, "Task 6: Docker Storage", S(
  h1("1. Objective"), p("Show that container-layer data is lost when a container is deleted, and that a named volume and a bind mount keep data permanently."),
  h1("2. Data loss without a volume"), p("The app was called 3 times (counter = 3). After deleting the container and starting a new one, the counter restarted at 1."),
  ...code("docker run -d --name lab2-novol -p 5101:5000 lab2-python-app:1.0\ncurl localhost:5101/   (x3)\ndocker rm -f lab2-novol\ndocker run -d --name lab2-novol -p 5101:5000 lab2-python-app:1.0\ncurl localhost:5101/"),
  ...shot("t6a_no_volume", "Figure 1: Counter resets to 1 after container deletion"),
  h1("3. Named volume and bind mount"), p("With a named volume the counter continued (1, 2, then 3 in a new container). With a bind mount, counter.txt appears in the host folder storage-demo/bind-data."),
  ...code("docker volume create lab2-vol\ndocker run -d -v lab2-vol:/data -p 5102:5000 lab2-python-app:1.0\ndocker run -d -v \"$PWD/storage-demo/bind-data:/data\" -p 5103:5000 lab2-python-app:1.0"),
  ...shot("t6b_volume_bind", "Figure 2: Named volume persists data; bind mount writes to the host folder"),
  h1("4. Conclusion"), p("Data in the container layer is lost with the container, while named volumes and bind mounts keep data outside the container's lifecycle."))]);
// ---- 7
docs.push([`Task7_Docker_Network_${ID}.docx`, "Task 7: Docker Network", S(
  h1("1. Objective"), p("Show communication between two containers over a Docker network using the container name and the container IP address."),
  h1("2. Create network and containers"), ...code("docker network create lab2-net\ndocker run -d --name lab2-net-app --network lab2-net lab2-python-app:1.0\ndocker run -d --name lab2-net-client --network lab2-net curlimages/curl sleep 3600"),
  ...shot("t7a_network_setup", "Figure 1: Network created and both containers running"),
  h1("3. Communication by name and by IP"), p("A user-defined network has built-in DNS, so the client reached the app by name. The app's IP (172.20.0.2) also worked."),
  ...code("docker exec lab2-net-client curl -s http://lab2-net-app:5000/health\ndocker exec lab2-net-client curl -s http://172.20.0.2:5000/health\ndocker network inspect lab2-net"),
  ...shot("t7b_network_comm", "Figure 2: Requests by container name and by IP both succeed"),
  h1("4. Conclusion"), p("Containers on the same custom bridge network communicate using either container names (Docker DNS) or IP addresses."))]);
// ---- 8
docs.push([`Task8_Continuous_Deployment_${ID}.docx`, "Task 8: Configure continuous deployment", S(
  h1("1. Objective"), p("Automate deployment to Kubernetes by integrating the build with a CI/CD pipeline that applies the manifests."),
  h1("2. Pipeline definition"), p("The Jenkinsfile has 5 stages: build image, load to Minikube, apply manifests, deploy new image, verify rollout. cicd.ps1 runs the same stages from the command line."),
  ...code(rd("Jenkinsfile")), ...shot("t8a_pipeline", "Figure 1: Jenkinsfile and the equivalent cicd.ps1 script"),
  h1("3. Pipeline run"), ...code("powershell -File cicd.ps1 -Build 3"),
  ...shot("t8b_cicd_run", "Figure 2: Pipeline run; deployment now runs image lab2-python-app:3"),
  h1("4. Note"), p("The stages were executed with cicd.ps1 on the local machine. The Jenkinsfile contains the identical commands, so a Jenkins job pointed at this folder would perform the same deployment on every build."),
  h1("5. Conclusion"), p("A single pipeline run builds the image, applies the Kubernetes manifests and rolls out the new version automatically."))]);
// ---- 9 records
docs.push([`Task9_All_Tools_Documentation_${ID}.docx`, "Task 9: Record all tools documents", S(
  h1("1. Overview"), p("Dockerfiles, Kubernetes manifests, commands, screenshots and observations for every experiment in this lab."),
  h1("2. Dockerfile (app)"), ...code(rd("app/Dockerfile")),
  h1("3. Docker Compose file"), ...code(rd("compose-app/docker-compose.yml")),
  h1("4. Kubernetes manifests"), h2("deployment.yaml"), ...code(rd("k8s/deployment.yaml")), h2("service.yaml"), ...code(rd("k8s/service.yaml")),
  h1("5. Pipeline files"), h2("Jenkinsfile"), ...code(rd("Jenkinsfile")),
  h1("6. Commands used"),
  h2("Docker"), ...code("docker build -t lab2-python-app:1.0 app\ndocker run -d --name lab2-app -p 5000:5000 lab2-python-app:1.0\ndocker ps / stop / start / rm\ndocker history lab2-python-app:1.0\ndocker tag / docker push localhost:5050/lab2-python-app:1.0\ndocker compose up -d --build / ps / down\ndocker volume create lab2-vol\ndocker run -v lab2-vol:/data ...\ndocker network create lab2-net\ndocker exec lab2-net-client curl http://lab2-net-app:5000/"),
  h2("Kubernetes"), ...code("minikube start --driver=docker\nminikube image load lab2-python-app:1.0\nkubectl apply -f k8s/\nkubectl get pods -o wide\nkubectl set image deployment/lab2-app web=lab2-python-app:2.0\nkubectl rollout status / history / undo deployment/lab2-app\nkubectl scale deployment/lab2-app --replicas=5\npowershell -File cicd.ps1 -Build 3"),
  h1("7. Screenshots and observations"),
  h2("Docker image build and run (Task 4)"), ...shot("t4b_run", "Container running and image layers"), p("Observation: each Dockerfile instruction is one layer; the container serves / and /health."),
  h2("Container management and Compose (Task 5)"), ...shot("t5a_manage", "Container lifecycle"), ...shot("t5c_compose", "Compose with redis"), p("Observation: Compose starts both services together; the redis counter increases per request."),
  h2("Storage (Task 6)"), ...shot("t6a_no_volume", "Data loss without volume"), ...shot("t6b_volume_bind", "Volume and bind mount"), p("Observation: only volumes and bind mounts keep data after the container is removed."),
  h2("Network (Task 7)"), ...shot("t7b_network_comm", "Name and IP communication"), p("Observation: custom bridge networks provide DNS by container name."),
  h2("Kubernetes (Tasks 1 and 2)"), ...shot("t1c_verify", "Pods and service"), ...shot("t2a_rolling", "Rolling update"), ...shot("t2b_rollback", "Rollback"), ...shot("t2c_scaling", "Scaling"), p("Observation: rolling update, rollback and scaling all completed successfully."),
  h2("Continuous deployment (Task 8)"), ...shot("t8b_cicd_run", "Pipeline run"), p("Observation: one pipeline run builds, applies manifests and rolls out the new image."))]);

(async () => { fs.mkdirSync(OUT, { recursive: true }); for (const d of docs) await build(...d); })();
