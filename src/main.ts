
const TOTAL_LIVES = 5
const DIFFICULTY_ID = 'app-difficulty-num'
const SCORE_ID = 'app-score-num'
const LIVES_ID = 'app-lives-num'
const GAME_BODY_ID = 'game-body'
const GAME_CANVAS_ID = 'game-canvas'
const FRAME_RATE = 100
const DIFFICULTY_INCREMENT = 5
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
    score: number
    lives: number
    snake?: Snake 
    food?: Food
    rows: number
    cols: number
    createFood(): Food
    createSnake(): Snake
    restart(): Game
    reset(): Game
}

class SnakeGame implements Game {

    score: number = 0
    lives: number = 1
    snake?: Snake
    food?: Food
    rows: number = 0
    cols: number = 0
    constructor() { }

    start(rows: number , cols: number, lives: number): Game {
        this.rows = rows
        this.cols = cols
        this.lives = lives
        return this.restart()
    }

    restart(): Game {
        this.snake = this.createSnake()
        this.food = this.createFood()
        return this
    }

    reset(): Game {
        this.score = 0
        this.lives = 1
        return this.restart()
    }

    createFood(): Food {

        let x = Math.floor(Math.random() * this.cols - 1)
        let y = Math.floor(Math.random() * this.rows - 1)

        let pixel = {
            point: {
                x: Math.abs(x),
                y: Math.abs(y),
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
                    x: Math.floor(Math.random() * this.cols - 1),
                    y: Math.floor(Math.random() * this.rows - 1),
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

    const difficulty = (): HTMLElement => {
        return document.getElementById(DIFFICULTY_ID)!
    }

    const score = (): HTMLElement => {
        return document.getElementById(SCORE_ID)!
    }

    const lives = (): HTMLElement => {
        return document.getElementById(LIVES_ID)!
    }

    const container = (): HTMLElement => {
        return document.getElementById(GAME_BODY_ID)!
    }

    const context = (): CanvasRenderingContext2D => {
        return canvas().getContext('2d')!
    }

    const canvas = (): HTMLCanvasElement => {
        return document.getElementById(GAME_CANVAS_ID) as HTMLCanvasElement
    }

    game = new SnakeGame()
    game.start(NUMBER_ROWS, NUMBER_COLUMNS,  TOTAL_LIVES)

    const draw = () => {
        updateCanvas(container() , canvas() , context(), game)
    }

    const setScore = (amount: number) => {
        score().innerHTML = amount.toString()
    }

    const setLives = (amount: number) => {
        lives().innerHTML = amount.toString()
    }

    const setDifficulty = (amount: number) => {
        difficulty().innerHTML = amount.toString()
    }
    const reset = () => {
        setScore(0)
        setLives(TOTAL_LIVES)
        setDifficulty(0)
    }

    const updateCanvas = (container: HTMLElement, canvas: HTMLCanvasElement , context: CanvasRenderingContext2D , game: Game ) => {
        
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

        game.lives = newSnake.dead === true ? game.lives - 1 : game.lives

        if (newSnake.dead && game.lives <= 0) {
            game = gameover(game, context, { width , height })
            reset()
            return
        }

        if( newSnake.dead ) {
            clearInterval(animationHandler)
            game = game.restart()
            DIFFICULTY = 0
            increaseDifficulty(0)
            return 
        }

        setLives(game.lives)
        
        game.food = newFood
        game.snake = newSnake

        if(food.eaten === true) {
            game.score += DIFFICULTY
            setScore(game.score)
            increaseDifficulty(DIFFICULTY_INCREMENT)
        }

        game.food = food.eaten === true ? game.createFood() : food

        drawPixels(snake.body, context) /// snake
        drawPixel(food.pixel, context, food.eaten === false ? FOOD_COLOR : GAME_COLOR)

    }

    window.onload = () => {
        const canvas: HTMLCanvasElement = document.createElement('canvas')
        canvas.id = GAME_CANVAS_ID
        container().appendChild(canvas)
        increaseDifficulty(DIFFICULTY_INCREMENT)
    }

    const increaseDifficulty = (amount: number) => {
        if (animationHandler !== undefined) {
            clearInterval(animationHandler)
            DIFFICULTY += amount
        }

        setDifficulty(DIFFICULTY)
        
        animationHandler = setInterval(() => {
            draw()
        }, FRAME_RATE - DIFFICULTY)
    }

    window.onresize = () => {
        clearInterval(animationHandler)
        updateCanvas(container() , canvas() , context(), game)
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
            case 82:  /// r key to restart
                clearInterval(animationHandler)
                game.restart()
                increaseDifficulty(0)
                break
            case 187: /// + key
                increaseDifficulty(DIFFICULTY_INCREMENT)
            break
        
            default: break
        }
        console.log(e.keyCode)
    }
   
})()

const gameover = (game: Game , context: CanvasRenderingContext2D, dimensions: { width: number , height: number }): Game => {
    clearInterval(animationHandler)
    DIFFICULTY = 0
    context.fillStyle = GAME_OVER_COLOR
    context.fillRect(0, 0, dimensions.width, dimensions.height)
    return game.reset()
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

