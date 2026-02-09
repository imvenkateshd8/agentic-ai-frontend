# Angular AI Chat Application

A modern, production-ready Angular chat application inspired by Streamlit's RAG and MCP chatbot implementations. Features real-time streaming, document upload with RAG, tool calling visualization, and comprehensive state management.

## 🎯 Features

### Core Features
- **🔐 Authentication** - Complete login/signup system with JWT token management
- **💬 Real-time Chat** - Streaming responses with message chunking
- **📄 Document RAG** - PDF upload and intelligent document querying
- **🛠️ Tool Calling** - Visual indicators for AI tool usage
- **🔄 State Management** - NgRx for predictable state handling
- **📱 Responsive Design** - Mobile-first, adaptive UI
- **🎨 Material Design** - Angular Material components with custom theming
- **⚡ Performance** - Lazy loading, optimized bundles
- **🔒 Security** - HTTP interceptors, auth guards, token refresh

### Technical Highlights
- **Standalone Components** - Modern Angular architecture
- **RxJS Observables** - Reactive data flow
- **Server-Sent Events (SSE)** - Real-time streaming
- **Type-Safe** - Full TypeScript implementation
- **Modular Structure** - Feature-based organization

## 📋 Architecture Overview

### Based on Streamlit Implementation Analysis

The application replicates the following key behaviors from the Python Streamlit apps:

#### From `streamlit_rag_frontend.py`:
- **Thread Management** - UUID-based conversation threads
- **PDF Ingestion** - Document upload per thread with metadata
- **Message History** - Persistent chat history per thread
- **Tool Status Display** - Visual feedback for tool execution
- **Streaming Responses** - Chunk-by-chunk message rendering

#### From `streamlit_frontend_mcp.py`:
- **Async Task Handling** - Queue-based event processing
- **MCP Integration** - Model Context Protocol support
- **State Persistence** - Thread state restoration
- **Error Handling** - Graceful degradation

### Application Structure

```
angular-chat-app/
├── src/
│   ├── app/
│   │   ├── core/                    # Singleton services & models
│   │   │   ├── models/
│   │   │   │   ├── chat.models.ts
│   │   │   │   ├── auth.models.ts
│   │   │   │   └── document.models.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── chat.service.ts
│   │   │   │   ├── document.service.ts
│   │   │   │   └── streaming.service.ts
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   └── interceptors/
│   │   │       └── auth.interceptor.ts
│   │   │
│   │   ├── store/                   # NgRx state management
│   │   │   ├── auth/
│   │   │   │   ├── auth.state.ts
│   │   │   │   ├── auth.actions.ts
│   │   │   │   ├── auth.reducer.ts
│   │   │   │   ├── auth.effects.ts
│   │   │   │   └── auth.selectors.ts
│   │   │   ├── chat/
│   │   │   │   └── [same pattern]
│   │   │   ├── document/
│   │   │   │   └── [same pattern]
│   │   │   └── app.state.ts
│   │   │
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── signup/
│   │   │   ├── chat/
│   │   │   │   ├── chat-container/
│   │   │   │   ├── chat-message/
│   │   │   │   ├── chat-input/
│   │   │   │   └── tool-status/
│   │   │   └── sidebar/
│   │   │       ├── thread-list/
│   │   │       └── document-upload/
│   │   │
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   └── app.component.ts
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   ├── styles.scss
│   ├── index.html
│   └── main.ts
│
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Angular CLI** >= 17.x

### Installation

```bash
# Navigate to project directory
cd frontend

# Install dependencies
npm install

# Install Angular CLI globally (if not installed)
npm install -g @angular/cli

# Start development server
npm start
```

The application will be available at `http://localhost:4200`

### Backend Setup

Ensure your backend API is running and accessible. Update the API URL in:
```typescript
// src/environments/environment.ts
export const environment = {
  apiUrl: 'http://localhost:8000/api',  // Update this
  wsUrl: 'ws://localhost:8000/ws'
};
```

## 📱 Features Guide

### 1. Authentication

#### Login
- Navigate to `/auth/login`
- Enter credentials
- JWT tokens stored securely in localStorage
- Auto-redirect to chat on success

#### Signup
- Navigate to `/auth/signup`
- Create new account
- Automatic login after registration

#### Token Management
- Automatic token refresh on expiry
- HTTP interceptor adds auth headers
- Auto-logout on invalid tokens

### 2. Chat Interface

#### Starting a Conversation
1. Click "New Chat" button
2. Type message in input field
3. Press Enter or click send button
4. View streaming response in real-time

#### Thread Management
- Each conversation has unique thread ID
- Switch between threads from sidebar
- Automatic message history loading
- Thread metadata display

### 3. Document Upload & RAG

#### Uploading Documents
1. Click "Upload PDF" in sidebar
2. Select PDF file
3. Wait for indexing (progress indicator shows)
4. Document metadata displayed when complete

#### Querying Documents
- Ask questions about uploaded document
- AI retrieves relevant context automatically
- Chunk and page information shown

### 4. Tool Calling

#### Visual Indicators
- Tool usage displayed in chat
- Real-time status updates
- Completion confirmation
- Error handling with user feedback

### 5. Streaming Responses

#### How It Works
- Server-Sent Events (SSE) for streaming
- Chunk-by-chunk message rendering
- Typing indicator during generation
- Smooth, real-time updates

