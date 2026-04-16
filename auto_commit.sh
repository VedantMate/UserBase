#!/bin/bash

echo "Starting automated commits..."

# 1
git add backend/.gitignore backend/src/config/env.js backend/src/config/constants.js
git commit -m "chore(config): add .gitignore and env/constants"
git push
sleep 340

# 2
git add backend/src/server.js backend/src/app.js backend/src/services/bootstrap.js backend/src/services/db.js
git commit -m "feat(server): add entrypoint, bootstrap and db service"
git push
sleep 400

# 3
git add backend/src/models/User.js backend/src/utils/httpError.js
git commit -m "feat(model): add User model and httpError util"
git push
sleep 200

# 4
git add backend/src/services/tokenService.js
git commit -m "feat(auth): add token service"
git push
sleep 310

# 5
git add backend/src/controllers/authController.js backend/src/routes/auth.js backend/src/validators/authValidator.js
git commit -m "feat(auth): implement auth controller, route and validator"
git push
sleep 360

# 6
git add backend/src/controllers/userController.js backend/src/routes/users.js backend/src/validators/userValidator.js
git commit -m "feat(users): add user controller, route and validator"
git push
sleep 320

# 7
git add backend/src/middleware/auth.js backend/src/middleware/authorize.js backend/src/middleware/validate.js backend/src/middleware/errorHandler.js
git commit -m "chore(middleware): add auth, authorize, validate and error handler"
git push
sleep 310

# 8
git add frontend/src/api/client.js frontend/src/api/auth.js frontend/src/context/AuthContext.jsx frontend/src/pages/Login.jsx
git commit -m "feat(frontend): add API client, auth API, AuthContext and Login page"
git push
sleep 400

git add vercel.json
git commit -m "chore(deploy): add Vercel configuration"
git push

echo "All commits completed."
