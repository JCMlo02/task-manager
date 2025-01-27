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
        project_id = body['project_id']
        
        # Create task
        task_id = str(uuid4())
        current_time = datetime.now().isoformat()
        
        # Clean up assigned_to value - ensure it's not an empty string
        assigned_to = body.get('assigned_to')
        if not assigned_to:  # If it's empty string, None, or falsy
            assigned_to = None  # Set to None instead of empty string
        
        task_item = {
            'task_id': task_id,
            'project_id': project_id,
            'user_id': user_id,
            'name': body['name'],
            'description': body['description'],
            'status': body.get('status', TASK_STATUSES['BACKLOG']),
            'created_at': current_time,
            'updated_at': current_time
        }

        # Only add assigned_to if it has a value
        if assigned_to:
            # Verify user is member of project
            member = project_members_table.get_item(
                Key={
                    'project_id': project_id,
                    'user_id': assigned_to
                }
            ).get('Item')
            
            if not member or member['status'] not in ['OWNER', 'ACCEPTED']:
                return {
                    'statusCode': 400,
                    'body': json.dumps('Cannot assign task to non-project member'),
                    'headers': CORS_HEADERS
                }
            task_item['assigned_to'] = assigned_to
            
            # Get assignee details
            assignee_details = get_user_details(assigned_to)
            task_item['assignee_username'] = assignee_details['username']
        
        task_table.put_item(Item=task_item)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'task': task_item
            }),
            'headers': CORS_HEADERS
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(str(e)),
            'headers': CORS_HEADERS
        }

def get_user_details(user_id):
    """Helper function to get user details from Cognito"""
    try:
        # Query for user using sub (user_id)
        response = cognito.list_users(
            UserPoolId=USER_POOL_ID,
            Filter=f'sub = "{user_id}"'
        )
        
        if not response.get('Users'):
            return {'user_id': user_id, 'username': user_id}
            
        user = response['Users'][0]  # Get the first (and should be only) user
        username = user.get('Username')  # This is the actual username
            
        return {
            'user_id': user_id,  # Keep the sub ID as user_id
            'username': username  # Use the actual Cognito username
        }
    except ClientError:
        return {'user_id': user_id, 'username': user_id}

def get_tasks(event, user_id):
    try:
        project_id = event.get('queryStringParameters', {}).get('project_id', None)
        all_projects = event.get('queryStringParameters', {}).get('all_projects', 'false')

        if all_projects.lower() == 'true':
            # Get all projects where user is a member (including ACCEPTED members)
            member_projects = project_members_table.query(
                IndexName='user-projects-index',
                KeyConditionExpression=Key('user_id').eq(user_id),
                FilterExpression='#status IN (:owner, :member)',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={':owner': 'OWNER', ':member': 'ACCEPTED'}
            )

            all_tasks = []
            for member in member_projects['Items']:
                project_id = member['project_id']
                # Get tasks for each project
                project_tasks = task_table.query(
                    IndexName='project-id-index',
                    KeyConditionExpression=Key('project_id').eq(project_id)
                )
                all_tasks.extend(project_tasks.get('Items', []))

        elif project_id:
            # Verify user is a member of the project (OWNER or ACCEPTED)
            member = project_members_table.get_item(
                Key={
                    'project_id': project_id,
                    'user_id': user_id
                }
            ).get('Item')

            if not member or member['status'] not in ['OWNER', 'ACCEPTED']:
                return {
                    'statusCode': 403,
                    'body': json.dumps('Not authorized to view tasks in this project'),
                    'headers': CORS_HEADERS
                }

            # Get ALL tasks for the project, regardless of who created them
            response = task_table.query(
                KeyConditionExpression=Key('project_id').eq(project_id),
                IndexName='project-id-index'
            )
            all_tasks = response.get('Items', [])
        else:
            return {
                'statusCode': 400,
                'body': json.dumps('Missing project_id or all_projects parameter'),
                'headers': CORS_HEADERS
            }

        # Enrich tasks with user details
        for task in all_tasks:
            if task.get('user_id'):  # Creator
                creator_details = get_user_details(task['user_id'])
                task['creator_username'] = creator_details['username']
            if task.get('assigned_to'):  # Assignee
                assignee_details = get_user_details(task['assigned_to'])
                task['assignee_username'] = assignee_details['username']

        return {
            'statusCode': 200,
            'body': json.dumps(all_tasks),
            'headers': CORS_HEADERS
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error retrieving tasks: {e.response['Error']['Message']}"),
            'headers': CORS_HEADERS
        }

