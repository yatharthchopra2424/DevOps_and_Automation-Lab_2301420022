"""Run commands for real, capture output, render terminal-style PNG.
usage: python tools/shot.py <name> <title> <cmd1> [cmd2 ...]"""
import subprocess, sys, os
from pathlib import Path
sys.path.insert(0, os.path.dirname(__file__))
from make_terminal_shot import render
name, title, cmds = sys.argv[1], sys.argv[2], sys.argv[3:]
env = dict(os.environ)
env["PATH"] = env["PATH"] + r";C:\Program Files\Kubernetes\Minikube"
out = []
for c in cmds:
    out.append("$ " + c)
    r = subprocess.run(["powershell", "-NoProfile", "-Command", c], capture_output=True, text=True,
                       encoding="utf-8", errors="replace", env=env)
    import re; text = re.sub(r"\[[0-9;]*m", "", r.stdout + r.stderr).rstrip()
    if text: out.append(text)
    out.append("")
body = "\n".join(out).rstrip() + "\n"
Path("logs").mkdir(exist_ok=True)
Path(f"logs/{name}.txt").write_text(body, encoding="utf-8")
render(title, body, f"shots/{name}.png")
print(body)
