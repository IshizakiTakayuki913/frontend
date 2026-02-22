import * as THREE from 'three'

import { meter } from './meter.js'
import {ObjectManager} from './Object.js'
import {SceneManager} from './SceneManager.js'
import {AnimationManager} from './aniamtion.js'
import {camera} from './camera.js'
import {presskeyboard} from './solve2.js'
import {cubemrotate} from './cubemrotate.js'
import {colorinput} from './colorinput.js'

import {motionList} from './motionList.js'

import {
  State, cubeState, color_set,
  cubeset, wait,
  objectPrint, positionGet
} from './solve.js'

window.THREE = THREE
window.color_set = color_set
window.cubeset = cubeset
window.objectPrint = objectPrint


class cubemode{
  #cubeHolding  = true
  #cubeMoveEnd = 0
  // this.#cubeTouching = true
  // this.#cubeMoving = true
  // this.load_end = true
  cube_mode = "Free"
  cube_modes = {
    "Free":         0,
    "Calculation":  1,
    "Execution":    2,
    "Input":        3,
    "learning":     4,
    "Viewpoint":    0,
    "Rotation":     1,
    "Colorset":     2,
  }

  static STATE_INIT      = 0	// 閲覧
  static STATE_EXPLORE   = 1	// 閲覧
  static STATE_EDITING   = 2	// 色入力
  static STATE_ANALYZING = 3	// 解析中
  static STATE_GUIDING   = 4	// 解説再生
  static STATE_PRACTICE  = 5	// 練習(試行)

  currentState = null
  currentFlags = null

  // --- 許可フラグ (何をしていいか) ---
  static ALLOW_VIEW_CONTROL   = 1 << 0
  static ALLOW_TOUCH_ROTATE   = 1 << 1
  static ALLOW_KEY_ROTATE     = 1 << 2
  static ALLOW_COLOR_PICK     = 1 << 3
  static ALLOW_ANIM_CONTROL   = 1 << 4

  mode_list = [
    [ true,  true, false],
    [false, false, false],
    [ true, false, false],
    [ true, false,  true],
    [ true,  true, false],
  ]
  rote_speed = 2

	constructor() {
    this.currentState = cubemode.STATE_INIT
    this.currentFlags = 0

	// --- 2. 有効フラグの設定 (どの状態で何ができるか) ---
    this.permissions = {
      [cubemode.STATE_INIT]: 0,
      [cubemode.STATE_EXPLORE]: 
        cubemode.ALLOW_VIEW_CONTROL | cubemode.ALLOW_TOUCH_ROTATE | cubemode.ALLOW_KEY_ROTATE,
      [cubemode.STATE_EDITING]: 
        cubemode.ALLOW_VIEW_CONTROL | cubemode.ALLOW_COLOR_PICK,
      [cubemode.STATE_ANALYZING]: cubemode.ALLOW_VIEW_CONTROL | cubemode.ALLOW_ANIM_CONTROL,
      [cubemode.STATE_GUIDING]: 
        cubemode.ALLOW_VIEW_CONTROL | cubemode.ALLOW_ANIM_CONTROL,
      [cubemode.STATE_PRACTICE]: 
        cubemode.ALLOW_VIEW_CONTROL | cubemode.ALLOW_TOUCH_ROTATE | cubemode.ALLOW_KEY_ROTATE | cubemode.ALLOW_ANIM_CONTROL,
    };

    // --- 3. 遷移ルールの設定 (どこからどこへ行けるか) ---
    this.transitionRules = {
      [cubemode.STATE_INIT]:   [cubemode.STATE_EXPLORE],
      [cubemode.STATE_EXPLORE]:   [cubemode.STATE_EDITING, cubemode.STATE_ANALYZING],
      [cubemode.STATE_EDITING]:   [cubemode.STATE_EXPLORE],
      [cubemode.STATE_ANALYZING]: [cubemode.STATE_GUIDING],
      [cubemode.STATE_GUIDING]:   [cubemode.STATE_PRACTICE, cubemode.STATE_EXPLORE],
      [cubemode.STATE_PRACTICE]:  [cubemode.STATE_GUIDING]
    };

    // console.log(`メインシステムが読み込み完了！`)
    this.fileLoaded = this.fileLoaded.bind(this)

    window.addEventListener("load", this.fileLoaded)
	}
  changeState(nextState) {
    const allowed = this.transitionRules[this.currentState];
    
    if (allowed && allowed.includes(nextState)) {
      // console.log(`State Changed: ${this.currentState} -> ${nextState}`);
      this.onStateEnter(nextState);
      return true
    } else {
      console.warn(`Invalid Transition: ${this.currentState} to ${nextState}`);
      return false
    }
  }

