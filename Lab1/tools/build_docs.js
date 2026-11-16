const fs = require("fs"), path = require("path");
const NM = "C:/Users/yatha/OneDrive/Desktop/devops_sem_7/Old_Lab1_2/lab2-docker/node_modules/docx";
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType,
  ShadingType, ImageRun, BorderStyle, AlignmentType } = require(NM);
const ROOT = path.resolve(__dirname, ".."), SHOTS = path.join(ROOT, "shots"), OUT = path.join(ROOT, "docs");
const WHO = "Yatharth Chopra  |  Repository: github.com/yatharthchopra2424/devops-lab1  |  Jenkins 2.568.2 on AWS EC2 (Ubuntu)";

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
  let W = 600, H = Math.round(h * W / w); if (H > 800) { H = 800; W = Math.round(w * H / h); }
  return [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
      children: [new ImageRun({ type: "png", data: buf, transformation: { width: W, height: H } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 },
      children: [new TextRun({ text: caption, italics: true, size: 18, color: "555555", font: "Calibri" })] })];
}
function build(file, title, kids) {
  const doc = new Document({ sections: [{ children: [
    new Paragraph({ text: "Lab 1: DevOps Foundations & Continuous Integration", heading: HeadingLevel.TITLE, spacing: { after: 60 } }),
    new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 28, font: "Calibri" })], spacing: { after: 60 } }),
    new Paragraph({ children: [new TextRun({ text: WHO, size: 18, color: "555555", font: "Calibri" })], spacing: { after: 200 } }),
    ...kids] }] });
  return Packer.toBuffer(doc).then(b => { fs.writeFileSync(path.join(OUT, file), b); console.log("wrote", file); });
}
const S = (...a) => a.flat();
const JF = fs.readFileSync(path.join(ROOT, "work", "Jenkinsfile"), "utf8").replace(/\r\n/g, "\n").trimEnd();
const LOG = `0f33ebc Add declarative Jenkinsfile with build, test and deploy stages
b89da58 Update README to trigger automated Jenkins build
28064bf Update README to trigger automated Jenkins build
7192aac Add README to trigger automated build
639e54a Merge feature/uppercase into main
40c3e68 Add shout function
38b6e8c Add farewell function
7143355 Add farewell function
1f560df Initial commit: app and unit test`;

const docs = [];
// ---- 1: record all commands
docs.push(["Task1_Record_All_Commands.docx", "Task 1: Record all commands, configurations, screenshots and observations", S(
  h1("1. Install and configure Git and Jenkins"),
  ...code("sudo apt update && sudo apt install -y git\ngit --version\ngit config --global user.name \"Yatharth Chopra\"\ngit config --global user.email \"yc9891966@gmail.com\"\ngit config --global init.defaultBranch main\ngit config --global --list\n\nsudo apt install -y fontconfig openjdk-21-jre\n(add Jenkins apt repo + key)  sudo apt install -y jenkins\nsudo systemctl enable --now jenkins\nsudo systemctl status jenkins --no-pager"),
  ...shot("git_config", "Git 2.53.0 installed and global config verified"), ...shot("jenkins_running", "jenkins.service active (running) on port 8080"),
  p("Observation: the Jenkins repository signing key had been rotated, so the 2026 key was needed; the old key gave a NO_PUBKEY error."),
  h1("2. Version control with Git"),
  ...code("mkdir ~/devops-lab1 && cd ~/devops-lab1 && git init\ngit add . && git commit -m \"Initial commit: app and unit test\"\ngit checkout -b feature/farewell\ngit add app.py && git commit -m \"Add farewell function\"\ngit checkout main && git merge feature/farewell\ngit checkout -b feature/uppercase\ngit add app.py && git commit -m \"Add shout function\"\ngit checkout main && git merge --no-ff feature/uppercase -m \"Merge feature/uppercase into main\"\ngit log --oneline --graph --all --decorate\ngit remote add origin https://github.com/yatharthchopra2424/devops-lab1.git\ngit push -u origin main && git push origin feature/farewell feature/uppercase"),
  ...shot("git_graph", "Branch created and merged with --no-ff; commit graph"), ...shot("git_push", "Repository pushed to GitHub"),
  p("Observation: the first merge was a fast-forward because main had not moved; --no-ff was used to record an explicit merge commit."),
  h2("Commit history (from GitHub)"), ...code(LOG),
  h1("3. Jenkins Freestyle job (pull from GitHub, poll for changes)"),
  ...code("Repository URL   : https://github.com/yatharthchopra2424/devops-lab1.git\nBranch Specifier : */main\nBuild Trigger    : Poll SCM  H/5 * * * *\nBuild step       : Execute shell\n   python3 --version\n   python3 app.py\n   python3 -m unittest test_app.py -v"),
  ...shot("scm_config", "Source Code Management set to the GitHub repository"), ...shot("poll_scm", "Poll SCM trigger every 5 minutes"), ...shot("build1", "Build #1 successful"),
  p("Observation: Jenkins marked its built-in node offline because /tmp had under 1 GiB free; java.io.tmpdir was moved to /var/lib/jenkins/tmp to fix it."),
  h1("4. Jenkinsfile pipeline configuration"), ...code(JF),
  ...shot("pipeline_scm", "Pipeline script from SCM"), ...shot("pipeline_run", "Pipeline build #1 succeeded (9.3 s) from the Jenkinsfile in GitHub"),
  p("Observation: with Pipeline script from SCM, Jenkins reads the Jenkinsfile from GitHub on each run, so the pipeline is versioned with the code."))]);

