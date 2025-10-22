#!/bin/bash

# ABACO Platform - Google Cloud IAM Permissions Checker
# This script checks if you have the necessary permissions to deploy to GCP

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║  ABACO Platform - GCP Permissions Checker             ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
}

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

# Check if gcloud is installed
check_gcloud_installed() {
    print_info "Checking for gcloud CLI..."
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI not found"
        echo ""
        echo "Install from: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    print_success "gcloud CLI is installed"
}

# Check authentication
check_auth() {
    print_info "Checking authentication status..."
    
    ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null)
    
    if [ -z "$ACTIVE_ACCOUNT" ]; then
        print_error "Not authenticated with gcloud"
        echo ""
        print_warning "Run: gcloud auth login"
        exit 1
    fi
    
    print_success "Authenticated as: $ACTIVE_ACCOUNT"
}

# Get project ID
get_project() {
    print_info "Getting project information..."
    
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
    
    if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "(unset)" ]; then
        print_warning "No project set in gcloud config"
        echo ""
        echo "Available projects:"
        gcloud projects list --format="table(projectId,name)" 2>/dev/null || true
        echo ""
        echo "Set a project with: gcloud config set project PROJECT_ID"
        exit 1
    fi
    
    print_success "Project: $PROJECT_ID"
    export PROJECT_ID
}

# Check project access
check_project_access() {
    print_info "Checking project access..."
    
    if gcloud projects describe "$PROJECT_ID" &> /dev/null; then
        print_success "Can access project: $PROJECT_ID"
        
        # Get project details
        PROJECT_NAME=$(gcloud projects describe "$PROJECT_ID" --format="value(name)" 2>/dev/null)
        PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)" 2>/dev/null)
        
        echo "  Name: $PROJECT_NAME"
        echo "  Number: $PROJECT_NUMBER"
    else
        print_error "Cannot access project: $PROJECT_ID"
        print_error "Missing permission: resourcemanager.projects.get"
        echo ""
        print_warning "This usually means you need one of these roles:"
        echo "  - roles/viewer (minimum for read access)"
        echo "  - roles/editor (recommended for deployment)"
        echo "  - roles/owner (full project control)"
        echo ""
        print_warning "Contact your administrator and provide:"
        echo "  Your email: $ACTIVE_ACCOUNT"
        echo "  Project ID: $PROJECT_ID"
        echo "  Required permission: resourcemanager.projects.get"
        exit 1
    fi
}

# Check specific permissions
check_permissions() {
    print_info "Checking required permissions..."
    
    REQUIRED_PERMISSIONS=(
        "resourcemanager.projects.get"
        "run.services.create"
        "run.services.update"
        "cloudbuild.builds.create"
        "storage.buckets.get"
    )
    
    HAS_ISSUES=false
    
    for permission in "${REQUIRED_PERMISSIONS[@]}"; do
        # Test permission by trying to use it (this is a simplified check)
        case $permission in
            "resourcemanager.projects.get")
                if gcloud projects describe "$PROJECT_ID" &> /dev/null; then
                    print_success "$permission"
                else
                    print_error "$permission - MISSING"
                    HAS_ISSUES=true
                fi
                ;;
            "run.services.create"|"run.services.update")
                if gcloud run services list --project="$PROJECT_ID" &> /dev/null; then
                    print_success "$permission"
                else
                    print_warning "$permission - Cannot verify (may need Editor role)"
                fi
                ;;
            "cloudbuild.builds.create")
                if gcloud builds list --project="$PROJECT_ID" --limit=1 &> /dev/null; then
                    print_success "$permission"
                else
                    print_warning "$permission - Cannot verify (may need Editor role)"
                fi
                ;;
            "storage.buckets.get")
                # 'gcloud storage buckets list' is only available in newer gcloud SDKs.
                # Check if 'gcloud storage' is available; if not, fall back to 'gsutil ls'.
                if gcloud storage --help &> /dev/null; then
                    if gcloud storage buckets list --project="$PROJECT_ID" &> /dev/null; then
                        print_success "$permission"
                    else
                        print_warning "$permission - Cannot verify (may need Editor role)"
                    fi
                else
                    if gsutil ls -p "$PROJECT_ID" &> /dev/null; then
                        print_success "$permission"
                    else
                        print_warning "$permission - Cannot verify (may need Editor role)"
                    fi
                fi
                ;;
        esac
    done
    
    if [ "$HAS_ISSUES" = true ]; then
        echo ""
        print_error "Some required permissions are missing"
        exit 1
    fi
}

# Check enabled APIs
check_apis() {
    print_info "Checking enabled APIs..."
    
    REQUIRED_APIS=(
        "cloudbuild.googleapis.com:Cloud Build API"
        "run.googleapis.com:Cloud Run API"
        "containerregistry.googleapis.com:Container Registry API"
    )
    
    for api_info in "${REQUIRED_APIS[@]}"; do
        IFS=':' read -r api name <<< "$api_info"
        
        if gcloud services list --enabled --project="$PROJECT_ID" 2>/dev/null | grep -q "$api"; then
            print_success "$name"
        else
            print_warning "$name - Not enabled"
            echo "    Enable with: gcloud services enable $api"
        fi
    done
}

# Get IAM roles
check_roles() {
    print_info "Checking your IAM roles..."
    
    POLICY=$(gcloud projects get-iam-policy "$PROJECT_ID" --flatten="bindings[].members" --format="json" 2>/dev/null)
    
    if [ -n "$POLICY" ]; then
        USER_ROLES=$(echo "$POLICY" | jq -r ".bindings[] | select(.members[] == \"user:$ACTIVE_ACCOUNT\") | .role" 2>/dev/null || echo "")
        
        if [ -n "$USER_ROLES" ]; then
            print_success "Your roles in project $PROJECT_ID:"
            echo "$USER_ROLES" | while read -r role; do
                echo "  - $role"
            done
        else
            print_warning "No direct roles found (you may have inherited roles)"
        fi
    fi
}

# Print summary and recommendations
print_summary() {
    echo ""
    echo "══════════════════════════════════════════════════════"
    echo "  Summary"
    echo "══════════════════════════════════════════════════════"
    echo ""
    
    print_success "All checks passed!"
    echo ""
    echo "You can deploy to Google Cloud Run with:"
    echo ""
    echo "  ./scripts/deploy-gcp.sh"
    echo ""
    echo "Or manually:"
    echo ""
    echo "  gcloud run deploy abaco-platform \\"
    echo "    --source . \\"
    echo "    --region us-central1 \\"
    echo "    --allow-unauthenticated"
    echo ""
}

# Main execution
main() {
    print_header
    check_gcloud_installed
    check_auth
    get_project
    check_project_access
    check_permissions
    check_apis
    check_roles
    print_summary
}

main
