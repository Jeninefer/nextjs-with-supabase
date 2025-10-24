#!/bin/bash
# Git Branch Tracking Setup Helper
# This script helps configure proper Git branch tracking to avoid common issues

set -e

echo "🔧 Git Branch Tracking Setup"
echo "=============================="
echo ""

# Function to check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo "❌ Error: Not a git repository"
        echo "Please run this script from within the repository directory"
        exit 1
    fi
}

# Function to get current branch name
get_current_branch() {
    git branch --show-current
}

# Function to check if remote exists
check_remote() {
    if ! git remote | grep -q "^origin$"; then
        echo "❌ Error: Remote 'origin' not configured"
        echo "Please add a remote first: git remote add origin <url>"
        exit 1
    fi
}

# Function to setup branch tracking
setup_branch_tracking() {
    local branch_name=$1
    
    echo "📋 Setting up tracking for branch: $branch_name"
    
    # Check if branch exists on remote
    if git ls-remote --heads origin "$branch_name" | grep -q "$branch_name"; then
        echo "✅ Branch exists on remote"
        
        # Set upstream tracking
        git branch --set-upstream-to=origin/"$branch_name" "$branch_name" 2>/dev/null || {
            echo "⚠️  Could not set upstream tracking"
            echo "Trying alternative method..."
            git config branch."$branch_name".remote origin
            git config branch."$branch_name".merge refs/heads/"$branch_name"
        }
        
        echo "✅ Tracking configured for $branch_name -> origin/$branch_name"
    else
        echo "⚠️  Branch '$branch_name' does not exist on remote"
        echo ""
        echo "Options:"
        echo "  1. Push the branch to create it on remote:"
        echo "     git push -u origin $branch_name"
        echo ""
        echo "  2. Switch to a different branch that exists on remote"
        exit 1
    fi
}

# Function to configure automatic push setup
configure_auto_setup() {
    echo ""
    echo "🔧 Configuring automatic push setup..."
    
    # Check current setting
    local current_setting
    current_setting=$(git config --get push.autoSetupRemote 2>/dev/null || echo "false")
    
    if [ "$current_setting" = "true" ]; then
        echo "✅ Automatic push setup is already enabled"
    else
        echo "Setting push.autoSetupRemote = true"
        git config --global push.autoSetupRemote true
        echo "✅ Automatic push setup enabled globally"
        echo "   Future branches will automatically track remote when you push"
    fi
}

# Function to update fetch refspec to track all branches
update_fetch_refspec() {
    echo ""
    echo "🔄 Updating fetch configuration to track all branches..."
    
    local current_fetch
    current_fetch=$(git config --get remote.origin.fetch 2>/dev/null || echo "")
    
    # Check if already configured to fetch all branches
    if [[ "$current_fetch" == "+refs/heads/*:refs/remotes/origin/*" ]]; then
        echo "✅ Fetch is already configured to track all branches"
    else
        git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
        echo "✅ Updated fetch refspec to track all remote branches"
        
        echo ""
        echo "📥 Fetching all branches from remote..."
        git fetch origin
        echo "✅ Fetch complete"
    fi
}

# Function to show current tracking status
show_tracking_status() {
    echo ""
    echo "📊 Current Branch Tracking Status:"
    echo "-----------------------------------"
    git branch -vv
    echo ""
}

# Main execution
main() {
    check_git_repo
    check_remote
    
    local current_branch
    current_branch=$(get_current_branch)
    
    if [ -z "$current_branch" ]; then
        echo "❌ Error: Could not determine current branch"
        exit 1
    fi
    
    echo "Current branch: $current_branch"
    echo ""
    
    # Update fetch refspec first
    update_fetch_refspec
    
    # Setup tracking for current branch
    setup_branch_tracking "$current_branch"
    
    # Configure automatic setup for future branches
    configure_auto_setup
    
    # Show final status
    show_tracking_status
    
    echo "✅ Git branch tracking setup complete!"
    echo ""
    echo "💡 Tips:"
    echo "   - You can now use 'git pull' and 'git push' without specifying remote/branch"
    echo "   - To setup tracking for other branches, checkout the branch and run this script again"
    echo "   - To manually set tracking: git branch --set-upstream-to=origin/<branch-name>"
    echo ""
}

# Run main function
main
