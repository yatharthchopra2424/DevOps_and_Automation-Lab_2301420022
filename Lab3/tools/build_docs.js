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
    new Paragraph({ text: "Lab 3: Monitoring, Logging & DevSecOps", heading: HeadingLevel.TITLE, spacing: { after: 60 } }),
    new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 28, font: "Calibri" })], spacing: { after: 200 } }),
    ...kids] }] });
  return Packer.toBuffer(doc).then(b => { fs.writeFileSync(path.join(OUT, file), b); console.log("wrote", file); });
}
const S = (...a) => a.flat();

const docs = [];

// ---- 1: Ansible
docs.push([`Task1_Ansible_Infrastructure_Automation_${ID}.docx`, "Task 1: Configure Infrastructure and Automate Application", S(
  h1("1. Objective"), p("Automate the deployment of a containerized web application using Ansible playbooks."),
  h1("2. Playbook and Inventory Setup"), p("Ansible was installed using pip. A local inventory file and a playbook were created to build the Docker image, run the container, and check application health."),
  ...code("# ansible/inventory\n[local]\nlocalhost ansible_connection=local\n\n# Command to run\nansible-playbook -i ansible/inventory ansible/playbook.yml"),
  ...shot("t1_ansible", "Figure 1: Ansible version and deployment playbook execution"),
  h1("3. Tasks Configured"),
  ...bl([
    "Create app working directory",
    "Copy application source code (Flask app and Dockerfile)",
    "Build the Docker container image",
    "Stop any old container instance",
    "Start the new container on port 5000",
    "Verify endpoint health using HTTP request"
  ]),
  h1("4. Conclusion"), p("The Ansible playbook ran successfully and automated the setup, container build, and deployment with zero manual steps."))]);

// ---- 2: Terraform
docs.push([`Task2_Terraform_IaC_${ID}.docx`, "Task 2: Provision Scalable Infrastructure", S(
  h1("1. Objective"), p("Define and provision scalable infrastructure using Terraform Infrastructure as Code (IaC)."),
  h1("2. Configuration"), p("Terraform configuration files were written to manage application instances and export deployment configuration files."),
  ...code("terraform init\nterraform plan\nterraform apply -auto-approve"),
  ...shot("t2_terraform", "Figure 1: Terraform main.tf and variables configuration"),
  h1("3. Key Components"),
  ...bl([
    "variables.tf: Defines instance count, environment name, and application port.",
    "main.tf: Provisions instances and generates deployment configuration files.",
    "outputs.tf: Displays the deployed application URL and active instance count."
  ]),
  h1("4. Conclusion"), p("Terraform successfully initialized and planned the infrastructure. Changing the instance_count variable allows instant horizontal scaling."))]);

// ---- 3: ELK Logging
docs.push([`Task3_ELK_Centralized_Logging_${ID}.docx`, "Task 3: Implement Centralized Logging", S(
  h1("1. Objective"), p("Set up a centralized logging stack using Elasticsearch, Logstash, and Kibana (ELK) with Docker Compose."),
  h1("2. Deployment"), p("Docker Compose was used to start Elasticsearch 7.17.15, Logstash, and Kibana on a shared bridge network. Elasticsearch runs in single-node mode."),
  ...code("docker compose -f elk/docker-compose.yml up -d\ndocker compose -f elk/docker-compose.yml ps\ncurl http://localhost:9200"),
  ...shot("t3_elk", "Figure 1: ELK stack containers running and Elasticsearch responding"),
  h1("3. Verification"),
  ...bl([
    "Elasticsearch is active on port 9200 (verified with HTTP GET).",
    "Logstash is configured to receive and parse JSON logs on port 5000.",
    "Kibana is accessible on port 5601 for log visualization."
  ]),
  h1("4. Conclusion"), p("Centralized logging is running. Application logs are shipped to Logstash, indexed in Elasticsearch, and viewable in Kibana."))]);

// ---- 4: DevSecOps
docs.push([`Task4_DevSecOps_CICD_Security_${ID}.docx`, "Task 4: Integrate Security into the CI/CD Pipeline", S(
  h1("1. Objective"), p("Integrate automated security vulnerability scanning into the CI/CD pipeline using Trivy."),
  h1("2. Container Security Scan"), p("Aqua Security Trivy was run against the container image to detect CVEs and security issues before deployment."),
  ...code("docker run --rm aquasec/trivy:latest --version\ndocker run --rm aquasec/trivy:latest image --severity HIGH,CRITICAL alpine:latest"),
  ...shot("t4_devsecops", "Figure 1: Trivy vulnerability scanning results"),
  h1("3. Pipeline Integration"),
  ...bl([
    "Security scan stage added to the pipeline before pushing image to production.",
    "Scans operating system packages and language dependencies.",
    "Build fails automatically if Critical vulnerabilities are detected."
  ]),
  h1("4. Conclusion"), p("Security scanning was integrated into the build process, ensuring container images are audited for vulnerabilities automatically."))]);

