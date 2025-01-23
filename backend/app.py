import json
from functions.helpers import (
    create_project, get_projects, update_project, delete_project,
    create_task, get_tasks, update_task, delete_task, TASK_STATUSES,
    invite_user, get_project_invites, update_invite_status, search_users
)

def lambda_handler(event, context):
    # Add CORS headers
    headers = {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*'
    }

    try:
        method = event['httpMethod']
        path = event['resource']
        
        # Handle OPTIONS requests for CORS
        if (method == 'OPTIONS'):
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps('OK')
            }
        
        # Extract user_id consistently
        user_id = None
        if method == 'GET':
            user_id = event.get('queryStringParameters', {}).get('userId')
        else:
            try:
                body = json.loads(event.get('body', '{}'))
                user_id = body.get('userId')
            except json.JSONDecodeError:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps('Invalid JSON in request body')
                }

        if not user_id:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps('Missing userId')
            }

        # Route requests
        if path == '/projects':
            handlers = {
                'POST': lambda e, uid: create_project(e, uid),
                'GET': lambda e, uid: get_projects(uid),
                'PUT': lambda e, uid: update_project(e, uid),
                'DELETE': lambda e, uid: delete_project(e, uid)
            }
        elif path == '/tasks':
            handlers = {
                'POST': lambda e, uid: create_task(e, uid),
                'GET': lambda e, uid: get_tasks(e, uid),
                'PUT': lambda e, uid: update_task(e, uid),
                'DELETE': lambda e, uid: delete_task(e, uid)
            }
        elif path == '/invites':
            handlers = {
                'POST': lambda e, uid: invite_user(e, uid),
                'GET': lambda e, uid: get_project_invites(uid),
                'PUT': lambda e, uid: update_invite_status(e, uid)
            }
        elif path == '/users':
            handlers = {
                'GET': lambda e, uid: search_users(e, uid)
            }
        else:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps('Not Found')
            }

        handler = handlers.get(method)
        if not handler:
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps('Method Not Allowed')
            }

        return handler(event, user_id)

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps(f'Internal Server Error: {str(e)}')
        }
