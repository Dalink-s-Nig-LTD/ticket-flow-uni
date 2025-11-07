# Convex Setup Instructions

## What YOU Need to Do

### 1. Initialize Convex

```bash
npx convex dev
```

This will:

- Create a Convex account (if you don't have one)
- Initialize your Convex project
- Generate proper TypeScript types
- Give you a deployment URL

### 2. Update Environment Variable

Copy the deployment URL from the terminal and update `.env`:

```
VITE_CONVEX_URL="https://your-actual-deployment-url.convex.cloud"
```

### 3. Deploy Convex Functions

Once `npx convex dev` is running, your functions are automatically deployed.

### 4. Configure Email Service (Optional)

The email functionality in `convex/emails.ts` is a placeholder. To enable emails:

- Sign up for Resend (or another email service)
- Add your API key to Convex environment variables
- Uncomment and configure the email sending code in `convex/emails.ts`

### 5. Test the Application

- Create a ticket as a student
- Sign up as admin
- View tickets in admin dashboard (with real-time updates!)
- Update ticket status

## Key Changes

- Authentication uses simple email/password stored in Convex (you should add proper hashing in production)
- Real-time updates are automatic with Convex (no manual subscriptions needed)
- All database operations now use Convex queries and mutations

## Production Notes

⚠️ **Important**: The current auth implementation stores passwords in plain text for demonstration. Before production:

1. Implement proper password hashing (bcrypt, argon2)
2. Add proper session management
3. Consider using Convex Auth for production-ready authentication
