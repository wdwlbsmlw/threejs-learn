<template>
    <div class="ship">
        <canvas id="ship-canvas"></canvas>
        <div class="ship-tools">
            <button @click="app.statsToggle()">监视器（{{ app ? app.statsVisible : '' }}）</button>
        </div>
    </div>
</template>

<script>
import Ship from './ship'

export default {
    name: 'Ship',

    data() {
        return {
            app: null,
            progress: 0
        }
    },

    mounted() {
        this.initShip()
    },

    beforeDestroy() {
        this.app.clear()
    },

    methods: {
        initShip() {
            this.app = new Ship('#ship-canvas')
            this.app.init()
            this.app.initStats()
            this.initAnimated()
            this.app.updateCamera()
            this.initMouseEvent()
        },
        initAnimated() {
            requestAnimationFrame(this.initAnimated)
            if (this.app.shipObj && this.app.curves) {
                if (this.progress < 1) {
                    let _p = this.app.curves.getPointAt(this.progress)
                    let _t = this.app.curves.getTangentAt(this.progress)
                    // 获取每个进步的坐标点
                    this.app.shipObj.position.copy(_p)
                    // 动态控制船体转向
                    this.app.shipObj.lookAt(_p.sub(_t))
                    this.app.shipObj.rotation.y += -Math.PI / 2
                    this.progress += 1 / 1000
                } else {
                    this.progress = 0
                }
            }
            this.app.render()
        },
        initMouseEvent() {
            const _dom = document.querySelector('#ship-canvas')
            // _dom.addEventListener('mousemove', e => this.app.onMouseMove(e), false)
            _dom.addEventListener('mousedown', e => this.app.onMouseDown(e), false)
        }
    }
}
</script>

<style lang="less">
.ship {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: blanchedalmond;

    &-tools {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 60px;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
#ship-canvas {
    width: 100%;
    height: 100%;
}
</style>
