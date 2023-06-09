"use strict";

// 更新鼠标或触摸点的坐标
function updateCoords(e) {
    pointerX = (e.clientX || e.touches[0].clientX) - canvasEl.getBoundingClientRect().left;
    pointerY = e.clientY || e.touches[0].clientY - canvasEl.getBoundingClientRect().top;
}

// 设置粒子的运动方向
function setParticuleDirection(particle) {
    var angle = anime.random(0, 360) * Math.PI / 180,
        distance = anime.random(50, 180),
        direction = [-1, 1][anime.random(0, 1)] * distance;
    return {
        x: particle.x + direction * Math.cos(angle),
        y: particle.y + direction * Math.sin(angle)
    };
}

// 创建粒子
function createParticule(x, y) {
    var particle = {};
    particle.x = x;
    particle.y = y;
    particle.color = colors[anime.random(0, colors.length - 1)];
    particle.radius = anime.random(16, 32);
    particle.endPos = setParticuleDirection(particle);
    particle.draw = function () {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, 2 * Math.PI, true);
        ctx.fillStyle = particle.color;
        ctx.fill();
    };
    return particle;
}

// 创建圆形（烟花核心）
function createCircle(x, y) {
    var circle = {};
    circle.x = x;
    circle.y = y;
    circle.color = "#F00";
    circle.radius = 0;
    circle.alpha = 0.5;
    circle.lineWidth = 6;
    circle.draw = function () {
        ctx.globalAlpha = circle.alpha;
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, true);
        ctx.lineWidth = circle.lineWidth;
        ctx.strokeStyle = circle.color;
        ctx.stroke();
        ctx.globalAlpha = 1;
    };
    return circle;
}

// 渲染粒子
function renderParticule(anim) {
    for (var i = 0; i < anim.animatables.length; i++) {
        anim.animatables[i].target.draw();
    }
}

// 播放烟花动画
function animateParticules(x, y) {
    var circle = createCircle(x, y),
        particles = [],
        numberOfParticles = 30;
    for (var i = 0; i < numberOfParticles; i++) {
        particles.push(createParticule(x, y));
    }
    anime.timeline().add({


        targets: particles,
        x: function (particle) {
            return particle.endPos.x;
        },
        y: function (particle) {
            return particle.endPos.y;
        },
        radius: 0,
        duration: anime.random(1200, 1800),
        easing: "easeOutExpo",
        update: renderParticule



    })/*.add({
        targets: circle,
        radius: anime.random(80, 160),
        lineWidth: 0,
        alpha: {
            value: 0,
            easing: "linear",
            duration: anime.random(600, 800)
        },
        duration: anime.random(1200, 1800),
        easing: "easeOutExpo",
        update: renderParticule,
        offset: 0
    });
*/
}

// 防抖函数
function debounce(func, wait) {
    var timeout;
    return function () {
        var context = this,
            args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            func.apply(context, args);
        }, wait);
    };
}

// 获取并设置画布
var canvasEl = document.querySelector(".fireworks");
if (canvasEl) {
    var ctx = canvasEl.getContext("2d"),
        pointerX = 0,
        pointerY = 0,
        tap = "mousedown",
        colors = ["#FF1461", "#18FF92", "#5A87FF", "#FBF38C"],
        setCanvasSize = debounce(function () {
            canvasEl.width = 2 * window.innerWidth;
            canvasEl.height = 2 * window.innerHeight;
            canvasEl.style.width = window.innerWidth + "px";
            canvasEl.style.height = window.innerHeight + "px";
            canvasEl.getContext("2d").scale(2, 2);
        }, 500),
        render = anime({
            duration: Infinity,
            update: function () {
                ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
            }
        });
    // 添加事件监听器
    document.addEventListener(tap, function (e) {
        if (e.target.id !== "sidebar" &&
            e.target.id !== "toggle-sidebar" &&
            e.target.nodeName !== "A" &&
            e.target.nodeName !== "IMG") {
            render.play();
            updateCoords(e);
            animateParticules(pointerX, pointerY);
        }
    }, false);

    // 初始化画布尺寸并监听窗口大小变化
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize, false);
}


