import os
import socket
from datetime import datetime, timezone

from flask import Flask, jsonify

app = Flask(__name__)

# Counter file lives in /data so we can demonstrate Docker storage behavior:
# - no volume  -> counter resets whenever the container is removed
# - volume/bind mount -> counter survives container removal
DATA_DIR = os.environ.get("DATA_DIR", "/data")
COUNTER_FILE = os.path.join(DATA_DIR, "counter.txt")


def read_counter():
    try:
        with open(COUNTER_FILE, "r") as f:
            return int(f.read().strip() or 0)
    except FileNotFoundError:
        return 0


def write_counter(value):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(COUNTER_FILE, "w") as f:
        f.write(str(value))


@app.route("/")
def index():
    count = read_counter() + 1
    write_counter(count)
    return jsonify(
        {
            "message": "Hello from the Lab 2 containerized Python app!",
            "hostname": socket.gethostname(),
            "visits_recorded_in_this_container": count,
            "data_dir": DATA_DIR,
            "time_utc": datetime.now(timezone.utc).isoformat(),
        }
    )


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
