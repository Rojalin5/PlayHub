import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors';

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));
app.use(express.json({limit:"20kb"}))
app.use(express.urlencoded({extended:true,limit:"20kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import subscriptionRoute from "./routes/subscription.routes.js"
import commentRouter from "./routes/comments.routes.js"
import healthCheckupRouter from "./routes/healthcheck.routes.js"
import likeRouter from "./routes/likes.routes.js"



//route declaration
app.use("/api/v1/users",userRouter)
app.use("/api/v1/video",videoRouter)
app.use("/api/v1/subscription",subscriptionRoute)
app.use("/api/v1/comments",commentRouter)
app.use("/api/v1/healthcheckup",healthCheckupRouter)
app.use("/api/v1/likes",likeRouter)

export default app;