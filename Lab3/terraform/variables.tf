variable "app_name" {
  description = "Name of the application"
  type        = string
  default     = "lab3-flask-app"
}

variable "app_version" {
  description = "Application version tag"
  type        = string
  default     = "1.0"
}

variable "environment" {
  description = "Deployment environment (dev / staging / prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be dev, staging, or prod."
  }
}

variable "instance_count" {
  description = "Number of application instances to provision"
  type        = number
  default     = 2
}

variable "app_port" {
  description = "Port the application listens on"
  type        = number
  default     = 5000
}
