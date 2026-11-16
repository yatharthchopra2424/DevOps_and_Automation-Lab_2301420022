import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from pathlib import Path
from make_terminal_shot import render
T = {"t1a_cluster":"Task 1 - Minikube cluster ready","t1b_deploy":"Task 1 - Deployment and Service manifests","t1c_verify":"Task 1 - Verify running pods",
"t2a_rolling":"Task 2 - Rolling update to v2.0","t2b_rollback":"Task 2 - Rollback (v2.0 -> v1.0)","t2c_scaling":"Task 2 - Scaling replicas",
"t4a_build":"Task 4 - Dockerfile and build","t4b_run":"Task 4 - Run container, layers, behavior","t5a_manage":"Task 5 - Manage containers and images",
"t5b_registry":"Task 5 - Tag and push to registry","t5c_compose":"Task 5 - Docker Compose multi-container","t6a_no_volume":"Task 6 - Data loss without a volume",
"t6b_volume_bind":"Task 6 - Named volume and bind mount","t7a_network_setup":"Task 7 - Custom network and two containers",
"t7b_network_comm":"Task 7 - Communication by name and by IP","t8a_pipeline":"Task 8 - Pipeline definition (Jenkinsfile)",
"t8b_cicd_run":"Task 8 - Pipeline run: automated manifest apply and deploy"}
for k,t in T.items():
    render("Windows PowerShell - "+t, Path(f"logs/{k}.txt").read_text(encoding="utf-8"), f"shots/{k}.png")
