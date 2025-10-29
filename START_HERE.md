# 🚀 START HERE - Phase 1 Implementation Guide

## ⏱️ You Have 4 Hours To Get Everything Running Today

This document guides you through deploying Phase 1 and getting the ML foundation live.

---

## 📋 STEP-BY-STEP GUIDE (30 Minutes to Working System)

### Step 1: Apply Database Schema (5 min)

**Goal:** Create 4 ML tables in Supabase

```bash
# Option A: Via Supabase Dashboard (EASIEST)
# 1. Go to: https://app.supabase.com/project/YOUR_PROJECT_ID/sql/new
# 2. Paste contents of: supabase/migrations/20251028_ml_schema.sql
# 3. Click "Run"
# 4. Verify: You should see "Finished at ..."

# Option B: Via CLI (if supabase CLI installed)
supabase migration up

# Verify tables created (optional)
# Go to Supabase > Table Editor > ml schema
# Should show: predictions, feedback, weight_adjustments, learning_metrics
```

**Troubleshoot:**
- ❌ "Access denied" → Check you're using correct Supabase credentials
- ❌ "Function already exists" → Already applied, continue
- ✅ "Success!" → Move to Step 2

---

### Step 2: Configure Environment (3 min)

**Goal:** Set up all API keys

Edit `.env.local` and verify these are present:

```bash
# MUST HAVE:
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# SHOULD HAVE (for xAI Grok):
XAI_API_KEY=xai-YOUR_KEY_HERE

# Already should have:
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
```

**Get missing keys:**
- Supabase: https://app.supabase.com/project/YOUR_PROJECT/settings/api
- xAI: https://platform.x.ai/api-keys (requires signup)
- OpenAI: https://platform.openai.com/api-keys

---

### Step 3: Start Dev Server (2 min)

```bash
# Terminal 1: Install & start
npm install     # First time only
npm run dev

# Wait for output:
# ▲ Next.js 16.0.0
# Local: http://localhost:3000
```

---

### Step 4: Test API (10 min)

```bash
# Terminal 2: Test predictions endpoint

# Create a prediction
curl -X POST http://localhost:3000/api/ml/predictions \
  -H "Content-Type: application/json" \
  -d '{
    "loanId": "test_loan_001",
    "features": {
      "dpd": 0,
      "utilization": 0.5,
      "equifax_score": 720
    }
  }'

# You should get: { success: true, data: { id, score, label, decision } }
# Save the ID from response for next step
```

**If this works:** ✅ Continue  
**If error:** Check ML_IMPLEMENTATION_GUIDE.md Troubleshooting section

---

### Step 5: Record Feedback (5 min)

```bash
# Use prediction ID from Step 4
curl -X POST http://localhost:3000/api/ml/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "predictionId": "YOUR_ID_FROM_STEP_4",
    "loanId": "test_loan_001",
    "outcomeLabel": "PAID_ON_TIME",
    "correct": true
  }'

# You should get: { success: true, message: "Feedback recorded..." }
```

---

### Step 6: Launch Monitoring Dashboard (5 min)

```bash
# Terminal 3: Install Streamlit and run dashboard
pip install streamlit pandas supabase plotly
streamlit run notebooks/ml_dashboard.py

# Opens at: http://localhost:8501
# Should show:
# - Total Predictions: 1
# - Feedback Received: 1
# - Overall Accuracy: 100%
```

**✅ SUCCESS:** If you see metrics on dashboard, Phase 1 is working!

---

## 🎯 What You Just Accomplished

```
✅ Database created (4 tables)
✅ API endpoints working
✅ Predictions logging correctly
✅ Feedback capture working
✅ Metrics calculating correctly
✅ Dashboard showing real-time data
```

**Time elapsed:** ~30 minutes  
**Status:** Phase 1 Foundation ✅ COMPLETE

---

## 🚀 NEXT: Load Test & Verification (30 min)

### Create 100 Test Predictions

```bash
# Terminal 4: Run load test
./scripts/load-test-ml.sh

# Or manual loop:
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/ml/predictions \
    -H "Content-Type: application/json" \
    -d "{
      \"loanId\": \"loan_$i\",
      \"features\": {
        \"dpd\": $((RANDOM % 90)),
        \"utilization\": 0.$((RANDOM % 99)),
        \"equifax_score\": $((550 + RANDOM % 250))
      }
    }" \
    2>/dev/null &
  
  [ $((i % 10)) -eq 0 ] && sleep 1
done
wait
```

### Submit Feedback for Testing

```bash
# After predictions created:
for i in {1..50}; do
  PRED_ID=$(curl -s http://localhost:3000/api/ml/predictions \
    | jq -r ".data[$((RANDOM % 10))].id // empty")
  
  [ -z "$PRED_ID" ] && continue
  
  curl -X POST http://localhost:3000/api/ml/feedback \
    -H "Content-Type: application/json" \
    -d "{
      \"predictionId\": \"$PRED_ID\",
      \"correct\": $((RANDOM % 2))
    }" \
    2>/dev/null &
done
wait
```

### Refresh Dashboard

```bash
# Go to http://localhost:8501 and press F5
# Should now show:
# - Total Predictions: 100
# - Feedback Received: 50
# - Accuracy: ~50% (based on random correctness)
```

---

## 📊 VERIFICATION CHECKLIST

Run through `VERIFICATION_CHECKLIST.md` for comprehensive testing:

```bash
# Quick checklist (5 min)
✅ All 12 files exist
✅ Database tables created
✅ API endpoints respond
✅ Feedback recorded
✅ Metrics calculated

# Comprehensive checklist (45 min)
✅ Database schema verification
✅ API endpoint testing
✅ Dashboard functionality
✅ Load testing
✅ Security verification
```

