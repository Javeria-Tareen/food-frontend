// src/types/google.d.ts
export {}; // Ensure this file is treated as a module

// Extend the global Window interface
declare global {
  interface Window {
    google?: typeof google;
  }
}

// Optional: include types for Google Maps if not already installed
/// <reference types="@types/google.maps" />
