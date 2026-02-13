#!/bin/bash

# Deployment script for Sarina Voice Backend to Google Cloud Run

set -e  # Exit on error

echo "🚀 Deploying Sarina Voice Backend to Cloud Run..."

# Configuration
PROJECT_ID="sarina-ai-2b2c1"
REGION="us-central1"
SERVICE_NAME="sarina-voice-backend"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first."
    echo "   Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo "❌ Not authenticated with gcloud. Please run:"
    echo "   gcloud auth login"
    exit 1
fi

# Set project
echo "📦 Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    secretmanager.googleapis.com

# Build and deploy using Cloud Build
echo "🏗️  Building and deploying with Cloud Build..."
gcloud builds submit --config cloudbuild.yaml .

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --format='value(status.url)')

echo ""
echo "✅ Deployment complete!"
echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║   Sarina Voice Backend Deployed                ║"
echo "║   🌐 URL: $SERVICE_URL"
echo "║   📊 Health: $SERVICE_URL/health"
echo "║   🔗 WebSocket: wss://${SERVICE_URL#https://}"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Test health endpoint: curl $SERVICE_URL/health"
echo "2. Update React Native app with new WebSocket URL"
echo "3. Test voice call from mobile app"
echo ""
