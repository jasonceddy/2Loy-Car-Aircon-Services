2loy Car Aircon Services
Fast, reliable, and affordable aircon services for your car. We offer everything from repairs to full AC overhauls.

🚀 Quick Start
Installation
Backend (Node.js/Express, MySQL)

Clone the repo:
git clone https://github.com/yourusername/2loy-car-aircon-services.git
Navigate to the server folder and install dependencies:
cd server
npm install


Create a .env file in the root directory with:

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=car_service_db
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
JWT_SECRET="your_secret_key"
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_email_password"


Run the server:
npm start
Frontend (React/Vite)
Navigate to the client folder and install dependencies:
cd client
npm install

Run the frontend:
npm run dev

🌍 Usage

Once the backend and frontend are running, access the app at http://localhost:5173. The app allows users to book car aircon services and view service packages.

💻 Tech Stack

Frontend: React, Vite
Backend: Node.js, Express
Database: MySQL, Prisma
Authentication: JWT
API Requests: Axios
