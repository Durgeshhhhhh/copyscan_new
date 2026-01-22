# CopyScan:- Intelligent Plagiarism Detection

CopyScan is a professional-grade plagiarism detection tool designed to protect original work through real-time web verification and private vault analysis. It allows users to scan content against billions of web pages and their own private database.


## Key Features

- **Intelligent Web Scanner**: Uses Google Custom Search API to detect content overlap across the public web.
- **Private Vault**: Securely store your own research, papers, and articles to cross-reference against new content.
- **Side-by-Side Comparison**: Visually compare two versions of a text with intelligent highlighting of matching phrases.
- **Admin Intelligence Dashboard**: Comprehensive oversight for administrators to monitor platform growth and content stats.
- **Secure Authentication**: Robust user management powered by Firebase Auth.
- **Report Generation**: Export authenticity reports as downloadable HTML files.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, FontAwesome
- **Backend/Database**: Firebase (Authentication & Firestore)
- **API**: Google Custom Search JSON API

## Prerequisites

Before you begin, ensure you have the following:

1.  A **Firebase Project** (Google Cloud Console).
2.  A **Google Custom Search Engine (CX)** ID.
3.  A **Google Cloud API Key** with Custom Search API enabled.

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Durgeshhhhhh/copyscan_v2.git
   cd copyscan_app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```


3. **Start Development Server**:
   ```bash
   npm run dev
   ```

## Firestore Security Rules

To ensure user data privacy, copy and paste the following rules into your **Firebase Console > Firestore > Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /users/{userId} {
      allow read, write: if request.auth != null && (request.auth.uid == userId || isAdmin());
      
      match /documents/{docId} {
        allow read, write: if request.auth != null && (request.auth.uid == userId || isAdmin());
      }
    }
    
    // Required for Admin Panel listing
    match /{path=**}/documents/{docId} {
      allow read: if isAdmin();
    }
  }
}
```

## Deployment (Vercel)

This project is pre-configured for Vercel deployment.

1. Connect your GitHub repository to Vercel.
2. In the Vercel dashboard, add all variables from your `.env` to the **Environment Variables** section.
3. The `vercel.json` ensures proper routing for the React Single Page Application (SPA).

---
