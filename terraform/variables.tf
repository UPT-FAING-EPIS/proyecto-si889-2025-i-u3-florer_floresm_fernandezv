variable "aws_region" {
  default = "us-east-2"
}

variable "project_name" {
  default = "datadicgen"
}

variable "common_tags" {
  type = map(string)
  default = {
    Project     = "DataDicGen"
    Environment = "production"
    ManagedBy   = "Terraform"
    Creator     = "Mario"
  }
}

variable "eb_solution_stack" {
  default = "64bit Amazon Linux 2023 v3.1.3 running .NET 8"
}