def update_task(event, user_id):
    try:
        body = json.loads(event['body'])
        task_id = event['queryStringParameters'].get('task_id')
        project_id = body.get('project_id')
        
        if not task_id or not project_id:
            return {
                'statusCode': 400,
                'body': json.dumps('Missing task_id or project_id'),
                'headers': CORS_HEADERS
            }
        
        # Verify project membership with proper status check
        member = project_members_table.get_item(
            Key={
                'project_id': project_id,
                'user_id': user_id
            }
        ).get('Item')
        
        if not member or member['status'] not in ['OWNER', 'ACCEPTED']:
            return {
                'statusCode': 403,
                'body': json.dumps('Not authorized to update tasks in this project'),
                'headers': CORS_HEADERS
            }

        # Update task
        update_expr = []
        expr_values = {':updated_at': datetime.now().isoformat()}
        expr_names = {'#updated_at': 'updated_at'}

        for key, value in body.items():
            if key not in ['task_id', 'project_id', 'user_id']:
                update_expr.append(f'#{key} = :{key}')
                expr_values[f':{key}'] = value
                expr_names[f'#{key}'] = key

        update_expression = "SET " + ", ".join(update_expr) + ", #updated_at = :updated_at"

        response = task_table.update_item(
            Key={
                'task_id': task_id,
                'project_id': project_id
            },
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expr_names,
            ExpressionAttributeValues=expr_values,
            ReturnValues='ALL_NEW'
        )
        
        updated_task = response['Attributes']
        
        # Add user details to response
        if updated_task.get('assigned_to'):
            assignee_details = get_user_details(updated_task['assigned_to'])
            updated_task['assignee_username'] = assignee_details['username']

        return {
            'statusCode': 200,
            'body': json.dumps(updated_task),
            'headers': CORS_HEADERS
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(str(e)),
            'headers': CORS_HEADERS
        }

def delete_task(event, user_id):
    try:
        task_id = event['queryStringParameters'].get('task_id')
        project_id = event['queryStringParameters'].get('project_id')
        
        if not task_id or not project_id:
            return {
                'statusCode': 400,
                'body': json.dumps('Missing task_id or project_id'),
                'headers': CORS_HEADERS
            }

        # First verify user is project member
        member = project_members_table.get_item(
            Key={
                'project_id': project_id,
                'user_id': user_id
            }
        ).get('Item')
        
        if not member or member['status'] not in ['OWNER', 'ACCEPTED']:
            return {
                'statusCode': 403,
                'body': json.dumps('Not authorized to delete tasks in this project'),
                'headers': CORS_HEADERS
            }

        # Check if the task exists
        task = task_table.get_item(
            Key={
                'task_id': task_id,
                'project_id': project_id
            }
        ).get('Item')
        
        if not task:
            return {
                'statusCode': 404,
                'body': json.dumps('Task not found'),
                'headers': CORS_HEADERS
            }

        # Delete the task
        task_table.delete_item(
            Key={
                'task_id': task_id,
                'project_id': project_id
            }
        )

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Task deleted successfully'}),
            'headers': CORS_HEADERS
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error deleting task: {e.response['Error']['Message']}"),
            'headers': CORS_HEADERS
        }

# ------------------------- Project CRUD Functions --------------------------