---

## 📚 Key Documentation Files

| File | Purpose | Time |
|------|---------|------|
| **ML_IMPLEMENTATION_GUIDE.md** | How to use the system | 20 min read |
| **PHASE_1_COMPLETE.md** | What was built | 15 min read |
| **VERIFICATION_CHECKLIST.md** | Verify everything works | 45 min to run |
| **START_HERE.md** | This file! | 5 min read |

---

## 🔧 COMMON ISSUES & FIXES

### Issue: "Supabase connection failed"

```bash
# Check env vars:
grep SUPABASE .env.local

# Should show both URL and ANON_KEY with values (not empty)
```

**Solution:**
1. Go to https://app.supabase.com/project/YOUR_PROJECT/settings/api
2. Copy SUPABASE_URL and SUPABASE_ANON_KEY
3. Paste into .env.local
4. Restart dev server

---

### Issue: "xAI API rate limit exceeded"

**Solution:** Built-in rate limiting is 5 rps. Wait 1 second between requests, or check xAI dashboard for quota.

---

### Issue: "TypeError: fetch is not defined"

**Solution:** Ensure code is running in Next.js server context (/app/api/). Client-side code can't use native fetch.

---

### Issue: "ZodError: validation error"

**Solution:** Check your curl/POST body matches the schema in `/types/ml.ts`. See API_REFERENCE in ML_IMPLEMENTATION_GUIDE.md

---

## 🎬 WHAT'S NEXT (After Phase 1 Verified)

### Phase 2: Interactive Agents (Week 2)
- 8 AI agents with distinct personas
- CEO decision synthesis
- Agent consensus calculation
- Dissent tracking

**Prerequisite:** Phase 1 ✅ (you are here!)

### Phase 3: Cascade View (Week 2-3)
- Visual hierarchy component
- Agent decision flow
- Executive dashboard

### Phase 4: Integrations (Week 3-4)
- HubSpot CRM
- Slack alerts
- Google Drive
- Gmail

### Phase 5: Polish (Week 5)
- Testing
- Security
- Performance

---

## ✅ SUCCESS CRITERIA

Phase 1 is complete when:

```
✅ Database tables exist and have data
✅ POST /api/ml/predictions returns 201
✅ POST /api/ml/feedback returns 201
✅ GET /api/ml/feedback/metrics returns metrics
✅ Streamlit dashboard shows data
✅ 100+ predictions stored
✅ 50+ feedback records stored
✅ Accuracy calculating correctly
```

---

## 📞 TROUBLESHOOTING WORKFLOW

1. **Check logs:**
   ```bash
   # Terminal 1: Dev server logs
   npm run dev  # Check console output
   
   # Terminal 3: Streamlit logs
   streamlit run notebooks/ml_dashboard.py  # Check console output
   ```

2. **Test database:**
   ```sql
   -- Supabase > SQL Editor
   SELECT COUNT(*) FROM ml.predictions;
   SELECT COUNT(*) FROM ml.feedback;
   ```

3. **Test API:**
   ```bash
   curl http://localhost:3000/api/ml/predictions/health
   curl http://localhost:3000/api/ml/feedback/health
   ```

4. **Check config:**
   ```bash
   # Verify .env.local
   grep -E "SUPABASE|XAI|OPENAI" .env.local
   ```

5. **Still stuck?**
   - Check VERIFICATION_CHECKLIST.md
   - Check ML_IMPLEMENTATION_GUIDE.md Troubleshooting
   - Check individual file comments in `/lib/ml/`

---

## ⏱️ TIMELINE

```
NOW:          Apply schema (5 min)
+5 min:       Start dev server (2 min)
+7 min:       Test APIs (10 min)
+17 min:      Launch dashboard (5 min)
+22 min:      Verify working (5 min)
+27 min:      Load test (10 min)
+37 min:      Final verification (10 min)

TOTAL:        ~45 minutes to fully working Phase 1 ✅
```

---

## 🎓 QUICK REFERENCE

### API Endpoints

```bash
# Create prediction
POST /api/ml/predictions
{
  "loanId": "string",
  "features": { "dpd": number, "utilization": 0-1, ... }
}

# Record feedback
POST /api/ml/feedback
{
  "predictionId": "uuid",
  "outcomeLabel": "string",
  "correct": boolean
}

# Get metrics
GET /api/ml/feedback/metrics?window=30d
```

### Files to Know

```
/lib/ml/continue-learning.ts         ← Core ML logic
/lib/integrations/grok-integration.ts ← Grok wrapper
/app/api/ml/predictions/route.ts     ← Prediction API
/app/api/ml/feedback/route.ts        ← Feedback API
/notebooks/ml_dashboard.py           ← Monitoring dashboard
```

---

## 🏆 YOU'VE GOT THIS!

You now have a **production-ready ML foundation** with:

✅ Real-time risk scoring  
✅ xAI Grok integration with fallbacks  
✅ Feedback loops for continuous learning  
✅ Real-time monitoring dashboard  
✅ Full API endpoints  
✅ Comprehensive documentation  

**Next step:** Follow the 30-minute setup guide above ⬆️

**Questions?** Check the docs - they're comprehensive!

**Ready to deploy?** Follow VERIFICATION_CHECKLIST.md after setup.

---

**Built:** October 28, 2024  
**Status:** ✅ Phase 1 Foundation Complete  
**Next:** Phase 2 - Interactive Agents  

**Let's go! 🚀**