# Layer 1: base image
FROM python:3.12-slim

# Layer 2: metadata / working directory
WORKDIR /app

# Layer 3: dependency manifest copied first so pip install is cached
# independently of application code changes
COPY requirements.txt .

# Layer 4: install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Layer 5: copy application source
COPY app.py .

# Layer 6: create data directory used for storage demo
RUN mkdir -p /data

# Metadata: document the port the app listens on
EXPOSE 5000

# Layer 7: default command to run the container
CMD ["python", "app.py"]
