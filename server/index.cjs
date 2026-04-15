const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:5173" }
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // --- 1. socket.on --- (รอฟังเหตุการณ์)
    socket.on('typing', (data) => {
        // --- 2. socket.broadcast.emit --- (ส่งหาคนอื่นยกเว้นตัวเอง)
        // ใช้บอกคนอื่นว่า "คนนี้กำลังพิมพ์อยู่"
        socket.broadcast.emit('display_typing', `${data.user} is typing...`);
    });

    // --- 3. socket.join --- (เข้าห้อง)
    socket.on('join_vip', () => {
        socket.join('vip_room');
        // --- 4. socket.emit --- (ส่งกลับหาผู้ส่งคนเดียว)
        socket.emit('message', 'ระบบ: คุณได้เข้าสู่ห้อง VIP แล้ว');
    });

    // --- 5. socket.leave --- (ออกจากห้อง)
    socket.on('leave_vip', () => {
        socket.leave('vip_room');
        socket.emit('message', 'ระบบ: คุณออกจากห้อง VIP แล้ว');
    });

    // --- 6. io.to().emit --- (ส่งหาทุกคนในห้อง รวมคนส่ง)
    socket.on('send_vip_msg', (msg) => {
        io.to('vip_room').emit('message', `[VIP] ${socket.id.substring(0,4)}: ${msg}`);
    });

    // --- 7. socket.to().emit --- (ส่งหาทุกคนในห้อง ยกเว้นคนส่ง)
    socket.on('vip_alert', () => {
        socket.to('vip_room').emit('message', 'แจ้งเตือน: มีสมาชิก VIP ท่านใหม่กำลังต้องการความช่วยเหลือ!');
    });

    // --- 8. io.emit --- (ประกาศหาทุกคนในระบบ)
    socket.on('admin_announcement', (msg) => {
        io.emit('message', `ประกาศจากแอดมิน: ${msg}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(3001, () => console.log("Server listening on port 3001"));