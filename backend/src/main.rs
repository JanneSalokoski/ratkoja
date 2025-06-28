mod db;
mod routes;

use axum::Router;
use axum::routing::get;
use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::env;
use tracing::{error, info};
use tracing_subscriber;

use routes::users::user_routes;

#[tokio::main]
async fn main() -> Result<(), sqlx::Error> {
    tracing_subscriber::fmt::init();

    std::panic::set_hook(Box::new(|info| {
        let backtrace = std::backtrace::Backtrace::force_capture();
        error!("PANIC: {:?}", info);
        error!("Backtrace:\n{:?}", backtrace);
    }));

    dotenv().ok();
    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await?;

    info!("Connected to database");

    sqlx::migrate!().run(&pool).await?;
    info!("Migrations ran succesfully");

    let app = Router::new()
        .route("/", get(|| async { "hello!" }))
        .nest("/users", user_routes())
        .with_state(pool);

    info!("Starting server...");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
    info!("Server exited!");

    Ok(())
}