def create_project(event, user_id):
    try:
        body = json.loads(event['body'])
        project_id = str(uuid4())

        # Create project
        project_table.put_item(
            Item={
                'project_id': project_id,
                'user_id': user_id,
                'name': body['name'],
                'description': body['description'],
            }
        )

        # Add creator as a project member with OWNER status
        project_members_table.put_item(
            Item={
                'project_id': project_id,
                'user_id': user_id,
                'status': 'OWNER',
                'joined_at': datetime.now().isoformat()
            }
        )

        return {
            'statusCode': 200,
            'body': json.dumps({'project_id': project_id}),
            'headers': CORS_HEADERS
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error creating project: {e.response['Error']['Message']}"),
            'headers': CORS_HEADERS
        }

# 1. Fix get_projects function to handle GSI errors
def get_projects(user_id):
    try:
        # Get all projects where user is a member
        member_projects = project_members_table.query(
            IndexName='user-projects-index',
            KeyConditionExpression=Key('user_id').eq(user_id),
            FilterExpression='#status IN (:owner, :member)',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':owner': 'OWNER', ':member': 'ACCEPTED'}
        )

        projects = []
        for member in member_projects['Items']:
            project_id = member['project_id']
            
            # Get project details
            owner_response = project_table.query(
                IndexName='project-id-index',
                KeyConditionExpression=Key('project_id').eq(project_id),
                Limit=1
            )
            
            if owner_response['Items']:
                project = owner_response['Items'][0]
                # Get all members for this project
                members_response = project_members_table.query(
                    KeyConditionExpression=Key('project_id').eq(project_id),
                    FilterExpression='#status IN (:owner, :member)',
                    ExpressionAttributeNames={'#status': 'status'},
                    ExpressionAttributeValues={':owner': 'OWNER', ':member': 'ACCEPTED'}
                )

                # Enrich member information with Cognito details
                members = []
                for member_item in members_response['Items']:
                    member_details = get_user_details(member_item['user_id'])
                    members.append({
                        'user_id': member_item['user_id'],
                        'username': member_details['username'],
                        'status': member_item['status']
                    })

                # Add member information to project
                project['members'] = members
                project['role'] = member['status']
                
                # Add owner details
                owner_details = get_user_details(project['user_id'])
                project['owner_username'] = owner_details['username']
                
                projects.append(project)

        return {
            'statusCode': 200,
            'body': json.dumps(projects),
            'headers': CORS_HEADERS
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error retrieving projects: {e.response['Error']['Message']}"),
            'headers': CORS_HEADERS
        }

def update_project(event, user_id):
    try:
        body = json.loads(event['body'])
        project_id = event['queryStringParameters'].get('project_id')
        
        # First verify user has permission to update project
        member = project_members_table.get_item(
            Key={
                'project_id': project_id,
                'user_id': user_id
            }
        ).get('Item')
        
        if not member or member['status'] not in ['OWNER', 'ACCEPTED']:
            return {
                'statusCode': 403,
                'body': json.dumps('Not authorized to update this project'),
                'headers': CORS_HEADERS
            }

        # Get project to verify it exists and get owner's user_id
        project_response = project_table.query(
            IndexName='project-id-index',
            KeyConditionExpression=Key('project_id').eq(project_id),
            Limit=1
        )
        
        if not project_response['Items']:
            return {
                'statusCode': 404,
                'body': json.dumps('Project not found'),
                'headers': CORS_HEADERS
            }
        
        owner_id = project_response['Items'][0]['user_id']
        
        # Update project using owner's user_id
        project_table.update_item(
            Key={
                'user_id': owner_id,  # Must use owner's user_id due to table structure
                'project_id': project_id
            },
            UpdateExpression="SET #name = :name, description = :desc",
            ExpressionAttributeNames={"#name": "name"},
            ExpressionAttributeValues={
                ":name": body['name'],
                ":desc": body['description']
            }
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Project updated successfully'}),
            'headers': CORS_HEADERS
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(str(e)),
            'headers': CORS_HEADERS
        }

