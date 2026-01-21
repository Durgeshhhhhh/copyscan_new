# CopyScan - Intelligent Plagiarism Detection

CopyScan is a professional-grade plagiarism detection tool designed to protect original work through real-time web verification and private vault analysis. It allows users to scan content against billions of web pages and their own private database.

![CopyScan Banner](https://images.unsplash.com/photo-1544396821-4dd40b938ad3?auto=format&fit=crop&q=80&w=1200&h=400)

## 🚀 Key Features

- **Intelligent Web Scanner**: Uses Google Custom Search API to detect content overlap across the public web.
- **Private Vault**: Securely store your own research, papers, and articles to cross-reference against new content.
- **Side-by-Side Comparison**: Visually compare two versions of a text with intelligent highlighting of matching phrases.
- **Admin Intelligence Dashboard**: Comprehensive oversight for administrators to monitor platform growth and content stats.
- **Scan History Logs**: Real-time tracking of what users are scanning and what their results were.
- **Role Management**: Admins can promote other users to admin status directly from the dashboard.
- **Secure Authentication**: Robust user management powered by Firebase Auth.

## 👑 Setting Up the First Admin

To access the **Admin Intelligence Panel**, you must manually set your user role in Firestore for the first account:

1.  Register an account in the app.
2.  Go to **Firebase Console > Firestore Database**.
3.  Locate the `users` collection and find the document with your `uid`.
4.  Add a new field: `role` (string) = `admin`.
5.  Refresh the app. You will now see the **Admin** tab. 

## 🔒 Required Firestore Security Rules

Copy and paste these into your **Firebase Console > Firestore > Rules**. These rules allow the application to save scan logs and let you view them in the Admin Panel:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if the current user is an admin
    function isAdmin() {
      return request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }

    // Users Collection
    match /users/{userId} {
      allow read, write: if request.auth != null && (request.auth.uid == userId || isAdmin());

      // Documents subcollection (Private Vault)
      match /documents/{docId} {
        allow read, write: if request.auth != null && (request.auth.uid == userId || isAdmin());
      }

      // Scans subcollection (Plagiarism Logs)
      match /scans/{scanId} {
        allow read, write: if request.auth != null && (request.auth.uid == userId || isAdmin());
      }
    }
    
    // Collection Group Rules (Allows Admin to see all scans and docs platform-wide)
    match /{path=**}/scans/{scanId} {
      allow read: if isAdmin();
    }
    
    match /{path=**}/documents/{docId} {
      allow read: if isAdmin();
    }
  }
}
```

---

&copy; 2024 CopyScan. Built with ❤️ for original creators.