# TikiTask

## Overview

This project is a full-stack web application designed for project and task management with real-time collaboration features. It provides a Kanban-style interface for managing tasks, analytics dashboards for tracking progress, and role-based access to manage teams effectively. The app is built with modern web technologies, leveraging AWS services for a serverless backend.

## Features

- **Authentication**: Secure user registration, login, and session management via AWS Cognito.
- **Project Management**: Create, edit, and delete projects; invite team members; access control through membership of project
- **Task Management**: Drag-and-drop Kanban board, task assignment, filtering, and status updates.
- **Analytics**: Visualize project progress, task distribution, and activity trends with Chart.js.
- **Collaboration**: Invite team members, share projects, and assign tasks.

## Stack

### Frontend (located in `frontend/` folder)

- **React 19**: For building the user interface.
- **TailwindCSS**: For responsive, utility-first styling.
- **Framer Motion**: For animations.
- **AWS Cognito**: For user authentication.
- **React Router**: For navigation and routing.
- **Chart.js**: For data visualization.
- **React Beautiful DnD**: For drag-and-drop functionality.

### Backend (located in `backend/` folder)

- **Python**: For building the API endpoints.
- **AWS Lambda**: For serverless functions.
- **DynamoDB**: For data storage.
- **API Gateway**: For providing a REST API.
- **Cognito**: For user authentication.
- **Terraform**: For managing infrastructure as code.

## Folder Structure

- `frontend/`: Contains all the code for the React frontend.
- `backend/`: Contains the FastAPI backend and serverless functions.

## Deployment

- **Frontend**: Deployed to AWS S3 with CloudFront for CDN.
- **Backend**: Deployed as AWS Lambda functions with API Gateway for API access.
- **Infrastructure**: Managed with Terraform.
- **CI/CD**: GitHub Actions for continuous integration and deployment.
