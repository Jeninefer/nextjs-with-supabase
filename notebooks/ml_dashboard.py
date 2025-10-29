#!/usr/bin/env python3
"""
ABACO ML Continue Learning Dashboard
Real-time monitoring of prediction accuracy and model performance

Requirements:
    pip install streamlit pandas supabase requests plotly
"""

import os
import sys
from datetime import datetime, timedelta
from typing import Optional

import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
import requests
import streamlit as st
from supabase import create_client

# Configuration
SUPABASE_URL = os.environ.get("SUPABASE_URL") or st.secrets.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or st.secrets.get("SUPABASE_SERVICE_ROLE_KEY")
NEXT_API_URL = os.environ.get("NEXT_API_URL", "http://localhost:3000")

# Initialize Supabase client
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    supabase = None

st.set_page_config(page_title="ABACO ML Dashboard", layout="wide", initial_sidebar_state="expanded")

# CSS styling
st.markdown("""
<style>
    .metric-card {
        background-color: #f0f2f6;
        padding: 20px;
        border-radius: 8px;
        margin: 10px 0;
    }
    .status-high { color: #d62728; font-weight: bold; }
    .status-medium { color: #ff7f0e; font-weight: bold; }
    .status-low { color: #2ca02c; font-weight: bold; }
</style>
""", unsafe_allow_html=True)

# Header
st.title("🤖 ABACO ML Continue Learning Dashboard")
st.markdown("Real-time monitoring of prediction accuracy and model performance")

# Sidebar
with st.sidebar:
    st.header("Configuration")
    window_days = st.slider("Metrics Window (days)", 1, 90, 30)
    refresh_interval = st.slider("Refresh Interval (seconds)", 5, 60, 10)
    
    if st.button("🔄 Refresh Data"):
        st.rerun()

# Main dashboard
if not supabase:
    st.error("❌ Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
    st.stop()

try:
    # Fetch predictions
    response = supabase.from_("ml.predictions").select("*").order("created_at", desc=True).limit(1000).execute()
    predictions_data = response.data
    
    # Fetch feedback
    response = supabase.from_("ml.feedback").select("*").order("created_at", desc=True).execute()
    feedback_data = response.data
    
    # Fetch metrics
    response = supabase.from_("ml.learning_metrics").select("*").order("created_at", desc=True).limit(100).execute()
    metrics_data = response.data
    
    # Convert to DataFrames
    predictions_df = pd.DataFrame(predictions_data) if predictions_data else pd.DataFrame()
    feedback_df = pd.DataFrame(feedback_data) if feedback_data else pd.DataFrame()
    metrics_df = pd.DataFrame(metrics_data) if metrics_data else pd.DataFrame()
    
except Exception as e:
    st.error(f"Error fetching data: {str(e)}")
    st.stop()

# Top metrics
col1, col2, col3, col4 = st.columns(4)

with col1:
    total_predictions = len(predictions_df)
    st.metric("Total Predictions", total_predictions, delta=None)

with col2:
    total_feedback = len(feedback_df)
    st.metric("Feedback Received", total_feedback, delta=None)

with col3:
    if len(feedback_df) > 0:
        accuracy = (feedback_df["correct"].sum() / len(feedback_df)) * 100
        st.metric("Overall Accuracy", f"{accuracy:.1f}%", delta=None)
    else:
        st.metric("Overall Accuracy", "—", delta=None)

with col4:
    if len(feedback_df) > 0:
        brier_scores = []
        for _, row in feedback_df.iterrows():
            pred_id = row.get("prediction_id")
            if pred_id and not predictions_df.empty:
                pred = predictions_df[predictions_df["id"] == pred_id]
                if not pred.empty:
                    score = float(pred.iloc[0]["score"])
                    actual = 1.0 if row.get("correct") else 0.0
                    brier_scores.append((score - actual) ** 2)
        
        if brier_scores:
            avg_brier = sum(brier_scores) / len(brier_scores)
            st.metric("Avg Brier Score", f"{avg_brier:.3f}", delta=None)
        else:
            st.metric("Avg Brier Score", "—", delta=None)
    else:
        st.metric("Avg Brier Score", "—", delta=None)

st.divider()

# Prediction score distribution
col1, col2 = st.columns(2)

with col1:
    if not predictions_df.empty:
        st.subheader("Prediction Score Distribution")
        
        # Create histogram
        fig = go.Figure()
        fig.add_trace(go.Histogram(
            x=predictions_df["score"],
            nbinsx=20,
            marker=dict(color="rgba(0, 100, 200, 0.7)"),
            name="Score"
        ))
        fig.update_layout(
            xaxis_title="Risk Score (0.0 - 1.0)",
            yaxis_title="Frequency",
            height=400,
            template="plotly_white"
        )
        st.plotly_chart(fig, use_container_width=True)

with col2:
    if not predictions_df.empty:
        st.subheader("Prediction Label Distribution")
        
        label_counts = predictions_df["label"].value_counts()
        colors = {"HIGH": "#d62728", "MEDIUM": "#ff7f0e", "LOW": "#2ca02c"}
        
        fig = go.Figure(data=[
            go.Pie(
                labels=label_counts.index,
                values=label_counts.values,
                marker=dict(colors=[colors.get(label, "#999") for label in label_counts.index])
            )
        ])
        fig.update_layout(height=400, template="plotly_white")
        st.plotly_chart(fig, use_container_width=True)

st.divider()

# Accuracy over time
if not feedback_df.empty and not predictions_df.empty:
    st.subheader("Accuracy Trend (7-day rolling window)")
    
    # Create time series
    feedback_df_copy = feedback_df.copy()
    feedback_df_copy["created_at"] = pd.to_datetime(feedback_df_copy["created_at"])
    feedback_df_copy = feedback_df_copy.sort_values("created_at")
    
    # Calculate rolling accuracy
    feedback_df_copy["correct_int"] = feedback_df_copy["correct"].astype(int)
    feedback_df_copy["rolling_acc"] = feedback_df_copy["correct_int"].rolling(window=7, min_periods=1).mean() * 100
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=feedback_df_copy["created_at"],
        y=feedback_df_copy["rolling_acc"],
        mode="lines+markers",
        name="Accuracy",
        line=dict(color="rgb(31, 119, 180)", width=2),
        marker=dict(size=4)
    ))
    fig.update_layout(
        xaxis_title="Date",
        yaxis_title="Accuracy (%)",
        height=400,
        template="plotly_white",
        hovermode="x unified"
    )
    st.plotly_chart(fig, use_container_width=True)

