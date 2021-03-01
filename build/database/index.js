"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pg_1 = require("pg");
var dotenv_1 = require("dotenv");
dotenv_1.config();
var DATABASE_URL = process.env.DATABASE_URL;
var client = new pg_1.Client({ connectionString: DATABASE_URL });
client.connect();
exports.default = client;
