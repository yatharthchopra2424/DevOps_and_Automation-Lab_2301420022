"""Simple Flask app for Lab 3 — Monitoring, Logging & DevSecOps"""
import os
import logging
from flask import Flask, jsonify

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)

app = Flask(__name__)

FEATURE_FLAGS = {
    "dark_mode": os.environ.get("FLAG_DARK_MODE", "false").lower() == "true",
    "beta_ui": os.environ.get("FLAG_BETA_UI", "false").lower() == "true",
}


@app.route("/")
def index():
    app.logger.info("GET / called")
    return jsonify({
        "message": "Lab 3 Flask App",
        "student_id": "2301420022",
        "feature_flags": FEATURE_FLAGS,
    })


@app.route("/health")
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/metrics")
def metrics():
    return (
        "# HELP requests_total Total requests\n"
        "# TYPE requests_total counter\n"
        "requests_total 42\n",
        200,
        {"Content-Type": "text/plain"},
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
