resource "aws_elastic_beanstalk_application" "main" {
  name        = "${var.project_name}-backend"
  description = "DataDicGen Backend API"
  tags        = var.common_tags
}

resource "aws_elastic_beanstalk_environment" "main" {
  name                = "${var.project_name}-backend-env"
  application         = aws_elastic_beanstalk_application.main.name
  solution_stack_name = var.eb_solution_stack

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = "t3.micro"
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.eb_instance.name
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "ASPNETCORE_ENVIRONMENT"
    value     = "Production"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "ASPNETCORE_URLS"
    value     = "http://0.0.0.0:5000"
  }

  tags = var.common_tags
}
