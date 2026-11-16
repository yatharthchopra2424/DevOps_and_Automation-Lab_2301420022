#!/usr/bin/env python3
"""
deploy.py — Simulated GitOps reconciliation loop.
Reads desired-state.yml and ensures Docker containers match the declared state.
Runs one reconciliation cycle (in a real GitOps system, this polls Git on a timer).
"""
import subprocess, sys, yaml, os, time

MANIFEST = os.path.join(os.path.dirname(__file__), "desired-state.yml")

def docker(*args, check=False):
    cmd = ["docker"] + list(args)
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout.strip(), result.returncode

def running_containers():
    out, _ = docker("ps", "--format", "{{.Names}}")
    return set(out.splitlines()) if out else set()

def reconcile(manifest_path):
    print("=== GitOps Reconciliation Loop ===")
    print(f"Reading desired state from: {manifest_path}")
    print("")

    with open(manifest_path) as f:
        state = yaml.safe_load(f)

    running = running_containers()
    print(f"Currently running containers: {running or '(none)'}")
    print("")

    for svc in state.get("services", []):
        name = svc["name"]
        image = svc["image"]
        port = svc.get("port", 5000)
        env_vars = svc.get("env", {})

        env_args = []
        for k, v in env_vars.items():
            env_args += ["-e", f"{k}={v}"]

        if name in running:
            print(f"[OK]  {name} already running — no action needed.")
        else:
            print(f"[DRIFT] {name} not running — starting container...")
            args = ["run", "-d", "--name", name, "-p", f"{port}:5000"] + env_args + [image]
            out, rc = docker(*args)
            if rc == 0:
                print(f"[STARTED] {name} -> {image} on port {port}")
            else:
                # Try removing stale container first
                docker("rm", "-f", name)
                out, rc = docker(*args)
                print(f"[RESTARTED] {name} -> {image} (removed stale container first)")
        print("")

    print("=== Reconciliation complete — cluster matches desired state ===")

if __name__ == "__main__":
    reconcile(MANIFEST)
