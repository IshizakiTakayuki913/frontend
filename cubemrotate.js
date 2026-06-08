import * as THREE from 'three'

import {
  cube_Full_Animation_Make, cubeset, hitObjecet
} from './solve.js'

import data from './data/moves.json' with { type: 'json' }

const {moves } = data

const rotaSpped = 5

const cubeTileMove = [
  ["y'","x'" ],
  ["y'","z'" ],
  ["y'","x"],     //Center normal
  ["y'","z"],
  ["z'","x'"],
  ["z", "x'"],
  
  ["L"],["B"],
  ["R"],["B"],
  ["R"],["F"],
  ["L"],["F"],

  ["B"],["U"],
  ["R"],["U"],
  ["F"],["U"],     //Edge normal
  ["L"],["U"],

  ["B"],["D"],
  ["R"],["D"],
  ["F"],["D"],
  ["L"],["D"],

  ["L","B'"],
  ["B","U'"],
  ["U","L'"],

  ["B","R'"],
  ["R","U'"],
  ["U","B'"],

  ["R","F'"],     //Corner normal
  ["F","U'"],
  ["U","R'"],

  ["F","L'"],
  ["L","U'"],
  ["U","F'"],
  
  ["B","L'"],
  ["L","D'"],
  ["D","B'"],

  ["R","B'"],
  ["B","D'"],
  ["D","R'"],

  ["F","R'"],
  ["R","D'"],
  ["D","F'"],

  ["L","F'"],
  ["F","D'"],
  ["D","L'"],
]

const move_reverse = {
  "U": "U'",  "U'": "U",
  "D": "D'",  "D'": "D",
  "L": "L'",  "L'": "L",
  "R": "R'",  "R'": "R",
  "F": "F'",  "F'": "F",
  "B": "B'",  "B'": "B",
  "x": "x'",  "x'": "x",
  "y": "y'",  "y'": "y",
  "z": "z'",  "z'": "z",
}

export class cubemrotate{
  Rotation = false
	#mousePress = false
	#touchPress = false
  new_move = null
  new_rad = null

