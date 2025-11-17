import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js'



export class outline{
  LineRender = true
  constructor(_data = {model: null, objects: null, scene: null, parent: null}){
    console.log(`outline init`)
    console.log(`Object len :${_data.objects.length}`)
    console.log(_data.objects)

    const parent = _data.parent

    // const sceneEl = _data.scene
    const renderer = parent.SceneManager.renderer
    const camera = parent.SceneManager.camera
    const scene = parent.SceneManager.scene

    console.log({renderer, scene, camera})  
    
    this.renderer = renderer
    this.camera = camera
    this.scene = scene
      
    const composer = new EffectComposer(renderer)
    // composer.setRenderTarget(new THREE.WebGLRenderTarget(width, height, { type: THREE.HalfFloatType }));

    const renderPass = new RenderPass( scene, camera )
    // renderPass.clear = false
    composer.addPass(renderPass)

    const outlinePass = new OutlinePass(new THREE.Vector2(2, 1), scene, camera)
    outlinePass.edgeStrength=5
    outlinePass.edgeGlow=0
    outlinePass.edgeThickness=0.3
    outlinePass.visibleEdgeColor = new THREE.Color(1,1,0)
    outlinePass.hiddenEdgeColor = new THREE.Color(0,0.5,0.5)
    outlinePass.selectedObjects = _data.objects

    composer.addPass(outlinePass)
    // composer.toneMapping = THREE.NoToneMapping

    this.composer = composer
    this.renderPass = renderPass
    this.outlinePass = outlinePass

    this.outLinerenderId = undefined
    
    this.outLinerender = () => {
      this.composer.render()
      this.outLinerenderId = requestAnimationFrame(this.outLinerender)
    }

    if(this.LineRender)  this.outLineCreate()
  }
  remove(){
    console.log(`outLine remove`)
    cancelAnimationFrame(this.outLinerenderId)
  }
  outLineCreate() {
    if(this.outLinerenderId != undefined) return 
    this.outLinerenderId = requestAnimationFrame(this.outLinerender)
  }
  outLineClear() {
    if(this.outLinerenderId == undefined) return 
    cancelAnimationFrame(this.outLinerenderId)
    this.outLinerenderId = undefined
  }
}