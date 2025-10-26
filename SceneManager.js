import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export class SceneManager{
  lights = []
  canvas = null
  camera = null
  renderer = null

  mixers = null
  setHeight = null

  constructor({canvasEl =  null, mixers =  null, view = {x: 0, y: 0, z: 5}} = {}){
    const light = new THREE.DirectionalLight(0xffffff, 1)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1)

    this.lights.push(light)
    this.lights.push(ambientLight)

    const scene = new THREE.Scene()
    scene.add(light)
    scene.add(ambientLight)

    
    const canvas = canvasEl
    
    const dpr = window.devicePixelRatio || 1
    this.setHeight = canvas.clientHeight  * dpr

    canvas.width  = canvas.clientWidth  * dpr
    canvas.height = canvas.clientHeight * dpr


    const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000)
    camera.position.set(view.x, view.y, view.z)
    camera.lookAt(new THREE.Vector3())

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,        // 背景を透明にする
      antialias: true     // アンチエイリアスを有効にする
    })
    renderer.updateStyle = false
    renderer.setSize(canvas.width ,canvas.height, false)
    // renderer.shadowMap.enabled = true

    this.scene = scene
    this.canvas = canvas
    this.camera = camera
    this.renderer = renderer
    
    this.mixers = mixers

    this.clock = new THREE.Clock()

    this.animate = this.animate.bind(this)
    this.animate()

    this.onResize = this.onResize.bind(this)
    window.addEventListener('resize', this.onResize)
  }
  animate(){
    requestAnimationFrame(this.animate)

    // this.rad += delta

    // this.camera.position.x = Math.cos(this.rad) * 5
    // this.camera.position.z = Math.sin(this.rad) * 5
    // this.camera.lookAt(this.scene.position)

    const delta = this.clock.getDelta()

    if (this.mixers) this.mixers.mixers.forEach(m => m.mixer.update(delta))

    this.renderer.render(this.scene, this.camera)
  }
  onResize(e) {
    const canvas = this.canvas
    const camera = this.camera
    const renderer = this.renderer

    const dpr = window.devicePixelRatio || 1
    const width = canvas.clientWidth * dpr // またはcanvas.height
    const height = canvas.clientHeight * dpr // またはcanvas.height

    canvas.width  = width
    canvas.height = height

    camera.aspect = width / height
    camera.fov = 75 * (height / this.setHeight)
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
  }
	dispose(){
    window.removeEventListener('resize', this.onResize)
	}
}
