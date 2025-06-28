use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Serialize, FromRow)]
pub struct User {
    pub id: i32,
    pub username: String,
    pub email: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Deserialize)]
pub struct CreateUser {
    pub username: String,
    pub email: String,
}
