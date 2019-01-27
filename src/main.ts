
const FRAME_RATE = 100
let DIFFICULTY = 1
const FILLED_COLOR = '#1fad1a'
const GAME_COLOR = '#222'
const FOOD_COLOR = 'orange'
const GAME_OVER_COLOR = 'red'
const NUMBER_COLUMNS: number = 75;
const NUMBER_ROWS: number = 75;
let game: SnakeGame;

interface Snake {
    body: Pixel[]
    direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN',
    path: Point[]
    dead: boolean
}

interface Point {
    x: number
    y: number
}

interface Pixel {
    point: Point
    w: number,
    h: number
    filled: boolean
    link?: Pixel
}

let animationHandler: NodeJS.Timeout;

interface Food {
    pixel: Pixel,
    eaten: boolean
}

interface Game {
    snake?: Snake 
    food?: Food
    rows: number
    cols: number
    createFood(): Food
    createSnake(): Snake
}

class SnakeGame implements Game {

    snake?: Snake
    food?: Food
    rows: number = 0
    cols: number = 0
    constructor() { }

    start(rows: number , cols: number): Game {
        this.rows = rows
        this.cols = cols
        return this.restart()
    }

    restart(): Game {
        this.snake = this.createSnake()
        this.food = this.createFood()
        return this
    }

    createFood(): Food {
        let pixel = {
            point: {
                x: Math.ceil(Math.random() * this.cols),
                y: Math.ceil(Math.random() * this.rows),
            },
            w: 0,
            h: 0,
            filled: true
        }
        return {
            pixel,
            eaten: false
        }
    }
    
    createSnake(): Snake {
        const _body = [
            {
                point: {
                    x: Math.ceil(Math.random() * this.cols),
                    y: Math.ceil(Math.random() * this.rows),
                },
                w: 0,
                h: 0,
                filled: true
            }
        ]
        return {
            direction: 'RIGHT',
            body: _body,
            path: [_body[0].point],
            dead: false
        }
    }

    setDirection(direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN' ) {
        this.snake!.direction = direction
    }

}

(() => {

    const container: HTMLDivElement = document.createElement('div')
    const canvas: HTMLCanvasElement = document.createElement('canvas')
    const context: CanvasRenderingContext2D = canvas.getContext('2d')!
    container.appendChild(canvas)

    game = new SnakeGame()
    game.start(NUMBER_ROWS, NUMBER_COLUMNS)

    const draw = () => {
        updateCanvas(container, game)
    }

    const updateCanvas = (container: HTMLDivElement, game: Game ) => {
        const { width, height } = container.getBoundingClientRect()
        canvas.width = width
        canvas.height = height
        context.fillStyle = GAME_COLOR
        context.fillRect(0, 0, width, height)

        const { snake, food } = game

        if(snake === undefined || food === undefined) throw new Error('problem here')

        snake.body = snake.body.map(o => {
            o.w = width / NUMBER_COLUMNS
            o.h = height / NUMBER_ROWS
            return o
        })

        food.pixel.w = width / NUMBER_COLUMNS
        food.pixel.h = height / NUMBER_ROWS

        const { newFood, newSnake } = moveSnake(snake, food)

        if (newSnake.dead) {
            gameover(context, { width , height })
            return
        }

        game.food = newFood
        game.snake = newSnake
        game.food = food.eaten === true ? game.createFood() : food

        drawPixels(snake.body, context) /// snake
        drawPixel(food.pixel, context, food.eaten === false ? FOOD_COLOR : GAME_COLOR)

    }

    window.onload = () => {
        document.body.appendChild(container)
        container.appendChild(canvas)
        increaseDifficulty()
    }

    const increaseDifficulty = () => {
        if (animationHandler !== undefined) {
            console.log('cleared interval')
            clearInterval(animationHandler)
        }

        animationHandler = setInterval(() => {
            draw()
        }, FRAME_RATE - DIFFICULTY)
    }

    window.onresize = () => {
        clearInterval(animationHandler)
        updateCanvas(container, game)
    }

    window.onkeydown = (e) => {
        switch (e.keyCode) {
            case 27:
                clearInterval(animationHandler)
                break;
            case 37:
                game.setDirection('LEFT')    
                break
            case 38:
                game.setDirection('UP')    
                break
            case 39:
                game.setDirection('RIGHT')    
                break
            case 40:
                game.setDirection('DOWN')    
                break
            case 82:
                clearInterval(animationHandler)
                game.restart()
                increaseDifficulty()
                break
            default: break
        }

        console.log(e.keyCode)

    }
   
})()

