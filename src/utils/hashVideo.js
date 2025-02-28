import { createHash } from "crypto";
import fs from "fs";
import { Stream } from "stream";

const videohash = (videoFile) =>{
    return new Promise((resolve,reject)=>{
        const hash = createHash("sha256");
        const stream = fs.createReadStream(videoFile);

        stream.on("data",(data)=>hash.update(data));
        stream.on("end",()=>resolve(hash.digest("hex")));
        stream.on("error",reject);

    })
}

export {videohash}