# TaskMaster Pro - Complete Setup & Features

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ (LTS recommended)
- MongoDB (Cloud Atlas or Local)
- npm or yarn

### Installation

1. **Clone/Open the Project**
   ```bash
   cd TaskMaster-Pro
   ```

2. **Set Up Environment Variables**
   
   Copy `.env.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/taskmaster-pro
   JWT_SECRET=your-generated-secret-key
   NODE_ENV=development
   ```

   **To generate a secure JWT secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   Open http://localhost:3000 in your browser

---

## 🔐 Authentication System

### User Registration
1. Click **"Sign Up"** on the login page
2. Create an account with:
   - Unique username
   - Valid email
   - Password (minimum 6 characters)
3. Your password is securely hashed using bcrypt
4. You'll be automatically logged in after registration

### User Login
1. Enter your email and password
2. Receive a JWT token (valid for 7 days)
3. Token is stored securely in httpOnly cookies
4. Automatically redirected to dashboard

### Session Management
- JWT tokens expire after 7 days
- You'll need to log in again after expiration
- Logout clears your token and redirects to login
- Token is required for all task operations

---

## ✅ Task Management Features

### Create Tasks
1. Go to Dashboard
2. Click **"Create Task"** button or use the quick-create form
3. Enter:
   - Task title (required)
   - Description (optional)
   - Due date and time (required)
   - Priority flag (optional)
   - Reminder settings (optional)

### View Tasks
**Dashboard Tabs:**
- **All Tasks**: See all your active tasks
- **Today**: Tasks due today
- **Upcoming**: Tasks due within next 7 days
- **Completed**: View finished tasks

### Edit Tasks
1. Click on any task
2. Modify the details
3. Save changes
4. Tasks update in real-time

### Complete Tasks
- Click the checkbox next to a task
- Task moves to "Completed" section
- Completion timestamp is recorded
- Can be undone by unchecking

### Delete Tasks
- Click the delete icon on any task
- Confirm deletion
- Task is permanently removed from your account

---

## 🔔 Notifications & Reminders

### Notification Types

**1. Overdue Notifications**
- Shows when task due date has passed
- Red indicator with "Overdue since..." message
- Helps you catch missed tasks

**2. Due Soon Notifications**
- Appears 24 hours before task is due
- Shows countdown (e.g., "Due in 3h 45m")
- Prevents last-minute surprises

**3. Custom Reminders**
- Set a custom reminder date/time
- Different from due date
- Perfect for advance notifications
- Shows "Reminder set for..." message

### Notification Panel
- Click bell icon in header
- Shows all active alerts
- Red badge shows count of notifications
- Click to dismiss notifications
- Notifications auto-refresh when tasks change

### Alarm System
- Soft beeping audio alert for imminent tasks
- Vibration feedback on mobile devices
- Customizable through browser audio settings
- Non-intrusive but noticeable

---

## 💾 Data & Security

### User Data Isolation
- Each user only sees their own tasks
- Tasks are linked to user ID via MongoDB relationships
- Backend validates all requests for user ownership
- Prevents unauthorized access to other users' data

### Authentication Security
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens signed with secret key
- HTTP-only cookies for token storage
- CORS protection on API routes
- No passwords stored in plain text

### API Endpoints (All require authentication)

**Authentication:**
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Get JWT token
- `POST /api/auth/logout` - Invalidate session

**Tasks (JWT Required):**
- `GET /api/tasks?completed=true|false` - Fetch user's tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/[id]` - Update specific task
- `DELETE /api/tasks/[id]` - Delete specific task

---

## 🛠 Technology Stack

### Frontend
- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

### Backend
- **Next.js API Routes** - Serverless backend
- **Node.js** - Runtime
- **Express-like routing** - Next API patterns

### Database & Auth
- **MongoDB** - Database (Atlas Cloud)
- **Mongoose** - ODM library
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT tokens

### Components & Tools
- **Lucide React** - Icons
- **date-fns** - Date formatting
- **Web Audio API** - Alarm sounds
- **Vibration API** - Mobile feedback

---

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Adaptive layouts for tablet/desktop
- Touch-friendly on mobile devices
- Optimized for all screen sizes

### Visual Feedback
- Loading states on all operations
- Toast notifications for success/error
- Real-time task list updates
- Smooth animations and transitions

### Dark Theme
- Beautiful dark interface
- Blue and purple gradients
- Reduced eye strain
- Modern aesthetic

---

## 🐛 Troubleshooting

### "Invalid email or password"
- Double-check your credentials
- Ensure caps lock is off
- Try resetting your password (future feature)

### "Failed to create task"
- Ensure you're logged in
- Check browser console for errors
- Verify MongoDB is running
- Check MONGODB_URI in .env.local

### "Tasks not showing"
- Refresh the page
- Check if you have network connection
- Try logging out and back in
- Clear browser cache
- Check browser dev tools Network tab

### "Notifications not working"
- Ensure browser notifications are enabled
- Check audio is not muted globally
- Verify tasks have due dates
- Try refreshing the page

### MongoDB Connection Issues
- Check MONGODB_URI format is correct
- Verify IP is whitelisted (Atlas)
- Test connection with MongoDB Compass
- Check username/password are URL-encoded

### JWT Token Expired
- Logout and login again
- Tokens last 7 days from creation
- New token issued on login

---

## 📝 Development

### Project Structure
```
app/
├── api/
│   ├── auth/
│   │   ├── register/route.tsx
│   │   ├── login/route.tsx
│   │   └── logout/route.tsx
│   └── tasks/
│       ├── route.tsx
│       └── [id]/route.tsx
├── components/          # React components
├── context/            # Context providers (Auth, Tasks)
├── dashboard/          # Dashboard page
├── login/              # Login page
├── signup/             # Signup page
└── page.tsx            # Home/main dashboard

lib/
├── api.tsx             # API client functions
├── auth.ts             # JWT utilities
├── db.tsx              # MongoDB connection
└── ...other utilities

models/
├── user.tsx            # User schema
├── tasks.tsx           # Task schema
└── course.tsx          # Course schema
```

### Running Tests
```bash
npm run lint      # ESLint
npm run typecheck # TypeScript
npm run build     # Production build
npm run start     # Production server
```

---

## 🚀 Production Deployment

### Environment Variables for Production
```env
MONGODB_URI=mongodb+srv://prod_user:prod_pass@prod-cluster.mongodb.net/taskmaster
JWT_SECRET=<very-long-random-string>
NODE_ENV=production
```

### Build & Deploy
```bash
npm run build
npm run start
```

### Security Checklist
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS in production
- [ ] Set secure CORS policies
- [ ] Enable rate limiting
- [ ] Monitor error logs
- [ ] Backup MongoDB regularly
- [ ] Use strong JWT secret

---

## 📞 Support

For issues or questions:
1. Check browser console for error messages
2. Review MongoDB connection
3. Verify .env.local configuration
4. Try clearing browser cache
5. Check that all dependencies are installed

---

## 📄 License

This project is part of TaskMaster Pro - All rights reserved.

---

**Happy Task Management! 🎯**