  onStateEnter(nextState) {

    // 状態が変わった瞬間に一度だけやりたいこと
    const oldFlags = this.currentFlags;
    const nextFlags = this.permissions[nextState];

    // 1. 変化があったフラグだけを抽出 (XOR演算)
    const diff = oldFlags ^ nextFlags;

    // 2. 「新しく追加されたフラグ」と「消えたフラグ」を特定
    const activated = nextFlags & diff;
    const deactivated = oldFlags & diff;

    console.log({activated, deactivated})

    // 3. 各機能のON/OFFを実行
    this.initializ(deactivated, false);
    this.initializ(activated, true);

    // 状態更新
    this.currentState = nextState;
    this.currentFlags = nextFlags;
    
    // if (state === cubemode.STATE_EXPLORE) {
    //   // if(this.Viewpoint) 
    // }else if (state === cubemode.STATE_EDITING) {

    // }else if (state === cubemode.STATE_ANALYZING) {
      
    // }else if (state === cubemode.STATE_GUIDING) {
      
    // }else if (state === cubemode.STATE_PRACTICE) {
      
    // }
  }

  initializ(flag, bool){
    if((flag & cubemode.ALLOW_VIEW_CONTROL) !== 0 ){
      if(!bool) {
        this.Viewpoint.dispose()
        this.Viewpoint = null
      }else{
        this.Viewpoint = new camera({
          scene: this.SceneManager.canvas, camOut: this.SceneManager.camera,
          ObjectManager: this.ObjectManager,
          AnimeManager: this.AnimeManager,
          SceneManager: this.SceneManager,
          status: this.mode_set_Viewpointer.bind(this),
        })
      }
    }
    if((flag & cubemode.ALLOW_TOUCH_ROTATE) !== 0){    
      if(!bool) {
        this.Rotation.dispose()
        this.Rotation = null
      }else{  
        this.Rotation = new cubemrotate({
          scene: this.SceneManager.canvas, camOut: this.SceneManager.camera,
          ObjectManager: this.ObjectManager,
          AnimeManager: this.AnimeManager,
          SceneManager: this.SceneManager,
          dispCube: this.dispCube,
          status: this.mode_set_Rotation.bind(this),
          getCubeHolding: () => this.cubeHolding,
          setCubeHolding: (b) => this.cubeHolding = b,
          getCubeMoveEnd: () => this.cubeMoveEnd,
          setCubeMoveEnd: (t) => this.cubeMoveEnd = t
        })
      }
    }
    if((flag & cubemode.ALLOW_KEY_ROTATE) !== 0){    
      if(!bool) {
        this.presskey.dispose()
        this.presskey = null
      }else{  
        this.presskey = new presskeyboard({
          scene: this.SceneManager.canvas, camOut: this.SceneManager.camera,
          ObjectManager: this.ObjectManager,
          AnimeManager: this.AnimeManager,
          SceneManager: this.SceneManager,
          dispCube: this.dispCube,
          status: this.mode_set_presskey.bind(this),
          getCubeHolding: () => this.cubeHolding,
          setCubeHolding: (b) => this.cubeHolding = b,
          getCubeMoveEnd: () => this.cubeMoveEnd,
          setCubeMoveEnd: (t) => this.cubeMoveEnd = t
        })
      }
    }
    if((flag & cubemode.ALLOW_COLOR_PICK) !== 0){
      if(!bool) {
        this.Colorset.dispose()
        this.Colorset = null
      }else{  
        this.Colorset = new colorinput({
          scene: this.SceneManager.canvas, camOut: this.SceneManager.camera, disp: this._main,
          ObjectManager: this.ObjectManager,
          AnimeManager: this.AnimeManager,
          SceneManager: this.SceneManager,
          status: this.mode_set_Colorseter.bind(this),
          Color_completion: this.Color_completion.bind(this)
        })
      }
    }
    if((flag & cubemode.ALLOW_ANIM_CONTROL) !== 0){
      if(!bool){
        this.timeList.dispose()
        this.timeList = null
      }else{
        this.timeList = new motionList({  
          full_cube: this.ObjectManager.objects.cube,
          L_hand: this.ObjectManager.objects.handL,
          R_hand: this.ObjectManager.objects.handR,
          dispCube: this.dispCube,
          ObjectManager: this.ObjectManager,
          AnimeManager: this.AnimeManager,
          SceneManager: this.SceneManager,
          status: this.mode_set_Guider.bind(this),
          allow_practice: this.mode_Practicer.bind(this),
          Change_Guide: this.func_Change_Guide.bind(this),
          Change_Practice: this.func_Change_Practice.bind(this),
          get_speed: () => { return this.rote_speed}
        })
      }
    }
  }

