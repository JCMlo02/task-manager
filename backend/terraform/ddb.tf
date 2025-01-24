resource "aws_dynamodb_table" "projects" {
  name           = "Projects"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "user_id"    # Changed hash key to user_id
  range_key      = "project_id" # Keep project_id as the sort key

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "project_id"
    type = "S"
  }

  # Add project-id-index for querying projects by project_id
  global_secondary_index {
    name               = "project-id-index"
    hash_key          = "project_id"
    projection_type    = "ALL"
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

  attribute {
    name = "assigned_to"
    type = "S"
  }

  global_secondary_index {
    name               = "assigned-tasks-index"
    hash_key          = "assigned_to"
    range_key         = "project_id"
    projection_type   = "ALL"
  }
}

resource "aws_dynamodb_table" "project_members" {
  name           = "ProjectMembers"
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

  # Remove unused attribute definitions for status and invited_by since they're not used in any index
  # We can still store these attributes in items, we just can't index them

  global_secondary_index {
    name               = "user-projects-index"
    hash_key          = "user_id"
    range_key         = "project_id"
    projection_type    = "ALL"
  }
}
