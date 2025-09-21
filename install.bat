                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       @echo off
REM CivicReport - Windows Installation Script
REM This script sets up the entire development environment on Windows

echo 🚀 Starting CivicReport Installation...

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 20+ first.
    pause
    exit /b 1
)

REM Get Node.js version
for /f "tokens=1 delims=v" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js version %NODE_VERSION% detected

REM Create necessary directories
echo 📁 Creating project directories...
mkdir backend\src\auth\entities 2>nul
mkdir backend\src\auth\strategies 2>nul
mkdir backend\src\reports\entities 2>nul
mkdir backend\src\reports\dto 2>nul
mkdir backend\src\reports\controllers 2>nul
mkdir backend\src\mcp-agents\orchestrator 2>nul
mkdir backend\src\mcp-agents\ai-analyzer 2>nul
mkdir backend\src\mcp-agents\location-processor 2>nul
mkdir backend\src\mcp-agents\official-finder 2>nul
mkdir backend\src\mcp-agents\certificate-generator 2>nul
mkdir backend\src\mcp-agents\social-publisher 2>nul
mkdir backend\src\mcp-agents\processors 2>nul
mkdir backend\src\common\services 2>nul
mkdir backend\src\common\decorators 2>nul
mkdir backend\src\common\guards 2>nul
mkdir backend\src\common\interceptors 2>nul
mkdir backend\src\common\pipes 2>nul
mkdir backend\src\health 2>nul
mkdir mobile\src\components 2>nul
mkdir mobile\src\screens 2>nul
mkdir mobile\src\store\slices 2>nul
mkdir mobile\src\services 2>nul
mkdir mobile\src\utils 2>nul
mkdir mobile\src\types 2>nul
mkdir mobile\src\assets 2>nul
mkdir infrastructure\k8s 2>nul
mkdir infrastructure\docker 2>nul
mkdir infrastructure\terraform 2>nul
mkdir infrastructure\helm 2>nul
mkdir database\migrations 2>nul
mkdir database\seeds 2>nul
mkdir docs\postman 2>nul
mkdir docs\architecture 2>nul
mkdir tests\unit 2>nul
mkdir tests\integration 2>nul
mkdir tests\e2e 2>nul

REM Install root dependencies
echo 📦 Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

REM Install mobile dependencies
echo 📦 Installing mobile dependencies...
cd mobile
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install mobile dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

REM Setup environment files
echo 🔧 Setting up environment files...
if not exist .env (
    copy .env.example .env >nul 2>nul
    echo 📝 Created .env file. Please configure with your API keys.
)

if not exist mobile\.env (
    copy mobile\.env.example mobile\.env >nul 2>nul
    echo 📝 Created mobile/.env file. Please configure with your API keys.
)

REM Check if Docker is available
where docker >nul 2>nul
if %errorlevel% equ 0 (
    echo 🐳 Setting up Docker development environment...
    docker-compose -f docker-compose.dev.yml pull
    echo ✅ Docker images pulled successfully
) else (
    echo ⚠️  Docker not found. Please install Docker Desktop for full development experience.
)

REM Check React Native CLI
where react-native >nul 2>nul
if %errorlevel% neq 0 (
    echo 📱 Installing React Native CLI...
    call npm install -g @react-native-community/cli
)

REM Create helpful batch scripts
echo 📝 Creating helpful development scripts...

REM Create start-dev.bat
echo @echo off > start-dev.bat
echo echo 🚀 Starting CivicReport Development Environment... >> start-dev.bat
echo docker-compose -f docker-compose.dev.yml up -d >> start-dev.bat
echo echo ⏳ Waiting for services to be ready... >> start-dev.bat
echo timeout /t 10 /nobreak ^>nul >> start-dev.bat
echo call npm run db:migrate >> start-dev.bat
echo call npm run dev >> start-dev.bat

REM Create stop-dev.bat  
echo @echo off > stop-dev.bat
echo echo 🛑 Stopping CivicReport Development Environment... >> stop-dev.bat
echo docker-compose -f docker-compose.dev.yml down >> stop-dev.bat
echo taskkill /f /im node.exe 2^>nul >> stop-dev.bat
echo echo ✅ Development environment stopped >> stop-dev.bat

REM Create setup-db.bat
echo @echo off > setup-db.bat
echo echo 🗄️ Setting up CivicReport Database... >> setup-db.bat
echo createdb civic_report 2^>nul >> setup-db.bat
echo psql -h localhost -U postgres -d civic_report -f database\schema.sql >> setup-db.bat
echo echo ✅ Database setup complete >> setup-db.bat

REM Final verification
echo 🔍 Running final verification...

REM Check critical files
if not exist package.json (
    echo ❌ Root package.json missing
    pause
    exit /b 1
)

if not exist backend\package.json (
    echo ❌ Backend package.json missing
    pause
    exit /b 1
)

if not exist mobile\package.json (
    echo ❌ Mobile package.json missing
    pause
    exit /b 1
)

echo ✅ All package.json files present

REM Display summary
echo.
echo 🎉 CivicReport Installation Complete!
echo.
echo 📋 Next Steps:
echo 1. Configure API keys in .env and mobile\.env files
echo 2. Start development environment: start-dev.bat
echo 3. Or manually: npm run dev
echo.
echo 📚 Documentation:
echo • API Documentation: docs\API.md
echo • Deployment Guide: docs\DEPLOYMENT.md  
echo • System Requirements: REQUIREMENTS.txt
echo.
echo 🛠️ Development Commands:
echo • npm run dev - Start both backend and mobile
echo • npm run backend:dev - Start backend only
echo • npm run mobile:start - Start mobile development server
echo • npm run test:all - Run all tests
echo • npm run db:migrate - Run database migrations
echo.
echo 🐳 Docker Commands:
echo • docker-compose -f docker-compose.dev.yml up -d - Start services
echo • docker-compose -f docker-compose.dev.yml down - Stop services
echo.
echo Happy coding! 🚀
pause
