/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global document, Office */

import { supabase, isSupabaseConfigured, testSupabaseConnection } from '../supabase/client';
import { auth, db } from '../supabase/service';

Office.onReady((info) => {
  if (info.host === Office.HostType.PowerPoint) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    
    // Setup button click handlers
    document.getElementById("run").onclick = run;
    document.getElementById("test-connection").onclick = testConnection;
    document.getElementById("save-data").onclick = saveData;
    document.getElementById("load-data").onclick = loadData;
    
    // Check Supabase status on load
    checkSupabaseStatus();
  }
});

/**
 * Check and display Supabase connection status
 */
async function checkSupabaseStatus() {
  const statusEl = document.getElementById("supabase-status");
  
  if (!isSupabaseConfigured()) {
    statusEl.className = "ms-MessageBar ms-MessageBar--warning";
    statusEl.querySelector(".ms-MessageBar-text").textContent = 
      "⚠️ Supabase not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env file.";
    return;
  }
  
  const connected = await testSupabaseConnection();
  
  if (connected) {
    statusEl.className = "ms-MessageBar ms-MessageBar--success";
    statusEl.querySelector(".ms-MessageBar-text").textContent = 
      "✅ Connected to Supabase successfully!";
  } else {
    statusEl.className = "ms-MessageBar ms-MessageBar--error";
    statusEl.querySelector(".ms-MessageBar-text").textContent = 
      "❌ Failed to connect to Supabase. Check your credentials.";
  }
}

/**
 * Insert text into PowerPoint slide
 */
export async function run() {
  try {
    const options = { coercionType: Office.CoercionType.Text };
    await Office.context.document.setSelectedDataAsync(" ", options);
    await Office.context.document.setSelectedDataAsync(
      "Hello from Office Add-in with Supabase! 🚀", 
      options
    );
    
    showOutput("✅ Text inserted successfully!", "success");
  } catch (error) {
    showOutput("❌ Error inserting text: " + error.message, "error");
  }
}

/**
 * Test Supabase connection
 */
async function testConnection() {
  showOutput("Testing Supabase connection...", "info");
  
  if (!isSupabaseConfigured()) {
    showOutput("❌ Supabase not configured. Check your .env file.", "error");
    return;
  }
  
  const connected = await testSupabaseConnection();
  
  if (connected) {
    showOutput("✅ Supabase connection successful!", "success");
  } else {
    showOutput("❌ Supabase connection failed. Check console for details.", "error");
  }
}

/**
 * Save data to Supabase (example)
 */
async function saveData() {
  showOutput("Saving data to Supabase...", "info");
  
  if (!isSupabaseConfigured()) {
    showOutput("❌ Supabase not configured. Check your .env file.", "error");
    return;
  }
  
  try {
    // Example: Save to a 'documents' table
    // You'll need to create this table in your Supabase project
    const data = {
      title: "Office Add-in Document",
      content: "Sample content from Office",
      created_at: new Date().toISOString()
    };
    
    const { data: result, error } = await db.insert('documents', data);
    
    if (error) {
      console.error('Supabase error:', error);
      showOutput(`❌ Error: ${error.message}`, "error");
    } else {
      console.log('Data saved:', result);
      showOutput("✅ Data saved successfully!", "success");
    }
  } catch (error) {
    console.error('Error:', error);
    showOutput(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Load data from Supabase (example)
 */
async function loadData() {
  showOutput("Loading data from Supabase...", "info");
  
  if (!isSupabaseConfigured()) {
    showOutput("❌ Supabase not configured. Check your .env file.", "error");
    return;
  }
  
  try {
    // Example: Load from 'documents' table
    const { data, error } = await db.select('documents', '*');
    
    if (error) {
      console.error('Supabase error:', error);
      showOutput(`❌ Error: ${error.message}`, "error");
    } else {
      console.log('Data loaded:', data);
      
      if (data && data.length > 0) {
        const count = data.length;
        showOutput(`✅ Loaded ${count} record${count !== 1 ? 's' : ''} from Supabase!`, "success");
      } else {
        showOutput("ℹ️ No records found in database", "info");
      }
    }
  } catch (error) {
    console.error('Error:', error);
    showOutput(`❌ Error: ${error.message}`, "error");
  }
}

/**
 * Display output message
 * @param {string} message - Message to display
 * @param {string} type - Message type: 'success', 'error', 'info'
 */
function showOutput(message, type = "info") {
  const outputEl = document.getElementById("demo-output");
  const icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
  outputEl.innerHTML = `<p class="ms-font-m">${icon} ${message}</p>`;
  console.log(message);
}

