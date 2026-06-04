# Human-in-the-Loop Workflow Designer

A Visual Programming Interface for Agentic Workflows — a drag-and-drop web application where users compose multi-agent workflows by placing MCP (Model Context Protocol) Tools as nodes. It features real-time data flow validation between nodes and live step-through execution with state inspection.

## Key Features

- **Visual Workflow Builder**: Intuitive drag-and-drop interface powered by React Flow.
- **Node-Based Architecture**: Compose workflows using different tool categories (Agent, Data, Transform, Output, Control Flow).
- **Human-in-the-Loop**: Dedicated "Human Approval" nodes allow pausing execution for manual review and intervention.
- **Real-Time Validation**: Instant graph topology validation, cycle detection, and data type checking to ensure workflows are structurally sound.
- **Live Execution Engine**: Execute workflows node-by-node with real-time progress updates via Socket.IO.
- **State Inspection**: View real-time logs, step duration, inputs, and outputs of every node execution through the State Inspector panel.
- **Authentication**: JWT-based user authentication and workflow persistence.
- **Premium Tools & API Key Management**: Support for external services requiring API keys (OpenAI, Anthropic, Google, SerpAPI, SendGrid).

## Tech Stack

### Frontend
- **Framework**: React + Vite
- **State Management**: Redux Toolkit
- **Canvas / Graph UI**: React Flow (`@xyflow/react`)
- **Styling**: Tailwind CSS + Framer Motion (for animations)
- **Icons**: Lucide React
- **Routing**: React Router

### Backend
- **Runtime**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Real-Time Communication**: Socket.IO
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs

## Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB (running locally or a MongoDB Atlas URI)

## Installation & Setup

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd Workflow-Design
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/workflow-designer
   JWT_SECRET=your_jwt_secret_here
   FRONTEND_URL=http://localhost:5173
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   ```

## Running the Application

You will need two terminal windows to run both the frontend and backend servers.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

The application will be accessible at `http://localhost:5173`.

## Usage Guide

1. **Sign Up / Log In**: Register a new account or log in.
2. **Create a Workflow**: Click "New Workflow" from the dashboard.
3. **Build**: Drag and drop tools from the left sidebar onto the canvas. Connect output handles (right) to input handles (left).
4. **Configure**: Click on a node to open the Node Config panel on the right. Set required properties and select models/configurations.
5. **Validate**: Click the "Validate" button to ensure your graph is valid and has no missing required fields or cycles.
6. **Execute**: Click "Run" or "Step" to execute the workflow. Monitor progress and view data transformations in the State Inspector at the bottom of the screen.

## License

MIT
