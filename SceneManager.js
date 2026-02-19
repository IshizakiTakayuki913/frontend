import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';


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
    
    this.setHeight = canvas.clientHeight

    canvas.width  = canvas.clientWidth
    canvas.height = canvas.clientHeight

    const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000)
    camera.position.set(view.x, view.y, view.z)
    camera.lookAt(new THREE.Vector3())

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,        // 背景を透明にする
      antialias: false     // アンチエイリアスを有効にする
    })
    
    renderer.toneMapping = THREE.NoToneMapping; 
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.setSize(canvas.width ,canvas.height, false)

    
    // レンダラーで設定している場合
    renderer.setPixelRatio(window.devicePixelRatio); 

    const composer = new EffectComposer(renderer)
    

    // EffectComposerにも適用する
    composer.setPixelRatio(window.devicePixelRatio);

    const renderPass = new RenderPass( scene, camera )
    renderPass.clear = true; 
    renderPass.clearDepth = true;
    composer.addPass(renderPass)

    
    const outlinePass = new OutlinePass(new THREE.Vector2(2, 1), scene, camera)
    outlinePass.edgeStrength=5
    outlinePass.edgeGlow=0
    outlinePass.edgeThickness=0.3
    outlinePass.visibleEdgeColor = new THREE.Color(1,0,1)
    outlinePass.hiddenEdgeColor = new THREE.Color(1,0,1)
    outlinePass.selectedObjects = []

    composer.addPass(outlinePass)
    
    
    // ... 
    // ★ FXAA Passを追加 ★
    const effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.uniforms['resolution'].value.set(
        1 / window.innerWidth, 
        1 / window.innerHeight
    );
    composer.addPass(effectFXAA);
    // ...

    composer.addPass(new OutputPass());

    this.scene = scene
    this.canvas = canvas
    this.camera = camera
    this.renderer = renderer

    this.composer = composer
    this.renderPass = renderPass
    this.outlinePass = outlinePass
    
    this.mixers = mixers

    this.clock = new THREE.Clock()

    this.animate = this.animate.bind(this)
    this.animate()

    this.onResize = this.onResize.bind(this)
    window.addEventListener('resize', this.onResize)
  }
  animate(){
    requestAnimationFrame(this.animate)

    const delta = this.clock.getDelta()

    if (this.mixers) this.mixers.mixers.forEach(m => m.mixer.update(delta))

    this.composer.render(this.scene, this.camera)
  }
  onResize(e) {
    const canvas = this.canvas
    const camera = this.camera
    const renderer = this.renderer

    const width = canvas.clientWidth
    const height = canvas.clientHeight

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
