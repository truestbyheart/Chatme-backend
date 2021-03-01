"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Create user
exports.default = [
    "create table if not exists users(id UUID primary key not null default uuid_in(overlay(overlay(md5(random():: text || ':' || clock_timestamp():: text) placing '4' from 13) placing to_hex(floor(random() * (11 - 8 + 1) + 8):: int):: text from 17):: cstring),\n        username VARCHAR(16) unique,\n        email VARCHAR(255),\n        email_verified BOOLEAN,\n        password VARCHAR(255) not null,\n        profile_pic VARCHAR(255),\n        createdAt DATE not null default NOW(),\n        updatedAt DATE not null default NOW(),\n        last_login DATE not null default NOW())",
    "create table if not exists chats(id UUID primary key not null default uuid_in(overlay(overlay(md5(random():: text || ':' || clock_timestamp():: text) placing '4' from 13) placing to_hex(floor(random() * (11 - 8 + 1) + 8):: int):: text from 17):: cstring),\n        sender VARCHAR(16) not null,\n        receiver VARCHAR(16) not null,\n        message text not null,\n        createdAt DATE not null default NOW(),\n        updatedAt DATE not null default NOW(),\n        deletedAt DATE default null)",
];
