provider "aws" {
  region = "us-east-1" 
}

terraform {
  backend "s3" {
    bucket         = "task-mngr-bucket-ddb"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    acl            = "private"
  }
}