st.divider()

# Recent predictions table
st.subheader("Recent Predictions")

if not predictions_df.empty:
    display_cols = ["id", "loan_id", "score", "label", "model_version", "created_at"]
    available_cols = [col for col in display_cols if col in predictions_df.columns]
    
    df_display = predictions_df[available_cols].head(20).copy()
    
    # Format score column
    if "score" in df_display.columns:
        df_display["score"] = df_display["score"].apply(lambda x: f"{float(x):.3f}")
    
    st.dataframe(df_display, use_container_width=True)
else:
    st.info("No predictions yet")

st.divider()

# Recent feedback table
st.subheader("Recent Feedback")

if not feedback_df.empty:
    display_cols = ["prediction_id", "loan_id", "outcome_label", "correct", "comments", "created_at"]
    available_cols = [col for col in display_cols if col in feedback_df.columns]
    
    df_display = feedback_df[available_cols].head(20).copy()
    
    # Format correct column
    if "correct" in df_display.columns:
        df_display["correct"] = df_display["correct"].apply(lambda x: "✅" if x else "❌")
    
    st.dataframe(df_display, use_container_width=True)
else:
    st.info("No feedback yet")

st.divider()

# Model metrics history
st.subheader("Model Performance Metrics History")

if not metrics_df.empty:
    # Parse metrics JSON
    metrics_df["metrics_parsed"] = metrics_df["metrics"].apply(
        lambda x: x if isinstance(x, dict) else {}
    )
    
    # Extract values
    metrics_df["accuracy"] = metrics_df["metrics_parsed"].apply(lambda x: x.get("acc", None))
    metrics_df["brier"] = metrics_df["metrics_parsed"].apply(lambda x: x.get("brier", None))
    
    # Convert timestamp
    metrics_df["created_at"] = pd.to_datetime(metrics_df["created_at"])
    
    # Filter by window
    metrics_df = metrics_df.sort_values("created_at", ascending=False)
    
    col1, col2 = st.columns(2)
    
    with col1:
        # Accuracy trend
        if metrics_df["accuracy"].notna().any():
            fig = go.Figure()
            fig.add_trace(go.Scatter(
                x=metrics_df["created_at"],
                y=metrics_df["accuracy"] * 100,
                mode="lines+markers",
                name="Accuracy",
                line=dict(color="rgb(31, 119, 180)", width=2)
            ))
            fig.update_layout(
                title="Accuracy Over Time",
                xaxis_title="Date",
                yaxis_title="Accuracy (%)",
                height=350,
                template="plotly_white"
            )
            st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        # Brier score trend
        if metrics_df["brier"].notna().any():
            fig = go.Figure()
            fig.add_trace(go.Scatter(
                x=metrics_df["created_at"],
                y=metrics_df["brier"],
                mode="lines+markers",
                name="Brier Score",
                line=dict(color="rgb(214, 39, 40)", width=2)
            ))
            fig.update_layout(
                title="Brier Score Over Time (lower is better)",
                xaxis_title="Date",
                yaxis_title="Brier Score",
                height=350,
                template="plotly_white"
            )
            st.plotly_chart(fig, use_container_width=True)

# Footer
st.divider()
st.markdown("""
---
**ABACO ML Continue Learning Dashboard**  
Last updated: {}  
Refresh interval: {} seconds

**Metrics Explanation:**
- **Accuracy**: % of predictions marked correct
- **Brier Score**: Mean squared error between predicted probability and actual outcome (lower is better)
- **Risk Score**: 0.0 (low risk) to 1.0 (high risk)
- **Label**: HIGH (score ≥ 0.5), MEDIUM (0.25-0.5), LOW (< 0.25)
""".format(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), refresh_interval), unsafe_allow_html=True)

st.info("""
📌 **Next Steps:**
1. Create predictions via `/api/ml/predictions`
2. Record feedback via `/api/ml/feedback` after 30-90 days
3. Monitor metrics in this dashboard
4. Retrain model when accuracy drops below threshold
""")