#!/bin/bash

# ABACO Financial Intelligence Platform - Google Cloud Deployment Script
# This script handles the complete deployment process to Google Cloud Run

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-abaco-platform}"

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to check if gcloud is installed
check_gcloud() {
    print_info "Checking for gcloud CLI..."
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI not found. Please install it from: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    print_success "gcloud CLI found"
}

# Function to check if user is authenticated
check_auth() {
    print_info "Checking authentication..."
    CURRENT_USER=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null)
    if [ -z "$CURRENT_USER" ]; then
        print_warning "Not authenticated. Running gcloud auth login..."
        gcloud auth login
        CURRENT_USER=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null)
        if [ -z "$CURRENT_USER" ]; then
            print_error "Authentication failed"
            exit 1
        fi
    fi
    print_success "Authenticated as: $CURRENT_USER"
}

# Function to get or set project ID
setup_project() {
    print_info "Setting up Google Cloud project..."
    
    # Try to get project from gcloud config
    CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
    
    if [ -z "$CURRENT_PROJECT" ] || [ "$CURRENT_PROJECT" = "(unset)" ]; then
        print_warning "No project set in gcloud config"
        echo "Please enter your Google Cloud Project ID:"
        read -r PROJECT_ID
        
        gcloud config set project "$PROJECT_ID"
    else
        PROJECT_ID="$CURRENT_PROJECT"
    fi
    
    print_success "Using project: $PROJECT_ID"
    export PROJECT_ID
}

# Function to check and enable required APIs
enable_apis() {
    print_info "Enabling required Google Cloud APIs..."
    
    REQUIRED_APIS=(
        "cloudbuild.googleapis.com"
        "run.googleapis.com"
        "containerregistry.googleapis.com"
        "cloudresourcemanager.googleapis.com"
    )
    
    for api in "${REQUIRED_APIS[@]}"; do
        print_info "Enabling $api..."
        if gcloud services enable "$api" --project="$PROJECT_ID" 2>&1 | grep -q "ERROR"; then
            print_error "Failed to enable $api. Check your permissions."
            print_warning "You may need 'serviceusage.services.enable' permission"
            print_warning "Or ask your administrator to grant you the 'Editor' or 'Owner' role"
            exit 1
        fi
    done
    
    print_success "All required APIs enabled"
}

# Function to check IAM permissions
check_permissions() {
    print_info "Checking IAM permissions..."
    
    # Try to get project details (requires resourcemanager.projects.get)
    if ! gcloud projects describe "$PROJECT_ID" &> /dev/null; then
        print_error "Cannot access project: $PROJECT_ID"
        print_error "Missing permission: resourcemanager.projects.get"
        echo ""
        print_warning "Solutions:"
        echo "  1. Ask your administrator to grant you one of these roles:"
        echo "     - roles/viewer (minimum)"
        echo "     - roles/editor (recommended for deployment)"
        echo "     - roles/owner (full access)"
        echo ""
        echo "  2. Or use the troubleshooting tool at:"
        echo "     https://console.cloud.google.com/iam-admin/troubleshooter"
        echo ""
        echo "  3. Or create a new project where you have Owner permissions:"
        echo '     gcloud projects create abaco-platform-$(date +%s) --name="ABACO Platform"'
        exit 1
    fi
    
    print_success "IAM permissions verified"
}

# Function to build and deploy
deploy() {
    print_info "Starting deployment to Cloud Run..."
    
    # Build and deploy using Cloud Build
    if [ -f "cloudbuild.yaml" ]; then
        print_info "Using Cloud Build for deployment..."
        gcloud builds submit \
            --config cloudbuild.yaml \
            --project="$PROJECT_ID"
    else
        # Direct deployment from source
        print_info "Deploying directly from source..."
        gcloud run deploy "$SERVICE_NAME" \
            --source . \
            --region "$REGION" \
            --platform managed \
            --allow-unauthenticated \
            --project="$PROJECT_ID"
    fi
    
    print_success "Deployment complete!"
}

# Function to get service URL
get_service_url() {
    print_info "Getting service URL..."
    SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
        --region "$REGION" \
        --project="$PROJECT_ID" \
        --format="value(status.url)" 2>/dev/null)
    
    if [ -n "$SERVICE_URL" ]; then
        echo ""
        print_success "🚀 ABACO Platform deployed successfully!"
        echo ""
        echo "  Service URL: $SERVICE_URL"
        echo "  Project: $PROJECT_ID"
        echo "  Region: $REGION"
        echo ""
    fi
}

# Main execution
main() {
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║  ABACO Financial Intelligence Platform                 ║"
    echo "║  Google Cloud Run Deployment                           ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
    
    check_gcloud
    check_auth
    setup_project
    check_permissions
    enable_apis
    deploy
    get_service_url
    
    print_success "Deployment process completed!"
}

# Run main function
main
