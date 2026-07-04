# Imagem de execução dos desafios em Java (mesmo protocolo das imagens js/python).
FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY lib/gson.jar /opt/gson.jar
COPY Harness.java .
RUN javac -cp /opt/gson.jar Harness.java
RUN useradd -m -u 1001 runner
USER runner
ENTRYPOINT ["java", "-XX:+UseSerialGC", "-XX:+PerfDisableSharedMem", "-Xmx128m", "-cp", "/app:/opt/gson.jar", "Harness"]
