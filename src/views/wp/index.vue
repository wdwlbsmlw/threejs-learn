<template>
    <div class="wp">
        <canvas id="wp"></canvas>

        <div class="wp-oper">
            <button @click="resetCamer">Reset Camer</button>
        </div>

        <div class="pane">
            test
        </div>
    </div>
</template>

<script>
import WindPower from './wind-power'
var app = null
export default {
    name: 'wp',

    mounted() {
        app = new WindPower('#wp')
        app.init()
        this.initAnimate()
    },

    methods: {
        initAnimate() {
            if (!app.renderer?.autoClear) app.renderer.clear()
            requestAnimationFrame(this.initAnimate)
            if (app.controls) app.controls.update()
            app.renderer.render(app.scene, app.camera)
            var time = app.clock.getDelta()
            if (app.mixer) app.mixer.update(time)
            if (app.stats) app.stats.update()
            app.water.material.uniforms.time.value += 0.5 / 60
            if (app.composer) app.composer.render()
        },

        resetCamer() {
            app.camera.position.set(0, 150, 300)
        }
    }
}
</script>

<style lang="less">
.wp {
    width: 100vw;
    height: 100vh;
    overflow: hidden;

    #wp {
        width: 100%;
        height: 100%;
    }

    &-oper {
        position: fixed;
        bottom: 10px;
        right: 10px;
        z-index: 1;
    }

    .pane {
        position: fixed;
        top: 10px;
        left: 100px;
        z-index: 1;
        display: none;
    }
}
</style>