// ---- 5: Prometheus Monitoring
docs.push([`Task5_Prometheus_Grafana_Monitoring_${ID}.docx`, "Task 5: Set Up Monitoring Using Prometheus", S(
  h1("1. Objective"), p("Deploy Prometheus and Grafana to collect and visualize application and system metrics."),
  h1("2. Setup and Execution"), p("Prometheus and Grafana were launched via Docker Compose. Prometheus scrapes the /metrics endpoint every 10 seconds."),
  ...code("docker compose -f prometheus/docker-compose.yml up -d\ncurl http://localhost:9090/-/healthy\ncurl -I http://localhost:3000/login"),
  ...shot("t5_prometheus", "Figure 1: Prometheus and Grafana running and healthy"),
  h1("3. Monitoring Architecture"),
  ...bl([
    "Prometheus collects time-series metrics from target services on port 9090.",
    "Grafana connects to Prometheus as a data source on port 3000.",
    "Dashboard provides real-time visualization of request rates and server status."
  ]),
  h1("4. Conclusion"), p("Prometheus server is healthy and actively gathering metrics. Grafana dashboard provides real-time monitoring of application performance."))]);

// ---- 6: Feature Flags & Testing
docs.push([`Task6_Feature_Flags_Testing_${ID}.docx`, "Task 6: Implement Feature Flags and Perform Testing", S(
  h1("1. Objective"), p("Implement a feature flag module in Python and verify behavior through automated unit tests."),
  h1("2. Implementation and Tests"), p("A FeatureFlags class was created to toggle features at runtime. A unit test suite with 17 tests was executed to verify all operations."),
  ...code("python feature-flags/test_flags.py"),
  ...shot("t6_flags", "Figure 1: Feature flag unit tests passed (17/17 OK)"),
  h1("3. Verified Operations"),
  ...bl([
    "Flag initialization and default state checks.",
    "Enabling, disabling, and toggling feature flags.",
    "Testing flag overrides and fallback behaviors.",
    "All 17 unit test cases passed with zero errors."
  ]),
  h1("4. Conclusion"), p("Feature flags enable safe feature rollouts without redeploying code. All automated tests passed successfully."))]);

// ---- 7: Lab 3 Report
docs.push([`Task7_Monitoring_Logging_DevSecOps_Report_${ID}.docx`, "Task 7: Monitoring, Logging, and DevSecOps Report", S(
  h1("1. Introduction"), p("This report summarizes the implementation of infrastructure automation, centralized logging, DevSecOps security, monitoring, and feature flagging."),
  h1("2. Architecture Summary"),
  ...code("Code -> Jenkins Pipeline (with Trivy Scan) -> Docker Image\n                 |\n                 v\n      Application Deployment (Ansible / Terraform)\n                 |\n        +--------+--------+\n        |                 |\n     Metrics             Logs\n        |                 |\n        v                 v\n    Prometheus         Logstash\n        |                 |\n        v                 v\n     Grafana        Elasticsearch -> Kibana"),
  h1("3. Infrastructure Automation (Ansible & Terraform)"),
  p("Ansible playbooks automated the application setup and Docker lifecycle. Terraform managed scalable configuration state."),
  ...shot("t1_ansible", "Figure 1: Ansible deployment automation"),
  ...shot("t2_terraform", "Figure 2: Terraform infrastructure definition"),
  h1("4. Observability (ELK & Prometheus)"),
  p("ELK stack collected structured logs while Prometheus and Grafana handled real-time time-series metrics."),
  ...shot("t3_elk", "Figure 3: Centralized ELK logging"),
  ...shot("t5_prometheus", "Figure 4: Prometheus and Grafana monitoring"),
  h1("5. DevSecOps & Testing"),
  p("Trivy audited container images for vulnerabilities, and feature flags were verified with automated unit tests."),
  ...shot("t4_devsecops", "Figure 5: Trivy security scan"),
  ...shot("t6_flags", "Figure 6: Feature flag test results"),
  h1("6. Observations and Conclusion"),
  ...bl([
    "Ansible and Terraform work together cleanly: Terraform provisions, Ansible configures.",
    "Centralized logging in ELK makes troubleshooting fast and searchable.",
    "Prometheus health endpoints confirm system availability in real time.",
    "Automated Trivy scanning prevents insecure images from reaching production.",
    "Feature flags allow gradual rollouts and instant rollbacks."
  ]),
  p("All requirements for Lab 3 were implemented, tested, and documented successfully."))]);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const d of docs) await build(...d);
  console.log("All Lab 3 documents updated with simplified text!");
})();
