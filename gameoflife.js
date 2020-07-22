const body = document.getElementsByTagName('BODY')[0]
const gridContainer = document.getElementById('grid-container')
const nightModeSwitch = document.getElementById('nightmode')
const forceGreyscaleSwitch = document.getElementById('greyscale')
const invertControl = document.getElementById('invert-control')
const invertSwitch = document.getElementById('invert')
const pauseSwitch = document.getElementById('pause')
const clearButton = document.getElementById('clear')
const randomButton = document.getElementById('randomize')
const canvas = { height: 50, width: 50 }

nightModeSwitch.addEventListener('change', switchNightMode)
forceGreyscaleSwitch.addEventListener('change', switchGreyscale)
invertSwitch.addEventListener('change', switchInverted)
pauseSwitch.addEventListener('change', switchPause)
clearButton.addEventListener('click', clearGrid)
randomButton.addEventListener('click', () => {
  clearGrid()
  rePaintGrid()
  randomize()
})

document.addEventListener('keydown', (e) => {
  if (e.keyCode !== 32) return
  e.preventDefault()
  paused = !paused
  pauseSwitch.checked = paused
})

const grid = []
let paused = false
let painting = false
let nightMode = false
let greyscale = true
let inverted = false

function createGrid () {
  for (let i = 0; i <= canvas.width; i++) {
    grid[i] = []
    for (let j = 0; j <= canvas.height; j++) {
      grid[i][j] = { state: 0, neighbors: findNeighbors(i, j) }
      const div = document.createElement('div')
      div.classList.add('grid-point')
      div.dataset.x = i
      div.dataset.y = j
      div.id = `${i}, ${j}`
      div.addEventListener('mousedown', allowPaint)
      div.addEventListener('mouseover', markPoint)
      div.addEventListener('mouseup', liftMouse)
      gridContainer.appendChild(div)
    }
  }
}

function clearGrid () {
  grid.forEach((x) => {
    x.forEach(y => {
      y.state = 0
    })
  })
  rePaintGrid()
}

function rc () {
  return Math.floor(Math.random() * 255)
}

function randomColor () {
  return `rgb(${rc()}, ${rc()}, ${rc()})`
}

function getLiveColor () {
  if (greyscale) {
    if (inverted) {
      return 'white'
    } else {
      return 'black'
    }
  } else if (inverted) {
    return 'white'
  } else {
    return randomColor()
  }
}

function getDeadColor () {
  if (greyscale) {
    if (inverted) {
      return 'black'
    } else {
      return 'white'
    }
  } else if (inverted) {
    return randomColor()
  } else {
    return 'white'
  }
}

function switchNightMode (e) {
  nightMode = !nightMode
  nightMode ? body.classList.add('night-background') : body.classList.remove('night-background')
}

function switchGreyscale (e) {
  greyscale = !greyscale
  if (!greyscale) {
    invertSwitch.checked = false
    inverted = false
  }
  greyscale ? invertControl.classList.remove('disabled') : invertControl.classList.add('disabled')
  if (paused) rePaintGrid()
}

function switchInverted (e) {
  inverted = !inverted
  if (paused) rePaintGrid()
}

function switchPause (e) {
  paused = !paused
}

function rePaintGrid () {
  grid.forEach((x, i) => {
    x.forEach((y, j) => {
      const div = document.getElementById(`${i}, ${j}`)
      if (y.state === 1) {
        div.style.backgroundColor = getLiveColor()
      } else {
        div.style.backgroundColor = getDeadColor()
      }
    })
  })
}

function allowPaint (e) {
  if (!paused) return
  e.preventDefault()
  painting = true
  markPoint(e)
}

function markPoint (e) {
  e.preventDefault()
  if (!painting) return
  const x = parseInt(e.target.dataset.x)
  const y = parseInt(e.target.dataset.y)
  if (grid[x][y].state === 0) {
    grid[x][y].state = 1
    e.target.style.backgroundColor = getLiveColor()
  } else {
    grid[x][y].state = 0
    e.target.style.backgroundColor = getDeadColor()
  }
}

function liftMouse (e) {
  e.preventDefault()
  painting = false
}

function findNeighbors (x, y) {
  return [
    { x: x + 1, y: y },
    { x: x + 1, y: y + 1 },
    { x: x + 1, y: y - 1 },
    { x: x, y: y + 1 },
    { x: x, y: y - 1 },
    { x: x - 1, y: y },
    { x: x - 1, y: y + 1 },
    { x: x - 1, y: y - 1 }
  ]
}

function randomize (points = Math.floor(Math.random() * (canvas.width * canvas.height) / 2)) {
  for (let i = 0; i <= points; i++) {
    const randomX = Math.floor(Math.random() * canvas.width)
    const randomY = Math.floor(Math.random() * canvas.height)
    const div = document.getElementById(`${randomX}, ${randomY}`)
    div.style.backgroundColor = getLiveColor()
    grid[randomX][randomY].state = 1
  }
}

function loop () {
  if (paused) { requestAnimationFrame(loop); return }
  const newGrid = JSON.parse(JSON.stringify(grid))
  newGrid.forEach((x, i) => {
    x.forEach((y, j) => {
      const div = document.getElementById(`${i}, ${j}`)
      let neighborsAlive = 0
      y.neighbors.forEach(n => {
        if (n.x < 0 || n.y < 0 || n.x > canvas.width || n.y > canvas.height) return
        if (newGrid[n.x][n.y].state === 1) {
          neighborsAlive++
        }
      })
      if (y.state === 1) {
        if (neighborsAlive < 2 || neighborsAlive > 3) {
          grid[i][j].state = 0
        }
      } else {
        if (neighborsAlive === 3) {
          grid[i][j].state = 1
        }
      }
      if (grid[i][j].state === 1) {
        div.style.backgroundColor = getLiveColor()
      } else {
        div.style.backgroundColor = getDeadColor()
      }
    })
  })
  requestAnimationFrame(loop)
}

createGrid()
randomize(2500)

loop()