	constructor(_data = {
      scene: null, camOut: null, dispCube: null,
      ObjectManager: null, AnimeManager: null, SceneManager: null, status: null,
			getCubeHolding: null, setCubeHolding: null,
      getCubeMoveEnd: null, setCubeMoveEnd: null
		}) {
		this.scene = _data.scene
		this.camOut = _data.camOut
		this.dispCube = _data.dispCube
    this.ObjectManager = _data.ObjectManager
    this.AnimeManager = _data.AnimeManager
    this.SceneManager =  _data.SceneManager
    this.status = _data.status

    this.getCubeHolding =  _data.getCubeHolding
    this.setCubeHolding =  _data.setCubeHolding
		
    this.getCubeMoveEnd =  _data.getCubeMoveEnd
    this.setCubeMoveEnd =  _data.setCubeMoveEnd
		
    const geometry = new THREE.PlaneGeometry(10, 10, 4,4)
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x33ddff, 
      side: THREE.DoubleSide,
      transparent: true, opacity: 0.5
    })
    const plane = new THREE.Mesh(geometry, material)
    plane.name = "tile"
    plane.visible = false
    this.tile = plane
    this.SceneManager.scene.add(this.tile)

    this.makeDebugPoint = this.makeDebugPoint.bind(this)

    // 例: (1,2,3) の座標を黄色い点でマーク
    this.pos = {
      world:  this.makeDebugPoint(new THREE.Vector3(2,0,2), 0xff0000 ),
      local1: this.makeDebugPoint(new THREE.Vector3(2,0,2), 0x99ff99 ),
      local2: this.makeDebugPoint(new THREE.Vector3(2,0,2), 0x00ff00 ),
      local3: this.makeDebugPoint(new THREE.Vector3(2,0,2), 0x9999ff ),
      local4: this.makeDebugPoint(new THREE.Vector3(2,0,2), 0x0000ff ),
    }

		this.touchId= undefined

		this.mouseDown = this.mouseDown.bind(this)
		this.scene.addEventListener('mousedown', this.mouseDown)

		this.mouseMove = this.mouseMove.bind(this)
		document.addEventListener('mousemove', this.mouseMove, { passive: false })
		
		this.mouseUp = this.mouseUp.bind(this)
		document.addEventListener('mouseup', this.mouseUp)

		this.touchStart = this.touchStart.bind(this)
		this.scene.addEventListener('touchstart', this.touchStart, { passive: false })
		
		this.touchMove = this.touchMove.bind(this)
		this.scene.addEventListener('touchmove', this.touchMove, { passive: false })

		this.touchEnd = this.touchEnd.bind(this)
		this.scene.addEventListener('touchend', this.touchEnd)

  }
	get mousePress(){
    return this.#mousePress
  }
	get touchPress(){
    return this.#touchPress
  }
	set mousePress(_m){
    this.#mousePress = _m
    // cubeHolding  = true
  }
	set touchPress(_m){
    this.#touchPress = _m
  }
  get time(){
    return Date.now()
  }
  makeDebugPoint(position, _c) {
    const asd = [
      {x: 0, y: 0, z: 0, w: 1},
      {x: 0.5, y: 0.5, z: 0.5, w: 0.5},
      {x: 0.5, y: -0.5, z: 0.5, w: 0.5},
    ]

    function ziku(color, qua){
      const geometry = new THREE.BoxGeometry(0.6, 0.03, 0.03)
      const material = new THREE.MeshBasicMaterial({ color })
      const box = new THREE.Mesh(geometry, material)
      // box.quaternion.set(qua.x, qua.y, qua.z, qua.w)
      box.position.x = 0.3

      
      const points = new THREE.Group()
      points.quaternion.set(qua.x, qua.y, qua.z, qua.w)
      points.add(box)

      return points
    }

    const points = new THREE.Group()
    
    points.add(ziku("#ff0000", asd[0]))
    points.add(ziku("#0000ff", asd[1]))
    points.add(ziku("#00ff00", asd[2]))

    const geometry = new THREE.SphereGeometry(0.1)
    const material = new THREE.MeshBasicMaterial({color:  _c})
    const shape = new THREE.Mesh(geometry, material)
    points.add(shape)

    points.position.copy(position)
    return points
  }
  search_parts(){
    const partsNamt = this.parts.object.name

    const posName = {
      "ce": "c",
      "co": "cp",
      "ed": "ep",
    }
    const vecName = {
      "ce": "c",
      "co": "co",
      "ed": "eo",
    }
    const vecCount = {
      "ce": 1,
      "co": 3,
      "ed": 2,
    }
    // console.log({patrs: this.parts})

    const parts_type = partsNamt.slice(0,2)
    const _be = parseInt(partsNamt.slice(2,4))
    const _face = parseInt(partsNamt.slice(-1))

    // console.log({patrs: this.parts, partsNamt, parts_type, be, face})

    if(!(parts_type === "ed" || parts_type === "ce" || parts_type === "co"))	return

    const be = this.dispCube.cube[posName[parts_type]].indexOf(_be)
    const face = (_face + this.dispCube.cube[vecName[parts_type]][be]) % vecCount[parts_type]
    
    let text=`\nname [${partsNamt}] parts_type [${parts_type}] be [${be}] face [${face}]\n`

    const num = this.faceToMove(parts_type, be, face)

    this.moves = cubeTileMove[num]

    this.anims = {}
    const _ani = [...this.moves, this.moves.map(e => move_reverse[e])].flat(1)
    _ani.forEach(e => {
      this.anims[e] = cube_Full_Animation_Make(this.dispCube.cube, e)
    })

    this.start_pos = null
    this.partsRot = null
    
    const pos = this.parts

    const a ={
      ce: {x: 0, y: 1, z: 0, w: 0},
      co: {x: 0.5, y: 0.5, z: 0.5, w: -0.5},
      ed: {x: 0.7071067811865475, y: 0.7071067811865475, z: 0, w: 0},
    }

    const inQua =  a[parts_type]
    
    const _reQ = new THREE.Quaternion();
    this.parts.object.getWorldQuaternion(_reQ);

    const revesQua = _reQ.multiply(new THREE.Quaternion(inQua.x, inQua.y, inQua.z, inQua.w))

    this.tile.position.set(pos.point.x, pos.point.y, pos.point.z)
    this.tile.quaternion.set(revesQua.x, revesQua.y, revesQua.z, revesQua.w)

    text += `moves ${this.moves.join(` `)}`
    // console.log(text)

    this.new_move = null
    this.new_rad = null
    this.raycast_rotate_T = true
  }
  faceToMove(parts_type, be, face){
    let num = 0
    if(parts_type === "ce"){
      num = be
    }
    else if(parts_type === "ed"	){
      num = be*2 + 6
      num += face
    }
    else if(parts_type === "co"){
      num = be*3 + 30
      num += face
    }
    return num
  }
  Progress_rotate(){
    const dist = this.tilePos.uv
    dist.x = (dist.x - 0.5) * 3
    dist.y = (dist.y - 0.5) * 3

    let roteInde = -1
    let value = 0
    const direi = 0.07

    if(Math.abs(dist.x) > direi){
      roteInde = 0
      value = dist.x
    }
    if(this.moves.length>1 && Math.abs(dist.y) > Math.abs(value) && Math.abs(dist.y) > direi){
      roteInde = 1
      value = dist.y
    }
    if(roteInde == -1){
      if(this.new_move !== null) this.AnimeManager.mixersName.cube.showFrameAt(0)
      return
    }  

    let move = this.moves[roteInde]
    if(value < 0) move = move_reverse[move]
    value=Math.abs(value) - direi
    value = Math.max(Math.min(value,1),-1)

    // console.log(
    //   `  name [${this.moves[roteInde]}] value ${value}\n`,
    //   `N name [${move}] value ${Math.abs(value)}`,
    // )

    if(this.raycast_rotate_T && this.new_move !== null && this.new_move != move){
      this.AnimeManager.mixersName.cube.remove()
      cubeset(this.ObjectManager.objects.cube, this.dispCube.cube)
      this.AnimeManager.mixersName.cube.set({animationData: this.anims[move], fps: 1, timeScale: rotaSpped})
      this.AnimeManager.mixersName.cube.showFrameAt({time: value})
    }
    else if(this.raycast_rotate_T && this.new_move === null){
      this.AnimeManager.mixersName.cube.remove()
      cubeset(this.ObjectManager.objects.cube, this.dispCube.cube)
      this.AnimeManager.mixersName.cube.set({animationData: this.anims[move], fps: 1, timeScale: rotaSpped})
      this.AnimeManager.mixersName.cube.showFrameAt({time: value})
    }
    else if(this.raycast_rotate_T){
      this.AnimeManager.mixersName.cube.showFrameAt({time: value})
    }

    this.new_move = move
    this.new_rad = value
  }
  get time(){
    return Date.now()
  }
  Decision_rotate(){
    if(this.new_move !== null){
      const rad = this.new_rad
      const move = this.new_move
      
      if(rad < 0.125){
        this.AnimeManager.mixersName.cube.play({timeScale: -rotaSpped})
        this.setCubeMoveEnd(this.time + 1000 / rotaSpped)
        return
      }

			this.dispCube.cube = this.dispCube.cube.apply_move(moves[move])
      this.AnimeManager.mixersName.cube.play({timeScale: rotaSpped})
      this.setCubeMoveEnd(this.time + 1000 / rotaSpped)

      const event = new CustomEvent("tutorial", {
        detail: {
          type: "user action",
          name: "cube-rotation"
        }
      });
      window.dispatchEvent(event);
    }
  }
  mouseDown(e){
    if(!this.status()) return
    if(e.target.tagName !== 'CANVAS') return
    if(this.mousePress || this.touchPress) return

		if(this.getCubeHolding()){
			console.log(`キューブ回転 マウス・タッチ キャンセル`)
			return
		}

    const time = this.time
    if(time <= this.getCubeMoveEnd()){
      console.log("キューブ回転 マウス キャンセル")
      return
    }

    const _parts = hitObjecet(
      {x:e.offsetX , y:e.offsetY},
			this.scene,
      this.camOut,
      [this.ObjectManager.objects.cube]
    )
    this.parts = _parts.length > 0 ? _parts[0] : null

    if(this.parts === null) return

    cubeset(this.ObjectManager.objects.cube, this.dispCube.cube)
    this.search_parts()	
    this.mousePress = true
    this.setCubeHolding(true)
    this.mousePos = {x:e.offsetX , y:e.offsetY}
  }
  touchStart(e){
    if(!this.status()) return
    if(e.target.tagName !== 'CANVAS') return
    if(this.mousePress || this.touchPress) return
    if(e.touches.length>1)  return

		if(this.getCubeHolding()){
			console.log(`キューブ回転 マウス・タッチ キャンセル`)
			return
		}

    const time = this.time
    if(time <= this.getCubeMoveEnd()){
      console.log("キューブ回転 タッチ キャンセル")
      return
    }

    const _parts = hitObjecet(
      {x:e.touches[0].clientX , y:e.touches[0].clientY},
			this.scene,
      this.camOut,
      [this.ObjectManager.objects.cube]
    )
    this.parts = _parts.length > 0 ? _parts[0] : null

    if(this.parts === null) return

    cubeset(this.ObjectManager.objects.cube, this.dispCube.cube)
    this.search_parts()	
    
    this.touchPress = true
    this.setCubeHolding(true)
    this.touchId = e.touches[0].identifier
    
    this.mousePos = {x:e.touches[0].clientX , y:e.touches[0].clientY}
  }
  mouseUp(e){
    // console.log(e.target)
    if(!this.mousePress)	return
    
    this.mousePress = false
      
    this.setCubeHolding(false)
      
    this.Decision_rotate()
  }
  touchEnd(e){
    if(!this.touchPress)	return
    if(e.changedTouches[0].identifier ==this.touchId){
    //  console.log("identifier touchend")
      this.touchId = undefined
      this.touchPress = false
      
      this.setCubeHolding(false)
      
      this.Decision_rotate()
    }
  }
  mouseMove(e){
		e.preventDefault()
    if(!this.status()) return
    // if(e.target.tagName !== 'CANVAS') return
    if(!this.mousePress)	return
    
    const _parts = hitObjecet(
      {
        x:e.clientX - this.scene.getBoundingClientRect().left,
        y:e.clientY - this.scene.getBoundingClientRect().top
      },
			this.scene,
      this.camOut,
      [this.tile]
    )
    // const _parts = hitObjecet(
    //   {
    //     x:e.offsetX, 
    //     y:e.offsetY
    //   },
		// 	this.scene,
    //   this.camOut,
    //   [this.tile]
    // )

    this.tilePos = _parts.length > 0 ? _parts[0] : null

    if(this.tilePos === null) return
    
    this.Progress_rotate()
  }
  touchMove(e){
		e.preventDefault()
    if(!this.status()) return
    if(!this.touchPress)	return
    if(e.changedTouches[0].identifier !==this.touchId) return
    // console.log("touchmove")
    
    const _parts = hitObjecet(
      {
        x:e.changedTouches[0].clientX - this.scene.getBoundingClientRect().left,
        y:e.changedTouches[0].clientY - this.scene.getBoundingClientRect().top
      },
			this.scene,
      this.camOut,
      [this.tile]
    )
    // const _parts = hitObjecet(
    //   {x:e.changedTouches[0].clientX , y:e.changedTouches[0].clientY},
		// 	this.scene,
    //   this.camOut,
    //   [this.tile]
    // )

    this.tilePos = _parts.length > 0 ? _parts[0] : null

    if(this.tilePos === null) return

    this.Progress_rotate()
  }
	dispose(){

    this.SceneManager.scene.remove(this.tile)

		this.scene.removeEventListener('mousedown', this.mouseDown)
		document.removeEventListener('mousemove', this.mouseMove)
		document.removeEventListener('mouseup', this.mouseUp)
		this.scene.removeEventListener('touchstart', this.touchStart)
		this.scene.removeEventListener('touchmove', this.touchMove)
		this.scene.removeEventListener('touchend', this.touchEnd)
	}
}


