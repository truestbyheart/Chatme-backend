const database_history = [
  `CREATE TABLE IF NOT EXISTS users(
      id UUID PRIMARY KEY NOT NULL DEFAULT uuid_in(overlay(overlay(md5(random()::text || ':' || clock_timestamp()::text) placing '4' from 13) placing to_hex(floor(random() * (11 - 8 + 1) + 8)::int)::text from 17)::cstring),
      username VARCHAR(16) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      email_verified BOOLEAN DEFAULT FALSE,
      password VARCHAR(255) NOT NULL,
      profile_pic VARCHAR(255),
      full_name VARCHAR(100),
      status VARCHAR(10) DEFAULT 'offline',
      last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)`,
  `CREATE TABLE IF NOT EXISTS chats(
      id UUID PRIMARY KEY NOT NULL DEFAULT uuid_in(overlay(overlay(md5(random()::text || ':' || clock_timestamp()::text) placing '4' from 13) placing to_hex(floor(random() * (11 - 8 + 1) + 8)::int)::text from 17)::cstring),
      sender VARCHAR(16) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
      receiver VARCHAR(16) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      message_type VARCHAR(10) DEFAULT 'text',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)`,
  `CREATE TABLE IF NOT EXISTS chat_rooms(
      id UUID PRIMARY KEY NOT NULL DEFAULT uuid_in(overlay(overlay(md5(random()::text || ':' || clock_timestamp()::text) placing '4' from 13) placing to_hex(floor(random() * (11 - 8 + 1) + 8)::int)::text from 17)::cstring),
      name VARCHAR(50) NOT NULL,
      description TEXT,
      created_by VARCHAR(16) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)`,

  `CREATE TABLE IF NOT EXISTS room_members(
      id UUID PRIMARY KEY NOT NULL DEFAULT uuid_in(overlay(overlay(md5(random()::text || ':' || clock_timestamp()::text) placing '4' from 13) placing to_hex(floor(random() * (11 - 8 + 1) + 8)::int)::text from 17)::cstring),
      room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
      username VARCHAR(16) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
      role VARCHAR(10) DEFAULT 'member',
      joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(room_id, username)
)`,
  `CREATE TABLE IF NOT EXISTS room_messages(
      id UUID PRIMARY KEY NOT NULL DEFAULT uuid_in(overlay(overlay(md5(random()::text || ':' || clock_timestamp()::text) placing '4' from 13) placing to_hex(floor(random() * (11 - 8 + 1) + 8)::int)::text from 17)::cstring),
      room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
      sender VARCHAR(16) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
      message TEXT NOT NULL,
      message_type VARCHAR(10) DEFAULT 'text',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)`,
  `CREATE TABLE IF NOT EXISTS message_read_receipts(
      id UUID PRIMARY KEY NOT NULL DEFAULT uuid_in(overlay(overlay(md5(random()::text || ':' || clock_timestamp()::text) placing '4' from 13) placing to_hex(floor(random() * (11 - 8 + 1) + 8)::int)::text from 17)::cstring),
      message_id UUID NOT NULL,
      username VARCHAR(16) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
      read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(message_id, username)
)`,
  `CREATE INDEX IF NOT EXISTS idx_chats_sender_receiver ON chats(sender, receiver)`,
  `CREATE INDEX IF NOT EXISTS idx_chats_created_at ON chats(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_room_messages_room_id ON room_messages(room_id)`,
  `CREATE INDEX IF NOT EXISTS idx_room_messages_created_at ON room_messages(created_at)`,
];

export default database_history;
