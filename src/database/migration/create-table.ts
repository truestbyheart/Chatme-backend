// Create user 
export default [
    `create table if not exists users(id UUID primary key not null default uuid_in(overlay(overlay(md5(random():: text || ':' || clock_timestamp():: text) placing '4' from 13) placing to_hex(floor(random() * (11 - 8 + 1) + 8):: int):: text from 17):: cstring),
        username VARCHAR(16) unique,
        email VARCHAR(255),
        email_verified BOOLEAN,
        password VARCHAR(255) not null,
        profile_pic VARCHAR(255),
        createdAt DATE not null default CURRENT_DATE,
        updatedAt DATE not null default CURRENT_DATE,
        last_login DATE not null default CURRENT_DATE)`,
    `create table if not exists chats(id UUID primary key not null default uuid_in(overlay(overlay(md5(random():: text || ':' || clock_timestamp():: text) placing '4' from 13) placing to_hex(floor(random() * (11 - 8 + 1) + 8):: int):: text from 17):: cstring),
        sender VARCHAR(16) not null,
        receiver VARCHAR(16) not null,
        message text not null,
        createdAt DATE not null default CURRENT_DATE,
        updatedAt DATE not null default CURRENT_DATE,
        deletedAt DATE default null)`
]