// ---- 2: CI/CD workflow report
docs.push(["Task2_CICD_Workflow_Report.docx", "Task 2: CI/CD workflow report", S(
  h1("1. Introduction"), p("This report describes the CI/CD workflow built in Lab 1: source code is kept in Git on GitHub, and Jenkins builds, tests and deploys it automatically."),
  h1("2. Pipeline architecture"),
  ...code("Developer -> git commit / push -> GitHub (devops-lab1, branch main)\n                                        |\n                       Jenkins polls every 5 min (Poll SCM)\n                                        v\n                 Jenkins on AWS EC2: Build -> Test -> Deploy\n                                        |\n                              success / failure message"),
  ...bl(["Source control: Git, branches feature/farewell and feature/uppercase merged into main.", "Server: Jenkins 2.568.2 on Ubuntu (AWS EC2), Java 21.", "Application: small Python app (app.py) with a unit test (test_app.py).", "Jobs: devops-lab1-freestyle (poll + shell build) and devops-lab1-pipeline (Jenkinsfile from SCM)."]),
  ...shot("github_repo", "GitHub repository with branches and commit history"),
  h1("3. Pipeline stages"),
  ...bl(["Build: print Python version and compile app.py (py_compile) to catch syntax errors.", "Test: run unittest in verbose mode; a failure stops the pipeline before deploy.", "Deploy: copy app.py to /tmp/deploy and run it from there.", "Post: print a success or failure message."]),
  ...code(JF), ...shot("pipeline_run", "Pipeline build #1 succeeded (9.3 s)"),
  h1("4. Automation results"),
  ...bl(["Manual build #1 of the Freestyle job cloned revision 7192aac and passed in 4.5 s.", "A README commit pushed to GitHub (b89da58) made Jenkins start a build automatically through Poll SCM.", "The Jenkinsfile pipeline checked out revision 0f33ebc and finished successfully in 9.3 s."]),
  ...shot("build1", "Freestyle build #1"), ...shot("auto_trigger", "Commit pushed; Jenkins starts the next build on its own"),
  h1("5. Observations"),
  ...bl(["Polling (every 5 minutes) is simple and needs no inbound webhook, but builds start with a delay of up to 5 minutes.", "Keeping the Jenkinsfile in the repository versions the pipeline together with the code.", "Disk/tmp space on the Jenkins node matters: a small /tmp took the built-in node offline until java.io.tmpdir was changed."]),
  h1("6. Conclusion"), p("Every push to main can now be built, tested and deployed by Jenkins without manual steps."))]);

// ---- 3: automate deployment
docs.push(["Task3_Automate_Deployment_Jenkins.docx", "Task 3: Automate application deployment using Jenkins", S(
  h1("1. Objective"), p("Automate deployment with Jenkins using a build trigger, post-build actions and deployment steps."),
  h1("2. Build trigger"), p("The Freestyle job uses Poll SCM with the schedule H/5 * * * *. Jenkins checks GitHub every five minutes and starts a build when it finds a new commit."),
  ...shot("poll_scm", "Poll SCM trigger enabled"),
  h1("3. Automated build from a commit"), p("A change was pushed to GitHub with no action in Jenkins; Jenkins detected it and started the build."),
  ...code("echo \"Automated build triggered via Jenkins SCM polling.\" >> README.md\ngit add README.md\ngit commit -m \"Update README to trigger automated Jenkins build\"\ngit push"),
  ...shot("auto_trigger", "Push to GitHub followed by an automatic Jenkins build"),
  h1("4. Deployment steps"), p("The Deploy stage of the Jenkinsfile copies the tested app to the deployment directory and runs it there. Deploy runs only if Build and Test succeeded."),
  ...code("stage('Deploy') {\n    steps {\n        echo 'Deploying application...'\n        sh 'mkdir -p /tmp/deploy && cp app.py /tmp/deploy/'\n        sh 'python3 /tmp/deploy/app.py'\n        echo 'Deployed successfully'\n    }\n}"),
  h1("5. Post-build actions"), p("A post block in the Jenkinsfile reports the result after every run: a message on success and a message on failure."),
  ...code("post {\n    success { echo 'Pipeline completed successfully' }\n    failure { echo 'Pipeline failed' }\n}"),
  ...shot("pipeline_run", "Pipeline build #1 succeeded (9.3 s) using the Jenkinsfile with Build, Test, Deploy and post stages"),
  h1("6. Result"), p("A push to GitHub triggers an automatic Jenkins build, and the pipeline then builds, tests, deploys and reports the result without manual steps."))]);

(async () => { for (const d of docs) await build(...d); })();
