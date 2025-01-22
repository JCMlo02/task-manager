resource "aws_dynamodb_table" "projects" {
  name           = "Projects"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "project_id"
  range_key      = "user_id"
  attribute {
    name = "project_id"
    type = "S"
  }
  attribute {
    name = "user_id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "tasks" {
  name           = "Tasks"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "task_id"
  range_key      = "project_id"
  attribute {
    name = "task_id"
    type = "S"
  }
  attribute {
    name = "project_id"
    type = "S"
  }
  attribute {
    name = "user_id"
    type = "S"
  }

  global_secondary_index {
    name               = "user_id-index"
    hash_key           = "user_id"  # GSI partition key
    range_key          = "project_id"  # Optional if you want to sort by project_id
    projection_type    = "ALL"  # This will include all attributes in the GSI
  }
}
