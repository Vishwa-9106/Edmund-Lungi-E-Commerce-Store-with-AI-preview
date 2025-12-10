# 🚀 Quick Start Guide - Firebase Setup

## ⚡ 3-Minute Setup

### Step 1: Open Firebase Console
Visit: https://console.firebase.google.com/project/edmund-lungi

### Step 2: Enable Authentication (2 clicks)
1. Click **Authentication** in left sidebar
2. Click **Get Started**
3. Click **Email/Password** → Toggle ON → Save
4. Click **Google** → Toggle ON → Save

### Step 3: Create Firestore Database (3 clicks)
1. Click **Firestore Database** in left sidebar  
2. Click **Create Database**
3. Select **Test mode** → Next
4. Choose region: **asia-south1** → Enable

### Step 4: Test Your App
```bash
# Your dev server should already be running
# If not, run: npm start

# Open in browser:
http://localhost:5173/signup
```

1. **Sign up** with email/password OR Google
2. **Check Firestore** → You should see a new user in `users` collection
3. **Check Authentication** → You should see the user listed

---

## ✅ That's It!

You now have:
- ✅ Firebase Authentication working
- ✅ User profiles in Firestore
- ✅ Google Sign-In enabled
- ✅ Real-time database ready

---

## 📝 Next: Add Products

Create your first product manually in Firestore:

1. Go to **Firestore Database**
2. Click **Start collection**
3. Collection ID: `products`
4. Add document with these fields:
   ```
   name: "Premium Cotton Lungi"
   description: "High quality traditional lungi"
   price: 599
   category: "traditional"
   images: ["https://placeholder.com/400"]
   inStock: true
   quantity: 50
   ```
5. Auto-generate ID
6. Save

Then use the examples in `firebase-examples.tsx` to fetch and display products!

---

## 🔐 Make Yourself Admin

1. **Sign up** on your site
2. Go to **Firestore Database**
3. Click **users** collection
4. Find your user document
5. Click it
6. Find the `role` field
7. Change value from `"customer"` to `"admin"`
8. Save
9. Log out and log back in
10. You'll now be redirected to `/admin` instead of `/dashboard`

---

## 🆘 Troubleshooting

**Error: "Firebase: Error (auth/configuration-not-found)"**
→ Enable Email/Password in Firebase Console → Authentication

**Error: "Missing or insufficient permissions"**
→ Make sure Firestore is in Test Mode (Rules tab)

**Users not saving to Firestore**
→ Check Firestore Database is created

**Google Sign-In not working**
→ Enable Google provider in Authentication → Sign-in method

---

## 📚 Full Documentation
See `FIREBASE_INTEGRATION_SUMMARY.md` for detailed documentation and examples.
