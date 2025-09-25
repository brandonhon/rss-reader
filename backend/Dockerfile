# PocketBase backend container
FROM alpine:latest

# Set working directory
WORKDIR /pb

# Install required packages
RUN apk add --no-cache \
    ca-certificates \
    unzip \
    wget \
    python3 \
    py3-pip \
    py3-requests \
    py3-feedparser

# Set PocketBase version
ENV PB_VERSION=0.30.0

# Download and install PocketBase
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
    && unzip pocketbase_${PB_VERSION}_linux_amd64.zip \
    && rm pocketbase_${PB_VERSION}_linux_amd64.zip \
    && chmod +x pocketbase

# Copy setup scripts
COPY pb_hooks ./pb_hooks/
COPY setup-collections.py ./
COPY feed-fetch.py ./
COPY entrypoint.sh ./

# Make entrypoint executable
RUN chmod +x entrypoint.sh

# Create data directory
RUN mkdir -p pb_data

# Expose PocketBase port
EXPOSE 8090

# Set entrypoint
ENTRYPOINT ["./entrypoint.sh"]