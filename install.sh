#!/bin/bash

# CivicReport - Complete Installation Script
# This script sets up the entire development environment

set -e

echo "🚀 Starting CivicReport Installation..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="20.0.0"
if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
    echo "❌ Node.js version $NODE_VERSION is not supported. Please install Node.js $REQUIRED_VERSION or higher."
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION detected"

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p backend/src/{auth/{entities,strategies},reports/{entities,dto,controllers},mcp-agents/{orchestrator,ai-analyzer,location-processor,official-finder,certificate-generator,social-publisher,processors},common/{services,decorators,guards,interceptors,pipes},health}
mkdir -p mobile/src/{components,screens,store/slices,services,utils,types,assets}
mkdir -p infrastructure/{k8s,docker,terraform,helm}
mkdir -p database/{migrations,seeds}
mkdir -p docs/{postman,architecture}
mkdir -p tests/{unit,integration,e2e}

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install mobile dependencies  
echo "📦 Installing mobile dependencies..."
cd mobile
npm install
cd ..

# Setup environment files
echo "🔧 Setting up environment files..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env file. Please configure with your API keys."
fi

if [ ! -f mobile/.env ]; then
    cp mobile/.env.example mobile/.env
    echo "📝 Created mobile/.env file. Please configure with your API keys."
fi

# Setup Git hooks (if .git directory exists)
if [ -d .git ]; then
    echo "🪝 Setting up Git hooks..."
    npx husky install
    npx husky add .husky/pre-commit "npm run lint"
    npx husky add .husky/pre-push "npm run test"
fi

# Create development certificate for HTTPS
echo "🔒 Creating development SSL certificate..."
mkdir -p certs
if ! [ -f certs/localhost.pem ]; then
    openssl req -x509 -newkey rsa:4096 -keyout certs/localhost-key.pem -out certs/localhost.pem -days 365 -nodes -subj "/CN=localhost"
    echo "✅ Development SSL certificate created"
fi

# Setup Docker development environment
echo "🐳 Setting up Docker development environment..."
if command -v docker &> /dev/null; then
    docker-compose -f docker-compose.dev.yml pull
    echo "✅ Docker images pulled successfully"
else
    echo "⚠️  Docker not found. Please install Docker for full development experience."
fi

# Verify PostgreSQL is available (if running locally)
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL client available"
else
    echo "⚠️  PostgreSQL client not found. Install PostgreSQL for local development."
fi

# Check React Native CLI
if ! command -v react-native &> /dev/null; then
    echo "📱 Installing React Native CLI..."
    npm install -g @react-native-community/cli
fi

# iOS setup (if on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 macOS detected - setting up iOS development..."
    if command -v pod &> /dev/null; then
        echo "✅ CocoaPods is installed"
        cd mobile/ios
        pod install
        cd ../..
        echo "✅ iOS pods installed"
    else
        echo "⚠️  CocoaPods not found. Install with: sudo gem install cocoapods"
    fi
fi

# Android setup verification
if [ -d "$ANDROID_HOME" ]; then
    echo "✅ Android SDK found at $ANDROID_HOME"
else
    echo "⚠️  Android SDK not found. Set ANDROID_HOME environment variable."
fi

# Create helpful scripts
echo "📝 Creating helpful development scripts..."

# Create start script
cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting CivicReport Development Environment..."

# Start Docker services
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Run database migrations
npm run db:migrate

# Start backend and mobile in parallel
npm run dev
EOF

chmod +x start-dev.sh

# Create stop script
cat > stop-dev.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping CivicReport Development Environment..."
docker-compose -f docker-compose.dev.yml down
pkill -f "react-native start"
pkill -f "nest start"
echo "✅ Development environment stopped"
EOF

chmod +x stop-dev.sh

# Create database setup script
cat > setup-db.sh << 'EOF'
#!/bin/bash
echo "🗄️ Setting up CivicReport Database..."

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432; then
    echo "❌ PostgreSQL is not running. Start it first."
    exit 1
fi

# Create database if it doesn't exist
createdb civic_report 2>/dev/null || echo "Database already exists"

# Run schema
psql -h localhost -U postgres -d civic_report -f database/schema.sql

echo "✅ Database setup complete"
EOF

chmod +x setup-db.sh

# Final verification
echo "🔍 Running final verification..."

# Check if all package.json files exist
if [ ! -f package.json ]; then
    echo "❌ Root package.json missing"
    exit 1
fi

if [ ! -f backend/package.json ]; then
    echo "❌ Backend package.json missing"
    exit 1
fi

if [ ! -f mobile/package.json ]; then
    echo "❌ Mobile package.json missing"
    exit 1
fi

echo "✅ All package.json files present"

# Check critical files
CRITICAL_FILES=(
    "README.md"
    "REQUIREMENTS.txt"
    ".env.example"
    "docker-compose.dev.yml"
    "backend/src/main.ts"
    "backend/src/app.module.ts"
    "mobile/App.tsx"
    "database/schema.sql"
    ".vscode/tasks.json"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Critical file missing: $file"
        exit 1
    fi
done

echo "✅ All critical files present"

# Display summary
echo ""
echo "🎉 CivicReport Installation Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Configure API keys in .env and mobile/.env files"
echo "2. Start development environment: ./start-dev.sh"
echo "3. Or manually: npm run dev"
echo ""
echo "📚 Documentation:"
echo "• API Documentation: docs/API.md"
echo "• Deployment Guide: docs/DEPLOYMENT.md"
echo "• System Requirements: REQUIREMENTS.txt"
echo ""
echo "🛠️ Development Commands:"
echo "• npm run dev - Start both backend and mobile"
echo "• npm run backend:dev - Start backend only"
echo "• npm run mobile:start - Start mobile development server"
echo "• npm run test:all - Run all tests"
echo "• npm run db:migrate - Run database migrations"
echo ""
echo "🐳 Docker Commands:"
echo "• docker-compose -f docker-compose.dev.yml up -d - Start services"
echo "• docker-compose -f docker-compose.dev.yml down - Stop services"
echo ""
echo "Happy coding! 🚀"
