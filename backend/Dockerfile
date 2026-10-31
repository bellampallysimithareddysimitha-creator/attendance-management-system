# ==============================================================
# MULTI-STAGE DOCKERFILE FOR BACKEND (SPRING BOOT 3.x / JAVA 21)
# ==============================================================

# Stage 1: Build environment
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /build

# Cache Maven dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build application artifact
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal Distroless / JRE Runtime environment
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create unprivileged system user for zero-trust security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser:appgroup

# Copy compiled jar from build stage
COPY --from=builder /build/target/attendance-backend-*.jar app.jar

# Expose HTTP port
EXPOSE 8080

# Environment defaults
ENV SPRING_PROFILES_ACTIVE=default \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
