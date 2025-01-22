import json
from functions.helpers import create_project, get_projects, update_project, delete_project, create_task, get_tasks, update_task, delete_task

def lambda_handler(event, context):
    method = event['httpMethod']
    path = event['resource']
    
    # Handle GET requests (userId from query string)
    if method == 'GET':
        user_id = event['queryStringParameters'].get('userId', None)  # Extract userId from query string
        if not user_id:
            return {
                'statusCode': 400,
                'body': json.dumps('Missing userId parameter'),
                'headers': {
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': '*'
                },
            }
    
    # Handle POST, PUT, DELETE requests (userId from body)
    else:
        body = json.loads(event['body'])
        user_id = body.get('userId', None)  # Extract userId from body
        if not user_id:
            return {
                'statusCode': 400,
                'body': json.dumps('Missing userId in request body'),
                'headers': {
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': '*'
                },
            }

    # Handle CRUD for Projects
    if path == '/projects':
        if method == 'POST':
            return create_project(event, user_id)
        elif method == 'GET':
            return get_projects(user_id)
        elif method == 'PUT':
            return update_project(event, user_id)
        elif method == 'DELETE':
            return delete_project(event, user_id)
    
    # Handle CRUD for Tasks
    elif path == '/tasks':
        if method == 'POST':
            return create_task(event, user_id)
        elif method == 'GET':
            return get_tasks(event, user_id)
        elif method == 'PUT':
            return update_task(event, user_id)
        elif method == 'DELETE':
            return delete_task(event, user_id)

    # Invalid request
    return {
        'statusCode': 400,
        'body': json.dumps('Invalid request'),
        'headers': {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': '*'
        },
    }
