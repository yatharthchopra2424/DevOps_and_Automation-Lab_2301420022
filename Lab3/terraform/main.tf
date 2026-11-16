terraform {
  required_version = ">= 1.0"
  required_providers {
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
    }
  }
}

provider "null" {}
provider "local" {}

# Simulate a "server" using a local null resource
resource "null_resource" "app_server" {
  triggers = {
    app_name    = var.app_name
    app_version = var.app_version
    environment = var.environment
  }

  provisioner "local-exec" {
    command = "echo Provisioning ${var.app_name} v${var.app_version} on ${var.environment} environment"
  }

  provisioner "local-exec" {
    when    = destroy
    command = "echo Destroying server for ${self.triggers.app_name}"
  }
}

# Simulate multiple scaled instances
resource "null_resource" "app_instances" {
  count = var.instance_count

  triggers = {
    instance_id = "instance-${count.index + 1}"
    app_name    = var.app_name
  }

  provisioner "local-exec" {
    command = "echo Started ${var.app_name} instance ${count.index + 1} of ${var.instance_count}"
  }
}

# Write a local deployment config file
resource "local_file" "deployment_config" {
  filename = "${path.module}/deployment.json"
  content = jsonencode({
    app_name    = var.app_name
    version     = var.app_version
    environment = var.environment
    instances   = var.instance_count
    port        = var.app_port
    student_id  = "2301420022"
    deployed_at = timestamp()
  })
}
