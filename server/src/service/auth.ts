import JWT, { JwtPayload } from "jsonwebtoken";



const secret="@Beer123!";

export interface JWTPayload {
  _id: string;
  username: string;
}


export function createWebToken(user:JwtPayload):string{
    const payload:JwtPayload={
        _id:user._id,
        username:user.username
    } 
const token=JWT.sign(payload,secret);
return token;
}

export function ValidateToken(token:string):JwtPayload{
const payload=JWT.verify(token,secret)as JwtPayload;
return payload;
}