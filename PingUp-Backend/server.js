require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const { pubClient, subClient, redisClient, redisReady } = require('./config/redis');
const Room = require('./models/Room');
const User = require('./models/User');
const { ROLES } = require('./data/store');
const { uploadDir } = require('./middleware/upload');

const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const usersRoutes = require('./routes/users');
const channelsRoutes = require('./routes/channels');
const dmRoutes = require('./routes/dm');
const messagesRoutes = require('./routes/messages');
const searchRoutes = require('./routes/search');
const { initializeSockets } = require('./sockets/index');

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : [
        "http://localhost:5173",
        "https://pingupsite.onrender.com"
      ];

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});
io.adapter(createAdapter(pubClient, subClient));

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true
    })
);
app.use(express.json());
app.use(cookieParser());
// Serve uploads without allowing browsers to interpret active content.
app.use('/uploads', (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    next();
}, express.static(uploadDir));

app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes); // support direct /api/login and /api/register paths used by the frontend
app.use('/api/users', usersRoutes);
app.use('/api', channelsRoutes);
app.use('/api/dm', dmRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/search', searchRoutes);

initializeSockets(io);

// ─── Role Helpers ──────────────────────────────────────────────────
function rollRole() {
    return Math.random() < 0.30 ? ROLES.MODERATOR : ROLES.MEMBER;
}

function safeSocketHandler(socket, eventName, handler, clientMessage = 'Something went wrong.') {
    return async (...args) => {
        try {
            await handler(...args);
        } catch (err) {
            console.error(`[socket:${eventName}]`, err);
            socket.emit('error:general', clientMessage);
        }
    };
}
// ─── Broadcast helpers ────────────────────────────────────────────
async function broadcastUserList() {
    const onlineUserIds = await redisClient.sMembers('users:online');
    if (onlineUserIds.length === 0) {
        io.emit('users:update', []);
        return;
    }
    const users = await User.find({ _id: { $in: onlineUserIds } });
    io.emit('users:update', users.map(u => u.toSafeObject()));
}
// Evict sockets from a channel room if the channel just became private
// and they are no longer authorized.
async function evictUnauthorizedSockets(room) {
    if (!room.isPrivate) return; // only act when it IS now private

    const roomIdStr = room._id.toString();

    // ✅ Fetch from BOTH join paths — some sockets join by _id, others by name
    const [socketsByIdArr, socketsByNameArr] = await Promise.all([
        io.in(roomIdStr).fetchSockets(),
        io.in(room.name).fetchSockets(),
    ]);

    // Deduplicate — a socket may appear in both sets
    const seen = new Set();
    const allSockets = [];
    for (const s of [...socketsByIdArr, ...socketsByNameArr]) {
        if (!seen.has(s.id)) {
            seen.add(s.id);
            allSockets.push(s);
        }
    }

    const allowedSet = new Set(room.allowedUsers.map(id => id.toString()));

    for (const s of allSockets) {
        const user = s.data?.user ?? s.user;
        const isOwnerOrAdmin =
            user?.role === ROLES.OWNER || user?.role === ROLES.ADMIN;
        if (isOwnerOrAdmin) continue; // owners/admins always keep access

        const isAllowed = allowedSet.has(user?.id?.toString());
        if (!isAllowed) {
            // ✅ Leave BOTH room identifiers so no messages leak through
            s.leave(roomIdStr);
            s.leave(room.name);
            s.emit('channel:kicked', {
                channelId: roomIdStr,
                reason: 'This channel has been made private.',
            });
        }
    }
}

// Socket.IO
initializeSockets(io);

// ─── Seed Default Rooms ───────────────────────────────────────────
async function seedRooms() {
    const defaults = [
        { name: 'general', description: 'General discussion', category: '✦ welcome', emoji: '🌿', order: 0 },
        { name: 'announcements', description: 'Official announcements', category: '✦ welcome', emoji: '📢', order: 1, isReadOnly: true },
        { name: 'rules', description: 'Server rules', category: '✦ welcome', emoji: '📋', order: 2, isReadOnly: true },
        { name: 'engineering', description: 'Engineering discussion', category: '✦ chat', emoji: '⚙️', order: 0 },
        { name: 'random', description: 'Random chat', category: '✦ chat', emoji: '🎲', order: 1 },
        { name: 'ideas', description: 'Share ideas', category: '✦ chat', emoji: '💡', order: 2 },
        { name: 'music-lounge', description: 'Stranger Things music', category: '✦ chat', emoji: '🎵', order: 3, isVoice: true },
        { name: 'admin-only', description: 'Owner & mods only', category: '✦ staff', emoji: '🔒', order: 0, isPrivate: true },
    ];
    for (const r of defaults) {
        await Room.findOneAndUpdate({ name: r.name }, r, { upsert: true, new: true });
    }
    console.log('✅ Default rooms seeded');
}

// ─── Connect & Start ──────────────────────────────────────────────
if (require.main === module) {
    mongoose.connect(process.env.MONGO_URI)
        .then(async () => {
            console.log('✅ MongoDB connected');
            await redisReady;
            await seedRooms();
            server.listen(process.env.PORT || 3001, () =>
                console.log(`🚀 Server on http://localhost:${process.env.PORT || 3001}`)
            );
        })
        .catch(err => { console.error('MongoDB error:', err); process.exit(1); });
}

module.exports = { app, server };
