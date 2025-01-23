
terraform {
  backend "s3" {
    bucket         = "tikitask-taskmanager"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    acl            = "private"
  }
}

provider "aws" {
  region = var.aws_region
}

# S3 bucket for website hosting
resource "aws_s3_bucket" "tikitask_website" {
  bucket = "tikitask-taskmanager"
}

resource "aws_s3_bucket_website_configuration" "tikitask_website" {
  bucket = aws_s3_bucket.tikitask_website.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "tikitask_website" {
  bucket = aws_s3_bucket.tikitask_website.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "tikitask_website" {
  bucket = aws_s3_bucket.tikitask_website.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.tikitask_website.arn}/*"
      },
    ]
  })
}

# CloudFront distribution
resource "aws_cloudfront_distribution" "tikitask_website" {
  enabled             = true
  default_root_object = "index.html"
  
  origin {
    domain_name = aws_s3_bucket.tikitask_website.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.tikitask_website.bucket

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.tikitask_website.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = aws_s3_bucket.tikitask_website.bucket
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}


resource "aws_cloudfront_origin_access_identity" "tikitask_website" {
  comment = "TikiTask access identity for TikiTask"
}

# Output values
output "website_url" {
  value = aws_cloudfront_distribution.tikitask_website.domain_name
}

output "s3_bucket" {
  value = aws_s3_bucket.tikitask_website.bucket
}
