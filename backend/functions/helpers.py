import json
import boto3
from uuid import uuid4

dynamodb = boto3.resource('dynamodb')
project_table = dynamodb.Table('Projects')
task_table = dynamodb.Table('Tasks')
# ------------------------- Task CRUD Functions --------------------------

def create_task(event, user_id):
    body = json.loads(event['body'])
    task_id = str(uuid4())  # Generate unique task ID
    project_id = body['project_id']  # Ensure project_id is provided in the request body
    
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
        'statusCode': 201,
        'body': json.dumps({'task_id': task_id}),
    }

def get_tasks(event, user_id):
    project_id = event.get('queryStringParameters', {}).get('project_id', None)
    
    if not project_id:
        return {
            'statusCode': 400,
            'body': json.dumps('Missing project_id query parameter')
        }

    response = task_table.query(
        KeyConditionExpression="project_id = :project_id AND user_id = :user_id",
        ExpressionAttributeValues={
            ":project_id": project_id,
            ":user_id": user_id
        }
    )

    return {
        'statusCode': 200,
        'body': json.dumps(response['Items']),
    }

def update_task(event, user_id):
    body = json.loads(event['body'])
    task_id = event['pathParameters']['task_id']  # Extract task_id from path parameters
    project_id = body['project_id']
    
    # Check if the task belongs to the user and project
    response = task_table.get_item(
        Key={'task_id': task_id, 'project_id': project_id}
    )
    
    if 'Item' not in response:
        return {
            'statusCode': 404,
            'body': json.dumps('Task not found')
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
    }

def delete_task(event, user_id):
    task_id = event['pathParameters']['task_id']
    project_id = event['pathParameters']['project_id']
    
    # Check if the task exists
    response = task_table.get_item(
        Key={'task_id': task_id, 'project_id': project_id}
    )
    
    if 'Item' not in response:
        return {
            'statusCode': 404,
            'body': json.dumps('Task not found')
        }

    task_table.delete_item(
        Key={'task_id': task_id, 'project_id': project_id}
    )

    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Task deleted successfully'}),
    }

# ------------------------- Project CRUD Functions --------------------------

def create_project(event, user_id):
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
        'statusCode': 201,
        'body': json.dumps({'project_id': project_id}),
    }

def get_projects(user_id):
    response = project_table.query(
        KeyConditionExpression="user_id = :user_id",
        ExpressionAttributeValues={":user_id": user_id}
    )
    return {
        'statusCode': 200,
        'body': json.dumps(response['Items']),
    }

def update_project(event, user_id):
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
    }

def delete_project(event, user_id):
    project_id = event['pathParameters']['project_id']
    project_table.delete_item(
        Key={'project_id': project_id, 'user_id': user_id}
    )
    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'Project deleted successfully'}),
    }
