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
import { authenticateUser } from "./middleware/authentication.js";

//route imports
import authRouter from "./routes/authRoutes.js";

import tutorRouter from "./routes/tutorRoutes.js";
import userRouter from "./routes/userRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import sessionRouter from "./routes/sessionRoutes.js";
//dirname import- needed since were using esmodules and not commonJS
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

//misc
import { generateTokens } from "./utilities/nts.js";

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
app.use("/api/v1/sessions", authenticateUser, sessionRouter);
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
  socket.on("join", async (roomId) => {
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
    //console.log(`socket has joined room:${roomId}`);

    // Have a joining event
    // get no of sockets in room
    //Check if length/no is greater than 2
    //If so try to connect the 2 peers
    const SOCKETS = await io.in(roomId).fetchSockets();
    //console.log(SOCKETS.length);
    if (SOCKETS.length > 1) {
      socket.to(roomId).emit("otherUserJoined", roomId);
    }

    //socket.roomId = roomId;

    // console.log(`User joined room ${roomId}`);
  });

  socket.on(`emitMessage`, ({ message, roomId, sender }) => {
    //visible to everyone in the room including the sender
    const today = new Date();
    const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
    const dateTimeFormat = dateTimeFormatter.format(Date.parse(today));
    const messageInfo = { message, sender, dateTimeFormat };
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
  //sockets for WebRTC video calling
  /* socket.on("incomingCall", (data) => {
    console.log(data.room);
    socket.to(data.room).emit("call", { signal: data.signalData });
  });*/

  /*socket.on("acceptCall", (data) => {
    console.log(data.room);
    io.to(data.room).emit("callAccepted", data.signal);
  });*/
  socket.on("offer", (payload) => {
    socket.to(payload.roomId).emit("offer", payload);
  });

  socket.on("answer", (payload) => {
    socket.to(payload.roomId).emit("answer", payload.sdp);
  });

  socket.on("ice-candidate", (payload) => {
    socket.to(payload.roomId).emit("ice-candidate", payload.candidate);
  });

  //handle disconnects
  socket.on("disconnect", () => {
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
//generateTokens();
