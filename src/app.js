import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({

    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());    


import userRoutes from './routes/user.routes.js';
import videoRoutes from './routes/video.routes.js'
import likeRoutes from './routes/like.routes.js'
import commentRoute from './routes/comment.routes.js'
import PlaylistRoute from './routes/playlist.routes.js';
import subscriptionRoute from './routes/subscription.routes.js'


app.use('/api/v1/users',userRoutes);
app.use('/api/v1/videos',videoRoutes);
app.use('/api/v1/likes',likeRoutes);
app.use('/api/v1/comment',commentRoute);
app.use('/api/v1/playlist',PlaylistRoute);
app.use('/api/v1/subscription',subscriptionRoute);

export default app;