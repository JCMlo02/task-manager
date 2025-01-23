import json
import boto3
from uuid import uuid4
from datetime import datetime
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key
import os  # Add this import

# Constants
TASK_STATUSES = {
    'BACKLOG': 'Backlog',
    'IN_PROGRESS': 'In Progress',
    'IN_TESTING': 'In Testing',
    'DONE': 'Done'
}

# CORS Headers
CORS_HEADERS = {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*'
}

# DynamoDB setup
dynamodb = boto3.resource('dynamodb')
project_table = dynamodb.Table('Projects')
task_table = dynamodb.Table('Tasks')
project_members_table = dynamodb.Table('ProjectMembers')

# Cognito setup
cognito = boto3.client('cognito-idp')
USER_POOL_ID = os.environ.get('COGNITO_USER_POOLID')  # Update this line

# ------------------------- Task CRUD Functions --------------------------

def create_task(event, user_id):
    try:
        body = json.loads(event['body'])
        task_id = str(uuid4())  # Generate unique task ID
        project_id = body['project_id']  # Ensure project_id is provided in the request body
        
        # Validate status
        status = body.get('status', TASK_STATUSES['BACKLOG'])
        if status not in TASK_STATUSES.values():
            status = TASK_STATUSES['BACKLOG']
        
        current_time = datetime.now().isoformat()
        
        task_item = {
            'task_id': task_id,
            'project_id': project_id,
            'user_id': user_id,
            'name': body['name'],
            'description': body['description'],
            'status': status,
            'due_date': body.get('due_date'),
            'created_at': current_time,
            'updated_at': current_time
        }
        
        task_table.put_item(Item=task_item)
        return {
            'statusCode': 200,
            'body': json.dumps({'task': task_item}),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            }
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(str(e)),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            }
        }

def get_tasks(event, user_id):
    try:
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

        # Using the GSI correctly with user_id and project_id
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
        task_id = event['queryStringParameters'].get('task_id')
        project_id = body['project_id']
        
        # Add assigned_to field in update logic
        if 'assigned_to' in body:
            # Verify user is member of project
            member = project_members_table.get_item(
                Key={
                    'project_id': body['project_id'],
                    'user_id': body['assigned_to']
                }
            ).get('Item')
            
            if not member:
                return {
                    'statusCode': 400,
                    'body': json.dumps('Cannot assign task to non-project member'),
                    'headers': {
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': '*'
                    }
                }

        # Validate status if provided
        if 'status' in body:
            if body['status'] not in TASK_STATUSES.values():
                return {
                    'statusCode': 400,
                    'body': json.dumps('Invalid status value'),
                    'headers': {
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': '*'
                    }
                }

        update_expr = []
        expr_values = {':updated_at': datetime.now().isoformat()}
        expr_names = {'#updated_at': 'updated_at'}

        for key, value in body.items():
            if key not in ['task_id', 'project_id', 'user_id']:
                update_expr.append(f'#{key} = :{key}')
                expr_values[f':{key}'] = value
                expr_names[f'#{key}'] = key

        update_expression = "SET " + ", ".join(update_expr) + ", #updated_at = :updated_at"

        # Using correct key structure for Tasks table
        response = task_table.update_item(
            Key={
                'task_id': task_id,  # Hash key
                'project_id': project_id  # Range key
            },
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expr_names,
            ExpressionAttributeValues=expr_values,
            ReturnValues='ALL_NEW'
        )

        return {
            'statusCode': 200,
            'body': json.dumps(response['Attributes']),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            }
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(str(e)),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            }
        }

def delete_task(event, user_id):
    try:
        task_id = event['queryStringParameters'].get('task_id')
        project_id = event['queryStringParameters'].get('project_id')
        
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

        # Using correct key structure for Tasks table
        task_table.delete_item(
            Key={
                'task_id': task_id,  # Hash key
                'project_id': project_id  # Range key
            }
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
        # Using the primary key correctly (user_id is now the hash key)
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
            }
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error retrieving projects: {e.response['Error']['Message']}"),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            }
        }

