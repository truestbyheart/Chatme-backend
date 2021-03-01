import { Socket } from "socket.io";
import client from "../../database";

class ChatService {
    async getMessages(from: string, to: string) {
        const messageSql = 'SELECT * FROM chats WHERE (receiver = $1 AND sender = $2) OR (receiver = $3 AND sender = $4)';
        return (await client.query(messageSql, [to, from, from, to])).rows;
    }

    async updateMessage(messageId: string, message: string) {
        const updateMessageSql = 'UPDATE chats SET message = $1 WHERE id = $2';
        return (await client.query(updateMessageSql, [message, messageId])).rowCount;
    }

    async deleteMessage(messageId: string) {
        const deleteMessageSql = 'DELETE FROM chats WHERE id = $1';
        return (await client.query(deleteMessageSql, [messageId])).rowCount;
    }

   async storeMessage(body: { from: string; to: string; message: string}) {
        const insertMessageSql = 'INSERT INTO chats (receiver, sender, message, updatedat, createdat) VALUES ($1, $2, $3, $4, $5) RETURNING *';
       return (await client.query(insertMessageSql, [body.to, body.from, body.message, new Date().toISOString(), new Date().toISOString()])).rows;
   }
}

export default ChatService;
