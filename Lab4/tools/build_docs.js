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
    new Paragraph({ text: "Lab 4: Advanced Deployment Strategies & Enterprise DevOps", heading: HeadingLevel.TITLE, spacing: { after: 60 } }),
    new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 28, font: "Calibri" })], spacing: { after: 200 } }),
    ...kids] }] });
  return Packer.toBuffer(doc).then(b => { fs.writeFileSync(path.join(OUT, file), b); console.log("wrote", file); });
}
const S = (...a) => a.flat();

const docs = [];

// ---- 1: Disaster Recovery
docs.push([`Task1_Disaster_Recovery_Mechanism_${ID}.docx`, "Task 1: Design and Demonstrate a Disaster Recovery Mechanism", S(
  h1("1. Objective"), p("Demonstrate backup, restore, and failover procedures using Docker volumes to protect application state."),
  h1("2. Steps and Execution"), p("An application container was started with a mounted data volume. Requests were sent to create application state (counter = 2). A backup was taken into a compressed tar archive. The primary container and volume were deleted to simulate disaster. The data was restored to a new failover container, and the counter resumed at 3."),
  ...code("# 1. Run primary container with volume\ndocker volume create lab4-dr-vol\ndocker run -d --name lab4-dr-app -v lab4-dr-vol:/data -p 5200:5000 lab4-app:1.0\n\n# 2. Make requests to generate state\ncurl http://localhost:5200/  # counter = 1\ncurl http://localhost:5200/  # counter = 2\n\n# 3. Take backup snapshot using Alpine helper\ndocker run --rm -v lab4-dr-vol:/data -v ${PWD}/disaster-recovery:/backup alpine tar czf /backup/backup_snapshot.tar.gz -C /data .\n\n# 4. Simulate disaster (delete container and volume)\ndocker rm -f lab4-dr-app\ndocker volume rm lab4-dr-vol\n\n# 5. Restore data into failover volume and start standby container\ndocker volume create lab4-dr-vol-restored\ndocker run --rm -v lab4-dr-vol-restored:/data -v ${PWD}/disaster-recovery:/backup alpine tar xzf /backup/backup_snapshot.tar.gz -C /data\ndocker run -d --name lab4-dr-failover -v lab4-dr-vol-restored:/data -p 5201:5000 lab4-app:1.0\ncurl http://localhost:5201/  # counter = 3"),
  ...shot("t1_dr", "Figure 1: State creation, volume backup, disaster simulation, and successful restore"),
  h1("3. Observations"),
  ...bl([
    "Volume data was safely exported to backup_snapshot.tar.gz.",
    "Even though the primary container and original volume were destroyed, zero data was lost.",
    "The failover container read the restored state and incremented the counter to 3 seamlessly."
  ]),
  h1("4. Conclusion"), p("The disaster recovery process successfully restored state after complete data loss within seconds."))]);

// ---- 2: CI/CD Automated Testing
docs.push([`Task2_Automated_Testing_CICD_Pipeline_${ID}.docx`, "Task 2: Implement Automated Testing within a CI/CD Pipeline", S(
  h1("1. Objective"), p("Implement automated testing in the CI/CD pipeline so tests must pass before deployment proceeds."),
  h1("2. Test Implementation"), p("A pytest test suite was written in test_app.py to test the home endpoint, status codes, JSON response keys, and the /health endpoint."),
  ...code(rd("ci-testing/test_app.py")),
  h1("3. Execution"), p("The tests were executed as part of the automated pipeline stage:"),
  ...code("python -m pytest test_app.py -v"),
  ...shot("t2_testing", "Figure 1: All 5 automated unit and integration tests passing"),
  h1("4. Observations"),
  ...bl([
    "5 out of 5 tests passed in 0.08 seconds.",
    "Tests act as a pipeline quality gate; if any test fails, deployment stops immediately."
  ]),
  h1("5. Conclusion"), p("Automated testing is configured and successfully verifies application functionality before deployment."))]);

