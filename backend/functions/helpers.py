import json
import boto3
from uuid import uuid4
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
project_table = dynamodb.Table('Projects')
task_table = dynamodb.Table('Tasks')

# ------------------------- Task CRUD Functions --------------------------

def create_task(event, user_id):
    try:
        body = json.loads(event['body'])
        task_id = str(uuid4())  # Generate unique task ID
        project_id = body['project_id']  # Ensure project_id is provided in the request body
        
        # Insert the task item into the DynamoDB table
        task_table.put_item(
            Item={
                'task_id': task_id,
                'project_id': project_id,
                'user_id': user_id,
                'name': body['name'],
                'description': body['description'],
                'status': body.get('status', 'To Do'),
                'due_date': body.get('due_date', None),
            }
        )

        return {
            'statusCode': 200,
            'body': json.dumps({'task_id': task_id}),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            },
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error creating task: {e.response['Error']['Message']}"),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            },
        }

def get_tasks(event, user_id):
    try:
        # Extract the project_id from query string parameters
        project_id = event.get('queryStringParameters', {}).get('project_id', None)
        
        if not project_id:
            return {
                'statusCode': 400,
                'body': json.dumps('Missing project_id query parameter'),
                'headers': {
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': '*'
                },
            }

        response = task_table.query(
            IndexName='user_id-index',
            KeyConditionExpression=Key('user_id').eq(user_id) & Key('project_id').eq(project_id)
        )

        return {
            'statusCode': 200,
            'body': json.dumps(response['Items']),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            },
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error retrieving tasks: {e.response['Error']['Message']}"),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            },
        }

def update_task(event, user_id):
    try:
        body = json.loads(event['body'])
        task_id = event['pathParameters']['task_id']  # Extract task_id from path parameters
        project_id = body['project_id']
        
        # Check if the task exists
        response = task_table.get_item(
            Key={'task_id': task_id, 'project_id': project_id}
        )
        
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'body': json.dumps('Task not found'),
                'headers': {
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': '*'
                },
            }

        task_table.update_item(
            Key={'task_id': task_id, 'project_id': project_id},
            UpdateExpression="SET #name = :name, description = :desc, status = :status, due_date = :due_date",
            ExpressionAttributeNames={
                "#name": "name",
            },
            ExpressionAttributeValues={
                ":name": body['name'],
                ":desc": body['description'],
                ":status": body['status'],
                ":due_date": body.get('due_date', None),
            },
        )

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Task updated successfully'}),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            },
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error updating task: {e.response['Error']['Message']}"),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            },
        }

def delete_task(event, user_id):
    try:
        task_id = event['pathParameters']['task_id']
        project_id = event['pathParameters']['project_id']
        
        # Check if the task exists
        response = task_table.get_item(
            Key={'task_id': task_id, 'project_id': project_id}
        )
        
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'body': json.dumps('Task not found'),
                'headers': {
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': '*'
                },
            }

        task_table.delete_item(
            Key={'task_id': task_id, 'project_id': project_id}
        )

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Task deleted successfully'}),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            },
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error deleting task: {e.response['Error']['Message']}"),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            },
        }

# ------------------------- Project CRUD Functions --------------------------

def create_project(event, user_id):
    try:
        body = json.loads(event['body'])
        project_id = str(uuid4())  # Generate unique project ID
        project_table.put_item(
            Item={
                'project_id': project_id,
                'user_id': user_id,
                'name': body['name'],
                'description': body['description'],
            }
        )

        return {
            'statusCode': 200,
            'body': json.dumps({'project_id': project_id}),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            },
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error creating project: {e.response['Error']['Message']}"),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            },
        }

def get_projects(user_id):
    try:
        response = project_table.query(
            KeyConditionExpression=Key('user_id').eq(user_id)
        )

        return {
            'statusCode': 200,
            'body': json.dumps(response['Items']),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            },
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error retrieving projects: {e.response['Error']['Message']}"),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            },
        }

def update_project(event, user_id):
    try:
        body = json.loads(event['body'])
        project_id = event['pathParameters']['project_id']
        project_table.update_item(
            Key={'project_id': project_id, 'user_id': user_id},
            UpdateExpression="SET #name = :name, description = :desc",
            ExpressionAttributeNames={"#name": "name"},
            ExpressionAttributeValues={":name": body['name'], ":desc": body['description']},
        )
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Project updated successfully'}),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            },
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error updating project: {e.response['Error']['Message']}"),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            },
        }

def delete_project(event, user_id):
    try:
        project_id = event['pathParameters']['project_id']
        project_table.delete_item(
            Key={'project_id': project_id, 'user_id': user_id}
        )
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Project deleted successfully'}),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            },
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error deleting project: {e.response['Error']['Message']}"),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            },
        }
