import express, { json, urlencoded } from "express";
import dotenv from "dotenv";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import "express-async-errors";
import cookieParser from "cookie-parser";
import cors from "cors";

//DB
import connectDB from "./DB/connect.js";

//middleware
import notFoundMiddleware from "./middleware/not-found.js";
import errorHandlerMiddleware from "./middleware/errorHandler.js";

//auth middleware
import authenticateUser from "./middleware/authentication.js";

//route imports
import authRouter from "./routes/authRoutes.js";

import tutorRouter from "./routes/tutorRoutes.js";
import userRouter from "./routes/userRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
//dirname import- needed since were using esmodules and not commonJS
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

app.set("trust proxy", 1);
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(json());
//app.use(urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({ msg: "API" });
});

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/user", authenticateUser, userRouter);
app.use("/api/v1/tutors", authenticateUser, tutorRouter);
app.use("/api/v1/rooms", authenticateUser, roomRouter);
app.use("/api/v1/messages", authenticateUser, messageRouter);
app.use(
  "/images",
  authenticateUser,
  express.static(path.join(__dirname, "/images"))
);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = 3000 || process.env.PORT;

//io.on("connection", (socket) => console.log(`User connected ${socket.id}`));

io.on("connection", (socket) => {
  socket.on("join", (roomId) => {
    //console.log(socket.rooms);

    //socket has to leave all other rooms before it joins new one , prevents events from being visible while in another room
    Array.from(socket.rooms)
      //by default the users own socket id is in socket.rooms we have to exclude it
      .filter((item) => item !== socket.id)
      .forEach((room) => {
        if (room !== roomId) {
          socket.leave(room);

          console.log(`User:${socket.id} has left room: ${room}`);
        }
      });
    socket.join(roomId); //join user to specific room

    //socket.roomId = roomId;

    // console.log(`User joined room ${roomId}`);
  });

  socket.on(`emitMessage`, ({ message, roomId, sender }) => {
    //visible to everyone in the room including the sender
    const messageInfo = { message, sender };
    //console.log(messageInfo);
    io.to(roomId).emit("onMessage", messageInfo);
  });
  //Only display typing event to recipient
  socket.on("typing", ({ roomId }) => {
    socket.to(roomId).emit("...typing");
  });
  socket.on("stopped", ({ roomId }) => {
    socket.to(roomId).emit("...stopped");
  });
  //handle disconnects
  socket.on("disconnect", () => {
    /*socket.rooms.forEach((roomId) => {
      socket.leave(roomId);
      console.log(`User has left room: ${roomId}`);
    });*/
    Array.from(socket.rooms).forEach((room) => {
      socket.leave(room);
      console.log(`User has left room ${room}`);
    });
  });
});

const startServer = async () => {
  try {
    await connectDB(process.env.DEVDB);
    httpServer.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();
