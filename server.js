// ============================================
// NEW ENDPOINTS: Visitor Auth, Chat, Out Conversation
// ============================================

// Visitor Registration
app.post('/api/visitor-register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Username and password required.' });
        const existing = await query('SELECT id FROM visitors WHERE username = $1', [username]);
        if (existing.rows.length > 0) return res.status(409).json({ error: 'Username already taken.' });
        const hashed = await bcrypt.hash(password, 10);
        const result = await query(
            'INSERT INTO visitors (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
            [username, username + '@temp.com', hashed]
        );
        const visitorId = result.rows[0].id;
        await query('INSERT INTO conversations (visitor_id) VALUES ($1)', [visitorId]);
        const token = jwt.sign({ id: visitorId, type: 'visitor' }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, username });
    } catch (error) {
        console.error('Visitor register error:', error);
        res.status(500).json({ error: 'Registration failed.' });
    }
});

// Visitor Login
app.post('/api/visitor-login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Username and password required.' });
        const result = await query('SELECT id, username, password_hash FROM visitors WHERE username = $1', [username]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials.' });
        const visitor = result.rows[0];
        const valid = await bcrypt.compare(password, visitor.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });
        const token = jwt.sign({ id: visitor.id, type: 'visitor' }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, username: visitor.username });
    } catch (error) {
        console.error('Visitor login error:', error);
        res.status(500).json({ error: 'Login failed.' });
    }
});

// Get conversation and messages (visitor)
app.get('/api/chat', authenticateVisitor, async (req, res) => {
    try {
        const visitorId = req.user.id;
        let conv = await query('SELECT id FROM conversations WHERE visitor_id = $1', [visitorId]);
        if (conv.rows.length === 0) {
            await query('INSERT INTO conversations (visitor_id) VALUES ($1)', [visitorId]);
            conv = await query('SELECT id FROM conversations WHERE visitor_id = $1', [visitorId]);
        }
        const convId = conv.rows[0].id;
        const messages = await query(
            'SELECT sender_type, message, sent_at FROM chat_messages WHERE conversation_id = $1 ORDER BY sent_at ASC',
            [convId]
        );
        // Get username
        const user = await query('SELECT username FROM visitors WHERE id = $1', [visitorId]);
        res.json({ success: true, conversationId: convId, messages: messages.rows, username: user.rows[0].username });
    } catch (error) {
        console.error('Chat load error:', error);
        res.status(500).json({ error: 'Failed to load chat.' });
    }
});

// Send message (visitor)
app.post('/api/chat/send', authenticateVisitor, async (req, res) => {
    try {
        const visitorId = req.user.id;
        const { message } = req.body;
        if (!message || message.trim() === '') return res.status(400).json({ error: 'Message cannot be empty.' });
        const conv = await query('SELECT id FROM conversations WHERE visitor_id = $1', [visitorId]);
        if (conv.rows.length === 0) return res.status(404).json({ error: 'Conversation not found.' });
        const convId = conv.rows[0].id;
        await query(
            'INSERT INTO chat_messages (conversation_id, sender_type, sender_id, message) VALUES ($1, $2, $3, $4)',
            [convId, 'visitor', visitorId, message.trim()]
        );
        await query('UPDATE conversations SET last_message_at = NOW() WHERE id = $1', [convId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to send message.' });
    }
});

// Poll for new messages (visitor)
app.get('/api/chat/messages', authenticateVisitor, async (req, res) => {
    try {
        const visitorId = req.user.id;
        const since = req.query.since ? new Date(parseInt(req.query.since)) : new Date(0);
        const conv = await query('SELECT id FROM conversations WHERE visitor_id = $1', [visitorId]);
        if (conv.rows.length === 0) return res.json({ success: true, messages: [] });
        const convId = conv.rows[0].id;
        const messages = await query(
            'SELECT sender_type, message, sent_at FROM chat_messages WHERE conversation_id = $1 AND sent_at > $2 ORDER BY sent_at ASC',
            [convId, since]
        );
        res.json({ success: true, messages: messages.rows });
    } catch (error) {
        console.error('Poll error:', error);
        res.status(500).json({ error: 'Failed to fetch messages.' });
    }
});

// Middleware for visitor JWT
function authenticateVisitor(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized.' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token.' });
        if (user.type !== 'visitor') return res.status(403).json({ error: 'Invalid user type.' });
        req.user = user;
        next();
    });
}

// Out Conversation – store contact message with channel
app.post('/api/contact-out', async (req, res) => {
    try {
        const { name, email, message, channel } = req.body;
        if (!name || !email || !message || !channel) {
            return res.status(400).json({ error: 'Missing fields.' });
        }
        await query(
            'INSERT INTO contact_out (name, email, message, channel) VALUES ($1, $2, $3, $4)',
            [name, email, message, channel]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Out contact error:', error);
        res.status(500).json({ error: 'Failed to send message.' });
    }
});