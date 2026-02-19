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
	constructor(_data = {parent: null,
      ObjectManager: null, AnimeManager: null, SceneManager: null}) {

    this.parent = _data.parent
    this.ObjectManager = _data.ObjectManager
    this.AnimeManager = _data.AnimeManager
    this.SceneManager =  _data.SceneManager

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
		if(!this.Rotation) return
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
		
		if(this.parent.cubeHolding){
			console.log(`キューブ回転 マウス・タッチ キャンセル`)
			return
		}
		
		const time = this.time
    if(time <= this.parent.cubeMoveEnd){
			console.log("キューブ回転 キーボード キャンセル")
			return
		}

		const anims = cube_Full_Animation_Make(this.parent.dispCube.cube, sulb)

		this.parent.dispCube.cube.set(this.parent.dispCube.cube.apply_move(moves[sulb]))

		this.parent.cubeMoveEnd = this.time + 1000 / rotaSpped
		
		this.AnimeManager.mixersName.cube.remove()
		cubeset(this.ObjectManager.objects.cube, this.parent.dispCube.cube)
		this.AnimeManager.mixersName.cube.set({animationData: anims, fps: 1, timeScale: rotaSpped})
		this.AnimeManager.mixersName.cube.action.paused = false
	}
  dispose(){
		window.removeEventListener("keydown", this.keyDown)
		window.removeEventListener("keyup", this.keyUp)
  }
}