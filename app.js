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
import testRouter from "./routes/testRoutes.js";
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
app.use("/api/v1/test", authenticateUser, testRouter);
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

io.on("connection", (socket) => console.log(`User connected ${socket.id}`));

io.on("connection", (socket) => {
  //socket.on("form", (msg) => {
  //socket.emit("form", msg);
  socket.on("join", (roomId) => {
    //console.log(roomName);
    //console.log(socket.id);
    //let name = roomName;
    //console.log(socket.rooms);

    /*Array.from(socket.rooms)
      .filter((item) => item !== socket.id)
      .forEach((id) => {
        socket.leave(id);
        socket.removeAllListeners(`emitMessage`);
      });*/
    //console.log(socket.rooms);
    // });
    socket.join(roomId); //join user to specific room
    //socket.on(`emitMessage`, (message) => {
    //Array.from(socket.rooms)
    //.filter((item) => item !== socket.id)
    //.forEach((id) => {
    //socket.in(roomName).emit("onMessage", message);
    //});
    // });
    console.log(`User joined room ${roomId}`);
  });
  socket.on(`emitMessage`, ({ message, roomId }) => {
    //console.log(message);
    io.to(roomId).emit("onMessage", message);
  });

  /* socket.on("disconnect", () => {
    console.log(socket.id + " ==== disconnected");
    socket.removeAllListeners();
  });*/
});

/*io.on("connection", (socket) => {
  socket.on("join", (roomName) => {
    socket.join(roomName);
    socket.on("emitMessage", (msg) => {
      socket.to(roomName).emit("onMessage", msg);
    });
  });
});*/

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

export { io };
