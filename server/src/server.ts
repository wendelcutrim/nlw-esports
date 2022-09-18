import express from 'express';
import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

import convertHourStringToMinutes from './utils/convertHourStringToMinutes';
import convertMinutesToHourString from './utils/convertMinutesToHourString';

const app = express();
app.use(cors());
dotenv.config()

app.use(express.json());

const prisma = new PrismaClient({
    log: ['query']
});
const port = process.env.PORT || 3333;


app.get('/games', async (req, res) => {
    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {ads: true}
            }
        }
    });

    return res.status(200).json(games);
});

app.post('/games/:id/ads', async (req, res) => {
    const { id } = req.params;
    const { name, yearsPlaying, discord, weekDays, hourStart, hourEnd, useVoiceChannel } = req.body;

    const ad = await prisma.ad.create({
        data: {
            gameId: id,
            name,
            yearsPlaying,
            discord, 
            weekDays: weekDays.join(','),
            hourStart: convertHourStringToMinutes(hourStart),
            hourEnd: convertHourStringToMinutes(hourEnd),
            useVoiceChannel
        }
    })


    return res.status(201).json(ad);
}); 

app.get('/games/:id/ads', async (req, res) => {
    const { id } = req.params;
    const ads = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hourStart: true,
            hourEnd: true,
        },
        
        where: {gameId: id},

        orderBy: {createdAt: 'desc'},
    });

    const response = ads.map(ad => {
        return ({
            ...ad,
            weekDays: ad.weekDays.split(','),
            hourStart: convertMinutesToHourString(ad.hourStart),
            hourEnd: convertMinutesToHourString(ad.hourEnd),
        })
    })

    return res.status(200).json(response);
});

app.get('/ads/:id/discord', async (req, res) => {
    const { id } = req.params;

    const ad = await prisma.ad.findUniqueOrThrow({
        select: {discord: true},
        where: {id}
    });

    return res.status(200).json(ad);
});


app.listen(port, () => console.log(`The server is running at port ${port}`));