/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global document, Office */

import { supabase, isSupabaseConfigured, testSupabaseConnection } from "../supabase/client";
import { auth, db } from "../supabase/service";
import { figma, validateFigmaConfig } from "../api/figma";
import { openai, validateOpenAIConfig } from "../api/openai";
import { xai, validateXAIConfig } from "../api/xai";

Office.onReady((info) => {
  if (info.host === Office.HostType.PowerPoint) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";

    // Setup button click handlers
    document.getElementById("run").onclick = run;
    document.getElementById("test-connection").onclick = testConnection;
    document.getElementById("import-figma").onclick = importFromFigma;
    document.getElementById("generate-content").onclick = generateContent;

    // Check system status on load
    checkSystemStatus();
  }
});

/**
 * Check and display system status
 */
async function checkSystemStatus() {
  const statusEl = document.getElementById("system-status");
  const statuses = [];

  // Check Supabase
  if (isSupabaseConfigured()) {
    const connected = await testSupabaseConnection();
    statuses.push(connected ? "✅ Supabase" : "⚠️ Supabase (error)");
  } else {
    statuses.push("❌ Supabase (not configured)");
  }

  // Check Figma
  statuses.push(validateFigmaConfig() ? "✅ Figma API" : "❌ Figma API (not configured)");

  // Check OpenAI
  statuses.push(validateOpenAIConfig() ? "✅ OpenAI" : "❌ OpenAI (not configured)");

  // Check xAI
  statuses.push(validateXAIConfig() ? "✅ xAI" : "❌ xAI (not configured)");

  statusEl.querySelector(".ms-MessageBar-text").textContent = statuses.join(" | ");
}

/**
 * Insert text into PowerPoint slide
 */
export async function run() {
  try {
    const options = { coercionType: Office.CoercionType.Text };
    await Office.context.document.setSelectedDataAsync(" ", options);
    await Office.context.document.setSelectedDataAsync(
      "Hello from Figma Office Add-in! 🚀",
      options
    );

    showOutput("✅ Text inserted successfully!");
  } catch (error) {
    showOutput("❌ Error: " + error.message);
  }
}

/**
 * Test Supabase connection
 */
async function testConnection() {
  showOutput("Testing connections...");

  const results = [];

  // Test Supabase
  if (isSupabaseConfigured()) {
    const connected = await testSupabaseConnection();
    results.push(connected ? "✅ Supabase: Connected" : "❌ Supabase: Failed");
  } else {
    results.push("❌ Supabase: Not configured");
  }

  // Test Figma
  try {
    if (validateFigmaConfig()) {
      await figma.getFile();
      results.push("✅ Figma: Connected");
    } else {
      results.push("❌ Figma: Not configured");
    }
  } catch (error) {
    results.push("❌ Figma: " + error.message);
  }

  showOutput(results.join("<br>"));
}

/**
 * Import design from Figma
 */
async function importFromFigma() {
  showOutput("Importing from Figma...");

  if (!validateFigmaConfig()) {
    showOutput("❌ Figma not configured");
    return;
  }

  try {
    // Get Figma file: nuVKwuPuLS7VmLFvqzOX1G
    const file = await figma.getFile();
    const frame = await figma.getFrame("nuVKwuPuLS7VmLFvqzOX1G", "Deck 2");

    if (frame) {
      showOutput(`✅ Imported "${frame.name}" from Figma`);

      // Extract text content
      const textNodes = await figma.extractText("nuVKwuPuLS7VmLFvqzOX1G");
      console.log("Text nodes:", textNodes);
    } else {
      showOutput("⚠️ Frame 'Deck 2' not found");
    }
  } catch (error) {
    showOutput("❌ Error: " + error.message);
    console.error(error);
  }
}

/**
 * Generate AI content
 */
async function generateContent() {
  showOutput("Generating AI content...");

  if (!validateOpenAIConfig() && !validateXAIConfig()) {
    showOutput("❌ No AI service configured");
    return;
  }

  try {
    let content;

    if (validateOpenAIConfig()) {
      content = await openai.generateSlideContent("Office Add-ins Integration", 1, 5);
      showOutput(`✅ Generated: ${content.title}<br>${content.bullets.join("<br>")}`);
    } else if (validateXAIConfig()) {
      content = await xai.complete("Generate a brief overview of Office Add-ins integration");
      showOutput(`✅ Generated: ${content}`);
    }

    // Save to Supabase if configured
    if (isSupabaseConfigured() && content) {
      await db.insert("generated_content", {
        content: JSON.stringify(content),
        created_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    showOutput("❌ Error: " + error.message);
    console.error(error);
  }
}

/**
 * Display output message
 */
function showOutput(message) {
  const outputEl = document.getElementById("output-area");
  outputEl.innerHTML = `<p class="ms-font-m">${message}</p>`;
  console.log(message);
}