const gameover = (context: CanvasRenderingContext2D, dimensions: { width: number , height: number }) => {
    clearInterval(animationHandler)
    context.fillStyle = GAME_OVER_COLOR
    context.fillRect(0, 0, dimensions.width, dimensions.height)
}

/**
 * Draws all pixels on the canvas
 *
 * @param {Pixel[]} pixels
 * @param {CanvasRenderingContext2D} canvas
 */
const drawPixels = (pixels: Pixel[], canvas: CanvasRenderingContext2D) => {

    pixels.forEach(p => {
        drawPixel(p, canvas, p.filled === true ? FILLED_COLOR : GAME_COLOR)
    })

}

/**
 * Drawa the pixels to the canvas using the color provided
 *
 * @param {Pixel} pixel
 * @param {CanvasRenderingContext2D} canvas
 * @param {string} color
 */
const drawPixel = (pixel: Pixel, canvas: CanvasRenderingContext2D, color: string) => {
    const { x, y } = pixel.point
    canvas.fillStyle = color
   canvas.fillRect(x * pixel.w, y * pixel.h, pixel.w, pixel.h)
}

/**
 * Moves the snake one pixel in the direction which it is currently moving.
 * If the snake hits the side then it re appears on the opposite side
 *
 * @param {Snake} snake
 * @param {Food} food
 * @returns {Food}
 */
const moveSnake = (snake: Snake, food: Food): { newSnake: Snake, newFood: Food } => {

    let direction = snake.direction
    let hori = ['LEFT', 'RIGHT'].includes(direction) ? direction === 'LEFT' ? -1 : 1 : 0
    let vert = ['UP', 'DOWN'].includes(direction) ? direction === 'UP' ? -1 : 1 : 0

    //console.log('is food eaten' , snake)
    let n_x: number = snake.body[0].point.x; // next x
    let n_y: number = snake.body[0].point.y; // next y

    const newPoint = {
        x: n_x + hori,
        y: n_y + vert
    }

    if (hasHitWall(newPoint)) {
        snake.dead = true
        return {
            newSnake: snake,
            newFood: food
        }
    }

    if (willSnakeMoveBackwards(newPoint , snake) ) {
        snake.dead = true
        return {
            newSnake: snake,
            newFood: food
        }
    }

    if (canSnakeEatFood(snake, food)) {
        snake = eatFood(food , snake )
    } else {
        snake = moveForward(newPoint , snake)
    }

    return {
        newSnake: snake,
        newFood: food
    }
}

const hasHitWall = (snakeHead: Point): boolean => {
    const { x, y } = snakeHead
    return !(x >= 0 && x <= (NUMBER_COLUMNS - 1) && y >= 0 && y <= (NUMBER_ROWS - 1))
}

const willSnakeMoveBackwards = (point: Point , snake: Snake): boolean => {

    if(snake.body.filter(i => { return i.point.x === point.x && i.point.y === point.y }).length > 0) {
        return true
    }

    return false
}

const canSnakeEatFood = (snake: Snake, food: Food): boolean => {
    return snake.path.filter(l => l.x === food.pixel.point.x && l.y === food.pixel.point.y).length > 0
}

const eatFood = (food: Food , snake: Snake): Snake => {
    food.eaten = true
    snake.body.unshift(food.pixel)
    snake.path = []
    return snake
}

const moveForward = (point: Point , snake: Snake): Snake => {
    const head = {
        ...snake.body[0],
        point
    }
    snake.body.unshift(head)
    snake.body.pop()
    snake.path.push(head.point)
    return snake
}

