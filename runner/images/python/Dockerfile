FROM python:3.12-alpine
RUN adduser -D -u 1000 runner
WORKDIR /app
COPY harness.py .
USER runner
ENTRYPOINT ["python", "/app/harness.py"]
