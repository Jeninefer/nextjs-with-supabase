# Validation Results - Access Instructions

## 🎯 Summary

A complete validation system has been implemented for loan data analysis. Results are available through a professional web interface.

## 📊 How to View Results

### Option 1: Web Interface (Recommended)

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Open your browser and visit:**

   ```
   http://localhost:3000/dashboard/validation
   ```

3. **You will see:**
   - ✅ Validation status (APPROVED)
   - 📈 Summary statistics
   - 📋 Monthly transfers and operations
   - 💰 Monthly average amounts
   - 💵 Monthly outstanding balance

### Option 2: JSON API

For integration with other systems:

```bash
curl http://localhost:3000/api/validation-results
```

**Example JSON response:**

```json
{
  "validation_status": "APPROVED",
  "summary_statistics": {
    "total_loans": 120,
    "total_amount": 350000,
    "average_amount": 2916.67
  },
  "monthly_transfers_operations": [
    { "month": "2024-01", "transfers": 15, "operations": 20 },
    { "month": "2024-02", "transfers": 12, "operations": 18 }
  ],
  "monthly_averages": [
    { "month": "2024-01", "average_amount": 3000 },
    { "month": "2024-02", "average_amount": 2850 }
  ],
  "outstanding_balance": [
    { "month": "2024-01", "balance": 50000 },
    { "month": "2024-02", "balance": 48000 }
  ]
}
```

### Option 3: CSV Files

Results are also available in CSV format:
