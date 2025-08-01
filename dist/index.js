"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_config_1 = __importDefault(require("./config/db.config"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = require("./middlewares/auth");
const cors_1 = __importDefault(require("cors"));
(0, db_config_1.default)('mongodb://localhost:27017/second-brain')
    .then(() => console.log("MongoDB Connected"))
    .catch((e) => console.log("ERROR OCC:", e));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use(auth_1.checkForAuthenticationCookie);
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));
app.use("/api", user_routes_1.default);
app.listen(PORT, () => { console.log("Server Started On PORT ", PORT); });
