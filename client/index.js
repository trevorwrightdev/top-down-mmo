const Application = PIXI.Application

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
player.y = app.view.height / 2

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
    
}