## 🔧 Development

### Available Scripts

```bash
# Development server
npm start

# Production build
npm run build:prod

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Environment Configuration

**Development** (`environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  wsUrl: 'ws://localhost:8000/ws'
};
```

**Production** (`environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: '/api',
  wsUrl: '/ws'
};
```

## 📦 State Management

### NgRx Store Structure

```typescript
interface AppState {
  auth: AuthState;
  chat: ChatState;
  document: DocumentState;
}
```

#### Auth State
- User information
- Access & refresh tokens
- Authentication status
- Loading & error states

#### Chat State
- Current thread ID
- All threads list
- Messages by thread
- Streaming status
- Tool status

#### Document State
- Documents by thread
- Upload progress
- Current upload
- Error handling

### Actions & Effects

**Auth Actions**:
- login, loginSuccess, loginFailure
- signup, signupSuccess, signupFailure
- logout, refreshToken

**Chat Actions**:
- loadThreads, createNewThread, setCurrentThread
- sendMessage, streamChunk, streamComplete
- updateToolStatus, clearToolStatus

**Document Actions**:
- uploadDocument, uploadDocumentSuccess
- loadThreadDocuments

## 🎨 Styling & Theming

### Material Theme

Custom purple-indigo gradient theme:
```scss
Primary: #667eea (Purple-Blue)
Accent: #764ba2 (Deep Purple)
Background: #f7fafc (Light Blue-Gray)
```

### Responsive Breakpoints

```scss
Mobile: < 600px
Tablet: 600px - 768px
Desktop: > 768px
```

### CSS Architecture

- **BEM Methodology** - Block Element Modifier
- **SCSS Variables** - Consistent theming
- **Flexbox/Grid** - Modern layouts
- **CSS Animations** - Smooth transitions

## 🔒 Security

### Implemented Security Measures

1. **JWT Authentication**
   - Secure token storage
   - Automatic refresh
   - Expiry handling

2. **HTTP Interceptors**
   - Auto-attach auth headers
   - Token refresh on 401
   - Error handling

3. **Route Guards**
   - Protected routes
   - Auth verification
   - Auto-redirect

4. **XSS Protection**
   - Sanitized user input
   - Safe HTML rendering
   - Content Security Policy ready

## 🚢 Deployment

### Production Build

```bash
# Create optimized production build
npm run build:prod

# Output: dist/angular-chat-app/
```

### Build Optimizations

- **AOT Compilation** - Ahead-of-time compilation
- **Tree Shaking** - Remove unused code
- **Code Splitting** - Lazy loading
- **Minification** - Compressed assets
- **Caching** - Service worker ready

### Deployment Options

#### 1. Static Hosting (Netlify, Vercel)
```bash
# Build
npm run build:prod

# Deploy dist/ folder
```

#### 2. Docker
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:prod

FROM nginx:alpine
COPY --from=build /app/dist/angular-chat-app /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 3. Azure Static Web Apps
```bash
# Install Azure CLI
az login

# Deploy
az staticwebapp create \
  --name angular-chat-app \
  --resource-group my-resource-group \
  --source . \
  --location "eastus2" \
  --app-location "/" \
  --output-location "dist/angular-chat-app"
```

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --code-coverage

# Run specific test
npm test -- --include='**/auth.service.spec.ts'
```

### E2E Tests

```bash
# Install Playwright
npm install -D @playwright/test

# Run E2E tests
npx playwright test
```

## 📊 Performance

### Optimization Techniques

1. **Lazy Loading**
   - Route-based code splitting
   - Reduced initial bundle size

2. **OnPush Change Detection**
   - Optimized rendering
   - Reduced digest cycles

3. **TrackBy Functions**
   - Efficient list rendering
   - Minimized DOM manipulation

4. **RxJS Operators**
   - Proper subscription management
   - Memory leak prevention

## 🐛 Troubleshooting

### Common Issues

**1. Module not found errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**2. Port already in use**
```bash
# Use different port
ng serve --port 4201
```

**3. CORS errors**
- Configure backend CORS settings
- Add proxy configuration in `angular.json`

**4. Token refresh loops**
- Check token expiry logic
- Verify refresh endpoint

## 🔄 Migration from Streamlit

### Key Differences

| Streamlit | Angular |
|-----------|---------|
| st.session_state | NgRx Store |
| st.chat_message | ChatMessageComponent |
| st.file_uploader | DocumentUploadComponent |
| st.status | ToolStatusComponent |
| st.write_stream | StreamingService |

### Backend Requirements

The Angular app expects the following API endpoints:

```
POST   /api/auth/login
POST   /api/auth/signup
POST   /api/auth/refresh
GET    /api/chat/threads
POST   /api/chat/threads
GET    /api/chat/threads/:id/messages
GET    /api/chat/threads/:id/state
POST   /api/chat/stream         (SSE)
POST   /api/documents/ingest
GET    /api/documents/threads/:id
```

## 📚 Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [NgRx Documentation](https://ngrx.io/)
- [Angular Material](https://material.angular.io/)
- [RxJS Documentation](https://rxjs.dev/)

## 👥 Contributing

Contributions welcome! Please follow:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by Streamlit RAG and MCP implementations
- Built with Angular 17+ and modern best practices
- Designed for production use

---

**Built with ❤️ using Angular, NgRx, and Material Design**
