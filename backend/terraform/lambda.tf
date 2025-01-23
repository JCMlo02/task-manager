resource "aws_lambda_function" "task_manager_lambda" {
  function_name = "task-manager-lambda"

  package_type = "Image"
  
  # This will change whenever the image_uri changes (new ECR image)
  image_uri    = "${aws_ecr_repository.lambda_repo.repository_url}:latest"

  environment {
    variables = {
      PROJECT_TABLE = aws_dynamodb_table.projects.name
      TASK_TABLE    = aws_dynamodb_table.tasks.name
      COGNITO_USER_POOLID = aws_cognito_user_pool.user_pool.id
      COGNITO_CLIENT_ID = aws_cognito_user_pool_client.user_pool_client.id
    }
  }

  role = aws_iam_role.lambda_role.arn

  timeout = 60  # Set timeout to 1 minute
}

resource "aws_lambda_permission" "allow_api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  principal     = "*"
  function_name = aws_lambda_function.task_manager_lambda.function_name
  source_arn    = "${aws_api_gateway_rest_api.task_manager_api.execution_arn}/*"
  depends_on = [aws_lambda_function.task_manager_lambda]
}

resource "aws_iam_role" "lambda_role" {
  name = "task-manager-lambda-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy" "lambda_policy" {
  name        = "task-manager-lambda-policy"
  description = "Policy for Lambda to interact with DynamoDB"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = ["dynamodb:PutItem", "dynamodb:Query", "dynamodb:UpdateItem", "dynamodb:DeleteItem"]
        Effect   = "Allow"
        Resource = [
          aws_dynamodb_table.projects.arn,
          aws_dynamodb_table.tasks.arn
        ]
      }
    ]
  })
}

resource "aws_iam_policy_attachment" "lambda_policy_attachment" {
  name       = "lambda-policy-attachment"
  policy_arn = aws_iam_policy.lambda_policy.arn
  roles      = [aws_iam_role.lambda_role.name]
}