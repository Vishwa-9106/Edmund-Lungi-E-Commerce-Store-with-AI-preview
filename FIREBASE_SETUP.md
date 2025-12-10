# Firebase Setup Documentation

## Overview
This project is now integrated with Firebase for Authentication and Firestore Database.

## Firebase Configuration
The Firebase configuration is located in `src/lib/firebase.ts` with the following services initialized:
- **Authentication** (Firebase Auth)
- **Firestore Database**
- **Storage** (Firebase Storage)
- **Analytics** (Firebase Analytics)

## Project Setup
```json
{
  "projectId": "edmund-lungi",
  "storageBucket": "edmund-lungi.firebasestorage.app",
  "messagingSenderId": "757821326336",
  "appId": "1:757821326336:web:74623875ce41d1951d04e5"
}
```

## Authentication

### Available Auth Functions
Located in `src/lib/auth.ts`:

- `signUp(email, password, displayName?)` - Create a new user account
- `signIn(email, password)` - Sign in with email/password
- `signInWithGoogle()` - Sign in with Google OAuth
- `logout()` - Sign out current user
- `resetPassword(email)` - Send password reset email
- `getCurrentUser()` - Get the current authenticated user
- `subscribeToAuthChanges(callback)` - Listen to auth state changes

### Using Authentication in Components

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout, loginWithGoogle } = useAuth();

  const handleLogin = async () => {
    const success = await login('user@example.com', 'password123');
    if (success) {
      console.log('Logged in!');
    }
  };

  const handleGoogleLogin = async () => {
    const success = await loginWithGoogle();
    if (success) {
      console.log('Logged in with Google!');
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user?.name}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleGoogleLogin}>Login with Google</button>
        </>
      )}
    </div>
  );
}
```

## Firestore Database

### Available Firestore Functions
Located in `src/lib/firestore.ts`:

- `addDocument(collection, data)` - Add a document with auto-generated ID
- `setDocument(collection, documentId, data, merge?)` - Set/update a document with specific ID
- `getDocument(collection, documentId)` - Get a single document
- `getDocuments(collection, constraints?)` - Get multiple documents with optional query constraints
- `updateDocument(collection, documentId, data)` - Update specific fields in a document
- `deleteDocument(collection, documentId)` - Delete a document
- `subscribeToDocument(collection, documentId, callback)` - Real-time listener for a single document
- `subscribeToCollection(collection, callback, constraints?)` - Real-time listener for a collection

### Using Firestore in Components

```tsx
import { addDocument, getDocuments, subscribeToCollection, where, orderBy } from '@/lib/firestore';

// Add a product
async function addProduct() {
  const productId = await addDocument('products', {
    name: 'Premium Lungi',
    price: 599,
    category: 'traditional',
    inStock: true
  });
  console.log('Product added with ID:', productId);
}

// Get all products
async function getProducts() {
  const products = await getDocuments('products');
  console.log('Products:', products);
}

// Get products with filters
async function getFilteredProducts() {
  const products = await getDocuments('products', [
    where('category', '==', 'traditional'),
    where('inStock', '==', true),
    orderBy('price', 'desc')
  ]);
  console.log('Filtered products:', products);
}

// Real-time subscription
function ProductsList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(
      'products',
      (data) => setProducts(data),
      [where('inStock', '==', true)]
    );

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name} - ₹{product.price}</div>
      ))}
    </div>
  );
}
```

## Firebase Collections Structure

### Users Collection (`users`)
```typescript
{
  id: string;           // Firebase Auth UID
  name: string;
  email: string;
  role: "customer" | "admin";
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Suggested Collections for E-commerce

#### Products Collection (`products`)
```typescript
{
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  inStock: boolean;
  quantity: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Orders Collection (`orders`)
```typescript
{
  id: string;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: object;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### Cart Collection (`carts`)
```typescript
{
  id: string;          // Same as userId
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  updatedAt: Timestamp;
}
```

## Firebase Security Rules

### Enable Firebase in Console
Before using the database, you need to:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `edmund-lungi`
3. Enable **Authentication** → **Sign-in methods** → Enable Email/Password and Google
4. Set up **Firestore Database** with the following security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Products collection
    match /products/{productId} {
      allow read: if true;  // Anyone can read products
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read: if request.auth.uid == resource.data.userId || 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Carts collection
    match /carts/{cartId} {
      allow read, write: if request.auth.uid == cartId;
    }
  }
}
```

5. Enable **Storage** with appropriate rules for product images

## Environment Variables (Optional)
For better security, you can move Firebase credentials to environment variables:

Create `.env`:
```env
VITE_FIREBASE_API_KEY=AIzaSyAYA1CmRDIYan8B7w8jGWiLVDiAS81Dtiw
VITE_FIREBASE_AUTH_DOMAIN=edmund-lungi.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=edmund-lungi
VITE_FIREBASE_STORAGE_BUCKET=edmund-lungi.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=757821326336
VITE_FIREBASE_APP_ID=1:757821326336:web:74623875ce41d1951d04e5
VITE_FIREBASE_MEASUREMENT_ID=G-LL21W4H327
```

Update `src/lib/firebase.ts`:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ... other fields
};
```

## Next Steps
1. ✅ Firebase is installed and configured
2. ✅ Authentication is integrated with AuthContext
3. ✅ Firestore utilities are available
4. 🔲 Enable Firebase services in Firebase Console
5. 🔲 Set up Firestore security rules
6. 🔲 Update your login/signup components to use the new Firebase auth
7. 🔲 Create database collections for products, orders, etc.

## Resources
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