// ---- 3: Blue-Green Deployment
docs.push([`Task3_Blue_Green_Deployment_Strategy_${ID}.docx`, "Task 3: Implement a Blue-Green Deployment Strategy", S(
  h1("1. Objective"), p("Implement Blue-Green deployment with Nginx to achieve zero-downtime updates between application versions."),
  h1("2. Setup and Execution"), p("Blue (v1.0) and Green (v2.0) containers were started together. Nginx acts as a reverse proxy on port 5300 initially routing to Blue. Updating the upstream configuration and reloading Nginx switches traffic instantly to Green without dropping any requests."),
  ...code("# 1. Start Blue and Green environments\ndocker compose -f blue-green/docker-compose.yml up -d\n\n# 2. Test initial traffic (served by Blue v1.0)\ncurl http://localhost:5300/\n\n# 3. Switch upstream to Green and reload Nginx\nSet-Content -Path blue-green\\conf\\default.conf -Value (Get-Content blue-green\\nginx-green.conf -Raw)\ndocker exec lab4-bg-nginx nginx -s reload\n\n# 4. Test updated traffic (served by Green v2.0)\ncurl http://localhost:5300/"),
  ...shot("t3_bluegreen", "Figure 1: Traffic served by Blue, zero-downtime Nginx reload, and traffic served by Green"),
  h1("3. Advantages and Limitations"),
  ...bl([
    "Advantage: Zero downtime during release because both versions are already running.",
    "Advantage: Instant rollback by switching the Nginx upstream back to Blue.",
    "Limitation: Requires double the container/server resources during deployment."
  ]),
  h1("4. Conclusion"), p("Blue-Green deployment was demonstrated successfully with instantaneous cutover and zero downtime."))]);

// ---- 4: GitOps Delivery
docs.push([`Task4_GitOps_Based_Delivery_${ID}.docx`, "Task 4: Implement GitOps-Based Delivery", S(
  h1("1. Objective"), p("Demonstrate GitOps delivery where declarative YAML manifests define the desired state, and an automated reconciler converges live infrastructure to match."),
  h1("2. Desired State and Reconciler"), p("desired-state.yml defines the required containers and ports. deploy.py compares running Docker containers with the manifest and applies changes automatically."),
  ...code("# desired-state.yml\nservices:\n  - name: lab4-gitops-app\n    image: lab4-app:1.0\n    port: 5500\n  - name: lab4-gitops-sidecar\n    image: nginx:alpine\n    port: 5501\n\n# Run reconciliation loop\npython gitops/deploy.py"),
  ...shot("t4_gitops", "Figure 1: GitOps drift detection, container provisioning, and zero-drift verification"),
  h1("3. Observations"),
  ...bl([
    "First run: Reconciler detected drift (containers missing) and started both containers.",
    "Second run: Reconciler confirmed zero drift ([OK] already running - no action needed).",
    "Application on port 5500 responded correctly to HTTP curl requests."
  ]),
  h1("4. Conclusion"), p("GitOps delivery ensures the live cluster state continuously matches the declarative configuration files."))]);

// ---- 5: Lab 4 Report
docs.push([`Task5_Advanced_Deployment_Strategies_Report_${ID}.docx`, "Task 5: Advanced Deployment Strategies Report", S(
  h1("1. Introduction"), p("This report covers advanced deployment strategies including Blue-Green deployments, Canary releases, GitOps delivery, Secret Management with Vault, and Disaster Recovery."),
  h1("2. Comparison of Deployment Strategies"),
  ...code("Strategy     | Downtime | Rollback Speed | Resource Overhead | Complexity\n-------------+----------+----------------+-------------------+-----------\nRolling      | Zero     | Moderate       | Low (+1 pod)      | Low\nBlue-Green   | Zero     | Instant (<1s)  | High (2x)         | Moderate\nCanary       | Zero     | Fast (<5s)     | Low (+10%)        | Moderate\nGitOps       | Zero     | Git Revert     | Same              | Standard"),
  h1("3. Blue-Green Deployments"),
  p("Blue and Green environments run in parallel. Nginx cuts over traffic instantly when the new version is verified."),
  ...shot("t3_bluegreen", "Figure 1: Blue-Green zero-downtime cutover"),
  h1("4. Canary Deployments"),
  p("Traffic is split with weights (90% to stable, 10% to canary) to test the new release with real users before full rollout."),
  ...shot("t6_canary", "Figure 2: Canary weighted traffic distribution"),
  h1("5. GitOps Delivery"),
  p("A declarative manifest serves as the single source of truth, and an automated loop fixes configuration drift."),
  ...shot("t4_gitops", "Figure 3: GitOps state reconciliation"),
  h1("6. Secret Management (Vault)"),
  p("Sensitive credentials are stored in HashiCorp Vault instead of plaintext files or environment variables."),
  ...shot("t5_vault", "Figure 4: Vault secret storage and retrieval"),
  h1("7. Disaster Recovery"),
  p("Automated volume snapshots allow complete state recovery to a standby container during failures."),
  ...shot("t1_dr", "Figure 5: Disaster recovery backup and restore"),
  h1("8. Conclusion"), p("Modern deployment strategies provide safe, automated, and zero-downtime releases with built-in rollback capabilities."))]);

