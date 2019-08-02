resource "aws_security_group" "bulk_delete" {
  name   = "${var.prefix}-bulk-delete"
  vpc_id = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lambda_function" "bulk_delete" {
  depends_on = [aws_iam_role.lambda_processing]

  function_name    = "${var.prefix}-BulkDelete"
  filename         = "${path.module}/../../packages/api/dist/BulkDelete/lambda.zip"
  source_code_hash = filebase64sha256("${path.module}/../../packages/api/dist/BulkDelete/lambda.zip")
  handler          = "index.handler"
  role             = aws_iam_role.lambda_processing.arn
  runtime          = "nodejs8.10"
  memory_size      = 1024
  timeout          = 300
  environment {
    variables = {
      CMR_ENVIRONMENT = var.cmr_environment
      stackName       = var.prefix
    }
  }
  tags = {
    Project = var.prefix
  }
  vpc_config {
    subnet_ids         = var.lambda_subnet_ids
    security_group_ids = [aws_security_group.bulk_delete.id]
  }
}
