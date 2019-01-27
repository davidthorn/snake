
const createPixels = (): (container: HTMLDivElement,map: (p: Pixel) => Pixel) => Pixel[] => {
   
    let pixels: Pixel[] = []

    for(let x = 0; x <= NUMBER_COLUMNS; x++) {
        for(let y = 0; y <= NUMBER_ROWS; y++) {
            pixels.push({
                x,
                y,
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

const createSnake = (rows: number , cols: number): Snake => {
    const body = [
        {
            x: Math.ceil(Math.random() * cols),
            y: Math.ceil(Math.random() * rows),
            w: 0,
            h: 0,
            filled: true
        }
    ]
    return {
        direction: 'RIGHT',
        body,
        getHead: () => {
            return body[0]
        }
    }
}

interface Snake {
    body: Pixel[]
    direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN'
    getHead(): Pixel
}

interface Pixel {
    x: number
    y: number
    w: number,
    h: number
    filled: boolean
    link?: Pixel
}

const FILLED_COLOR = '#1fad1a'
const GAME_COLOR = '#222'

const NUMBER_COLUMNS: number = 75;
const NUMBER_ROWS: number = 75;

(() => {

    const container: HTMLDivElement = document.createElement('div')
    const canvas: HTMLCanvasElement = document.createElement('canvas')
    const context: CanvasRenderingContext2D = canvas.getContext('2d')!
    
    container.appendChild(canvas)

    const pixelsRepo = createPixels()

    let snake: Snake = createSnake(NUMBER_ROWS, NUMBER_COLUMNS)
    let animationHandler: NodeJS.Timeout;


    const draw = () => {
        updateCanvas(container)
        console.log('jhere')
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
        drawPixels(pixels, context) /// board
        moveSnake(snake)
        drawPixels(snake.body, context) /// snake
    
    }  

    window.onload = () => {
        document.body.appendChild(container)
        container.appendChild(canvas)
        animationHandler = setInterval(() => {
            draw()
        },60)
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
        const color = p.x % 2 === 0 && p.y % 2 === 0 
                        ? FILLED_COLOR : p.x % 2 !== 0 && p.y % 2 !== 0 
                        ? FILLED_COLOR :  GAME_COLOR
        canvas.fillStyle = p.filled === true ? FILLED_COLOR : GAME_COLOR
        canvas.fillRect(p.x * p.w, p.y * p.h, p.w , p.h )
    })

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

const moveSnake = (snake: Snake) => {

    switch(snake.direction) {
        case 'RIGHT':
            if(snake.getHead().x < (NUMBER_COLUMNS - 1)) {
                snake.body[0].x += 1
            } else {
                snake.body[0].x = 0
            }
        break;
        case 'LEFT':
            if(snake.getHead().x > 0) {
                snake.body[0].x -= 1
            } else {
                snake.body[0].x = NUMBER_COLUMNS - 1
            }
        break;
        case 'UP':
            if(snake.getHead().y > 0) {
                snake.body[0].y -= 1
            } else {
                snake.body[0].y = NUMBER_ROWS - 1
            }
        break;
        case 'DOWN':
            if(snake.getHead().y < NUMBER_ROWS - 1) {
                snake.body[0].y += 1
            } else {
                snake.body[0].y = 0
                
            }
        break;
    }

    
}