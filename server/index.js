const io = require('socket.io')(3000, {
    cors: {
        origin: ['http://127.0.0.1:5500']
    }
})

let users = []

io.on('connection', socket => {
    // now store the new player 
    users.push({
        id: socket.id,
        x: 400,
        y: 350,
    })
    console.log(users)
    
    socket.on('getPlayerLocations', () => {
        io.emit('playerLocations', users)
    })

    // check for movement
    socket.on('move', newLocation => {
        // update player location 
        users.forEach(user => {
            if (user.id === socket.id) {
                user.x = newLocation.x
                user.y = newLocation.y
            }
        })
        // send new location to all players 
        io.emit('playerLocations', users)
    })

    socket.on('disconnect', () => {
        users = users.filter(user => user.id !== socket.id)
        io.emit('playerLocations', users)
    });

})
