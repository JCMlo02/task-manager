import json
from functions.helpers import create_project, get_projects, update_project, delete_project, create_task, get_tasks, update_task, delete_task

def lambda_handler(event, context):
    method = event['httpMethod']
    path = event['resource']
    body = json.loads(event['body'])
    user_id = body['userId']# Cognito User ID
    
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


    return {
        'statusCode': 400,
        'body': json.dumps('Invalid request')
    }
