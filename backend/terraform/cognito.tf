resource "aws_cognito_user_pool" "user_pool" {
  name = "task-manager-user-pool"

  password_policy {
    minimum_length    = 8
    require_uppercase = true
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
  }

  mfa_configuration = "OFF"
}

resource "aws_cognito_user_pool_client" "user_pool_client" {
  name            = "task-manager-client"
  user_pool_id    = aws_cognito_user_pool.user_pool.id
  generate_secret = false
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.user_pool.id
}

output "cognito_app_client_id" {
  value = aws_cognito_user_pool_client.user_pool_client.id
}