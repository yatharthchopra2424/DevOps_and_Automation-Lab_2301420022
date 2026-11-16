import os
import socket
from datetime import datetime, timezone

from flask import Flask, jsonify
import redis

app = Flask(__name__)

REDIS_HOST = os.environ.get("REDIS_HOST", "redis")
REDIS_PORT = int(os.environ.get("REDIS_PORT", "6379"))
r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True, socket_connect_timeout=2)


@app.route("/")
def index():
    count = r.incr("visits")
    return jsonify(
        {
            "message": "Hello from the Compose multi-container app!",
            "web_hostname": socket.gethostname(),
            "visits_recorded_in_redis": count,
            "redis_host": REDIS_HOST,
            "time_utc": datetime.now(timezone.utc).isoformat(),
        }
    )


@app.route("/health")
def health():
    try:
        r.ping()
        redis_status = "reachable"
    except Exception as exc:
        redis_status = f"unreachable: {exc}"
    return jsonify({"status": "ok", "redis": redis_status})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
