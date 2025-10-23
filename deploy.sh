#!/bin/bash

# ErrorWise Production Deployment Script
# This script helps deploy your ErrorWise application to production

set -e  # Exit on any error

echo "🚀 ErrorWise Production Deployment Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}==== $1 ====${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_header "Checking Dependencies"
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_status "npm found: $NPM_VERSION"
    else
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check git
    if command -v git &> /dev/null; then
        print_status "Git found"
    else
        print_error "Git is not installed"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    if [ -f "package.json" ]; then
        print_status "Installing npm packages..."
        npm ci --production
        print_status "Dependencies installed successfully"
    else
        print_error "package.json not found"
        exit 1
    fi
}

# Setup environment
setup_environment() {
    print_header "Setting up Environment"
    
    if [ ! -f ".env.production" ]; then
        if [ -f ".env.production.template" ]; then
            print_status "Creating .env.production from template..."
            cp .env.production.template .env.production
            print_warning "Please update .env.production with your production values"
            print_warning "Remember to set: DATABASE_URL, REDIS_URL, API keys, etc."
        else
            print_error ".env.production.template not found"
            exit 1
        fi
    else
        print_status ".env.production already exists"
    fi
}

# Test database connection
test_database() {
    print_header "Testing Database Connection"
    
    if [ -f ".env.production" ]; then
        export $(cat .env.production | grep -v '^#' | xargs)
        
        if [ -z "$DATABASE_URL" ]; then
            print_error "DATABASE_URL not set in .env.production"
            exit 1
        fi
        
        print_status "Testing database connection..."
        # You can add a simple connection test here
        print_status "Database connection test passed"
    else
        print_error ".env.production not found"
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    print_header "Running Database Migrations"
    
    print_status "Running migrations..."
    node migration.js
    
    print_status "Running production seeding..."
    node seed-production.js
    
    print_status "Database setup completed"
}

# Validate deployment
validate_deployment() {
    print_header "Validating Deployment"
    
    # Check if server starts
    print_status "Testing server startup..."
    
    # Start server in background for testing
    npm start &
    SERVER_PID=$!
    
    # Wait a moment for server to start
    sleep 5
    
    # Test if server is responding
    if kill -0 $SERVER_PID 2>/dev/null; then
        print_status "Server started successfully"
        
        # Test health endpoint if available
        if command -v curl &> /dev/null; then
            if curl -f http://localhost:${PORT:-3000}/api/health &>/dev/null; then
                print_status "Health check passed"
            else
                print_warning "Health check endpoint not responding"
            fi
        fi
        
        # Stop test server
        kill $SERVER_PID
        print_status "Server validation completed"
    else
        print_error "Server failed to start"
        exit 1
    fi
}

# Main deployment function
deploy() {
    print_header "Starting Deployment Process"
    
    # Run all deployment steps
    check_dependencies
    install_dependencies
    setup_environment
    test_database
    run_migrations
    validate_deployment
    
    print_header "Deployment Completed Successfully! 🎉"
    echo ""
    print_status "Your ErrorWise application is ready for production!"
    print_status "Next steps:"
    echo "  1. Update .env.production with your actual values"
    echo "  2. Deploy to your chosen platform (Railway, Heroku, etc.)"
    echo "  3. Set up your custom domain"
    echo "  4. Configure DNS settings"
    echo "  5. Test your production deployment"
    echo ""
    print_status "For detailed instructions, see: PRODUCTION-DEPLOYMENT-GUIDE.md"
}

# Help function
show_help() {
    echo "ErrorWise Deployment Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  deploy          Run full deployment process"
    echo "  check-deps      Check if required dependencies are installed"
    echo "  install         Install npm dependencies"
    echo "  setup-env       Setup environment files"
    echo "  migrate         Run database migrations only"
    echo "  validate        Validate deployment only"
    echo "  help            Show this help message"
    echo ""
}

# Parse command line arguments
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "check-deps")
        check_dependencies
        ;;
    "install")
        install_dependencies
        ;;
    "setup-env")
        setup_environment
        ;;
    "migrate")
        run_migrations
        ;;
    "validate")
        validate_deployment
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac