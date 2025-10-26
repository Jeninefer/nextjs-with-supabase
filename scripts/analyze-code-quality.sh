#!/bin/bash
# ABACO Financial Intelligence Platform - Code Quality Analysis (Docker-free)
# Following AI Toolkit best practices with Azure Cosmos DB integration

set -euo pipefail

cd /workspaces/nextjs-with-supabase

echo "📊 ABACO Financial Intelligence - Code Quality Analysis (Docker-free)"
echo "=================================================================="

# AI Toolkit tracing for quality analysis
QUALITY_TRACE_ID="quality_$(date +%s)"
echo "🔍 AI Toolkit Trace ID: $QUALITY_TRACE_ID"

# Create quality analysis log
mkdir -p ./data/quality-logs
QUALITY_LOG="./data/quality-logs/quality_analysis_${QUALITY_TRACE_ID}.log"

log_quality() {
    local level="$1"
    local component="$2"
    local message="$3"
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    echo "[$timestamp] [$level] [$component] $message" | tee -a "$QUALITY_LOG"
}

log_quality "INFO" "ANALYSIS" "Starting Docker-free code quality analysis"

# Analysis 1: TypeScript Quality Check
echo ""
echo "🔍 Analysis 1: TypeScript Quality Check"
echo "======================================"

if npm run type-check 2>/dev/null; then
    TS_ERRORS=0
    log_quality "SUCCESS" "TYPESCRIPT" "TypeScript compilation successful - 0 errors"
else
    # Count TypeScript errors
    TS_ERRORS=$(npm run type-check 2>&1 | grep -c "error TS" || echo "0")
    log_quality "WARN" "TYPESCRIPT" "TypeScript compilation issues found: $TS_ERRORS errors"
fi

# Analysis 2: ESLint Code Quality
echo ""
echo "🔍 Analysis 2: ESLint Code Quality"
echo "================================"

if command -v npx >/dev/null 2>&1; then
    ESLINT_ERRORS=0
    ESLINT_WARNINGS=0
    
    # Run ESLint and capture output
    if ESLINT_OUTPUT=$(npx eslint . --ext .js,.ts,.jsx,.tsx --format json 2>/dev/null); then
        # Parse JSON output to count issues
        if command -v jq >/dev/null 2>&1; then
            ESLINT_ERRORS=$(echo "$ESLINT_OUTPUT" | jq '[.[].messages[] | select(.severity == 2)] | length')
            ESLINT_WARNINGS=$(echo "$ESLINT_OUTPUT" | jq '[.[].messages[] | select(.severity == 1)] | length')
        else
            # Fallback if jq not available
            ESLINT_ERRORS=$(echo "$ESLINT_OUTPUT" | grep -c '"severity":2' || echo "0")
            ESLINT_WARNINGS=$(echo "$ESLINT_OUTPUT" | grep -c '"severity":1' || echo "0")
        fi
        
        log_quality "INFO" "ESLINT" "ESLint analysis completed - Errors: $ESLINT_ERRORS, Warnings: $ESLINT_WARNINGS"
    else
        log_quality "WARN" "ESLINT" "ESLint analysis failed or not configured"
    fi
else
    log_quality "WARN" "ESLINT" "ESLint not available"
fi

# Analysis 3: Build Quality Check
echo ""
echo "🔍 Analysis 3: Build Quality Check"
echo "==============================="

BUILD_SUCCESS=false
if npm run build >/dev/null 2>&1; then
    BUILD_SUCCESS=true
    log_quality "SUCCESS" "BUILD" "Production build successful"
else
    log_quality "ERROR" "BUILD" "Production build failed"
fi

# Analysis 4: Code Complexity Analysis (Simple)
echo ""
echo "🔍 Analysis 4: Code Complexity Analysis"
echo "====================================="

# Count lines of code and complexity metrics
TOTAL_FILES=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | wc -l)
TOTAL_LINES=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | xargs wc -l 2>/dev/null | tail -n 1 | awk '{print $1}' || echo "0")
AVG_FILE_SIZE=$((TOTAL_LINES / (TOTAL_FILES > 0 ? TOTAL_FILES : 1)))

log_quality "INFO" "COMPLEXITY" "Code metrics - Files: $TOTAL_FILES, Lines: $TOTAL_LINES, Avg per file: $AVG_FILE_SIZE"

# Analysis 5: Security Scan (npm audit)
echo ""
echo "🔍 Analysis 5: Security Analysis"
echo "============================"

SECURITY_ISSUES=0
if npm audit --json >/dev/null 2>&1; then
    if command -v jq >/dev/null 2>&1; then
        AUDIT_OUTPUT=$(npm audit --json 2>/dev/null || echo '{"metadata":{"vulnerabilities":{"total":0}}}')
        SECURITY_ISSUES=$(echo "$AUDIT_OUTPUT" | jq '.metadata.vulnerabilities.total' 2>/dev/null || echo "0")
    else
        SECURITY_ISSUES=$(npm audit 2>/dev/null | grep -c "vulnerabilities found" || echo "0")
    fi
    log_quality "INFO" "SECURITY" "Security audit completed - $SECURITY_ISSUES vulnerabilities found"
else
    log_quality "WARN" "SECURITY" "Security audit not available"
fi

# Calculate Overall Quality Score
echo ""
echo "📊 Quality Score Calculation"
echo "=========================="

QUALITY_SCORE=100

