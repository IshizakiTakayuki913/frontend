import * as THREE from 'three'
import {syncuser} from './syncuser.js'
import {
  hitObjecet
} from './solve.js'


export class camera {
	Viewpoint = false
	scene = null
	camOut = null
	#angle = {x: 0, y:0, z: 0 ,r: 5}
	// #angle = new THREE.Rotation()
	
	constructor(_data = {scene: null, camOut: null, parent: null}) {
		this.scene = _data.scene
		this.camOut = _data.camOut
		this.parent = _data.parent
		
		this.mousePress = false
		this.touchPress = false
		this.touchMode = null

		console.log(this.angle)
		// console.log(`カメラ　ーーーー`)

		// console.log(this.scene)
		// this.setpos = this.scene.getBounndingClientRect()

		this.mouseDown = this.mouseDown.bind(this)
		this.scene.addEventListener('mousedown', this.mouseDown)

		this.mouseMove = this.mouseMove.bind(this)
		document.addEventListener('mousemove', this.mouseMove, this.touchMove, { passive: false })
	
		
		this.mouseUp = this.mouseUp.bind(this)
		document.addEventListener('mouseup', this.mouseUp)

		this.touchStart = this.touchStart.bind(this)
		this.scene.addEventListener('touchstart', this.touchStart, { passive: false })
		
		this.touchMove = this.touchMove.bind(this)
		this.scene.addEventListener('touchmove', this.touchMove, { passive: false })

		this.touchEnd = this.touchEnd.bind(this)
		this.scene.addEventListener('touchend', this.touchEnd)
		
		
		this.wheel = this.wheel.bind(this)
		this.scene.addEventListener('wheel', this.wheel, { passive: false })

    this.syncuser = new syncuser()
	}
	get angle(){
		return this.#angle
	}
	set angle(v){
		// console.log({v})
    if (v.x !== undefined) this.#angle.x = v.x
    if (v.y !== undefined) this.#angle.y = v.y
    if (v.z !== undefined) this.#angle.z = v.z
    if (v.r !== undefined) this.#angle.r = v.r
		

		this.camOut.position.x = this.#angle.r * Math.sin(this.#angle.y) * Math.cos(this.#angle.x)
		this.camOut.position.y = this.#angle.r * Math.sin(-this.#angle.x)
		this.camOut.position.z = this.#angle.r * Math.cos(this.#angle.y) * Math.cos(this.#angle.x)
		this.camOut.lookAt(new THREE.Vector3(0, 0, 0))

		this.syncuser.manual(this.#angle)

		
		// this.camOut.position.x = Math.sin(this.#angle.y) * Math.cos(this.#angle.x)
		// this.camOut.position.y = Math.sin(-this.#angle.x)
		// this.camOut.position.z = Math.cos(this.#angle.y) * Math.cos(this.#angle.x)
		// this.camOut.lookAt(new THREE.Vector3(0, 0, 0))

		// this.syncuser.manual([...this.camOut.position])
	}
	mouseDown(e){
		if(!this.Viewpoint) return
		if(e.target.nodeName !== 'CANVAS') return

		const point = {
			x:e.clientX - this.scene.getBoundingClientRect().left,
			y:e.clientY - this.scene.getBoundingClientRect().top
		}
		
    const _parts = hitObjecet(
      point,
			this.scene,
			this.camOut,
			[this.parent.ObjectManager.objects.cube]
    )
    if(_parts.length > 0) return

		this.mousePress = true
		
		if(this.touchPress || this.touchMode !== undefined){
			this.touchPress =false
			this.touchMode = undefined
			console.log("touchPres")
		}

		this.mousePos = point
		this.sceneRot = {...this.angle}
	}
	mouseMove(e){
		e.preventDefault()
		if(!this.Viewpoint) return
		if(!this.mousePress)	return
		// console.log(`target [${e.target.nodeName}] current [${e.currentTarget.tagName}]`)
		
		// console.log(`camOut MOVE ${this.el.id}`)
		let dx = {
			x:e.clientX - this.scene.getBoundingClientRect().left - this.mousePos.x,
			y:e.clientY - this.scene.getBoundingClientRect().top - this.mousePos.y
		}

		this.angle = {
			x: Math.max(Math.min(this.sceneRot.x - dx.y/150,85*Math.PI/180),-85*Math.PI/180),
			y: (this.sceneRot.y - dx.x/150) % (2*Math.PI)
		}

		// console.log(`rotation ${JSON.stringify(this.angle)}`)
	}
	mouseUp(e){
		// console.log(e.target)
		if(!this.mousePress)	return
		this.mousePress=false
	}
	touchStart(e){
		if(!this.Viewpoint) return
		if(e.target.nodeName !== 'CANVAS') return

		const point = {
			x:e.touches[0].clientX - this.scene.getBoundingClientRect().left,
			y:e.touches[0].clientY - this.scene.getBoundingClientRect().top
		}

    const _parts = hitObjecet(
      point,
			this.scene,
			this.camOut,
			[this.parent.ObjectManager.objects.cube]
    )
    if(_parts.length > 0) return

		this.touchPress = true

		if(this.mousePress){
			this.mousePress =false
			console.log("mousePres")
		}

		if(this.touchMode === "none"){}
		else if(e.touches.length == 1){
			this.touchMode = "oun"
			this.touchPos = point
			this.sceneRot = {...this.angle}
		}
		else if(e.touches.length == 2){
			this.touchMode = "two"
			this.touchPos = {
				x:e.touches[1].clientX - e.touches[0].clientX ,
				y:e.touches[1].clientY - e.touches[0].clientY
			}
		}
	}
	touchMove(e){
		e.preventDefault()
		if(!this.Viewpoint) return
		if(!this.touchPress)	return

		if(this.touchMode === "oun"){
			let dx = {
				x:e.touches[0].clientX - this.scene.getBoundingClientRect().left - this.touchPos.x,
				y:e.touches[0].clientY - this.scene.getBoundingClientRect().top - this.touchPos.y
			}
			
			this.angle = {
				x: Math.max(Math.min(this.sceneRot.x - dx.y/150,85*Math.PI/180),-85*Math.PI/180),
				y: (this.sceneRot.y - dx.x/150) % (2*Math.PI)
			}
		}
		else if(this.touchMode === "two"){
			let pdx = Math.sqrt( 
				Math.pow( e.touches[1].clientX - e.touches[0].clientX, 2) + 
				Math.pow( e.touches[1].clientY - e.touches[0].clientY, 2) 
			)
			let dx = Math.sqrt( Math.pow( this.touchPos.x, 2) + Math.pow( this.touchPos.y, 2) )
			this.angle = {r: Math.max(this.sceneRot.r - ( pdx - dx )/100 , 3.0)}
			// console.log({pdx, dx, ang: this.angle})
			// document.title = `${pdx}, ${dx}, ${this.angle}`
		}
		else if(this.touchMode === "none"){}
	}
	touchEnd(e){
		if(!this.touchPress)	return
		// console.log(e)
		if(e.touches.length>0)	this.touchMode = "none"
		else {
			this.touchPress = false
			this.touchMode = null
		}
	}
	wheel(e){
		e.preventDefault()
		if(e.target.nodeName !== 'CANVAS') return
		let d = this.angle.r
		d += e.deltaY/200
		d = Math.max(d,0)
		this.angle = {r: d}
		
	}
	dispose(){
		this.scene.removeEventListener('mousedown', this.mouseDown)
		document.removeEventListener('mousemove', this.mouseMove)
		document.removeEventListener('mouseup', this.mouseUp)
		this.scene.removeEventListener('touchstart', this.touchStart)
		this.scene.removeEventListener('touchmove', this.touchMove)
		this.scene.removeEventListener('touchend', this.touchEnd)
		this.scene.removeEventListener('wheel', this.wheel)
	}
}

// html  three.jsなどの公式のライブラリとindex.jsを読み込む
//  |-  index.js  ほかの.jsファイルを利用する
//         |-  camera.js
//         |-  roattion.js

