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

import {AnnotationManager, SVGAnnotation} from './annotation.js'


import {TutorialManager} from './tutorial.js'

import {
  State, cubeState, color_set,
  cubeset, wait,
  objectPrint, positionGet, modelIndex
} from './solve.js'
// import { vec2 } from 'three/src/nodes/tsl/TSLCore.js'

const svgNS = "http://www.w3.org/2000/svg"
const xmlns= "http://www.w3.org/1999/xhtml"

window.THREE = THREE
window.color_set = color_set
window.cubeset = cubeset
window.objectPrint = objectPrint


class cubemode{
  #cubeHolding = true
  #cubeMoveEnd = 0

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

  rote_speed = 2
  
  ano_obj = null
  ano_obj_type = null

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

    
    const _svg = document.createElementNS(svgNS, "svg");
    document.querySelector("body").appendChild(_svg)
    _svg.id = "annotation-svg"
    _svg.classList.add("ui-overlay")
    

    this.AnnotationManager = new AnnotationManager(_svg)
    this.anoMap = {}

    this.TutorialManager = new TutorialManager(
      _svg, this.AnnotationManager,
      this.openMenuFolder. bind(this)
    )

    this.AnnotationManager.loadingIconSet()

    this.fileLoaded = this.fileLoaded.bind(this)
    window.addEventListener("load", this.fileLoaded)
	}
  /**
   * 状態の遷移が可能かを判断する
   * @param {number} nextState STATE 次に遷移予定の状態
   * @returns 
   */
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
  /**
   * 状態の遷移を行う　また、遷移で機能するサブクラスのＯＮ・ＯＦＦを行う
   * @param {number} nextState STATE 次に遷移予定の状態
   */
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
  }
  /**
   * 現在の遷移でサブクラスの機能が使用される場合は宣言、停止されるを場合は消去を行う
   * @param {*} flag サブクラス
   * @param {*} bool ＯＮ・ＯＦＦ
   */
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
          callback: this.upDate_view.bind(this)
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
          get_speed: () => { return this.rote_speed},
          set_ano: this.set_ano.bind(this),
          callback: this.upDate_view.bind(this)
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
  /**
   * メインのファイルを読み込まれた際に呼び出される
   * ここで初期環境の構築を行う
   */
  async fileLoaded(){
    console.log("すべてのリソース（画像・CSS・JS）が読み込み完了！")
    window.removeEventListener("load", this.fileLoaded)

    // const canvas = document.createElement("canvas")
    // canvas.id="icon"
    // canvas.style.width = "40vmin"
    // canvas.style.height = "40vmin"
    // canvas.classList.add("load-icon")

    // const ctx = canvas.getContext("2d")
    // canvas.width = 300
    // canvas.height = 300
    // const w = 300
    // ctx.lineWidth = w/10
    // let fanwisegradient = ctx.createConicGradient(-0.2, w/2, w/2);
    // fanwisegradient.addColorStop(0,   '#000');
    // fanwisegradient.addColorStop(0.3, '#000');
    // fanwisegradient.addColorStop(0.6, '#fff');
    // fanwisegradient.addColorStop(0.8, '#CCCCCC00');
    // ctx.strokeStyle = fanwisegradient;
    // ctx.lineCap = "round";
    // ctx.beginPath()
    // ctx.arc(w/2, w/2, w/2-ctx.lineWidth/2, 0, 1.6*Math.PI)
    // ctx.stroke()

    // document.querySelector("body").appendChild(canvas)
    // this.icon = canvas

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

    const folderTile = Object.values(document.getElementsByClassName("folder"))
    
    for(let i=0; i<folderTile.length; i++){

      folderTile[i].style.maxHeight = `${folderTile[i].scrollHeight}px`

      folderTile[i].querySelector(".folder-tile")
      .addEventListener("click", (e) => {
        if(e.target.parentElement !== folderTile[i]) return

        if(folderTile[0].classList.value.includes("tutorial-targeting"))  return

        if(folderTile[i].classList.value.includes("clause-folder")){
          folderTile[i].classList.remove('clause-folder')
        }
        else{
          folderTile[i].classList.add('clause-folder')
        }
      })
    }

    this.menuFolders = folderTile
    this.tree = [
      -1,
      0,
      1,
      0,
      3,
      4,
      4,
      0
    ]

    
    this.calculation_set_buttont = document.getElementsByClassName("function-calculation-set-buttont")[0]
    this.func_calculation_set_buttont = this.func_calculation_set_buttont.bind(this)
		this.calculation_set_buttont.addEventListener('click', this.func_calculation_set_buttont)
    
    
    this.color_set_buttont = document.getElementsByClassName("function-color-set-buttont")[0]
    this.func_color_set_buttont = this.func_color_set_buttont.bind(this)
		this.color_set_buttont.addEventListener('click', this.func_color_set_buttont)
    
    
    this.fullscreen_buttont = document.getElementsByClassName("function-fullscreen-buttont")[0]
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

    // const geometry = new THREE.BoxGeometry(1, 1, 1);
    // エッジのジオメトリを作成（30度以上の角度があるエッジを抽出）
    // console.log(objMan.objects.handL)
    // const edges = new THREE.EdgesGeometry(objMan.objects.handL.children[0].children[0].geometry, 30); 
    // const outLine = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xFF0000 }));
    
    // outLine.scale.set(56,56,56)
    // scnMan.scene.add(outLine);

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

    // this.dispCube.cube.set({
    //   "cp":[4,0,2,3,1,5,6,7],
    //   "co":[2,0,1,1,2,1,1,1],
    //   "ep":[11,5,9,6,7,4,2,0,1,10,3,8],
    //   "eo":[0,0,0,0,0,0,0,0,0,0,0,0],
    //   "c":[0,1,2,3,4,5]
    // })

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

    // const ano_mes = document.createElement("div")
    // ano_mes.id = "ano-mes"
    // ano_mes.classList.add("annotation-message")
    // this._main.appendChild(ano_mes)

    // this.ano_mes = ano_mes

    // this.setupSVG()

    await wait(5000)
    this.AnnotationManager.svg.style.setProperty('--theme-color', '#010a26e2');
    this.AnnotationManager.loadingIconRemove()

    this.TutorialManager.start()

  }
  async openMenuFolder(_el){
   const _folder = _el.closest(".folder")

    const index = this.menuFolders.findIndex((_el)=>{return _el===_folder})
    let isCloues = false
    console.log({_folder, index})
    for(let i=index; i!=-1;){
      if(this.menuFolders[i].classList.value.includes("clause-folder")){
        this.menuFolders[i].classList.remove('clause-folder')
        isCloues = true
      }
      i = this.tree[i]
    }
    if(isCloues) await wait(500)

    return
  }
  /**
   * 新な解説のステップ設定時にアノテーションの対象のパーツを指定する
   * @param {String} type キューブのパーツのタイプ
   * @param {number} index キューブのパーツ内のインデックス
   */
  set_ano(type,index){
    console.log({type,index})
    this.ano_obj = this.ObjectManager.objects.cube.children[modelIndex(type,index)]
    this.ano_obj_type = type
  }
  /**
   * 解説モードのときに、情報が変更されたときサブクラスに呼び出される
   * アノテーションクラスのアップデートを命令する
   * @param {*} viewP 
   */
  upDate_view(viewP){
    const keys = Object.keys(this.anoMap)
    Object.values(this.anoMap).forEach((e, i) => {
      if(e.mode !== "3DPointer") return

      const ans = this.annotation_set(e.obj, e.type)
      
      // const a = this.ano_mes.getBoundingClientRect()
      // const b = {x: a.left + a.width*0.9, y: a.top + a.height}
      const b = {x: 580, y: 150}
      const c = ans.map(e=> { return { x: e.x-b.x, y: e.y-b.y, z: e.z }})
      
      let dd = {xSum: 0, ySum: 0, xMin: Infinity, xMax: -Infinity, yMin: Infinity, yMax: -Infinity}
      for(let i=0;i<c.length;i++){
        dd.xSum += ans[i].x
        dd.ySum += ans[i].y

        dd.xMin = dd.xMin > ans[i].x ? ans[i].x : dd.xMin
        dd.xMax = dd.xMax < ans[i].x ? ans[i].x : dd.xMax
        
        dd.yMin = dd.yMin > ans[i].x ? ans[i].x : dd.yMin
        dd.yMax = dd.yMax < ans[i].x ? ans[i].x : dd.yMax
      }

      this.AnnotationManager.activeAnnotations.get(keys[i]).updateLeaderLine(
        b.x, b.y,
        dd.xMax, dd.ySum/c.length
      )

      // console.log(dd)
      // this.updateLeaderLine(
      //   b.x, b.y,
      //   dd.xMax, dd.ySum/c.length
      // )
    })
  }
  /**
   * キューブのパーツのタイプに分けて、対象の座標を変換した一覧の値を返す
   * 3次元座標を画面の2次元座標に変換
   * @param {*} obj 
   * @param {*} type 
   * @returns {{{x: number, y: number, z: number}}} obj
   */
  annotation_set(obj, type){
    const dist = {
      "co": [
        { "x":-1.5, "y": 1.5, "z":-1.5 },
        { "x":-0.5, "y": 1.5, "z":-1.5 },
        { "x":-0.5, "y": 1.5, "z":-0.5 },
        { "x":-1.5, "y": 1.5, "z":-0.5 },
        { "x":-1.5, "y": 0.5, "z":-1.5 },
        { "x":-0.5, "y": 0.5, "z":-1.5 },
        { "x":-0.5, "y": 0.5, "z":-0.5 },
        { "x":-1.5, "y": 0.5, "z":-0.5 }
      ],
      "ce": [
        { "x":-0.5, "y": 0.5, "z":-1.5 },
        { "x": 0.5, "y": 0.5, "z":-1.5 },
        { "x": 0.5, "y": 0.5, "z":-0.5 },
        { "x":-0.5, "y": 0.5, "z":-0.5 },
        { "x":-0.5, "y":-0.5, "z":-1.5 },
        { "x": 0.5, "y":-0.5, "z":-1.5 },
        { "x": 0.5, "y":-0.5, "z":-0.5 },
        { "x":-0.5, "y":-0.5, "z":-0.5 }
      ],
      "ed": [
        { "x":-1.5, "y": 0.5, "z":-1.5 },
        { "x":-0.5, "y": 0.5, "z":-1.5 },
        { "x":-0.5, "y": 0.5, "z":-0.5 },
        { "x":-1.5, "y": 0.5, "z":-0.5 },
        { "x":-1.5, "y":-0.5, "z":-1.5 },
        { "x":-0.5, "y":-0.5, "z":-1.5 },
        { "x":-0.5, "y":-0.5, "z":-0.5 },
        { "x":-1.5, "y":-0.5, "z":-0.5 }
      ]
    }[type]
    const _camera = this.SceneManager.camera
    const ans = dist.map(e => this.getScreenPosition(obj, _camera, e))
    
    return ans
  }
  /**
   * 画面上の２次元座標に変更
   * @param {THREE.Object3D} target 
   * @param {THREE.Camera} camera 
   * @param {{x: number, y: number, z: number}} dist ズレ
   * @returns {{x: number, y: number, z: number}}
   */
  getScreenPosition(target,camera, dist){
    // 1. ローカル空間での座標を定義 (例: パーツの中心からx方向に0.5, y方向に0.5ずれた点)
    const localPoint = new THREE.Vector3(dist.x, dist.y, dist.z);

    // 2. その座標をワールド座標に変換
    // ※ localPointそのものが書き換わるので注意

    const vector = target.localToWorld(localPoint);

    // console.log({target, camera, dist})
    // console.log(vector);
    // これで worldPoint は世界全体の中心(0,0,0)からの座標になります。

    vector.project(camera);

    // 3. ブラウザのピクセル座標に変換
    const x = (vector.x + 1) / 2 * this.SceneManager.canvas.clientWidth
    const y = -(vector.y - 1) / 2 * this.SceneManager.canvas.clientHeight
    // console.log({ x: (vector.x + 1) / 2, y: -(vector.y - 1) / 2})
    // console.log({ x, y, z: vector.z })

    return { x, y, z: vector.z };
  }
  /**
   * キューブのモデルを制作する
   * @param {THREE.Object3D} objs キューブの基礎partsがまとめられてたモデル
   * @returns {THREE.Object3D} 完成後のモデル
   */
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
  /**
   * 解説アニメーション時の回転速度のmeterのコールバック関数
   * @param {number} data 回速度
   */
  meter1(data){
    this.rote_speed = data.value
  }
  /**
   * 解説アニメーション時のハンドモデルの透明度のmeterのコールバック関数
   * @param {number} data 透明度の値
   */
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
  /**
   * サブクラスから自身が利用できるかを判断する
   * @returns {boolean} 
   */
  mode_set_Colorseter(){
    return (this.currentFlags & cubemode.ALLOW_COLOR_PICK) !== 0
  }
  /**
   * サブクラスから自身が利用できるかを判断する
   * @returns {boolean} 
   */
  mode_set_presskey(){
    return (this.currentFlags & cubemode.ALLOW_KEY_ROTATE) !== 0
  }
  /**
   * サブクラスから自身が利用できるかを判断する
   * @returns {boolean} 
   */
  mode_set_Rotation(){
    return (this.currentFlags & cubemode.ALLOW_TOUCH_ROTATE) !== 0
  }
  /**
   * サブクラスから自身が利用できるかを判断する
   * @returns {boolean} 
   */
  mode_set_Viewpointer(){
    return (this.currentFlags & cubemode.ALLOW_VIEW_CONTROL) !== 0
  }
  /**
   * サブクラスから自身が利用できるかを判断する
   * @returns {boolean} 
   */
  mode_set_Guider(){
    return this.currentState === cubemode.STATE_GUIDING
  }
  /**
   * サブクラスから自身が利用できるかを判断する
   * @returns {boolean} 
   */
  mode_Practicer(){
    return this.currentState === cubemode.STATE_PRACTICE
  }
  /**
   * 色入力サブクラスから色入力が完了して呼び出される
   */
  Color_completion(Check_ans){
    this.dispCube.cube.set(Check_ans)
    this.dispCube.color.set(new State())

    cubeset(this.ObjectManager.objects.cube, this.dispCube.cube)
    color_set(this.dispCube.color.c, this.ObjectManager.objects.cube)
    
    this.changeState(cubemode.STATE_EXPLORE)

    const event = new CustomEvent("tutorial", {
			detail: {
				type: "user action",
        name: "color-set-completion",
			}
		});
		window.dispatchEvent(event);

  }
  /**
   * ボタン　解説機能の使用
   * APIを呼び出す
   */
  async func_calculation_set_buttont(){
    if(this.currentState == cubemode.STATE_EXPLORE){
      this.changeState(cubemode.STATE_ANALYZING)

      this.AnnotationManager.loadingIconSet()

      window.dispatchEvent(new CustomEvent("tutorial", {
        detail: {
          type: "function click",
          name: "calculation" 
        }
      }));


      await wait(1000)

      const time = Date.now()

      const reqData = {ss: this.dispCube.cube, cd: this.dispCube.color.c}
      const request = await fetch(
        // 'https://cubesolvefunction010.azurewebsites.net/api/cubesovlefunction010', {
        'http://localhost:7071/api/CubeSovleFunction010', {
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
      
      await wait(5000)

      const is = this.changeState(cubemode.STATE_GUIDING)

      this.calculation_set_buttont.innerHTML = "実行中"
      
      this.ObjectManager.objects.handL.visible = true
      this.ObjectManager.objects.handR.visible = true

      if(is){
        this.AnnotationManager.loadingIconRemove()
        
        window.dispatchEvent(new CustomEvent("tutorial", {
          detail: {
            "type": "user action",
            "name": "calculation-response-completion",
          }
        }));
      }
      else {
        console.error("解説機能に切り替わることができなかった")
      }

    }
    else if(this.currentState == cubemode.STATE_GUIDING){
      if(this.timeList.step_move)  return

      this.changeState(cubemode.STATE_EXPLORE)

      const event = new CustomEvent("tutorial", {
        detail: {
          type: "btton",
          name: "exrlore" 
        }
      });
      window.dispatchEvent(event);

      this.calculation_set_buttont.innerHTML = "実行"
      
      this.ObjectManager.objects.handL.visible = false
      this.ObjectManager.objects.handR.visible = false

      this.dispCube.cube.set(this.saveCube.cube)
      this.dispCube.color.set(this.saveCube.color)

      cubeset(this.ObjectManager.objects.cube, this.dispCube.cube)
    }
  }
  /**
   * ボタン　色入力の使用
   */
  func_color_set_buttont(){
    if(this.currentState === cubemode.STATE_EXPLORE){
      const is = this.changeState(cubemode.STATE_EDITING)
      if(!is) return

      const event = new CustomEvent("tutorial", {
        detail: {
          type: "function click",
          name: "color-set" 
        }
      });
      window.dispatchEvent(event);
    }
    else if(this.currentState === cubemode.STATE_EDITING){
      const is = this.changeState(cubemode.STATE_EXPLORE)
      if(!is) return
      
      cubeset(this.ObjectManager.objects.cube, this.dispCube.cube)
      color_set(this.dispCube.color.c, this.ObjectManager.objects.cube)

      const event = new CustomEvent("tutorial", {
        detail: {
          type: "function click",
          name: "color-set-break" 
        }
      });
      window.dispatchEvent(event);
    }

  }
  /**
   * ボタン　解説機能の練習モードの使用
   */
  func_Change_Practice(){
    this.changeState(cubemode.STATE_PRACTICE)
  }
  /**
   * ボタン　解説機能の解説モードの使用
   */
  func_Change_Guide(){
    this.changeState(cubemode.STATE_GUIDING)
  }
  /**
   * ボタン　フルスクリーン
   */
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