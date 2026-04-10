import express from "express"
import { JWT_SECRET } from "@repo/backend-common/config"
import jwt from "jsonwebtoken"
import { authMiddleware } from "./middleware"
import { CreateRoomSchema, CreatUserSchema, SigninSchema } from "@repo/common/zodSchema"
import { prismaClient } from "@repo/db/client"
import bcrypt from "bcrypt"
import cors from "cors"

const app = express()
app.use(express.json())
app.use(cors())

app.post('/signup', async (req, res) => {

    const result = CreatUserSchema.safeParse(req.body)
    if (!result.success) {
        return res.json({
            message: "Incoorect input credentials"
        })
    }
    const { username, password, name, photo } = result.data

    const existingUser = await prismaClient.user.findUnique({
        where: { email: username }
    })
    if (existingUser) {
        return res.status(401).json({
            message: "User is already exist with this email"
        })
    }

    try {
        const hashedPass = await bcrypt.hash(password, 10)

        const user = await prismaClient.user.create({
            data: {
                email: username,
                password: hashedPass,
                name,
                photo
            }
        })
        const token = jwt.sign({
            userId: user.id
        }, JWT_SECRET!);

        res.json({
            token,
            message: "User Created Successfully"
        });

    } catch (e: any) {
        return res.status(411).json({
            message: "Something went wrong",
            error: e.message
        })
    }

})

app.post('/signin', async (req, res) => {

    const parrsed = SigninSchema.safeParse(req.body)

    if (!parrsed.success) {
        return res.status(411).json({
            message: "Invalid input type"
        })
    }

    const { username, password } = parrsed.data

    const user = await prismaClient.user.findUnique({
        where: {
            email: username
        }
    })

    if (!user) {
        return res.status(401).json({
            message: "User with this email is not exist"
        })
    }

    const matchPassword = await bcrypt.compare(password, user.password)

    if (!matchPassword) {
        return res.status(500).json({
            message: "Entered password is not correct. Please Enter correct password"
        })
    }

    const userId = user.id
    const token = jwt.sign({
        userId
    }, JWT_SECRET)

    res.json({
        token
    })
})

app.post('/room', authMiddleware, async (req, res) => {

    const parrsed = CreateRoomSchema.safeParse(req.body)
    if (!parrsed.success) {
        return res.status(400).json({
            message: "Invalid input"
        })
    }

    const userId = req.userId
    if (!userId) {
        return res.status(401).json({
            message: "Unauthorized"
        })
    }

    const existingRoom = await prismaClient.room.findUnique({
        where: {
            slug: parrsed.data.room
        }
    })

    if (existingRoom) {
        return res.status(409).json({
            message: "Room already exists"
        })
    }

    const room = await prismaClient.room.create({
        data: {
            slug: parrsed.data.room,
            adminId: userId,
        }
    })

    res.json({
        roomId: room.id,
        slug: room.slug
    })
})

app.get('/chats/:roomId', async (req, res) => {
    // May be the roomId passed by someone is 'abc' that result into DB query breaks silently
    const roomId = parseInt(req.params.roomId)       //   This is not just enough

    if (isNaN(roomId)) {
        return res.status(400).json({ message: "Invalid roomId" });
    }

    const room = await prismaClient.room.findUnique({
        where: { id: roomId }
    });

    if (!room) {
        return res.status(404).json({
            message: "Room not found"
        });
    }

    const messages = await prismaClient.chat.findMany({
        where: {
            roomId: roomId
        },
        orderBy: {
            id: "desc"
        },
        take: 100
    })

    res.json({
        messages
    })
})

app.get("/room/:slug", async (req, res) => {
    const slug = req.params.slug
    const room = await prismaClient.room.findFirst({
        where: {
            slug: slug
        }
    })

    if(!room){
        return res.status(404).json({
            message: "Room not found"
        })
    }

    res.json({
        roomId: room.id,
        slug: room.slug
    })
})

app.get('/rooms', async (req, res) =>{
    const rooms = await prismaClient.room.findMany({
        orderBy:{
            createdAT:"desc"
        }
    });

    res.json({
        rooms
    })
})

app.listen(4000)