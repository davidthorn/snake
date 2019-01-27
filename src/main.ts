const FRAME_RATE = 100
let DIFFICULTY = 1
const FILLED_COLOR = '#1fad1a'
const GAME_COLOR = '#222'
const FOOD_COLOR = 'orange'

const NUMBER_COLUMNS: number = 75;
const NUMBER_ROWS: number = 75;

const createPixels = (): (container: HTMLDivElement,map: (p: Pixel) => Pixel) => Pixel[] => {
   
    let pixels: Pixel[] = []

    for(let x = 0; x <= NUMBER_COLUMNS; x++) {
        for(let y = 0; y <= NUMBER_ROWS; y++) {
            pixels.push({
                point: {
                    x,
                    y
                },
                w: 0,
                h: 0,
                filled: false,
                link: undefined
            })
        }   
    }

    return (container: HTMLDivElement, map: (p: Pixel) => Pixel) => {
        
        const { width , height } = container.getBoundingClientRect()
        
        pixels = pixels.map(i => {
            return map({
                ...i,
                w: width / NUMBER_COLUMNS,
                h: height / NUMBER_ROWS
            })
        })

        return pixels
    }

}

const createFood = (rows: number , cols: number): Food => {
    let pixel = {
        point: {
            x: Math.ceil(Math.random() * cols),
            y: Math.ceil(Math.random() * rows),
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

const createSnake = (rows: number , cols: number): Snake => {
    const _body = [
        {
            point: {
                x: Math.ceil(Math.random() * cols),
                y: Math.ceil(Math.random() * rows),
            },
            w: 0,
            h: 0,
            filled: true
        }
    ]
    return {
        direction: 'RIGHT',
        body: _body,
        path: [_body[0].point]
    }
}

interface Snake {
    body: Pixel[]
    direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN',
    path: Point[]
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

(() => {

    const container: HTMLDivElement = document.createElement('div')
    const canvas: HTMLCanvasElement = document.createElement('canvas')
    const context: CanvasRenderingContext2D = canvas.getContext('2d')!
    
    container.appendChild(canvas)

    const pixelsRepo = createPixels()

    let snake: Snake = createSnake(NUMBER_ROWS, NUMBER_COLUMNS)
    
    let food = createFood(NUMBER_ROWS, NUMBER_COLUMNS)

    const draw = () => {
        updateCanvas(container)
    }

    const updateCanvas = (container: HTMLDivElement) => {
        const { width, height } = container.getBoundingClientRect()
        canvas.width = width
        canvas.height = height
        context.fillStyle = GAME_COLOR
        context.fillRect(0, 0, width, height)

        let pixels = pixelsRepo(container, o => o)
        snake.body = snake.body.map(o => {
            o.w = width / NUMBER_COLUMNS
            o.h = height / NUMBER_ROWS
            return o
        })

        food.pixel.w = width / NUMBER_COLUMNS
        food.pixel.h = height / NUMBER_ROWS
        
        //drawPixels(pixels, context) /// board
        const { newFood , newSnake } = moveSnake(snake, food)
        food = newFood
        snake = newSnake
        
        if(newFood.eaten === true) {
            
        }

        food = food.eaten === true ? createFood(NUMBER_ROWS, NUMBER_COLUMNS) : food

        drawPixels(snake.body, context) /// snake
        drawPixel(food.pixel, context, food.eaten === false ? FOOD_COLOR : GAME_COLOR)

    }  

    window.onload = () => {
        document.body.appendChild(container)
        container.appendChild(canvas)
        increaseDifficulty()
    }

    const increaseDifficulty = () => {
        if(animationHandler !== undefined) {
            console.log('cleared interval')
            clearInterval(animationHandler)
        }
        
        animationHandler = setInterval(() => {
            draw()
        },FRAME_RATE - DIFFICULTY)
    }

    window.onresize = () => {
        clearInterval(animationHandler)
        updateCanvas(container)
    }

    window.onkeydown = (e) => {
        switch(e.keyCode) {
            case 27:
            clearInterval(animationHandler)
            break;
            case 37:
            snake.direction = 'LEFT'
            break
            case 38:
            snake.direction = 'UP'
            break
            case 39:
            snake.direction = 'RIGHT'
            break
            case 40:
            snake.direction = 'DOWN'
            break
            default: break
        }
      
    }

})()

/**
 * Draws all pixels on the canvas
 *
 * @param {Pixel[]} pixels
 * @param {CanvasRenderingContext2D} canvas
 */
const drawPixels = ( pixels: Pixel[] , canvas: CanvasRenderingContext2D )=> {
    
    pixels.forEach(p => {
        drawPixel(p , canvas , p.filled === true ? FILLED_COLOR : GAME_COLOR)
    })

}

const drawPixel = ( pixel: Pixel , canvas: CanvasRenderingContext2D, color: string )=> {
    //canvas.clearRect(pixel.x * pixel.w, pixel.y * pixel.h, pixel.w , pixel.h )
    const { x , y } = pixel.point
    canvas.fillStyle = color

    canvas.fillRect(x * pixel.w, y * pixel.h, pixel.w , pixel.h )
}


/**
 *  Returns all pixels which are currently filled
 *
 * @param {Pixel[]} pixels
 * @returns {Pixel[]}
 */
const getSnake = (pixels: Pixel[]): Pixel[] => {
    return pixels.filter(i => i.filled === true)
} 


/**
 * Moves the snake one pixel in the direction which it is currently moving.
 * If the snake hits the side then it re appears on the opposite side
 *
 * @param {Snake} snake
 * @param {Food} food
 * @returns {Food}
 */
const moveSnake = (snake: Snake, food: Food): { newSnake: Snake , newFood: Food } => {

    let direction = snake.direction
    let hori =  ['LEFT' , 'RIGHT' ].includes(direction) ? direction === 'LEFT' ? -1 : 1 : 0 
    let vert =  ['UP' , 'DOWN' ].includes(direction) ? direction === 'UP' ? -1 : 1 : 0 

    //console.log('is food eaten' , snake)
    let n_x: number = snake.body[0].point.x; // next x
    let n_y: number = snake.body[0].point.y; // next y

    let head =  {
        ...snake.body[0],
        point: {
            x: n_x + hori,
            y: n_y + vert
            }
            }
                
    if(snake.path.filter(l => l.x === food.pixel.point.x && l.y === food.pixel.point.y).length > 0) {
        food.eaten = true
        snake.body.unshift(food.pixel)
        snake.path = []
    } else {
        snake.body.unshift(head)
        snake.body.pop()
        snake.path.push(head.point)
    }

    return {
        newSnake: snake,
        newFood: food
    }
}

