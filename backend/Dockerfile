# Build stage

FROM rust:1-bullseye AS builder
WORKDIR /app

# Cache deps
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo 'fn main() {}' > src/main.rs
RUN cargo build --release
# RUN cargo build
RUN rm -rf src

# Build actual binary
COPY src ./src
COPY migrations ./migrations
RUN cargo build --release
# RUN cargo build

# Runtime stage

FROM debian:bullseye-slim

RUN useradd -m ratkoja
WORKDIR /app

COPY --from=builder /app/target/release/backend .
COPY --from=builder /app/migrations ./migrations

RUN chown -R ratkoja:ratkoja /app
USER ratkoja

ENV RUST_BACKTRACE=1

CMD ["./backend"]
