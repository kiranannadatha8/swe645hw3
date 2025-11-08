# SWE 645 Student Survey Platform

Full-stack web application that captures and manages student campus visit surveys. The project uses a React (Vite) frontend, FastAPI backend with SQLModel + MySQL persistence, and is containerised for deployment on Kubernetes with a Jenkins-powered CI/CD pipeline.

## Tech Stack

- **Frontend:** React 18 with Vite, modern CSS, REST client abstraction
- **Backend:** FastAPI, SQLModel/SQLAlchemy, Pydantic Settings
- **Database:** MySQL-compatible (Amazon RDS ready)
- **Infrastructure:** Docker, Docker Compose, Kubernetes (Rancher), Jenkins pipeline

## Project Structure

```
backend/     FastAPI application, database models, Dockerfile
frontend/    React application, components, Dockerfile
k8s/         Kubernetes manifests (namespace, deployments, ingress)
Jenkinsfile  CI/CD pipeline definition
docker-compose.yml  Local container orchestration
```

## Local Development

### Backend (FastAPI)

1. Create and activate a virtual environment:
   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and update `DATABASE_URL`.  
   For local development you can leave SQLite as the default or point to MySQL/RDS.
4. Run the API server:
   ```bash
   uvicorn app.main:app --reload
   ```
5. API documentation is available at `http://localhost:8000/docs`.

### Frontend (React + Vite)

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Create a `.env` file if you need to override the backend API endpoint:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

## Docker & Docker Compose

Build and run the full stack locally:

```bash
docker compose up --build
```

Services:

- `frontend` served on `http://localhost:4173`
- `backend` served on `http://localhost:8000`
- `mysql` exposed on port `3306` with sample credentials (see `docker-compose.yml`)

> ⚠️ Update database credentials before exposing the stack beyond local development.  
> Set `CORS_ORIGINS` as a JSON array (e.g. `["http://localhost:4173","http://localhost:5173"]`) when overriding the backend environment variable so both the Vite dev server and the containerized frontend are allowed.

## Amazon RDS / MySQL Configuration

- Provision a MySQL instance (e.g., Amazon RDS) in development/sandbox mode.
- Create a database (default: `student_survey`) and user with least-privilege access.
- Update the backend `DATABASE_URL` to point at your RDS endpoint, for example:  
  `mysql+pymysql://survey_user:survey_pass@<rds-endpoint>:3306/student_survey`.
- Ensure the RDS security group allows access from your application nodes, Jenkins agents, and Kubernetes cluster.

## Kubernetes Deployment (Rancher)

1. Build and push Docker images for the frontend and backend (see Jenkins section).
2. Replace the placeholder image references in `k8s/backend-deployment.yaml` and `k8s/frontend-deployment.yaml` with your registry paths.
3. Create the namespace and config maps:
   ```bash
   kubectl apply -f k8s/namespace.yaml
   kubectl apply -f k8s/backend-configmap.yaml
   kubectl apply -f k8s/frontend-configmap.yaml
   ```
4. Create the backend secret with your production `DATABASE_URL` (or discrete DB_* keys):
   ```bash
   kubectl create secret generic survey-backend-secrets \
     --from-literal=DATABASE_URL='mysql+pymysql://user:pass@rds-endpoint:3306/student_survey' \
     -n student-survey
   ```
5. Deploy workloads and ingress:
   ```bash
   kubectl apply -f k8s/backend-deployment.yaml
   kubectl apply -f k8s/frontend-deployment.yaml
   kubectl apply -f k8s/ingress.yaml
   ```
6. Update `k8s/ingress.yaml` hostnames to match your DNS and configure TLS through Rancher/Ingress controller as needed.

`frontend/public/runtime-config.js` defines the default API endpoint/timeouts used by the
React app. In Kubernetes the file is overridden via `survey-frontend-config` so each
environment can supply its own backend URL without rebuilding the image.

## Jenkins CI/CD Pipeline

- Jenkins pipeline is defined in `Jenkinsfile` and expects:
  - Docker registry credentials stored as `docker-registry-creds`
  - Rancher cluster kubeconfig credentials as `rancher-kubeconfig`
  - Environment variable `VITE_API_BASE_URL` pointing to the public API gateway
- Pipeline stages:
  1. **Checkout** source from SCM.
  2. **Backend Dependencies & Tests** using a virtual environment (`pytest` placeholder included).
  3. **Frontend Build** via `npm ci` and Vite production bundle.
  4. **Docker Build & Push** for backend and frontend images.
  5. **Deploy to Kubernetes** applying manifests and rolling out new images.

> Adapt credentials, registry URLs, and k8s manifests to match your infrastructure (ECR, EKS, Rancher projects, etc.).

## Postman & API Testing

- Use Postman (or curl) to interact with the backend endpoints hosted at `/api/surveys`.
- Sample operations:
  - `POST /api/surveys` to submit a survey
  - `GET /api/surveys` to fetch all surveys
  - `PUT /api/surveys/{id}` to update
  - `DELETE /api/surveys/{id}` to remove

## Contributors

Add your team members' names and emails here for homework submission tracking.
