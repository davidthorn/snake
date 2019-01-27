
const createPixels = (): (container: HTMLDivElement) => Pixel[] => {
   
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

    return (container: HTMLDivElement) => {
        
        const { width , height } = container.getBoundingClientRect()
        
        return pixels.map(i => {
            return {
                ...i,
                w: width / NUMBER_COLUMNS,
                h: height / NUMBER_ROWS
            }
        })
    }

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

    const d = ''

    const container: HTMLDivElement = document.createElement('div')
    const canvas: HTMLCanvasElement = document.createElement('canvas')
    const context: CanvasRenderingContext2D = canvas.getContext('2d')!
    
    container.appendChild(canvas)

    const pixelsRepo = createPixels()

    const updateCanvas = (container: HTMLDivElement) => {
        const { width, height } = container.getBoundingClientRect()
        canvas.width = width
        canvas.height = height
        context.fillStyle = GAME_COLOR
        context.fillRect(0, 0, width, height)
        drawPixels(pixelsRepo(container), context)
    }  

    window.onload = () => {
        document.body.appendChild(container)
        container.appendChild(canvas)
        updateCanvas(container)
    }

    window.onresize = () => {
        updateCanvas(container)
    }

    console.log('started')

})()

const drawPixels = ( pixels: Pixel[] , canvas: CanvasRenderingContext2D )=> {

    pixels.forEach(p => {
        const color = p.x % 2 === 0 && p.y % 2 === 0 
                        ? FILLED_COLOR : p.x % 2 !== 0 && p.y % 2 !== 0 
                        ? FILLED_COLOR :  GAME_COLOR
        canvas.fillStyle = color
        canvas.fillRect(p.x * p.w, p.y * p.h, p.w , p.h )
    })

}