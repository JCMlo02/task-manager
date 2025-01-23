data "aws_caller_identity" "current" {}

resource "aws_iam_role_policy" "lambda_cognito_policy" {
  name = "lambda_cognito_policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:ListUsers"
        ]
        Resource = "arn:aws:cognito-idp:${var.aws_region}:${data.aws_caller_identity.current.account_id}:userpool/${aws_cognito_user_pool.user_pool.id}"
      }
    ]
  })
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}