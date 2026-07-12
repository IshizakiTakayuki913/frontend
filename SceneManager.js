import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

import { SobelOperatorShader } from 'three/addons/shaders/SobelOperatorShader.js';

export class SceneManager{
  lights = []
  canvas = null
  camera = null
  renderer = null

  mixers = null
  setHeight = null
  
  canvasCenterPos = {
    centerX: 0.5,
    centerY: 0.5,
  }

  isReSize = false

  BdAspect = {
    normal: {
      dist: 5,
      aspect: 1,
      top: 0.08,
      near: 0.1,
      far: 10
    },
    hand: {
      dist: 7,
      aspect: 2,
      top: 0.05,
      near: 0.1,
      far: 20
    }
  }

  nowBdAspectType = "normal"

  constructor({canvasEl =  null, mixers =  null, view = {x: 0, y: 0, z: 5}} = {}){
    const light = new THREE.DirectionalLight(0xffffff, 1)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3)

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

    
    const outlinePass = new OutlinePass(new THREE.Vector2(canvas.width ,canvas.height), scene, camera)
    outlinePass.edgeStrength=5
    outlinePass.edgeGlow=0
    outlinePass.edgeThickness=1
    outlinePass.visibleEdgeColor = new THREE.Color(0,1,1)
    outlinePass.hiddenEdgeColor = new THREE.Color(0,1,1)
    outlinePass.selectedObjects = []
    outlinePass.overlayMaterial.blending = THREE.NormalBlending

    composer.addPass(outlinePass)
    
    const outlinePass2 = new OutlinePass(new THREE.Vector2(1, 2), scene, camera)
    outlinePass2.edgeStrength=5
    outlinePass2.edgeGlow=0
    outlinePass2.edgeThickness=3
    outlinePass2.visibleEdgeColor = new THREE.Color(1,1,1)
    outlinePass2.hiddenEdgeColor = new THREE.Color(1,1,1)
    outlinePass2.selectedObjects = []
    outlinePass.overlayMaterial.blending = THREE.NormalBlending

    composer.addPass(outlinePass2)
    
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

    // 追加
    // ... RenderPassの後に配置 ...
    // const effectSobel = new ShaderPass(SobelOperatorShader);
    // effectSobel.uniforms['resolution'].value.set(
    //     window.innerWidth * window.devicePixelRatio,
    //     window.innerHeight * window.devicePixelRatio
    // );
    // composer.addPass(effectSobel);
    // 追加

    this.scene = scene
    this.canvas = canvas
    this.camera = camera
    this.renderer = renderer

    this.composer = composer
    this.renderPass = renderPass
    this.outlinePass = outlinePass
    this.outlinePass2 = outlinePass2
    
    this.mixers = mixers

    this.clock = new THREE.Clock()

    this.animate = this.animate.bind(this)
    this.animate()


    this.nowBdAspectType = "normal"
    this._onResizeAspect = this._onResizeAspect.bind(this)
    
    // this.onResize = this.onResize.bind(this)
    // window.addEventListener('resize', this.onResize)

    this.timeoutID  = null;
    this.observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      this._onResizeAspect(width, height)

      if (this.timeoutID ) {
        clearTimeout(this.timeoutID )
      }

      // ブラウザの次の描画タイミング（通常16.6ms以内）に最新のサイズで実行を予約
      this.timeoutID  = setTimeout(() => {

        camera.aspect = width / height;
        renderer.setSize(width, height, false)
        camera.updateProjectionMatrix();

        this._onResizeAspect(width, height)
      }, 70)

    })
    this.observer.observe(this.canvas)

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

    camera.aspect = width / height
    camera.fov = 75 * (height / this.setHeight)
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
  }
  /**
   * キューブの表示位置を調整する
   */
  _onResize() {

    if(this.isReSize) return

    const canvas = this.canvas
    const camera = this.camera
    const renderer = this.renderer

    const canvasWidth = canvas.clientWidth
    const canvasHeight = canvas.clientHeight

    const fovTop = this.canvasCenterPos.fovTop
    const centerX = this.canvasCenterPos.centerX * canvasWidth
    const centerY = this.canvasCenterPos.centerY * canvasHeight
    // const centerY = 0.5 * canvasWidth

    const fovRadyTop = (fovTop * Math.PI) / 180;
    const near = camera.near
    const far = camera.far
    
    const localTop = near * Math.tan(fovRadyTop);
    const scaleH = (canvasHeight-centerY) / centerY 
    const localBottom = scaleH * localTop
    const localHeight = localTop + localBottom

    const fovRadyBottom = Math.atan(localBottom/near)
    const fovRadyHeight = fovRadyTop + fovRadyBottom

    const aspect = canvasWidth / canvasHeight
    const localWidth = aspect * localHeight

    const localLeft = localWidth * centerX / canvasWidth 
    const localRight = localWidth - localLeft 

    
    const fovRadyLeft = Math.atan(localLeft/near)
    const fovRadyRight = Math.atan(localRight/near)
    const fovRadyWidth = fovRadyLeft + fovRadyRight

    camera.fov = fovRadyHeight * 180 / Math.PI
    camera.aspect = aspect
    
    camera.updateProjectionMatrix()
    renderer.setSize(canvasWidth, canvasHeight, false)

    camera.projectionMatrix.makePerspective(-localLeft, localRight, localTop, -localBottom, near, far)
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert()
  }
  /**
   * キューブの表示位置を調整する
   */
  _onResizeAspect(_width, _height) {

    if(this.isReSize) return

    const BdA = this.BdAspect[this.nowBdAspectType]

    const camera = this.camera
    const renderer = this.renderer

    const screenSize = {
      w: _width,
      h: _height,
    }
    screenSize.a = screenSize.w / screenSize.h
    
    const centerSize = {
      x: this.canvasCenterPos.centerX * screenSize.w,
      y: this.canvasCenterPos.centerY * screenSize.h,
      w: Math.min(this.canvasCenterPos.centerX, 1 - this.canvasCenterPos.centerX) * 2 * screenSize.w,
      h: Math.min(this.canvasCenterPos.centerY, 1 - this.canvasCenterPos.centerY) * 2 * screenSize.h,
    }
    const _aspect = centerSize.w / centerSize.h

    const redSize = JSON.parse(JSON.stringify(centerSize))
    // const redSize = [...centerSize]

    const longH = _aspect >= BdA.aspect
    if(longH)  redSize.w = centerSize.h * BdA.aspect
    else  redSize.h = centerSize.w / BdA.aspect

    const toLen = BdA.top / (redSize.h/2)
    const BdPosition = {
      top:    redSize.y * toLen,
      bottom: (screenSize.h-redSize.y) * toLen,
      left:   redSize.x * toLen,
      right:  (screenSize.w-redSize.x) * toLen,
    }

    // camera.aspect = screenSize.w / screenSize.h
    // renderer.setSize(screenSize.w, screenSize.h, false)

    camera.projectionMatrix.makePerspective(
      -BdPosition.left,
      BdPosition.right,
      BdPosition.top,
      -BdPosition.bottom,
      BdA.near, BdA.far
    )
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert()

    // console.log({canvasCenterPos: this.canvasCenterPos, BdA, screenSize, centerSize, redSize, longH})
    // console.log({toLen, BdPosition})
  }
	dispose(){
    this.observer.observe(this.canvas)
    window.removeEventListener('resize', this._onResizeAspect)
	}
}