# Deduct points for issues
if [[ $TS_ERRORS -gt 0 ]]; then
    QUALITY_SCORE=$((QUALITY_SCORE - (TS_ERRORS > 10 ? 30 : TS_ERRORS * 3)))
fi

if [[ $ESLINT_ERRORS -gt 0 ]]; then
    QUALITY_SCORE=$((QUALITY_SCORE - (ESLINT_ERRORS > 20 ? 25 : ESLINT_ERRORS)))
fi

if [[ $ESLINT_WARNINGS -gt 0 ]]; then
    QUALITY_SCORE=$((QUALITY_SCORE - (ESLINT_WARNINGS > 50 ? 10 : ESLINT_WARNINGS / 5)))
fi

if [[ $BUILD_SUCCESS == false ]]; then
    QUALITY_SCORE=$((QUALITY_SCORE - 20))
fi

if [[ $SECURITY_ISSUES -gt 0 ]]; then
    QUALITY_SCORE=$((QUALITY_SCORE - (SECURITY_ISSUES > 5 ? 15 : SECURITY_ISSUES * 3)))
fi

# Ensure score doesn't go below 0
QUALITY_SCORE=$((QUALITY_SCORE < 0 ? 0 : QUALITY_SCORE))

# Generate comprehensive report
echo ""
echo "📋 ABACO Financial Intelligence - Code Quality Report"
echo "=================================================="
echo "🔍 Analysis ID: $QUALITY_TRACE_ID"
echo "📊 Overall Quality Score: $QUALITY_SCORE/100"
echo ""
echo "📈 Detailed Metrics:"
echo "   TypeScript Errors: $TS_ERRORS"
echo "   ESLint Errors: $ESLINT_ERRORS"
echo "   ESLint Warnings: $ESLINT_WARNINGS"
echo "   Build Status: $([ $BUILD_SUCCESS == true ] && echo 'PASS' || echo 'FAIL')"
echo "   Security Issues: $SECURITY_ISSUES"
echo "   Total Files: $TOTAL_FILES"
echo "   Total Lines: $TOTAL_LINES"

# Create JSON report for Azure Cosmos DB integration
REPORT_FILE="./data/quality-logs/quality_report_${QUALITY_TRACE_ID}.json"

cat > "$REPORT_FILE" << EOF
{
  "id": "quality_${QUALITY_TRACE_ID}",
  "partitionKey": "abaco_financial/CODE_QUALITY/$(date +%Y-%m-%d)",
  "tenantId": "abaco_financial",
  "customerSegment": "code_quality",
  "analysisDate": "$(date +%Y-%m-%d)",
  "documentType": "quality_analysis",
  "createdAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "updatedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "ttl": $(echo "90 * 24 * 60 * 60" | bc),
  "qualityMetrics": {
    "overallScore": $QUALITY_SCORE,
    "typescriptErrors": $TS_ERRORS,
    "eslintErrors": $ESLINT_ERRORS,
    "eslintWarnings": $ESLINT_WARNINGS,
    "buildSuccess": $BUILD_SUCCESS,
    "securityIssues": $SECURITY_ISSUES,
    "codeMetrics": {
      "totalFiles": $TOTAL_FILES,
      "totalLines": $TOTAL_LINES,
      "avgFileSize": $AVG_FILE_SIZE
    }
  },
  "aiToolkitTrace": {
    "traceId": "$QUALITY_TRACE_ID",
    "operation": "code_quality_analysis",
    "platform": "abaco_financial_intelligence",
    "analysisMethod": "docker_free",
    "toolsUsed": ["typescript", "eslint", "npm_audit"]
  },
  "recommendations": [
    $([ $TS_ERRORS -gt 0 ] && echo '"Fix TypeScript compilation errors for better type safety",' || echo '')
    $([ $ESLINT_ERRORS -gt 0 ] && echo '"Address ESLint errors for code quality improvements",' || echo '')
    $([ $BUILD_SUCCESS == false ] && echo '"Fix build issues to ensure deployability",' || echo '')
    $([ $SECURITY_ISSUES -gt 0 ] && echo '"Address security vulnerabilities with npm audit fix",' || echo '')
    "Maintain comprehensive AI Toolkit tracing for ongoing quality monitoring"
  ]
}
EOF

# Remove trailing comma if present
sed -i 's/,]/]/g' "$REPORT_FILE"

log_quality "SUCCESS" "REPORT" "Quality analysis completed - Score: $QUALITY_SCORE/100"

echo ""
echo "📄 Reports Generated:"
echo "   📋 Analysis Log: $QUALITY_LOG"
echo "   📊 JSON Report: $REPORT_FILE"
echo "   ☁️ Azure Cosmos DB Ready: HPK format included"

# Quality Score Interpretation
echo ""
if [[ $QUALITY_SCORE -ge 90 ]]; then
    echo "🎉 EXCELLENT: Code quality is excellent - ready for production!"
elif [[ $QUALITY_SCORE -ge 80 ]]; then
    echo "✅ GOOD: Code quality is good - minor improvements recommended"
elif [[ $QUALITY_SCORE -ge 70 ]]; then
    echo "⚠️ FAIR: Code quality needs improvement - address major issues"
else
    echo "❌ POOR: Code quality requires significant improvement before production"
fi

echo ""
echo "🏦 ABACO Financial Intelligence Platform - Quality Analysis Complete!"
echo "💡 Use this report for continuous improvement and compliance tracking"

log_quality "SUCCESS" "ANALYSIS" "Docker-free quality analysis completed successfully"
