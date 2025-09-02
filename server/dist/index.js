"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables first
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file in the project root
const envPath = '/home/levi1604/second_Brain/server/.env';
console.log('Loading .env from:', envPath);
dotenv_1.default.config({
    path: envPath,
    debug: true,
    override: true
});
// Debug: Log all environment variables (except sensitive ones)
console.log('Environment variables loaded:', {
    NODE_ENV: process.env.NODE_ENV,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '***' : 'Not set',
    COHERE_API_KEY: process.env.COHERE_API_KEY ? '***' : 'Not set',
    QDRANT_HOST: process.env.QDRANT_HOST ? 'Set' : 'Not set',
    MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
    // Debug info
    cwd: process.cwd()
});
const express_1 = __importDefault(require("express"));
const db_config_1 = __importDefault(require("./config/db.config"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = require("./middlewares/auth");
const cors_1 = __importDefault(require("cors"));
console.log('Environment variables loaded:', {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '***' : 'Not set',
    COHERE_API_KEY: process.env.COHERE_API_KEY ? '***' : 'Not set',
    QDRANT_HOST: process.env.QDRANT_HOST ? 'Set' : 'Not set'
});
(0, db_config_1.default)('mongodb://localhost:27017/second-brain')
    .then(() => console.log("MongoDB Connected"))
    .catch((e) => console.log("ERROR OCC:", e));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// CORS must be configured before authentication middleware
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cookie'],
}));
// Authentication middleware should come after CORS
app.use(auth_1.checkForAuthenticationCookie);
app.use("/api", user_routes_1.default);
app.listen(PORT, () => { console.log("Server Started On PORT ", PORT); });
