import * as THREE from 'three'
import {SceneManager} from './SceneManager.js'


const mainCanvas = document.createElement("canvas")
mainCanvas.id = "main-canvas"
mainCanvas.width = 300
mainCanvas.height = 300
mainCanvas.classList.add("main-display")
const _main = document.querySelector("#main-display")
_main.appendChild(mainCanvas)

const scnMan = new SceneManager({
  canvasEl: mainCanvas,
  view: {x: 0, y: 0, z: 3}
})
scnMan.camera.position.z = 2



const axesHelper = new THREE.AxesHelper(1)
// シーンに追加
scnMan.scene.add(axesHelper)

window.SceneManager = scnMan