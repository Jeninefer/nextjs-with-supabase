#!/bin/bash
# ABACO Financial Intelligence Platform - Delete Blank Files Script
# Following AI Toolkit best practices with comprehensive tracing and logging

set -euo pipefail

cd /workspaces/nextjs-with-supabase

echo "🧹 ABACO Financial Intelligence Platform - Delete Blank Files"
echo "=========================================================="

# AI Toolkit tracing initialization
TRACE_ID="delete_blank_files_$(date +%s)"
START_TIME=$(date +%s)
DELETED_COUNT=0
SCANNED_COUNT=0
ERROR_COUNT=0

echo "🔍 AI Toolkit Trace ID: $TRACE_ID"
echo "⏰ Operation Start: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Create log file for AI Toolkit tracing
LOG_FILE="./data/logs/delete_blank_files_${TRACE_ID}.log"
mkdir -p ./data/logs

# Function for structured logging following AI Toolkit best practices
log_trace() {
    local level="$1"
    local operation="$2"
    local message="$3"
    local metadata="${4:-{}}"
    
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local log_entry=$(cat <<EOF
{
  "timestamp": "$timestamp",
  "trace_id": "$TRACE_ID",
  "level": "$level",
  "operation": "$operation",
  "message": "$message",
  "metadata": $metadata,
  "platform": "abaco_financial_intelligence"
}
EOF
)
    echo "$log_entry" >> "$LOG_FILE"
    
    # Also output to console for visibility
    case "$level" in
        "INFO") echo "ℹ️  $message" ;;
        "WARN") echo "⚠️  $message" ;;
        "ERROR") echo "❌ $message" ;;
        "SUCCESS") echo "✅ $message" ;;
    esac
}

# Initialize tracing
log_trace "INFO" "initialization" "Starting blank file deletion process" \
    '{"workspace": "/workspaces/nextjs-with-supabase", "trace_id": "'$TRACE_ID'"}'

# Define patterns for files to exclude from deletion (even if blank)
EXCLUDE_PATTERNS=(
    ".git/*"
    "node_modules/*"
    ".next/*"
    "dist/*"
    "build/*"
    "coverage/*"
    ".venv/*"
    ".env.local"
    ".env"
    "*.lock"
    "package-lock.json"
    "yarn.lock"
    ".gitkeep"
    ".keep"
    "py.typed"
    "__init__.py"
    "REQUESTED"
)

# Function to check if a file should be excluded
should_exclude_file() {
    local file="$1"
    
    # Check each exclude pattern
    for pattern in "${EXCLUDE_PATTERNS[@]}"; do
        case "$file" in
            $pattern)
                return 0  # Should exclude
                ;;
            */$pattern)
                return 0  # Should exclude
                ;;
            *"$pattern"*)
                # Special case for specific file types
                if [[ "$pattern" == "py.typed" || "$pattern" == "__init__.py" || "$pattern" == "REQUESTED" ]]; then
                    return 0
                fi
                ;;
        esac
    done
    
    return 1  # Should not exclude
}

# Function to check if a file is truly blank
is_file_blank() {
    local file="$1"
    
    # Check if file exists
    if [[ ! -f "$file" ]]; then
        return 1
    fi
    
    # Check if file is empty (0 bytes)
    if [[ ! -s "$file" ]]; then
        return 0  # File is blank (empty)
    fi
    
    # Check if file contains only whitespace/newlines (but skip binary files)
    if file "$file" | grep -q "text"; then
        if [[ -z "$(tr -d '[:space:]' < "$file" 2>/dev/null)" ]]; then
            return 0  # File contains only whitespace
        fi
    fi
    
    return 1  # File is not blank
}

