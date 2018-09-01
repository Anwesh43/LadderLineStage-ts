const w : number = window.innerWidth, h : number = window.innerHeight
const nodes : number = 5
class LadderLineStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    ladderLine : LadderLine = new LadderLine()
    animator : Animator = new Animator()

    constructor() {
        this.initCanvas()
    }
    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }
    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        this.ladderLine.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.ladderLine.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.ladderLine.update(() => {
                        this.animator.stop()
                    })
                })
            })
        }
    }
}

class State {
    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += this.dir * 0.1
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {
    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class LLNode {
    prev : LLNode
    next : LLNode
    state : State = new State()
    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new LLNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        if (this.prev) {
            this.prev.draw(context)
        }
        context.lineWidth = Math.min(w, h) / 60
        context.lineCap = 'round'
        context.strokeStyle = '#1976D2'
        const sc : number = Math.min(0.5, Math.max(0, this.state.scale - 0.5)) * 2
        const index : number = this.i % 2
        const gap : number = h / nodes
        context.save()
        context.translate(w/2, this.i * gap)
        for (var i = 0; i < 2; i++) {
            context.save()
            context.translate(-gap/2 * (1 - 2 * index), 0)
            context.beginPath()
            context.moveTo(0, 0)
            context.lineTo(0, gap * this.state.scale)
            context.stroke()
            context.restore()
        }
        context.save()
        context.translate(0, gap / 2)
        context.scale(1 - 2 * index, 1)
        context.beginPath()
        context.moveTo(-gap/2, 0)
        context.lineTo(-gap/2 + gap * sc, 0)
        context.stroke()
        context.restore()
        context.restore()
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : LLNode {
        var curr = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LadderLine {
    curr : LLNode = new LLNode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}
