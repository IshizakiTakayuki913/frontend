import {
  cube_Full_Animation_Make, cubeset
} from './solve.js'

import data from './data/moves.json' with { type: 'json' }

const {moves } = data

const rotaSpped = 3

export class presskeyboard{
	Space_key = false
	Rotation = false
	key_ples = {
		'KeyW':false,
		'KeyX':false,
		'KeyA':false,
		'KeyD':false,
		'KeyE':false,
		'KeyC':false,
		'Digit1':false,
		'Digit2':false,
		'Digit3':false,
		'KeyJ':false,
		'KeyG':false,
	}
	M = {
		'KeyW':'U',
		'KeyX':'D',
		'KeyA':'L',
		'KeyD':'R',
		'KeyE':'B',
		'KeyC':'F',
		'Digit1':'x',
		'Digit2':'y',
		'Digit3':'z',
		'KeyJ':'r',
		'KeyG':'l',
		'KeyY':'u',
		'KeyN':'d',
		'KeyM':'f',
		'KeyU':'b',
	}
	constructor(_data = {
		  dispCube: null,
      ObjectManager: null, AnimeManager: null, SceneManager: null, status: null,
			getCubeHolding: null, setCubeHolding: null,
      getCubeMoveEnd: null, setCubeMoveEnd: null
		}) {

    this.dispCube = _data.dispCube
    this.ObjectManager = _data.ObjectManager
    this.AnimeManager = _data.AnimeManager
    this.SceneManager =  _data.SceneManager
		this.status = _data.status
		
    this.getCubeHolding =  _data.getCubeHolding
    this.setCubeHolding =  _data.setCubeHolding
		
    this.getCubeMoveEnd =  _data.getCubeMoveEnd
    this.setCubeMoveEnd =  _data.setCubeMoveEnd

		this.keyDown = this.keyDown.bind(this)
		window.addEventListener("keydown", this.keyDown)
		
		this.keyUp = this.keyUp.bind(this)
		window.addEventListener("keyup", this.keyUp)
	}
  get time(){
    return Date.now()
  }
	keyUp(e){
		if(e.code == "Space")
			this.Space_key = false
			this.key_ples[e.code] = false
	}
	keyDown(e){
		if(!this.status()) return
		// if(e.code == "KeyP"){
		// 	const camera = document.getElementById('camOut').components["sync-user"]
		// 	camera.load()
		// }
		const A = e.code

		if(e.code == "Space")
			this.Space_key = true
		if(this.key_ples[e.code]) return
			this.key_ples[e.code]= true
		if(this.M[A] == undefined)	return
		

		let sulb = this.M[A]
		if(e.shiftKey) sulb += "'"
		else if(this.Space_key) sulb += "2"
		
		if(this.getCubeHolding()){
			console.log(`キューブ回転 マウス・タッチ キャンセル`)
			return
		}
		
		const time = this.time
    if(time <= this.getCubeMoveEnd()){
			console.log("キューブ回転 キーボード キャンセル")
			return
		}

		const anims = cube_Full_Animation_Make(this.dispCube.cube, sulb)
		
		this.dispCube.cube.set(this.dispCube.cube.apply_move(moves[sulb]))
		
		this.setCubeMoveEnd(this.time + 1000 / rotaSpped)
		
		this.AnimeManager.mixersName.cube.remove()
		cubeset(this.ObjectManager.objects.cube, this.dispCube.cube)
		this.AnimeManager.mixersName.cube.set({animationData: anims, fps: 1, timeScale: rotaSpped})
		this.AnimeManager.mixersName.cube.action.paused = false
	}
  dispose(){
		window.removeEventListener("keydown", this.keyDown)
		window.removeEventListener("keyup", this.keyUp)
  }
}