log_trace "INFO" "scanning" "Starting file system scan for blank files" \
    '{"exclude_patterns_count": '${#EXCLUDE_PATTERNS[@]}'}'

echo ""
echo "🔍 Scanning for blank files..."
echo "📝 Exclusion patterns: ${#EXCLUDE_PATTERNS[@]} configured"

# Improved file finding with better null byte handling
find . -type f \
    -not -path "./.git/*" \
    -not -path "./node_modules/*" \
    -not -path "./.next/*" \
    -not -path "./.venv/*" \
    -not -path "./dist/*" \
    -not -path "./build/*" \
    -not -path "./coverage/*" \
    -print0 | while IFS= read -r -d '' file; do
    
    SCANNED_COUNT=$((SCANNED_COUNT + 1))
    
    # Skip if file should be excluded
    if should_exclude_file "$file"; then
        continue
    fi
    
    # Check if file is blank
    if is_file_blank "$file"; then
        # Get file size safely without null byte issues
        if [[ -f "$file" ]]; then
            file_size=$(stat -c%s "$file" 2>/dev/null || echo "0")
            file_modified=$(stat -c%y "$file" 2>/dev/null || date)
            
            log_trace "INFO" "file_deletion" "Deleting blank file: $file" \
                "{\"file_path\": \"$file\", \"file_size_bytes\": $file_size, \"last_modified\": \"$file_modified\"}"
            
            # Delete the blank file
            if rm "$file" 2>/dev/null; then
                DELETED_COUNT=$((DELETED_COUNT + 1))
                echo "🗑️  Deleted: $file (${file_size} bytes)"
            else
                ERROR_COUNT=$((ERROR_COUNT + 1))
                log_trace "ERROR" "file_deletion" "Failed to delete file: $file" \
                    "{\"file_path\": \"$file\", \"error\": \"Permission denied or file locked\"}"
                echo "❌ Failed to delete: $file"
            fi
        fi
    fi
    
    # Progress indicator every 100 files
    if ((SCANNED_COUNT % 100 == 0)); then
        echo "📊 Progress: Scanned $SCANNED_COUNT files, deleted $DELETED_COUNT blank files"
    fi
done

# Calculate processing time
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Final results logging
log_trace "SUCCESS" "completion" "Blank file deletion completed" \
    "{\"files_scanned\": $SCANNED_COUNT, \"files_deleted\": $DELETED_COUNT, \"errors\": $ERROR_COUNT, \"duration_seconds\": $DURATION}"

echo ""
echo "📊 DELETION SUMMARY:"
echo "===================="
echo "🔍 Files Scanned: $SCANNED_COUNT"
echo "🗑️  Files Deleted: $DELETED_COUNT"
echo "❌ Errors: $ERROR_COUNT"
echo "⏱️  Processing Time: ${DURATION}s"
echo "🆔 Trace ID: $TRACE_ID"

# Generate summary report following Azure Cosmos DB document structure
SUMMARY_REPORT="./data/reports/blank_files_deletion_summary_$(date +%Y%m%d_%H%M%S).json"
mkdir -p ./data/reports

# Create Azure Cosmos DB compatible document with HPK structure
cat > "$SUMMARY_REPORT" << EOF
{
  "id": "blank_file_deletion_${TRACE_ID}",
  "partitionKey": "abaco_financial/MAINTENANCE/$(date +%Y-%m-%d)",
  "tenantId": "abaco_financial",
  "customerSegment": "maintenance",
  "analysisDate": "$(date +%Y-%m-%d)",
  "documentType": "maintenance_operation",
  "createdAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "updatedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "ttl": $((30 * 24 * 60 * 60)),
  "operation": "delete_blank_files",
  "trace_id": "$TRACE_ID",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "results": {
    "files_scanned": $SCANNED_COUNT,
    "files_deleted": $DELETED_COUNT,
    "errors_encountered": $ERROR_COUNT,
    "processing_time_seconds": $DURATION
  },
  "configuration": {
    "exclude_patterns_count": ${#EXCLUDE_PATTERNS[@]},
    "workspace_path": "/workspaces/nextjs-with-supabase",
    "exclude_patterns": [$(printf '"%s",' "${EXCLUDE_PATTERNS[@]}" | sed 's/,$//')]
  },
  "ai_toolkit_tracing": {
    "trace_enabled": true,
    "log_file": "$LOG_FILE",
    "structured_logging": true,
    "platform": "abaco_financial_intelligence",
    "correlation_id": "$TRACE_ID"
  },
  "performance_metrics": {
    "files_per_second": $(( SCANNED_COUNT > 0 && DURATION > 0 ? SCANNED_COUNT / DURATION : 0 )),
    "deletions_per_second": $(if [[ $DELETED_COUNT -gt 0 && $DURATION -gt 0 ]]; then echo $((DELETED_COUNT / DURATION)); else echo 0; fi),
    "success_rate": $(( SCANNED_COUNT > 0 ? (SCANNED_COUNT - ERROR_COUNT) * 100 / SCANNED_COUNT : 100 ))
  }
}
EOF

echo "📄 Summary Report: $SUMMARY_REPORT"
echo "📋 Detailed Log: $LOG_FILE"

# Additional cleanup if any files were deleted
if [ $DELETED_COUNT -gt 0 ]; then
    echo ""
    echo "🧹 Post-deletion cleanup..."
    
    # Remove empty directories (except protected ones)  
    find . -type d -empty \
        -not -path "./.git/*" \
        -not -path "./node_modules/*" \
        -not -path "./.next/*" \
        -not -path "./data/*" \
        -not -path "./.venv/*" 2>/dev/null | while read -r empty_dir; do
        if [[ "$empty_dir" != "." && "$empty_dir" != "./.git" && "$empty_dir" != "./node_modules" ]]; then
            echo "📁 Removing empty directory: $empty_dir"
            rmdir "$empty_dir" 2>/dev/null || true
        fi
    done
    
    log_trace "INFO" "post_cleanup" "Post-deletion cleanup completed" \
        '{"empty_directories_processed": true}'
fi

# Final status with enhanced reporting
if [ $ERROR_COUNT -eq 0 ]; then
    echo ""
    echo "✅ OPERATION COMPLETED SUCCESSFULLY"
    echo "🏦 ABACO Financial Intelligence Platform - Repository cleaned!"
    
    if [ $DELETED_COUNT -eq 0 ]; then
        echo "🎉 No blank files found - repository is already clean!"
    else
        echo "🎯 Deleted $DELETED_COUNT blank files, repository optimized!"
        
        # Calculate space saved (approximate)
        echo "💾 Estimated space saved: ${DELETED_COUNT} files"
        echo "📈 Processing efficiency: $(( DURATION > 0 ? SCANNED_COUNT / DURATION : 0 )) files/second"
    fi
else
    echo ""
    echo "⚠️ OPERATION COMPLETED WITH ERRORS"
    echo "❌ $ERROR_COUNT errors encountered during deletion"
    echo "📋 Check log file for details: $LOG_FILE"
    echo "📊 Success rate: $(( SCANNED_COUNT > 0 ? (SCANNED_COUNT - ERROR_COUNT) * 100 / SCANNED_COUNT : 100 ))%"
fi

echo ""
echo "💡 For comprehensive repository cleanup, also run:"
echo "   ./git-cleanup.sh"
echo "   ./scripts/cleanup-and-sync.sh"

# AI Toolkit tracing completion
log_trace "INFO" "operation_end" "Blank file deletion operation completed" \
    "{\"final_status\": \"$([ $ERROR_COUNT -eq 0 ] && echo 'success' || echo 'completed_with_errors')\", \"trace_id\": \"$TRACE_ID\", \"performance_score\": $(( DURATION > 0 ? SCANNED_COUNT / DURATION : 0 ))}"

echo ""
echo "🔍 AI Toolkit Tracing Summary:"
echo "   📊 Trace ID: $TRACE_ID"
echo "   📋 Structured logs: $LOG_FILE"
echo "   ☁️ Azure Cosmos DB ready: $SUMMARY_REPORT" 
echo "   🎯 Operation status: $([ $ERROR_COUNT -eq 0 ] && echo 'SUCCESS' || echo 'COMPLETED_WITH_ERRORS')"

exit 0
