class outline{
  LineRender = true
  constructor(_data = {model: null, objects: null, scene: null}){
    console.log(`outline init`)
    console.log(`Object len :${_data.objects.length}`)
    console.log(_data.objects)

    const sceneEl = _data.scene
    const renderer = sceneEl.renderer
    const camera = sceneEl.camera
    const scene = _data.scene.object3D

    console.log({sceneEl, renderer, scene, camera})  
    
    this.camera = camera
    this.scene = scene
    this.renderer = renderer
      
    const composer = new myTHREE.EffectComposer(renderer)
    
    const renderPass = new myTHREE.RenderPass( scene, camera )
    // renderPass.clear = true
    composer.addPass(renderPass)

    const outlinePass = new myTHREE.OutlinePass(new THREE.Vector2(2, 1), scene, camera)
    outlinePass.edgeStrength=5
    outlinePass.edgeGlow=0
    outlinePass.edgeThickness=0.3
    outlinePass.visibleEdgeColor = new THREE.Color(1,1,0)
    outlinePass.hiddenEdgeColor = new THREE.Color(0,0.5,0.5)
    outlinePass.selectedObjects = _data.objects

    composer.addPass(outlinePass)

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
