resource "aws_iam_role" "eb_service" {
  name = "${var.project_name}-eb-service-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "elasticbeanstalk.amazonaws.com" }
    }]
  })
  tags = var.common_tags
}

resource "aws_iam_role_policy_attachment" "eb_service" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkService"
  role       = aws_iam_role.eb_service.name
}

resource "aws_iam_instance_profile" "eb_instance" {
  name = "${var.project_name}-eb-instance-profile"
  role = aws_iam_role.eb_service.name
}
