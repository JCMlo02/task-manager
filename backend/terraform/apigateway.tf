resource "aws_api_gateway_rest_api" "task_manager_api" {
  name        = "task-manager-api"
  description = "API for managing tasks and projects"
}

resource "aws_api_gateway_resource" "projects" {
  rest_api_id = aws_api_gateway_rest_api.task_manager_api.id
  parent_id   = aws_api_gateway_rest_api.task_manager_api.root_resource_id
  path_part   = "projects"
}

resource "aws_api_gateway_resource" "tasks" {
  rest_api_id = aws_api_gateway_rest_api.task_manager_api.id
  parent_id   = aws_api_gateway_rest_api.task_manager_api.root_resource_id
  path_part   = "tasks"
}

# Define the ANY method for /projects
resource "aws_api_gateway_method" "any_method_projects" {
  rest_api_id   = aws_api_gateway_rest_api.task_manager_api.id
  resource_id   = aws_api_gateway_resource.projects.id
  http_method   = "ANY"
  authorization = "NONE"  # You can replace "NONE" with Cognito or another auth method

  # This method will trigger the AWS Lambda function
}

# Define the ANY method for /tasks
resource "aws_api_gateway_method" "any_method_tasks" {
  rest_api_id   = aws_api_gateway_rest_api.task_manager_api.id
  resource_id   = aws_api_gateway_resource.tasks.id
  http_method   = "ANY"
  authorization = "NONE"
}

# Define the integration between the method and Lambda for /projects
resource "aws_api_gateway_integration" "lambda_integration_projects" {
  rest_api_id             = aws_api_gateway_rest_api.task_manager_api.id
  resource_id             = aws_api_gateway_resource.projects.id
  http_method             = aws_api_gateway_method.any_method_projects.http_method
  integration_http_method = "POST"  # This is always POST for AWS Proxy integration
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.task_manager_lambda.invoke_arn
}

# Define the integration between the method and Lambda for /tasks
resource "aws_api_gateway_integration" "lambda_integration_tasks" {
  rest_api_id             = aws_api_gateway_rest_api.task_manager_api.id
  resource_id             = aws_api_gateway_resource.tasks.id
  http_method             = aws_api_gateway_method.any_method_tasks.http_method
  integration_http_method = "POST"  # This is always POST for AWS Proxy integration
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.task_manager_lambda.invoke_arn
}

# Deploy the API Gateway to a stage
resource "aws_api_gateway_deployment" "task_manager_api_deployment" {
  rest_api_id = aws_api_gateway_rest_api.task_manager_api.id
  stage_name  = "dev"

  depends_on = [
    aws_api_gateway_integration.lambda_integration_projects,
    aws_api_gateway_integration.lambda_integration_tasks
  ]
}
