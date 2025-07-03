output "frontend_url" {
  value = aws_s3_bucket_website_configuration.frontend.website_endpoint
}
output "backend_env_url" {
  value = aws_elastic_beanstalk_environment.main.endpoint_url
}