// ---- 6: Secret Management (Vault)
docs.push([`Task6_Secret_Management_Pipeline_${ID}.docx`, "Task 6: Implement Secret Management for the Pipeline", S(
  h1("1. Objective"), p("Secure sensitive pipeline credentials using HashiCorp Vault instead of hardcoded values."),
  h1("2. Setup and Execution"), p("HashiCorp Vault was started using Docker Compose in development mode. Secrets were written to the Key-Value (KV) engine and verified by reading them back."),
  ...code("# 1. Start Vault\ndocker compose -f vault/docker-compose.yml up -d\n\n# 2. Check Vault status\nvault status\n\n# 3. Store sensitive secrets securely\nvault kv put secret/lab4/app db_password=SuperSecretPassword123 api_key=devops-vault-key-777\n\n# 4. Retrieve stored secrets\nvault kv get secret/lab4/app"),
  ...shot("t5_vault", "Figure 1: Vault status, secret storage, and verified extraction"),
  h1("3. Observations"),
  ...bl([
    "Vault initialized and unsealed successfully on port 8200.",
    "Secrets are encrypted and versioned in the secret/data/lab4/app path.",
    "Pipelines can authenticate and fetch credentials on demand without storing plaintext tokens."
  ]),
  h1("4. Conclusion"), p("HashiCorp Vault provides secure secret storage and safe credential management for pipelines and containers."))]);

// ---- 7: Canary Deployment
docs.push([`Task7_Canary_Deployment_Strategy_${ID}.docx`, "Task 7: Implement a Canary Deployment Strategy", S(
  h1("1. Objective"), p("Deploy a new application version to a subset of users using a Canary deployment strategy with weighted routing."),
  h1("2. Architecture and Setup"), p("Stable (v1.0) and Canary (v2.0) containers were deployed behind Nginx. Nginx was configured with upstream weights: 9 for stable (90%) and 1 for canary (10%)."),
  ...code("upstream app_backend {\n    server lab4-stable:5000 weight=9;  # 90% traffic\n    server lab4-canary:5000 weight=1;  # 10% traffic\n}"),
  h1("3. Testing Traffic Distribution"), p("10 sequential HTTP requests were sent to port 5400 to verify the traffic distribution:"),
  ...code("1..10 | ForEach-Object { curl.exe -s http://localhost:5400/ }"),
  ...shot("t6_canary", "Figure 1: 10 requests routed with 9 going to stable v1.0 and 1 going to canary v2.0"),
  h1("4. Rollback and Promotion Rules"),
  ...bl([
    "If canary shows errors or slow response times, traffic weight is set back to 0 immediately.",
    "If canary performs well, weight is increased gradually (10% -> 25% -> 50% -> 100%)."
  ]),
  h1("5. Conclusion"), p("Canary deployment allows testing new releases on a small percentage of traffic before committing to a full rollout."))]);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const d of docs) await build(...d);
  console.log("All Lab 4 documents updated with simplified text!");
})();
