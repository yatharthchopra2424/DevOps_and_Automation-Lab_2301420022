import os, socket
from flask import Flask, jsonify

app = Flask(__name__)
VERSION = os.environ.get("APP_VERSION", "1.0")
DATA_DIR = os.environ.get("DATA_DIR", "/data")
COUNTER_FILE = os.path.join(DATA_DIR, "counter.txt")

def read_counter():
    try:
        with open(COUNTER_FILE, "r") as f:
            return int(f.read().strip() or 0)
    except Exception:
        return 0

def write_counter(val):
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(COUNTER_FILE, "w") as f:
            f.write(str(val))
    except Exception:
        pass

@app.route("/")
def index():
    count = read_counter() + 1
    write_counter(count)
    return jsonify({
        "message": "Hello from Lab4 App!",
        "version": VERSION,
        "hostname": socket.gethostname(),
        "stateful_counter": count
    })

@app.route("/health")
def health():
    return jsonify({"status": "healthy", "version": VERSION})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