class Circle {
  constructor({ origin, speed, color, angle, context }) {
    this.origin = origin
    this.position = { ...this.origin }
    this.color = color
    this.speed = speed
    this.angle = angle
    this.context = context
    this.renderCount = 0
  }

  draw() {
    this.context.fillStyle = this.color
    this.context.beginPath()
    this.context.arc(this.position.x, this.position.y, 2, 0, Math.PI * 2)
    this.context.fill()
  }

  move() {
    this.position.x = (Math.sin(this.angle) * this.speed) + this.position.x
    this.position.y = (Math.cos(this.angle) * this.speed) + this.position.y + (this.renderCount * 0.3)
    this.renderCount++
  }
}

class Boom {
  constructor ({ origin, context, circleCount = 16, area }) {
    this.origin = origin
    this.context = context
    this.circleCount = circleCount
    this.area = area
    this.stop = false
    this.circles = []
  }

  randomArray(range) {
    const length = range.length
    const randomIndex = Math.floor(length * Math.random())
    return range[randomIndex]
  }

  randomColor() {
    const range = ['8', '9', 'A', 'B', 'C', 'D', 'E', 'F']
    return '#' + this.randomArray(range) + this.randomArray(range) + this.randomArray(range) + this.randomArray(range) + this.randomArray(range) + this.randomArray(range)
  }

  randomRange(start, end) {
    return (end - start) * Math.random() + start
  }

  init() {
    for(let i = 0; i < this.circleCount; i++) {
      const circle = new Circle({
        context: this.context,
        origin: this.origin,
        color: this.randomColor(),
        angle: this.randomRange(Math.PI - 1, Math.PI + 1),
        speed: this.randomRange(1, 6)
      })
      this.circles.push(circle)
    }
  }

  move() {
    this.circles.forEach((circle, index) => {
      if (circle.position.x > this.area.width || circle.position.y > this.area.height) {
        return this.circles.splice(index, 1)
      }
      circle.move()
    })
    if (this.circles.length == 0) {
      this.stop = true
    }
  }

  draw() {
    this.circles.forEach(circle => circle.draw())
  }
}

class CursorSpecialEffects {
  constructor() {
    this.computerCanvas = document.createElement('canvas')
    this.renderCanvas = document.createElement('canvas')

    this.computerContext = this.computerCanvas.getContext('2d')
    this.renderContext = this.renderCanvas.getContext('2d')

    this.globalWidth = window.innerWidth
    this.globalHeight = window.innerHeight

    this.booms = []
    this.running = false
  }

  handleMouseDown(e) {
    const boom = new Boom({
      origin: { x: e.clientX, y: e.clientY },
      context: this.computerContext,
      area: {
        width: this.globalWidth,
        height: this.globalHeight
      }
    })
    boom.init()
    this.booms.push(boom)
    this.running || this.run()
  }

  handlePageHide() {
    this.booms = []
    this.running = false
  }

  init() {
    const style = this.renderCanvas.style
    style.position = 'fixed'
    style.top = style.left = 0
    style.zIndex = '999999999999999999999999999999999999999999'
    style.pointerEvents = 'none'

    style.width = this.renderCanvas.width = this.computerCanvas.width = this.globalWidth
    style.height = this.renderCanvas.height = this.computerCanvas.height = this.globalHeight

    document.body.append(this.renderCanvas)

    window.addEventListener('mousedown', this.handleMouseDown.bind(this))
    window.addEventListener('pagehide', this.handlePageHide.bind(this))
  }

  run() {
    this.running = true
    if (this.booms.length == 0) {
      return this.running = false
    }

    requestAnimationFrame(this.run.bind(this))

    this.computerContext.clearRect(0, 0, this.globalWidth, this.globalHeight)
    this.renderContext.clearRect(0, 0, this.globalWidth, this.globalHeight)

    this.booms.forEach((boom, index) => {
      if (boom.stop) {
        return this.booms.splice(index, 1)
      }
      boom.move()
      boom.draw()
    })
    this.renderContext.drawImage(this.computerCanvas, 0, 0, this.globalWidth, this.globalHeight)
  }
}

const cursorSpecialEffects = new CursorSpecialEffects()
cursorSpecialEffects.init()