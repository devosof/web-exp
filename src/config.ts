import dotenv from "dotenv";

dotenv.config({
    path: "C:/Users/Admin/Desktop/xcelliti-web/.env"
})

export const MONGODB_URI = process.env.MONGODB_URI!
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL!
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD! 