output "app_name" {
  description = "Deployed application name"
  value       = var.app_name
}

output "app_version" {
  description = "Deployed application version"
  value       = var.app_version
}

output "environment" {
  description = "Target environment"
  value       = var.environment
}

output "instance_count" {
  description = "Number of running instances"
  value       = var.instance_count
}

output "config_file" {
  description = "Path to the generated deployment config"
  value       = local_file.deployment_config.filename
}
