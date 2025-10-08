# Firebase Configuration Setup Guide

This project is configured to use Firebase for file storage and other services. Follow these steps to complete the Firebase setup:

## 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your existing project: `exe201-aidonia`
3. Go to Project Settings (gear icon)
4. In the "General" tab, scroll down to "Your apps"
5. Click "Add app" and select "Web" (</>) if you haven't already
6. Register your app with a nickname (e.g., "Aidonia Web App")
7. Copy the Firebase configuration object

## 2. Environment Variables

Replace the placeholder values in `.env.local` with your actual Firebase configuration:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=exe201-aidonia.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=exe201-aidonia
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=exe201-aidonia.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## 3. Firebase Services Configuration

### Storage Rules (Required for file uploads)

Go to Firebase Console > Storage > Rules and update to:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Firestore Rules (Optional, if using database)

Go to Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 4. Usage Examples

### Basic File Upload

```typescript
import { useFirebaseUpload } from "@/hooks/useFirebaseUpload";

const MyComponent = () => {
  const { uploadImage, isUploading, downloadURL, error } = useFirebaseUpload();

  const handleUpload = async (file: File) => {
    try {
      const url = await uploadImage(file, "user-uploads");
      console.log("Upload successful:", url);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };
};
```

### Avatar Upload

```typescript
import { uploadAvatar } from "@/services/firebaseUtils";

const uploadUserAvatar = async (file: File, userId: string) => {
  const avatarURL = await uploadAvatar(file, userId);
  // Update user profile with avatarURL
};
```

### Using the Upload Component

```typescript
import FirebaseFileUpload from '@/components/Common/FirebaseFileUpload';

const MyPage = () => {
  return (
    <FirebaseFileUpload
      onUploadComplete={(url) => console.log('File uploaded:', url)}
      folder="product-images"
      maxSize={5} // 5MB limit
      acceptedTypes="image/*"
    />
  );
};
```

## 5. Available Functions

### Storage Utilities (`firebaseUtils.ts`)

- `uploadFile(file, path, metadata?)` - Upload any file
- `uploadImage(file, folder?, userId?)` - Upload image with auto-path
- `uploadAvatar(file, userId)` - Upload user avatar
- `uploadProductImage(file, productId?)` - Upload product image
- `deleteFile(path)` - Delete file from storage
- `getFileURL(path)` - Get download URL for existing file
- `listFiles(folderPath)` - List all files in folder

### React Hook (`useFirebaseUpload.ts`)

- `uploadFile(file, path)` - Upload with loading states
- `uploadImage(file, folder?, userId?)` - Upload image with states
- `uploadAvatar(file, userId)` - Upload avatar with states
- `uploadProductImage(file, productId?)` - Upload product image
- `isUploading` - Loading state
- `error` - Error message
- `downloadURL` - Successful upload URL
- `resetUpload()` - Reset all states

## 6. File Organization Structure

```
storage/
├── avatars/
│   └── {userId}/
│       └── {timestamp}.{ext}
├── products/
│   └── {productId}/
│       └── {timestamp}.{ext}
├── images/
│   └── {timestamp}.{ext}
└── uploads/
    └── {timestamp}.{ext}
```

## 7. Security Notes

- All uploads require authentication (user must be signed in)
- Files are organized by user/product to prevent conflicts
- File names include timestamps to ensure uniqueness
- Storage rules can be customized based on your security needs

## 8. Testing Firebase Connection

1. Start your development server: `npm run dev`
2. Navigate to a page with file upload functionality
3. Try uploading a file
4. Check Firebase Storage console to see uploaded files
5. Check browser console for any error messages

## Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/configuration-not-found)"**
   - Check if all environment variables are set correctly
   - Verify Firebase config in `.env.local`

2. **"FirebaseError: Missing or insufficient permissions"**
   - Update Firebase Storage rules
   - Ensure user is authenticated before upload

3. **"Network Error"**
   - Check if Firebase project is active
   - Verify internet connection
   - Check browser console for CORS issues

4. **Files not appearing in Storage**
   - Verify the correct project is selected in Firebase Console
   - Check storage rules allow write permissions
   - Ensure the storage bucket name matches your project

For more help, check the [Firebase Documentation](https://firebase.google.com/docs) or the browser console for specific error messages.