def update_project(event, user_id):
    try:
        body = json.loads(event['body'])
        project_id = event['queryStringParameters'].get('project_id')
        
        # Using correct key structure for Projects table
        project_table.update_item(
            Key={
                'user_id': user_id,  # Hash key
                'project_id': project_id  # Range key
            },
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
            }
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error updating project: {e.response['Error']['Message']}"),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            }
        }

def delete_project(event, user_id):
    try:
        project_id = event['queryStringParameters'].get('project_id')
        # Using correct key structure for Projects table
        project_table.delete_item(
            Key={
                'user_id': user_id,  # Hash key
                'project_id': project_id  # Range key
            }
        )
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Project deleted successfully'}),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            }
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error deleting project: {e.response['Error']['Message']}"),
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': '*'
            }
        }

def invite_user(event, user_id):
    try:
        body = json.loads(event['body'])
        project_id = body['project_id']
        invitee_id = body['invitee_id']
        
        # Check if user is project owner
        project = project_table.get_item(
            Key={'user_id': user_id, 'project_id': project_id}
        ).get('Item')
        
        if not project:
            return {
                'statusCode': 403,
                'body': json.dumps('Not authorized to invite to this project'),
                'headers': CORS_HEADERS
            }
        
        # Add member to project
        project_members_table.put_item(
            Item={
                'project_id': project_id,
                'user_id': invitee_id,
                'status': 'PENDING',
                'invited_by': user_id,
                'invited_at': datetime.now().isoformat()
            }
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Invitation sent successfully'}),
            'headers': CORS_HEADERS
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(str(e)),
            'headers': CORS_HEADERS
        }

def get_project_invites(user_id):
    try:
        # Query invitations by user_id
        response = project_members_table.query(
            IndexName='user-projects-index',
            KeyConditionExpression=Key('user_id').eq(user_id),
            FilterExpression='#status = :status',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':status': 'PENDING'}
        )
        
        # Get project details for each invitation
        invites = []
        for item in response['Items']:
            project = project_table.get_item(
                Key={
                    'project_id': item['project_id'],
                    'user_id': item['invited_by']
                }
            ).get('Item', {})
            
            invites.append({
                **item,
                'project_name': project.get('name', 'Unknown Project'),
                'project_description': project.get('description', '')
            })
        
        return {
            'statusCode': 200,
            'body': json.dumps(invites),
            'headers': CORS_HEADERS
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(str(e)),
            'headers': CORS_HEADERS
        }

def update_invite_status(event, user_id):
    try:
        body = json.loads(event['body'])
        project_id = body['project_id']
        status = body['status']  # 'ACCEPTED' or 'REJECTED'
        
        if status not in ['ACCEPTED', 'REJECTED']:
            return {
                'statusCode': 400,
                'body': json.dumps('Invalid status'),
                'headers': CORS_HEADERS
            }
        
        # Update invitation status
        project_members_table.update_item(
            Key={
                'project_id': project_id,
                'user_id': user_id
            },
            UpdateExpression='SET #status = :status, accepted_at = :time',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':status': status,
                ':time': datetime.now().isoformat()
            }
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': f'Invitation {status.lower()}'}),
            'headers': CORS_HEADERS
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(str(e)),
            'headers': CORS_HEADERS
        }

def search_users(event, user_id):
    try:
        query = event.get('queryStringParameters', {}).get('query', '')
        
        response = cognito.list_users(
            UserPoolId=USER_POOL_ID,
            Filter=f'username ^= "{query}"',  # Starts with query
            Limit=10
        )
        
        # Format user data
        users = []
        for user in response.get('Users', []):
            if user.get('Username') != user_id:  # Don't include the requesting user
                user_data = {
                    'user_id': user['Username'],
                    'username': user['Username'],
                    'email': next((attr['Value'] for attr in user['Attributes'] 
                                 if attr['Name'] == 'email'), None)
                }
                users.append(user_data)
        
        return {
            'statusCode': 200,
            'body': json.dumps(users),
            'headers': CORS_HEADERS
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(str(e)),
            'headers': CORS_HEADERS
        }
