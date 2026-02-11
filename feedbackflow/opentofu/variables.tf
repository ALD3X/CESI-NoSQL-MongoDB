variable "api_port" {
  description = "Port on which the Node.js API will run"
  default     = 3000
}

variable "postgres_db" {
  description = "Nom de la base PostgreSQL"
  default     = "demo_db"
}

variable "postgres_user" {
  description = "Utilisateur PostgreSQL"
  default     = "demo_user"
}

variable "postgres_password" {
  description = "Mot de passe PostgreSQL"
  default     = "demo_pass"
}