  get cubeHolding(){
    return this.#cubeHolding
  }
  set cubeHolding(bool){
    this.#cubeHolding = bool
  }
  get cubeMoveEnd(){
    return this.#cubeMoveEnd
  }
  set cubeMoveEnd(time){
    this.#cubeMoveEnd = time
  }

  async fileLoaded(){
    console.log("すべてのリソース（画像・CSS・JS）が読み込み完了！")
    window.removeEventListener("load", this.fileLoaded)

    const canvas = document.createElement("canvas")
    canvas.id="icon"
    canvas.style.width = "40vmin"
    canvas.style.height = "40vmin"
    canvas.classList.add("load-icon")

    const ctx = canvas.getContext("2d")
    canvas.width = 300
    canvas.height = 300
    const w = 300
    ctx.lineWidth = w/10
    let fanwisegradient = ctx.createConicGradient(-0.2, w/2, w/2);
    fanwisegradient.addColorStop(0,   '#000');
    fanwisegradient.addColorStop(0.3, '#000');
    fanwisegradient.addColorStop(0.6, '#fff');
    fanwisegradient.addColorStop(0.8, '#CCCCCC00');
    ctx.strokeStyle = fanwisegradient;
    ctx.lineCap = "round";
    ctx.beginPath()
    ctx.arc(w/2, w/2, w/2-ctx.lineWidth/2, 0, 1.6*Math.PI)
    ctx.stroke()

    document.querySelector("body").appendChild(canvas)
    this.icon = canvas

    // const iframe = document.getElementById('iframe')
    // iframe.width = 100
    // iframe.height = 100


    const map = document.getElementsByClassName('sulves-map')[0]
    const list = document.createElement('div')
    const line = document.createElement('div')
    const rotas = document.createElement('div')

    list.classList.add("list")
    line.classList.add("line")
    rotas.classList.add("rotas")
    
    line.append(rotas)

    for(let i=0;i<16;i++)
      list.append(line.cloneNode(true))

    map.append(list)

    const folderTile = document.getElementsByClassName("folder-tile")
    // console.log(folderTile)
    for(let i=0; i<folderTile.length; i++){
      folderTile[i].addEventListener("click", (e) => {
        // console.log(folderTile[i].parentElement)
        if(folderTile[i].parentElement.classList.value.includes("clause-folder")){
          folderTile[i].parentElement.classList.remove('clause-folder')
          
        }
        else{
          folderTile[i].parentElement.classList.add('clause-folder')

        }
      })
    }

    
    this.calculation_set_buttont = document.getElementsByClassName("calculation_set_buttont")[0]
    this.func_calculation_set_buttont = this.func_calculation_set_buttont.bind(this)
		this.calculation_set_buttont.addEventListener('click', this.func_calculation_set_buttont)
    
    
    this.color_set_buttont = document.getElementsByClassName("color-set-buttont")[0]
    this.func_color_set_buttont = this.func_color_set_buttont.bind(this)
		this.color_set_buttont.addEventListener('click', this.func_color_set_buttont)
    
    
    this.fullscreen_buttont = document.getElementsByClassName("fullscreen_buttont")[0]
    this.func_fullscreen_buttont = this.func_fullscreen_buttont.bind(this)
		this.fullscreen_buttont.addEventListener('click', this.func_fullscreen_buttont)

    this.rote_speed_metar = new meter({
      id: document.querySelector(`.spped-meter`),
      el: document.querySelector(`.spped-meter .meter-in`),
      start: 0.2,
      end: 6,
      value: 4,
      dx: 0.2,
      constSet: true,
      callbackfunc: {func1: this, func2: "meter1"},
      count_Disp: document.querySelector(`.spped-meter`),
    })

    this.hnd_opacity_metar = new meter({
      id: document.querySelector(`.hand-opacity-meter`),
      el: document.querySelector(`.hand-opacity-meter .meter-in`),
      start: 0,
      end: 1,
      value: 1,
      dx: 0.1,
      constSet: false,
      callbackfunc: {func1: this, func2: "meter2"},
      count_Disp: document.querySelector(`.hand-opacity-meter`),
    })
    
    const objMan = new ObjectManager()
    const isLoad = await objMan.load([
      {name: "setcube", modelPath: "./model/sample.glb"},
      {name: "handR", modelPath: "./model/hand-v2-2.glb"},
      {name: "handL", modelPath: "./model/hand-v2-2.glb"},
    ])

    const animeManager = new AnimationManager()

    const mainCanvas = document.createElement("canvas")
    mainCanvas.id = "main-canvas"
    mainCanvas.classList.add("main-display")
    const _main = document.querySelector("#main-display")
    _main.appendChild(mainCanvas)
    this._main = _main

    const scnMan = new SceneManager({
      canvasEl: mainCanvas, 
      mixers: animeManager,
      view: {x: 0, y: 0, z: 5}
    })

    // this.makeCube = this.makeCube.bind(this)
    const cube = this.makeCube(objMan.objects.setcube)
    objMan.add({name: "cube", modle: cube})

    scnMan.scene.add(cube)
    scnMan.scene.add(objMan.objects.handL)
    scnMan.scene.add(objMan.objects.handR)

    // // シーンに追加
    // const axesHelper = new THREE.AxesHelper(2);
    // scnMan.scene.add(axesHelper)

    objMan.objects.handL.visible = false
    objMan.objects.handR.visible = false
    objMan.objects.handL.traverse((e)=>{
      if(e.type == "SkinnedMesh"){
          e.material.transparent = true
      }
    })
    objMan.objects.handR.traverse((e)=>{
      if(e.type == "SkinnedMesh"){
          e.material.transparent = true
      }
    })

    const cubeAnim = animeManager.create({scene: objMan.objects.cube, name: "cube"})
    const handLAnim = animeManager.create({scene: objMan.objects.handL, name: "L_hand"})
    const handRAnim = animeManager.create({scene: objMan.objects.handR, name: "R_hand"})

    objMan.objects.handL.scale.set(56,56,56)
    objMan.objects.handR.scale.set(-56,56,56)

    this.ObjectManager = objMan
    this.AnimeManager = animeManager
    this.SceneManager = scnMan
    
    this.cubeAnim = cubeAnim
    this.handLAnim = handLAnim
    this.handRAnim = handRAnim

    this.dispCube = new cubeState()

    this.dispCube.cube.set({
      "cp":[4,0,2,3,1,5,6,7],
      "co":[2,0,1,1,2,1,1,1],
      "ep":[11,5,9,6,7,4,2,0,1,10,3,8],
      "eo":[0,0,0,0,0,0,0,0,0,0,0,0],
      "c":[0,1,2,3,4,5]
    })

    // this.dispCube.cube.set(new State({
    //   cp:[4,5,0,7,3,1,6,2],
    //   co:[2,1,0,0,1,0,0,2],
    //   ep:[11,6,7,1,5,2,3,0,8,9,10,4],
    //   eo:[0,0,0,1,0,1,1,0,0,0,0,1],
    //   c:[0,1,2,3,4,5],
    // }))
    
    color_set(this.dispCube.color.c, objMan.objects.cube)
    cubeset(objMan.objects.cube, this.dispCube.cube)
    
    this.#cubeHolding  = false 

    this.changeState(cubemode.STATE_EXPLORE)
  }
  makeCube(objs){
    const root = new THREE.Group()
    const center = new THREE.Group()
    const corner = new THREE.Group()
    const edge = new THREE.Group()

    center.add(objs.getObjectByName("ce00-").clone(true))
    center.add(objs.getObjectByName("ce000").clone(true))

    corner.add(objs.getObjectByName("co00-").clone(true))
    corner.add(objs.getObjectByName("co000").clone(true))
    corner.add(objs.getObjectByName("co001").clone(true))
    corner.add(objs.getObjectByName("co002").clone(true))

    edge.add(  objs.getObjectByName("ed00-").clone(true))
    edge.add(  objs.getObjectByName("ed000").clone(true))
    edge.add(  objs.getObjectByName("ed001").clone(true))

    const cubeMate = [
      {},
      { transparent: true, opacity: 0.5 },
    ].at(0)

    for(let i=0;i<6;i++){
      const m = center.clone(true)

      const newMat = new THREE.MeshStandardMaterial(cubeMate)
      newMat.name = `ce${("00"+i).slice(-2)}0`
      m.getObjectByName("ce000").material = newMat

      m.name = `ce${("00"+i).slice(-2)}`
      m.getObjectByName("ce00-").name = `ce${("00"+i).slice(-2)}-`
      m.getObjectByName("ce000").name = `ce${("00"+i).slice(-2)}0`

      root.add(m)
    }

    for(let i=0;i<8;i++){
      const m = corner.clone(true)

      for(let s=0;s<3;s++){
        const newMat = new THREE.MeshStandardMaterial(cubeMate)
        newMat.name = `co${("00"+i).slice(-2)}${s}`
        m.getObjectByName(`co00${s}`).material = newMat
      }

      m.name = `co${("00"+i).slice(-2)}`
      m.getObjectByName("co00-").name = `co${("00"+i).slice(-2)}-`
      m.getObjectByName("co000").name = `co${("00"+i).slice(-2)}0`
      m.getObjectByName("co001").name = `co${("00"+i).slice(-2)}1`
      m.getObjectByName("co002").name = `co${("00"+i).slice(-2)}2`
      
      root.add(m)
    }

    for(let i=0;i<12;i++){
      const m = edge.clone(true)

      for(let s=0;s<2;s++){
        const newMat = new THREE.MeshStandardMaterial(cubeMate)
        newMat.name = `ed${("00"+i).slice(-2)}${s}`
        m.getObjectByName(`ed00${s}`).material = newMat
      }

      m.name = `ed${("00"+i).slice(-2)}`
      m.getObjectByName("ed00-").name = `ed${("00"+i).slice(-2)}-`
      m.getObjectByName("ed000").name = `ed${("00"+i).slice(-2)}0`
      m.getObjectByName("ed001").name = `ed${("00"+i).slice(-2)}1`
      
      root.add(m)
    }

    const inner = root.getObjectByName(`ce00-`)
    // console.log(inner)
    inner.material.name = "in"
    // inner.material.transparent = true
    // inner.material.opacity = 0.3
    // inner.material.visible = false

    root.name = "root"

    // console.log(objs)
    // console.log(root)

    return root
  }
  meter1(data){
    this.rote_speed = data.value
  }
  meter2(data){
    const Lhand = this.ObjectManager.objects.handL
    const Rhand = this.ObjectManager.objects.handR

    // console.log(Lhand)
    Lhand.traverse( (child) => {
      if(child.type == "SkinnedMesh") {
        // child.material.transparent = true
        child.material.opacity = data.value
      }
    })
    Rhand.traverse( (child) => {
      if(child.type == "SkinnedMesh") {
        // child.material.transparent = true
        child.material.opacity = data.value
      }
    })
  }
  mode_set_Colorseter(){
    return (this.currentFlags & cubemode.ALLOW_COLOR_PICK) !== 0
  }
  mode_set_presskey(){
    return (this.currentFlags & cubemode.ALLOW_KEY_ROTATE) !== 0
  }
  mode_set_Rotation(){
    return (this.currentFlags & cubemode.ALLOW_TOUCH_ROTATE) !== 0
  }
  mode_set_Viewpointer(){
    return (this.currentFlags & cubemode.ALLOW_VIEW_CONTROL) !== 0
  }
  mode_set_Guider(){
    return this.currentState === cubemode.STATE_GUIDING
  }
  mode_Practicer(){
    return this.currentState === cubemode.STATE_PRACTICE
  }
  Color_completion(Check_ans){
    this.dispCube.cube.set(Check_ans)
    this.dispCube.color.set(new State())

    cubeset(this.ObjectManager.objects.cube, this.dispCube.cube)
    color_set(this.dispCube.color.c, this.ObjectManager.objects.cube)
    
    this.changeState(cubemode.STATE_EXPLORE)
  }
  async func_calculation_set_buttont(){
    if(this.currentState == cubemode.STATE_EXPLORE){
      this.changeState(cubemode.STATE_ANALYZING)

      this.icon.classList.add("rotate-ani")
      this.icon.style.display = "block"

      await wait(100)

      const time = Date.now()

      const reqData = {ss: this.dispCube.cube, cd: this.dispCube.color.c}
      const request = await fetch(
        'https://cubesolvefunction010.azurewebsites.net/api/cubesovlefunction010', {
        // 'http://localhost:7071/api/CubeSovleFunction010', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              // 'x-api-key': 'qwaszx'
          },
          body: JSON.stringify(reqData)
      })
      console.log(request)
      const response = await request.json()
      console.log(response)

      const { res_cd, res_sl, res_tk, amime } = response.inf


      this.saveCube = this.dispCube.clone()

      console.log(this.timeList)

      await this.timeList.ins(this.dispCube.cube.copy(), res_cd, res_sl, res_tk, amime)

      localStorage.setItem("json", localStorage.getItem("json")+" "+(Date.now() - time))
      
      await wait(100)

      this.icon.style.display = "none"
      this.icon.classList.remove("rotate-ani")
      
      this.ObjectManager.objects.handL.visible = true
      this.ObjectManager.objects.handR.visible = true

      this.changeState(cubemode.STATE_GUIDING)
    }
    else if(this.currentState == cubemode.STATE_GUIDING){
      if(this.timeList.step_move)  return

      this.changeState(cubemode.STATE_EXPLORE)
      
      this.ObjectManager.objects.handL.visible = false
      this.ObjectManager.objects.handR.visible = false

      this.dispCube.cube.set(this.saveCube.cube)
      this.dispCube.color.set(this.saveCube.color)

      cubeset(this.ObjectManager.objects.cube, this.dispCube.cube)
    }
  }
  func_color_set_buttont(){
    this.changeState(cubemode.STATE_EDITING)
  }
  func_Change_Practice(){
    this.changeState(cubemode.STATE_PRACTICE)
  }
  func_Change_Guide(){
    this.changeState(cubemode.STATE_GUIDING)
  }
  func_fullscreen_buttont(){
    if (!document.fullscreenElement) {
      document.getElementsByTagName("body")[0].requestFullscreen().catch((err) => {
        alert(
          `Error attempting to enable fullscreen mode: ${err.message} (${err.name})`,
        );
      });
    } else {
      document.exitFullscreen();
    }
  }
}

const mainSystem = new cubemode()
window.System = mainSystem

const ip = window.location.hostname
const rotates = 3100
const animes = 3200