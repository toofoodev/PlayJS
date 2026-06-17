const v = "1.0.2";
// PlayJS - Made by WesGoof

// If you're self-hosting on Windows, run "RUNSERVER.BAT"
// If you're on a server hosting website, add this file as the startup file. (My personal fav is Wispbyte.)

// Join the Discord: discord.gg/ygHWDuxkBQ

// ------------------

// Customize

// Make sure you're on the newest PlayJS version!
const checkversion = true; // Default = True

// Log ALL actions. Not recommended for production but for development.
const log = false; // Default = False

// Enable the Web GUI (at localhost:{port}/admin)
const webgui = true; // Default = True

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
import { mkdirSync, readdirSync } from "node:fs";
import set from 'lodash/set';

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

// check web pass
if (webgui) {
    const info = await Bun.file(`${svrpath}/weblogin.json`).json();
    if (info.password == "playjs") {
        console.error(`Please update the password in "weblogin.json"`)
        process.exit(1);
    }
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
if (log) {
    console.log(`Checks: Cosmetics JSON (+) - Default User JSON (+) - Player & Server Data Folders (?)`);
}

// server balls
if (log) {
    console.log(`Starting server on port ${serverport}`);
}

const server = Bun.serve({
  port: serverport,
  async fetch(req) {
    const url = new URL(req.url);
    if (log) {
            console.log(`User requested ${url.pathname}`);
    }

    // === SERVER ===

    // get datata balllls
    if (req.method === "GET" && url.pathname.startsWith("/server/data/")) {
        // what you wanna get boi
        const get = url.pathname.replace("/server/data/", "");

        // get path
        const filePath = `${svrpath}/data.json`;

        // set
        const data = await Bun.file(filePath).json();
        const value = data[get];

        if (value == null || value == undefined) {
            return new Response("null", { status: 400 });
        }

        if (log) {
            console.log(`Result: ${value} | 200 TXT`);
        }
        return new Response(value, { status: 200 });
    }

    // === END ===

    // === USER ===

    // check if user json exists
    if (req.method === "GET" && url.pathname.startsWith("/user/find/")) {
        const playerid = url.pathname.replace("/user/find/", "");
        const file = Bun.file(`${pdpath}/${playerid}.json`);

        if (await file.exists()) {
            console.log(`User got: ${playerid}`)
            if (log) {
                console.log(`Result: User found! | 200 TXT`);
            }
            return new Response("User found!", { status: 200 });
        } else {
            if (log) {
                console.log(`Result: User not found! | 400 TXT`);
            }
            return new Response("User not found!", { status: 400 });
        }
    }

    // get user info
    if (req.method === "GET" && url.pathname.startsWith("/user/get/")) {
        const playerid = url.pathname.replace("/user/get/", "");
        const file = Bun.file(`${pdpath}/${playerid}.json`);

        if (!await file.exists()) {
            if (log) {
                console.log(`Result: User not found! | 404 TXT`);
            }
            return new Response("User not found!", { status: 404 });
        }

        if (log) {
            console.log(`Result: ${file} | 200 JSON`);
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
            if (log) {
                console.log(`Result: User already created! | 409 TXT`);
            }
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

        if (log) {
            console.log(`Result: ${Bun.file(filePath)} | 200 JSON`);
        }

        // i need to change this to respond with json so unity doesnt trip the fuck out :sob:
        return new Response(Bun.file(filePath), {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    // change som
    if (req.method === "GET" && url.pathname.startsWith("/user/edit/")) {
    const change = url.pathname.replace("/user/edit/", "");
    const playerid = req.headers.get("player");
    let what = req.headers.get("what"); // Changed from const to let

    if (!playerid) return new Response("PlayerID", { status: 401 });
    if (!what) return new Response("What", { status: 401 });

    // FIX: Safely parse numbers or array structures before Lodash saves them
    try {
        what = JSON.parse(what);
    } catch (e) {
        // Leave it as a standard string string if parsing fails
    }

    const filePath = `${pdpath}/${playerid}.json`;
    const data = await Bun.file(filePath).json();
    set(data, change, what);
    await Bun.write(filePath, JSON.stringify(data, null, 4));

    return new Response(`Changed ${change} to ${what}`, { status: 200 });
}

    // === END ===

    // === COSMETICS ===

    // get all cosmetics in store
    if (req.method === "GET" && url.pathname == "/cosmetics/all/" || url.pathname == "/cosmetics/all") {
        const file = Bun.file(`${svrpath}/${cjname}.json`);
        
        if (log) {
            console.log(`Result: ${file} | 200 JSON`);
        }
        return new Response(file, {
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    // cosmetic buy
    if (req.method === "GET" && url.pathname == "/cosmetics/buy/" || url.pathname == "/cosmetics/buy") {
        const cos = `${svrpath}/${cjname}.json`;

        // get headers bc i said so
        const playerid = req.headers.get("player");
        const cosid = req.headers.get("cosmetic");

        if (!playerid) {
            if (log) {
                console.log(`Result: PlayerID | 401 TXT`);
            }
            return new Response("PlayerID", { status: 401 });
        }

        if (!cosid) {
            if (log) {
                console.log(`Result: CosID | 401 TXT`);
            }
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
            if (log) {
                console.log(`Result: Not enough currency | 400 TXT`);
            }
            return new Response("Not enough currency", { status: 400 });
        }

        // damn
        if (plrdata.cosmetics.includes(cosid)) {
            if (log) {
                console.log(`Result: Already owned | 400 TXT`);
            }
            return new Response("Already owned", { status: 400 });
        }
        plrdata.currency -= price;
        plrdata.cosmetics.push(cosid);

        await Bun.write(player, JSON.stringify(plrdata, null, 4));

        if (log) {
            console.log(`Result: Bought the thing you wanted :D | 200 TXT`);
        }
        return new Response("Bought the thing you wanted :D", { status: 200 });
    }

    // === END ===

    // web gui
    // check if they want the gui
    if (webgui) {
        if (req.method === "GET" && (url.pathname == "/admin/" || url.pathname == "/admin")) {
            // respond with index.html
            const file = Bun.file(`web/index.html`);
            return new Response(file, {
                headers: {
                    "Content-Type": "text/html"
                }
            });
        }

        if (req.method === "GET" && (url.pathname == "/admin/dash/" || url.pathname == "/admin/dash")) {
            // respond with dash.html
            const file = Bun.file(`web/dash.html`);
            return new Response(file, {
                headers: {
                    "Content-Type": "text/html"
                }
            });
        }

        // Get all players list
if (req.method === "GET" && (url.pathname === "/admin/players" || url.pathname === "/admin/players/")) {
    try {
        const files = readdirSync(pdpath); // Reads the playerdata directory
        const playersList = [];

        for (const file of files) {
            if (file.endsWith(".json")) {
                const playerData = await Bun.file(`${pdpath}/${file}`).json();
                
                // Push an object containing only what the HTML needs
                playersList.push({
                    name: playerData.name || "Unknown Player",
                    id: playerData.id || file.replace(".json", "")
                });
            }
        }

        return Response.json(playersList);
    } catch (err) {
        return Response.json({ success: false, message: "Could not retrieve players" }, { status: 500 });
    }
}

        // login
        if (req.method === "POST" && (url.pathname == "/admin/login/" || url.pathname == "/admin/login")) {
            const info = await Bun.file(`${svrpath}/weblogin.json`).json();
            const { username, password } = await req.json();
            if (username == info.username && password == info.password) {
                return new Response(`{ "token": "${btoa(info.password)}" }`, {
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
            }
            return new Response(JSON.stringify({ success: false, message: "Invalid credentials" }), { 
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
        }

        // do check
if (req.method === "POST" && (url.pathname === "/admin/verify" || url.pathname === "/admin/verify/")) {
    try {
        const { token } = await req.json();

        const info = await Bun.file(`${svrpath}/weblogin.json`).json();
        if (token && atob(token) === info.password) {
            return Response.json({ success: true });
        }

        return Response.json({ success: false, message: "Invalid token" }, { status: 401 });
    } catch (err) {
        return Response.json({ success: false, message: "Bad Request" }, { status: 400 });
    }
}
    }

    // 404
    if (log) {
        console.log(`Result: This is a PlayJS Server. (https://github.com/TooFooDev/PlayJS) | 404 TXT`);
    }
    return new Response("This is a PlayJS Server. (https://github.com/TooFooDev/PlayJS)", { status: 404 });
  },
  });

// ------------------

console.log(`Server running at http://localhost:${server.port}`);