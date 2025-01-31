# TikiTask

TikiTask is a modern, full-stack task management application built with React and AWS serverless architecture. It provides a Kanban-style interface for managing tasks, real-time collaboration features, and comprehensive analytics dashboards.

## Features

### Core Features

- **Task Management**
  - Drag-and-drop Kanban board
  - Task assignments and status updates
  - Priority levels and filtering
  - Task templates for common workflows
  - Comments and collaboration

### User Experience

- **Responsive Design**
  - Mobile-optimized interface
  - Dark/Light mode support
  - Smooth animations with Framer Motion
  - Real-time updates

### Project Management

- **Team Collaboration**
  - Project creation and management
  - Team member invitations
  - Role-based access control
  - Activity tracking

### Analytics

- **Project Insights**
  - Task distribution visualization
  - Progress tracking
  - Team performance metrics
  - Activity trends with Chart.js

## Technical Stack

### Frontend

- **Core**

  - React 19.0.0

- **UI Components**

  - Framer Motion 12.0.3
  - TailwindCSS 3.4.17
  - React Beautiful DnD 13.1.1
  - React Icons 5.4.0
  - React Hot Toast 2.5.1

- **State Management**
  - React Hooks
  - Local Storage for caching

### Backend

- **AWS Services**
  - Lambda (Python 3.9)
  - API Gateway
  - DynamoDB
  - Cognito Authentication
  - ECR for container registry

### DevOps

- **Infrastructure as Code**
  - Terraform
  - GitHub Actions for CI/CD

## Development Setup

1. Install dependencies:

```bash
cd frontend
npm install --legacy-peer-deps
```
