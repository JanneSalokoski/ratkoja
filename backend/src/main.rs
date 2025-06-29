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
    println!("Hello!");

    tracing_subscriber::fmt::init();

    std::panic::set_hook(Box::new(|info| {
        let location = info
            .location()
            .map(|l| format!("{}:{}", l.file(), l.line()))
            .unwrap_or_else(|| "<unknown>".into());

        if let Some(s) = info.payload().downcast_ref::<&str>() {
            error!("PANIC at {}: {}", location, s);
        } else if let Some(s) = info.payload().downcast_ref::<String>() {
            error!("PANIC at {}: {}", location, s);
        } else {
            error!("PANIC at {}: Unknown payload type", location);
        }
    }));

    dotenv().ok();
    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("Could not initialize PgPool");

    info!("Connected to database");

    sqlx::migrate!().run(&pool).await?;
    info!("Migrations ran succesfully");

    let app = Router::new()
        .route("/", get(|| async { "hello!" }))
        .nest("/users", user_routes())
        .with_state(pool);

    info!("Starting server...");

    // let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
    //     .await
    //     .expect("Failed to bind to 0.0.0.0:3000");

    match tokio::net::TcpListener::bind("0.0.0.0:3000").await {
        Ok(listener) => {
            info!("Listener bound");
            axum::serve(listener, app)
                .await
                .expect("Failed to start server");
        }
        Err(e) => {
            panic!("Could not bind listener: {:?}", e);
        }
    }

    // axum::serve(listener, app)
    // .await
    // .expect("Failed to start server");

    info!("Server exited!");

    Ok(())
}
