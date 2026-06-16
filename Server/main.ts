const v = "1.0.0";
// PlayJS - Made by WesGoof
// Go to "localhost:{port}/url" to find all the urls that are used.

// If you're self-hosting on Windows, run "RUNSERVER.BAT"
// If you're on a server hosting website, add this file as the startup file. (My personal fav is Wispbyte.)

// Join the Discord: discord.gg/ygHWDuxkBQ

// ------------------

// Customize

// Make sure you're on the newest PlayJS version!
const checkversion = true; // Default = True

// The port the server runs on.
const serverport = 3000; // Default = 3000

// The folder with all the player data.
const pdpath = "playerdata"; // Default = playerdata

// The folder with all the server data.
const svrpath = "serverdata"; // Default = serverdata

// The name of the default json when creating players.
const dpjname = "defaultUser"; // Default = defaultUser

// The name of the cosmetics json that holds all of your cosmetics. (Names & Prices)
const cjname = "cosmetics"; // Default = cosmetics

// ------------------
// The no touch zone (unless you can code, like me. im pro coder man trust :O)

// import some stuff bc you need it. trust me. you need it!
import { mkdirSync } from "node:fs";

// check playjs version
if (checkversion == true) {
    try {
    console.log(`Checking Version`);
    const response = await fetch("https://raw.githubusercontent.com/toofoodev/PlayJS/refs/heads/main/version");

    if (!response.ok) {
      throw new Error(`oops`);
    }

    const newestversion = (await response.text()).trim(); 
        
        if (newestversion == v) {
            console.log("No need to update!");
        }
        else {
            console.error("You need to update to the newest version of PlayJS! If you don't care, change the 'checkversion' value in 'Customization' to 'false'.");
            process.exit(1);
        }
    
  } catch (error) {
    console.error(`oops`);
    process.exit(1);
}
}

// welcome 67
const welcome = await Bun.file("message.txt").text();
if (welcome) {
    console.log(welcome);
}
else {
    console.log("That was mean to delete my message like that! :sob:");
    console.log("It's fine, it's your machine BUT IT'S MY PROGRAM MWAHAHAHAHAHAHA");
}

// start shit to make sure you didnt fuck up!

// check folders (svrdata & plrdata)
mkdirSync(pdpath, { recursive: true });
mkdirSync(svrpath, { recursive: true });

// check def user
const du = Bun.file(`${svrpath}/${dpjname}.json`);
if (!await du.exists()) {
    console.error(`There is no "Default User" file named "${dpjname}.json"`)
    process.exit(1);
}

// check cos json
const cj = Bun.file(`${svrpath}/${cjname}.json`);
if (!await cj.exists()) {
    console.error(`There is no "Cosmetics" file named "${cjname}.json"`)
    process.exit(1);
}

// server balls

const server = Bun.serve({
  port: serverport,
  async fetch(req) {
    const url = new URL(req.url);
    // server info (all url links for people who dont want to search the code)
    if (req.method === "GET" && url.pathname === ("/url")) {
        const file = Bun.file(`${svrpath}/needed.json`);
        
        return new Response(file, {
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    // check if user json exists
    if (req.method === "GET" && url.pathname.startsWith("/user/find/")) {
        const playerid = url.pathname.replace("/user/find/", "");
        const file = Bun.file(`${pdpath}/${playerid}.json`);

        if (await file.exists()) {
            console.log(`User got: ${playerid}`)
            return new Response("User found!", { status: 200 });
        } else {
            return new Response("User not found!", { status: 400 });
        }
    }

    // get user info
    if (req.method === "GET" && url.pathname.startsWith("/user/get/")) {
        const playerid = url.pathname.replace("/user/get/", "");
        const file = Bun.file(`${pdpath}/${playerid}.json`);

        if (!await file.exists()) {
            return new Response("User not found!", { status: 404 });
        }

        return new Response(file, {
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    // create user with id and set it bc wee neeeeeeeeddddd too
    if (req.method === "GET" && url.pathname.startsWith("/user/create/")) {
        const playerid = url.pathname.replace("/user/create/", "");
        const file = Bun.file(`${pdpath}/${playerid}.json`);

        if (await file.exists()) {
            return new Response("User already created!", { status: 409 });
        }

        // create
        const defaultUserJson = Bun.file(`${svrpath}/${dpjname}.json`);
        await Bun.write(`${pdpath}/${playerid}.json`, defaultUserJson);
        const filePath = `${pdpath}/${playerid}.json`;

        // set id
        const data = await Bun.file(filePath).json();
        data.id = playerid;
        await Bun.write(filePath, JSON.stringify(data, null, 4));

        // i need to change this to respond with json so unity doesnt trip the fuck out :sob:
        return new Response(Bun.file(filePath), {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    // get all cosmetics in store
    if (req.method === "GET" && url.pathname == ("/cosmetic/")) {
        const file = Bun.file(`${svrpath}/${cjname}.json`);
        
        return new Response(file, {
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    // cosmetic buy
    if (req.method === "GET" && url.pathname == ("/cosmetic/buy/")) {
        const cos = `${svrpath}/${cjname}.json`;

        // get headers bc i said so
        const playerid = req.headers.get("player");
        const cosid = req.headers.get("cosmetic");

        if (!playerid) {
            return new Response("PlayerID", { status: 401 });
        }

        if (!cosid) {
            return new Response("CosID", { status: 401 });
        }

        const player = `${pdpath}/${playerid}.json`;

        // get cosmetic
        const cosdata = await Bun.file(cos).json();
        const price = cosdata[cosid];
        if (price === undefined) {
            console.warn(`User (${playerid}) tried to buy ${cosid} but Price (${price}) was null!`);
            return new Response("Cosmetic does not exist", { status: 401 });
        }

        // get player
        const plrdata = await Bun.file(player).json();

        // sucks to be you!
        if (plrdata.currency < price) {
            return new Response("Not enough currency", { status: 400 });
        }

        // damn
        if (plrdata.cosmetics.includes(cosid)) {
            return new Response("Already owned", { status: 400 });
        }
        plrdata.currency -= price;
        plrdata.cosmetics.push(cosid);

        await Bun.write(player, JSON.stringify(plrdata, null, 4));

        return new Response("Bought the thing you wanted :D", { status: 200 });
    }

    return new Response("This is a PlayJS Server. (https://github.com/TooFooDev/PlayJS)", { status: 404 });
  },
});

// ------------------

console.log(`Server running at http://localhost:${server.port}`);