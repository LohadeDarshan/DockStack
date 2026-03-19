# DockStack 🚀

DockStack is a **full-stack Kubernetes-deployed project** featuring a **React frontend**, **Node.js + Express backend**, and a **MySQL database**.  
All three components run in **separate containers managed by Kubernetes** and communicate seamlessly.

---

## 🧱 Tech Stack

| Layer     | Technology        | Port  |
|-----------|-------------------|-------|
| Frontend  | React             | 3000  |
| Backend   | Node.js + Express | 5000  |
| Database  | MySQL 8.0         | 3306  |

---

## 📁 Project Structure
```
DockStack/
│
├── frontend/          # React frontend code
├── backend/           # Node.js backend code
├── k8s/               # Kubernetes manifests
│   ├── namespace.yaml
│   ├── mysql-secret.yaml
│   ├── mysql-configmap.yaml
│   ├── mysql-pvc.yaml
│   ├── mysql-deployment.yaml
│   ├── backend-deployment.yaml
│   └── frontend-deployment.yaml
└── README.md
```

---

## ✅ Requirements

- Docker ≥ 20
- Kubernetes (Minikube for local or any cloud cluster)
- kubectl CLI
- Docker Hub account (to push images)

---

## 🐳 Step 1 — Build & Push Docker Images
```bash
# Backend
docker build -t myserverd/dockstack-backend:latest ./backend
docker push myserverd/dockstack-backend:latest

# Frontend
docker build -t myserverd/dockstack-frontend:latest ./frontend
docker push myserverd/dockstack-frontend:latest
```

---

## ☸️ Step 2 — Deploy to Kubernetes
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/mysql-secret.yaml
kubectl apply -f k8s/mysql-configmap.yaml
kubectl apply -f k8s/mysql-pvc.yaml
kubectl apply -f k8s/mysql-deployment.yaml
kubectl apply -f k8s/mysql-service.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
```

---

## 🌐 Step 3 — Access the Application

**Minikube:**
```bash
minikube service frontend-service -n dockstack
```

**Manual:**
| Service      | URL                          |
|--------------|------------------------------|
| Frontend     | http://\<node-ip\>:30000     |
| Backend API  | http://\<node-ip\>:5000/api/users |

---

## 🗄️ Sample Data

The MySQL database is preloaded automatically with a `users` table:

| id | name  |
|----|-------|
| 1  | Alice |
| 2  | Bob   |

---

## 📡 API Endpoints

| Method | Endpoint     | Description      |
|--------|--------------|------------------|
| GET    | /api/users   | Get all users    |

---

## 🔍 Verify Pods are Running
```bash
kubectl get pods -n dockstack
kubectl get svc -n dockstack
```

---

## 🧹 Cleanup
```bash
kubectl delete namespace dockstack
```

This removes all pods, services, and deployments at once.

---

## 📌 Notes

- MySQL data is persisted using a **PersistentVolumeClaim**
- Backend waits for MySQL to be ready using an **initContainer**
- Credentials are stored securely in a **Kubernetes Secret**