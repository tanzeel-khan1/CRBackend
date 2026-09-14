// const jwt = require('jsonwebtoken');
// const ChatMessage = require('../models/ChatMessage');

// module.exports = (io) => {
//   // Auth middleware for socket connections
//   io.use((socket, next) => {
//     const token = socket.handshake.auth?.token || socket.handshake.query?.token;
//     if (!token) return next(new Error('No token'));
//     try {
//       socket.user = jwt.verify(token, process.env.JWT_SECRET);
//       next();
//     } catch {
//       next(new Error('Invalid token'));
//     }
//   });

//   io.on('connection', (socket) => {
//     // Join a company chat room
//     socket.on('join_room', (companyId) => {
//       socket.join(companyId);
//     });

//     // Leave room
//     socket.on('leave_room', (companyId) => {
//       socket.leave(companyId);
//     });

//     // Send message
//     socket.on('send_message', async (data, callback) => {
//       try {
//         const msg = await ChatMessage.create({
//           company_id: data.company_id,
//           content: data.content || '',
//           sender_email: data.sender_email,
//           sender_name: data.sender_name,
//           reply_to_id: data.reply_to_id || null,
//           reply_to_content: data.reply_to_content || null,
//           reply_to_sender: data.reply_to_sender || null,
//           image_url: data.image_url || null,
//           file_url: data.file_url || null,
//           file_name: data.file_name || null,
//           audio_url: data.audio_url || null,
//         });

//         const normalized = {
//           ...msg.toObject(),
//           id: msg._id.toString(),
//           created_date: msg.createdAt,
//           updated_date: msg.updatedAt,
//         };

//         // Broadcast to everyone in room including sender
//         io.to(data.company_id).emit('new_message', normalized);

//         if (callback) callback({ ok: true, message: normalized });
//       } catch (err) {
//         if (callback) callback({ ok: false, error: err.message });
//       }
//     });

//     // Delete message
//     socket.on('delete_message', async ({ messageId, company_id }, callback) => {
//       try {
//         await ChatMessage.findByIdAndDelete(messageId);
//         io.to(company_id).emit('message_deleted', messageId);
//         if (callback) callback({ ok: true });
//       } catch (err) {
//         if (callback) callback({ ok: false, error: err.message });
//       }
//     });

//     // Update reactions
//     socket.on('update_reactions', async ({ messageId, reactions, company_id }, callback) => {
//       try {
//         const msg = await ChatMessage.findByIdAndUpdate(
//           messageId,
//           { reactions },
//           { new: true }
//         );
//         const normalized = {
//           ...msg.toObject(),
//           id: msg._id.toString(),
//           created_date: msg.createdAt,
//         };
//         io.to(company_id).emit('message_updated', normalized);
//         if (callback) callback({ ok: true });
//       } catch (err) {
//         if (callback) callback({ ok: false, error: err.message });
//       }
//     });

//     socket.on('disconnect', () => {});
//   });

//   const onlineUsers = new Set();

// io.on("connection", socket => {

//   socket.on("user-online", email => {

//     socket.email = email;

//     onlineUsers.add(email);

//     io.emit(
//       "online-users",
//       Array.from(onlineUsers)
//     );
//   });

//   socket.on("disconnect", () => {

//     if (socket.email) {
//       onlineUsers.delete(socket.email);
//     }

//     io.emit(
//       "online-users",
//       Array.from(onlineUsers)
//     );
//   });

// });
// };
const jwt = require('jsonwebtoken');
const ChatMessage = require('../models/ChatMessage');

module.exports = (io) => {

  const onlineUsers = new Set();

  // Auth middleware
  io.use((socket, next) => {

    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token;

    if (!token) {
      return next(new Error('No token'));
    }

    try {
      socket.user = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      next();

    } catch {

      next(new Error('Invalid token'));
    }

  });

  io.on('connection', (socket) => {

    // USER ONLINE
    socket.on("user-online", email => {

      socket.email = email;

      onlineUsers.add(email);

      io.emit(
        "online-users",
        Array.from(onlineUsers)
      );
    });

    // JOIN ROOM
    socket.on('join_room', (companyId) => {
      socket.join(companyId);
    });

    // LEAVE ROOM
    socket.on('leave_room', (companyId) => {
      socket.leave(companyId);
    });

    // SEND MESSAGE
    socket.on('send_message', async (data, callback) => {

      try {

        const msg = await ChatMessage.create({
          company_id: data.company_id,
          content: data.content || '',
          sender_email: data.sender_email,
          sender_name: data.sender_name,
          reply_to_id: data.reply_to_id || null,
          reply_to_content: data.reply_to_content || null,
          reply_to_sender: data.reply_to_sender || null,
          file_url: data.file_url || null,
          file_name: data.file_name || null,
          audio_url: data.audio_url || null,
        });

        const normalized = {
          ...msg.toObject(),
          id: msg._id.toString(),
          created_date: msg.createdAt,
          updated_date: msg.updatedAt,
        };

        io.to(data.company_id)
          .emit('new_message', normalized);

        if (callback) {
          callback({
            ok: true,
            message: normalized
          });
        }

      } catch (err) {

        if (callback) {
          callback({
            ok: false,
            error: err.message
          });
        }
      }
    });

    // DELETE MESSAGE
    socket.on(
      'delete_message',
      async ({ messageId, company_id }, callback) => {

        try {

          await ChatMessage.findByIdAndDelete(messageId);

          io.to(company_id)
            .emit('message_deleted', messageId);

          if (callback) {
            callback({ ok: true });
          }

        } catch (err) {

          if (callback) {
            callback({
              ok: false,
              error: err.message
            });
          }
        }
      }
    );

    // UPDATE REACTIONS
    socket.on(
      'update_reactions',
      async ({
        messageId,
        reactions,
        company_id
      }, callback) => {

        try {

          const msg =
            await ChatMessage.findByIdAndUpdate(
              messageId,
              { reactions },
              { new: true }
            );

          const normalized = {
            ...msg.toObject(),
            id: msg._id.toString(),
            created_date: msg.createdAt,
          };

          io.to(company_id)
            .emit('message_updated', normalized);

          if (callback) {
            callback({ ok: true });
          }

        } catch (err) {

          if (callback) {
            callback({
              ok: false,
              error: err.message
            });
          }
        }
      }
    );

    // DISCONNECT
    socket.on("disconnect", () => {

      if (socket.email) {
        onlineUsers.delete(socket.email);
      }

      io.emit(
        "online-users",
        Array.from(onlineUsers)
      );
    });

  });

};