def delete_project(event, user_id):
    try:
        project_id = event['queryStringParameters'].get('project_id')
        
        # First verify user is project owner
        member = project_members_table.get_item(
            Key={
                'project_id': project_id,
                'user_id': user_id
            }
        ).get('Item')
        
        if not member or member['status'] != 'OWNER':
            return {
                'statusCode': 403,
                'body': json.dumps('Only project owner can delete project'),
                'headers': CORS_HEADERS
            }

        # Delete all project members
        members_response = project_members_table.query(
            KeyConditionExpression=Key('project_id').eq(project_id)
        )
        
        for member_item in members_response['Items']:
            project_members_table.delete_item(
                Key={
                    'project_id': project_id,
                    'user_id': member_item['user_id']
                }
            )

        # Delete all tasks in the project
        tasks_response = task_table.query(
            IndexName='project-id-index',
            KeyConditionExpression=Key('project_id').eq(project_id)
        )
        
        for task in tasks_response['Items']:
            task_table.delete_item(
                Key={
                    'task_id': task['task_id'],
                    'project_id': project_id
                }
            )

        # Finally delete the project
        project_table.delete_item(
            Key={
                'project_id': project_id,
                'user_id': user_id
            }
        )

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Project deleted successfully'}),
            'headers': CORS_HEADERS
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error deleting project: {e.response['Error']['Message']}"),
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
        
        invites = []
        for item in response['Items']:
            try:
                # Try to get project details with error handling
                project_response = project_table.get_item(
                    Key={
                        'project_id': item['project_id'],
                        'user_id': item['invited_by']
                    }
                )
                project = project_response.get('Item', {})
                
                # Only add valid invites for existing projects
                if project:
                    # Get inviter details
                    inviter_details = get_user_details(item['invited_by'])
                    
                    invites.append({
                        **item,
                        'project_name': project.get('name', 'Unknown Project'),
                        'project_description': project.get('description', ''),
                        'inviter_username': inviter_details['username']
                    })
            except ClientError:
                continue  # Skip invalid invites
        
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

def invite_user(event, user_id):
    try:
        body = json.loads(event['body'])
        project_id = body['project_id']
        invitee_id = body['invitee_id']
        
        # Check if user is project owner
        member = project_members_table.get_item(
            Key={
                'project_id': project_id,
                'user_id': user_id
            }
        ).get('Item')
        
        if not member or member['status'] != 'OWNER':
            return {
                'statusCode': 403,
                'body': json.dumps('Only project owner can send invitations'),
                'headers': CORS_HEADERS
            }
        
        # Check if user is already a member
        existing_member = project_members_table.get_item(
            Key={
                'project_id': project_id,
                'user_id': invitee_id
            }
        ).get('Item')
        
        if existing_member:
            return {
                'statusCode': 400,
                'body': json.dumps('User is already a member or has a pending invitation'),
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

        # If accepted, ensure user is added to project members (if not already)
        if status == 'ACCEPTED':
            try:
                project_members_table.put_item(
                    Item={
                        'project_id': project_id,
                        'user_id': user_id,
                        'status': 'ACCEPTED',
                        'joined_at': datetime.now().isoformat()
                    },
                    ConditionExpression='attribute_not_exists(project_id) AND attribute_not_exists(user_id)'
                )
            except ClientError as e:
                if e.response['Error']['Code'] != 'ConditionalCheckFailedException':
                    raise e
        
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
        
        # Search by username
        response = cognito.list_users(
            UserPoolId=USER_POOL_ID,
            Filter=f'username ^= "{query}"',  # Search by actual username
            Limit=10
        )
        
        users = []
        for user in response.get('Users', []):
            # Get the sub (user_id) from attributes
            sub = next((attr['Value'] for attr in user.get('Attributes', []) 
                       if attr['Name'] == 'sub'), None)
            
            if sub and sub != user_id:  # Don't include the requesting user
                user_data = {
                    'user_id': sub,  # Use the sub as user_id
                    'username': user.get('Username')  # Use the actual username
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
