const socket = io('http://localhost:3000')

const Application = PIXI.Application
let otherPlayers = []

let w = 800
let h = 500
const app = new Application({
    width: w,
    height: h,
    backgroundColor: 0x1099bb,
})

let backdrop = PIXI.Sprite.from('art/backdrop.png')
backdrop.anchor.set(0.5)
backdrop.x = app.view.width / 2
backdrop.y = app.view.height / 2

app.stage.addChild(backdrop)

let player = PIXI.Sprite.from('art/scientistwithlegs.png')
player.anchor.set(0.5)
player.x = app.view.width / 2
player.y = (app.view.height / 2) + 100

let id 

// socket connection
socket.on('connect', () => {
    // get session id
    id = socket.id
    socket.emit('getPlayerLocations')
    socket.on('playerLocations', playerLocations => {
        // remove current player from list
        playerLocations = playerLocations.filter(e => e.id !== id)
        // get list of new players 
        let newPlayers = playerLocations.filter(e => !otherPlayers.some(p => p.id === e.id))
        // get list of old players 
        let oldPlayers = playerLocations.filter(e => otherPlayers.some(p => p.id === e.id))

        // SPAWN NEW PLAYERS
        newPlayers.forEach(e => {
            let newPlayer = PIXI.Sprite.from('art/scientistwithlegs.png')
            newPlayer.anchor.set(0.5)
            newPlayer.x = e.x
            newPlayer.y = e.y
            app.stage.addChild(newPlayer)
            otherPlayers.push({
                id: e.id,
                body: newPlayer,
                desiredPosX: e.x,
                desiredPosY: e.y,
            })
        }) 

        // iterate through old players and update their positions
        oldPlayers.forEach(e => {
            let otherIndex = otherPlayers.findIndex(p => p.id === e.id)
            otherPlayers[otherIndex].desiredPosX = e.x
            otherPlayers[otherIndex].desiredPosY = e.y
        })
    })
})

let desiredPosition = {
    x: player.x,
    y: player.y,
}

app.stage.addChild(player)

app.stage.interactive = true
app.stage.hitArea = new PIXI.Rectangle(0, 0, w, h);
app.stage.on('click', setDesiredPosition)

app.ticker.add(gameLoop)
document.getElementsByClassName("container")[0].appendChild(app.view);

function setDesiredPosition(e) {
    // get desired position 
    let pos = e.data.global
    desiredPosition.x = pos.x
    desiredPosition.y = pos.y
    
    // set player direction 
    if (desiredPosition.x < player.x) {
        player.scale.x = -1
    } else if (desiredPosition.x > player.x) {
        player.scale.x = 1
    }

    // send new location to server
    socket.emit('move', { id, x: desiredPosition.x, y: desiredPosition.y })
}

function gameLoop() {
    const speed = 3
    // move player towards desired position 
    let dx = desiredPosition.x - player.x
    let dy = desiredPosition.y - player.y
    let dist = Math.sqrt(dx * dx + dy * dy)
    if (dist > 1 * speed) {
        player.x += (dx / dist) * speed
        player.y += (dy / dist) * speed
    }

    for (let e of otherPlayers) {
        let dx = e.desiredPosX - e.body.x
        let dy = e.desiredPosY - e.body.y
        let dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > 1 * speed) {
            e.body.x += (dx / dist) * speed
            e.body.y += (dy / dist) * speed
        }

        if (e.desiredPosX < e.body.x) {
            e.body.scale.x = -1
        } else if (e.desiredPosX > e.body.x) {
            e.body.scale.x = 1
        }
    }
}
