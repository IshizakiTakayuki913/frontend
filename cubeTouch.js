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
  cubeHolding  = true
  cubeMoveEnd = 0
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
  mode_list = [
    [ true,  true, false],
    [false, false, false],
    [ true, false, false],
    [ true, false,  true],
    [ true,  true, false],
  ]
  rote_speed = 2

  
	constructor() {
    // console.log(`メインシステムが読み込み完了！`)
    this.fileLoaded = this.fileLoaded.bind(this)

    window.addEventListener("load", this.fileLoaded)
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

    this.color_set_buttont = document.getElementsByClassName("color-set-buttont")[0]
    this.calculation_set_buttont = document.getElementsByClassName("calculation_set_buttont")[0]
    this.fullscreen_buttont = document.getElementsByClassName("fullscreen_buttont")[0]


    this.func_calculation_set_buttont = this.func_calculation_set_buttont.bind(this)
		this.calculation_set_buttont.addEventListener('click', this.func_calculation_set_buttont)

    this.func_color_set_buttont = this.func_color_set_buttont.bind(this)
		this.color_set_buttont.addEventListener('click', this.func_color_set_buttont)

    
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

	  this.Viewpoint = new camera({
      scene: mainCanvas, camOut: scnMan.camera, parent: this,
      ObjectManager: this.ObjectManager,
      AnimeManager: this.AnimeManager,
      SceneManager: this.SceneManager
    })
    
	  this.Colorset = new colorinput({scene: mainCanvas, camOut: scnMan.camera, disp: _main, parent: this,
      ObjectManager: this.ObjectManager,
      AnimeManager: this.AnimeManager,
      SceneManager: this.SceneManager
    })
	  this.presskey = new presskeyboard({scene: mainCanvas, camOut: scnMan.camera, parent: this,
      ObjectManager: this.ObjectManager,
      AnimeManager: this.AnimeManager,
      SceneManager: this.SceneManager
    })
	  this.Rotation = new cubemrotate({scene: mainCanvas, camOut: scnMan.camera, parent: this,
      ObjectManager: this.ObjectManager,
      AnimeManager: this.AnimeManager,
      SceneManager: this.SceneManager
    })
    
    this.cubeHolding  = false 

    this.Mode_set("Free")
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
  Mode_set(Nmode){
    // console.trace(`Nmode: ${Nmode}`)

    this.cube_mode = Nmode

    this.Viewpoint.Viewpoint = this.mode_list[this.cube_modes[this.cube_mode]][this.cube_modes["Viewpoint"]]
    this.presskey.Rotation   = this.mode_list[this.cube_modes[this.cube_mode]][this.cube_modes["Rotation"]]
    this.Rotation.Rotation = this.mode_list[this.cube_modes[this.cube_mode]][this.cube_modes["Rotation"]]
    this.Colorset.Colorset = this.mode_list[this.cube_modes[this.cube_mode]][this.cube_modes["Colorset"]]

  }
  async Calculation(){

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

    this.timeList = new motionList({  
      full_cube: this.ObjectManager.objects.cube,
      L_hand: this.ObjectManager.objects.handL,
      R_hand: this.ObjectManager.objects.handR,
      parent: this,
      ObjectManager: this.ObjectManager,
      AnimeManager: this.AnimeManager,
      SceneManager: this.SceneManager
    })

    this.saveCube = this.dispCube.clone()

    await this.timeList.ins(this.dispCube.cube.copy(), res_cd, res_sl, res_tk, amime)

    localStorage.setItem("json", localStorage.getItem("json")+" "+(Date.now() - time))
    
    await wait(100)

    this.icon.style.display = "none"
    this.icon.classList.remove("rotate-ani")
    
    this.ObjectManager.objects.handL.visible = true
    this.ObjectManager.objects.handR.visible = true

    this.Mode_set("Execution")
  }
  Execution_End(){
    this.ObjectManager.objects.handL.visible = false
    this.ObjectManager.objects.handR.visible = false

    this.dispCube.cube.set(this.saveCube.cube)
    this.dispCube.color.set(this.saveCube.color)

    cubeset(this.ObjectManager.objects.cube, this.dispCube.cube)

    this.Mode_set("Free")
  }
  Color_completion(Check_ans){
    this.dispCube.cube.set(Check_ans)
    this.dispCube.color.set(new State())

    cubeset(this.ObjectManager.objects.cube, this.dispCube.cube)
    color_set(this.dispCube.color.c, this.ObjectManager.objects.cube)

    this.Mode_set("Free")
  }
  modeleData(data){
    console.log(`cube mode modeleData`)

    // full_cube = data.full_cube
    // model_centers = data.model_centers
    // model_corners = data.model_corners
    // model_edges = data.model_edges
    // bone_centers = data.bone_centers
    // bone_corners = data.bone_corners
    // bone_edges = data.bone_edges
    // L_hand = data.L_hand
    // R_hand = data.R_hand
    // frameObj = data.frameObj

    // console.log(full_cube)
    cubeset(full_cube.object3D, this.dispCube.cube)

    this.load_end = false
  }
  func_calculation_set_buttont(){
    if(this.cube_mode == "Free"){
      this.Mode_set("Calculation")
      this.Calculation()
    }
    else if(this.cube_mode == "Execution"){
      // execution_btn_func()
      this.timeList.execution_btn_func()
    }
  }
  func_color_set_buttont(){
    if(this.cube_mode !== "Free") return
    this.Mode_set("Input")
    cubeset(this.ObjectManager.objects.cube, new State())
    this.Colorset.Intiset()
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