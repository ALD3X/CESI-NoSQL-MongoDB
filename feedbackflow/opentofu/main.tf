terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

resource "docker_network" "stack_network" {
  name = "opentofu_network"
}

resource "docker_volume" "mongo_data" {
  name = "mongo_data"
}

# MongoDB image
resource "docker_image" "mongo" {
  name         = "mongo:7"
  keep_locally = false
}

# MongoDB container
resource "docker_container" "mongodb" {
  name  = "mongodb"
  image = docker_image.mongo.name
  restart = "unless-stopped"

  env = [
    "MONGO_INITDB_ROOT_USERNAME=root",
    "MONGO_INITDB_ROOT_PASSWORD=rootpassword",
    "MONGO_INITDB_DATABASE=feedback"
  ]

  ports {
    internal = 27017
    external = 27017
  }

  networks_advanced {
    name = docker_network.stack_network.name
  }

  # volume mongo_data:/data/db
  volumes {
    volume_name    = docker_volume.mongo_data.name
    container_path = "/data/db"
  }

  # ./init-mongo:/docker-entrypoint-initdb.d
  volumes {
    host_path      = "/home/alex/feedbackflow/init-mongo"
    container_path = "/docker-entrypoint-initdb.d"
    read_only      = true
  }
}

# API image
resource "docker_image" "api" {
  name = "api:latest"
  build {
    context = "${path.module}/api"
  }
}

# API container
resource "docker_container" "api" {
  name    = "api"
  image   = docker_image.api.name
  restart = "unless-stopped"

  depends_on = [
    docker_container.mongodb
  ]

  ports {
    internal = 3000
    external = 3000
  }

  networks_advanced {
    name = docker_network.stack_network.name
  }
}

# NGINX
resource "docker_image" "nginx" {
    name = "nginx:alpine"
    keep_locally = false
}


resource "docker_container" "nginx_container" {
    image = docker_image.nginx.name
    name  = "nginx"

    networks_advanced {
        name = docker_network.stack_network.name
    }

    ports {
        internal = 80
        external = 8080
    }

    volumes {
        host_path      = "/home/alex/feedbackflow/nginx/html/"
        # host_path    = "/nginx/html"
        container_path = "/usr/share/nginx/html"
        read_only      = true
    }
}