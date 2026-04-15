
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io.connect("http://localhost:3001");

function App() {
  const [msg, setMsg] = useState("");
  const [logs, setLogs] = useState([]);
  const [typingStatus, setTypingStatus] = useState("");

  useEffect(() => {
    // รอรับข้อความทั่วไป
    socket.on('message', (data) => {
      setLogs((prev) => [...prev, data]);
    });

    // รอรับสถานะการพิมพ์จากคนอื่น
    socket.on('display_typing', (status) => {
      setTypingStatus(status);
      setTimeout(() => setTypingStatus(""), 2000); // หายไปใน 2 วินาที
    });

    return () => {
      socket.off('message');
      socket.off('display_typing');
    };
  }, []);

  const handleTyping = (e) => {
    setMsg(e.target.value);
    socket.emit('typing', { user: socket.id.substring(0,4) });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Socket.io Master Demo</h1>
      <p style={{ color: 'gray' }}>{typingStatus}</p>

      {/* ปุ่มทดสอบคำสั่งต่างๆ */}
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => socket.emit('join_vip')}>Join VIP Room</button>
        <button onClick={() => socket.emit('leave_vip')}>Leave VIP Room</button>
        <button onClick={() => socket.emit('admin_announcement', 'เซิร์ฟเวอร์จะปิดปรับปรุง')}>Admin Announce</button>
      </div>

      <input 
        value={msg} 
        onChange={handleTyping} 
        placeholder="Type message..." 
      />
      <button onClick={() => socket.emit('send_vip_msg', msg)}>Send to VIP (All)</button>
      <button onClick={() => socket.emit('vip_alert')}>Alert VIP (Others)</button>

      <div style={{ border: '1px solid #ccc', marginTop: '10px', height: '200px', overflowY: 'scroll' }}>
        {logs.map((log, i) => <p key={i}>{log}</p>)}
      </div>
    </div>
  );
}

export default App;