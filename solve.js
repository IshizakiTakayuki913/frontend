import * as THREE from 'three'

export const COLOR_STATE = {
	NORMAL: 0,
	LOW: 1,
	GRAY: 2,
	INNER: 3
}

export class State {
	/**
	 * 
	 * @param {*} obj 
	 */
	constructor(obj = {}) {
		this.cp = obj.cp || [0,1,2,3,4,5,6,7]
		this.co = obj.co || [0,0,0,0,0,0,0,0]
		this.ep = obj.ep || [0,1,2,3,4,5,6,7,8,9,10,11]
		this.eo = obj.eo || [0,0,0,0,0,0,0,0,0,0,0,0]
		this.c 	= obj.c  || [0,1,2,3,4,5]
		// console.log(cp, co, ep, eo);
	}
	/**
	 * 
	 * @param {*} move 
	 * @returns {State} キューブ情報
	 */
	apply_move(move) {
		let new_cp = new Array(8);
		let new_co = new Array(8);
		for(let i=0;i<8;i++){
			new_cp[i] = this.cp[move.cp[i]];
			new_co[i] = (this.co[move.cp[i]] + move.co[i]) % 3;
		}

		let new_ep = new Array(12);
		let new_eo = new Array(12);
		for(let i=0;i<12;i++){
			new_ep[i] = this.ep[move.ep[i]]
			new_eo[i] = (this.eo[move.ep[i]] + move.eo[i]) % 2;
		}
		
		if(typeof move.c === "undefined")
			return new State({cp:new_cp, co:new_co, ep:new_ep, eo:new_eo})
		let new_c = new Array(6);
		for(let i=0;i<6;i++)	new_c[i] = this.c[move.c[i]]
		
		return new State({cp:new_cp, co:new_co, ep:new_ep, eo:new_eo, c:new_c})
	}
	hand_move(move) {
		let new_cp = new Array(8);
		let new_co = new Array(8);
		// let graph = ". 今前位置 前向き 今、前位置の中にあるのがいる出来場所\n"
		for(let i=0;i<8;i++){
			new_cp[i] = move.cp.indexOf(this.cp[move.cp[i]])
			new_co[i] = (3+move.co[i]+this.co[move.cp[i]]-move.co[move.cp.indexOf(this.cp[move.cp[i]])])%3
			// graph += [
			// 	i,
			// 	move.co[i],
			// 	move.cp[i],
			// 	this.co[move.cp[i]],
			// 	this.cp[move.cp[i]],
			// 	move.cp.indexOf(this.cp[move.cp[i]]),
			// 	move.co[move.cp.indexOf(this.cp[move.cp[i]])],
			// 	(3+move.co[i]+this.co[move.cp[i]]-move.co[move.cp.indexOf(this.cp[move.cp[i]])])%3,
			// ].join(' ')+"\n"
		}

		let new_ep = new Array(12);
		let new_eo = new Array(12);
		for(let i=0;i<12;i++){
			new_ep[i] = move.ep.indexOf(this.ep[move.ep[i]])
			new_eo[i] = (2+move.eo[i]+this.eo[move.ep[i]]-move.eo[move.ep.indexOf(this.ep[move.ep[i]])])%2
		}
		
		// if(typeof move.c === "undefined"){
		// 	//console.log(`typeof move.c === "undefined"`)
		// 	return new State(new_cp, new_co, new_ep, new_eo, this.c)
		// }

		let new_c = new Array(6)
		for(let i=0;i<6;i++)	new_c[i] = move.c.indexOf(this.c[move.c[i]])
		
		return new State({cp:new_cp, co:new_co, ep:new_ep, eo:new_eo, c:new_c})
	}
	center_move(move) {
		let new_cp = new Array(8);
		let new_co = new Array(8);
		let text = ""
		// let graph = ". 今前位置 前向き 今、前位置の中にあるのがいる出来場所\n"
		for(let i=0;i<8;i++){
			new_cp[i] = move.cp[this.cp[i]]
			new_co[i] = (3 + this.co[i] + move.co[this.cp[i]])%3
			text += `${i}: ${this.co[i]} +  ${move.co[this.cp[i]]} )%3 = ${new_co[i]}\n`
			// graph += [
			// 	i,
			// 	move.co[i],
			// 	move.cp[i],
			// 	this.co[move.cp[i]],
			// 	this.cp[move.cp[i]],
			// 	move.cp.indexOf(this.cp[move.cp[i]]),
			// 	move.co[move.cp.indexOf(this.cp[move.cp[i]])],
			// 	(3+move.co[i]+this.co[move.cp[i]]-move.co[move.cp.indexOf(this.cp[move.cp[i]])])%3,
			// ].join(' ')+"\n"
		}
		// console.log(`corner o\n${text}`)

		let new_ep = new Array(12);
		let new_eo = new Array(12);
		for(let i=0;i<12;i++){
			new_ep[i] = move.ep[this.ep[i]]
			new_eo[i] = (2 + this.eo[i] + move.eo[this.ep[i]])%2
		}
		
		// if(typeof move.c === "undefined"){
		// 	//console.log(`typeof move.c === "undefined"`)
		// 	return new State(new_cp, new_co, new_ep, new_eo, this.c)
		// }

		let new_c = new Array(6)
		for(let i=0;i<6;i++)	new_c[i] = move.c[this.c[i]]
		
		return new State({cp:new_cp, co:new_co, ep:new_ep, eo:new_eo, c:new_c})
	}
	data_print() {
		//console.log(this.cp)
		//console.log(this.co)
		//console.log(this.ep)
		//console.log(this.eo)
		//console.log(this.c)
	}
	copy(){
		return new State({
			cp:[...this.cp],
			co:[...this.co],
			ep:[...this.ep],
			eo:[...this.eo],
			c:[...this.c],
		})
	}
	set(newS){
		this.cp = [...newS.cp]
		this.co = [...newS.co]
		this.ep = [...newS.ep]
		this.eo = [...newS.eo]
		this.c 	= [...newS.c]
	}
	toJson(){
		return {
			cp:[...this.cp],
			co:[...this.co],
			ep:[...this.ep],
			eo:[...this.eo],
			c:[...this.c],
		}
	}
}

export class cubeState {
	#cube = new State()
	#color = new State()

	constructor(){
	}

	get cube(){
		return this.#cube
	}
	set cube(_cube){
		this.#cube.set(_cube)
	}

	get color(){
		return this.#color
	}
	set color(_color){
		this.#color.set(_color)
	}

	clone(){
		const _a = new cubeState()
		_a.cube = this.#cube.copy()
		_a.color = this.#color.copy()

		return _a
	}
	set(_cube, _color){
		this.cube = _cube
		this.color = _color
	}
	toJson(){
		const _j = {
			cube: this.cube.toJson(),
			color: this.cube.toJson(),
		}

		return _j
	}
}

export const set_color_data = [
	{r:0,g:0.05,b:0.95},
	{r:0.89,g:0,b:0},
	{r:0,g:0.75,b:0},
	{r:1,g:0.25,b:0},
	{r:0.9,g:0.9,b:0.9},
	{r:0.9,g:0.95,b:0},
]

export const color_list = {
	0 : [
		"#0012c4",
		"#e70000",
		"#17b118",
		"#ff8c00",
		"#e9e9e9",
		"#f0df11"
	],
	1: [
		"#121748",
		"#4d1b1b",
		"#174117",
		"#473218",
		"#545454",
		"#585426"
	],
	2: "#323131",
	3: "#302c2a",
}

/**
 * 
 * @param {State.c} color_data 
 * @param {THREE.Object3D} _obj 
 */
export function cube_object_color_data_set(color_data, _obj){
	let obj = null
	_obj.traverse( (child) => {
		if(child.name == "root") {
			obj = child
		}
	})
	const model = obj.children
	
	const color_c = [
		[4,3,0],		[4,0,1],		[4,1,2],		[4,2,3],
		[5,0,3],		[5,1,0],		[5,2,1],		[5,3,2],
	]

	const color_e = [
		[0,3],		[0,1],		[2,1],		[2,3],
		[4,0],		[4,1],		[4,2],		[4,3],
		[5,0],		[5,1],		[5,2],		[5,3],
	]

	const color_cn = [
		[0],		[1],		[2],		[3],		[4],		[5],
	]

	const center = model.slice(0,6)
	const corner = model.slice(6,14)
	const edge = model.slice(14)
	
	// const {r, g, b} = set_color_data[color_data[color_c[i][s]]]

	const _gray = color_list[COLOR_STATE.GRAY]
	const _inner = color_list[COLOR_STATE.INNER]

	for(let i=0;i<corner.length;i++){
		let F = corner[i].children
		for(let j=0;j<3;j++){
			const _normal = color_list[COLOR_STATE.NORMAL][color_data[color_c[i][j]]]
			const _low = color_list[COLOR_STATE.LOW][color_data[color_c[i][j]]]

			const colors = {}
			colors[COLOR_STATE.NORMAL] = new THREE.Color().setStyle(_normal)
			colors[COLOR_STATE.GRAY] = new THREE.Color().setStyle(_gray)
			colors[COLOR_STATE.LOW] = new THREE.Color().setStyle(_low)
			F[j+1].material.userData.colors = colors
		}
		
		const colors = {}
		colors[COLOR_STATE.NORMAL] = new THREE.Color().setStyle(_inner)
		F[0].material.userData.colors = colors
	}

	for(let i=0;i<center.length;i++){
		let F = center[i].children

		const _normal = color_list[COLOR_STATE.NORMAL][color_data[color_cn[i][0]]]
		const _low = color_list[COLOR_STATE.LOW][color_data[color_cn[i][0]]]

		const colors = {}
		colors[COLOR_STATE.NORMAL] = new THREE.Color().setStyle(_normal)
		colors[COLOR_STATE.GRAY] = new THREE.Color().setStyle(_gray)
		colors[COLOR_STATE.LOW] = new THREE.Color().setStyle(_low)
		F[1].material.userData.colors = colors

		const colorsg = {}
		colorsg[COLOR_STATE.NORMAL] = new THREE.Color().setStyle(_inner)
		F[0].material.userData.colors = colorsg
	}

	for(let i=0;i<edge.length;i++){
		let F = edge[i].children
		for(let j=0;j<2;j++){
			
			const _normal = color_list[COLOR_STATE.NORMAL][color_data[color_e[i][j]]]
			const _low = color_list[COLOR_STATE.LOW][color_data[color_e[i][j]]]

			const colors = {}
			colors[COLOR_STATE.NORMAL] = new THREE.Color().setStyle(_normal)
			colors[COLOR_STATE.GRAY] = new THREE.Color().setStyle(_gray)
			colors[COLOR_STATE.LOW] = new THREE.Color().setStyle(_low)
			F[j+1].material.userData.colors = colors
		}
		
		const colors = {}
		colors[COLOR_STATE.NORMAL] = new THREE.Color().setStyle(_inner)
		F[0].material.userData.colors = colors
	}
}
/**
 * 
 * @param {THREE.Object3D} _obj 
 * @param {COLOR_STATE} type 
 */
export function color_set(_obj, type){
	let obj = null
	_obj.traverse( (child) => {
		if(child.name == "root") {
			obj = child
		}
	})
	const models = obj.children

	models.forEach((_obj)=>{
		let meshs = _obj.children
		meshs.forEach((mesh)=>{
			mesh_color_set(mesh, type)
		})
	})
}

/**
 * 
 * @param {THREE.Mesh} _obj 
 * @param {COLOR_STATE} type 
 */
export function mesh_color_set(mesh, type){
	const colors = mesh.material.userData.colors
	mesh.material.color = colors[type] != undefined ? colors[type] : colors[COLOR_STATE.NORMAL]
}

export function choice_object_color_set(_obj, type){
	let objs = []

	if(_obj.type === "Group"){
		objs = _obj.children
	}
	else if(_obj.type === "Mesh"){
		objs = [_obj]
	}

	objs.forEach((_o)=>{
		mesh_color_set(_o, type)
	})
}

export function cube_Full_Animation_Make(Datas, clip){
  const anim = {
    duration: 1,
    name: "rote",
    tracks:[],
  }

  const moves_ce = [
    [4],
    [1],
    [3],
    [2],
    [5],
    [0],
    [0,1,2,3,4,5],
    [0,1,2,3,4,5],
    [0,1,2,3,4,5],
    [0,1,2,4,5],
    [0,2,3,4,5],
    [0,1,2,3,4],
    [0,1,2,3,5],
    [1,2,3,4,5],
    [0,1,3,4,5],
  ]
  const moves_ed = [
    [4,5,6,7],
    [1,2,5,9],
    [0,3,7,11],
    [2,3,6,10],
    [8,9,10,11],
    [0,1,4,8],
    [0,1,2,3,4,5,6,7,8,9,10,11],
    [0,1,2,3,4,5,6,7,8,9,10,11],
    [0,1,2,3,4,5,6,7,8,9,10,11],
    [1,2,4,5,6,8,9,10],
    [0,3,4,6,7,8,10,11],
    [0,1,2,3,4,5,6,7],
    [0,1,2,3,8,9,10,11],
    [2,3,5,6,7,9,10,11],
    [0,1,4,5,7,8,9,11],
  ]
  const moves_co = [
    [0,1,2,3],
    [1,2,5,6],
    [0,3,4,7],
    [2,3,6,7],
    [4,5,6,7],
    [0,1,4,5],
    [0,1,2,3,4,5,6,7],
    [0,1,2,3,4,5,6,7],
    [0,1,2,3,4,5,6,7],
    [1,2,5,6],
    [0,3,4,7],
    [0,1,2,3],
    [4,5,6,7],
    [2,3,6,7],
    [0,1,4,5],
  ]
  const faces =    ['U', 'R', 'L', 'F', 'D', 'B', 'x', 'y', 'z', 'r', 'l', 'u', 'd', 'f', 'b']
  const facesXYZ = [  1,   0,   0,   2,   1,   2,   0,   1,   2,   0,   0,   1,   1,   2,   2]
  const facesVec = [ -1,  -1,   1,  -1,   1,   1,  -1,  -1,  -1,  -1,   1,  -1,   1,  -1,   1]

	const quas = cubesetData(Datas)

  const bone_ce = quas.slice(0, 6)
  const bone_co = quas.slice(6, 14)
  const bone_ed = quas.slice(14)

  function animationAdd(clip, Vector3, vec, Quat){
    const trackJSON = {
      name: clip,
      times: [0, 1],
      values: [],
    }
    
    trackJSON.values.push(Quat.x)
    trackJSON.values.push(Quat.y)
    trackJSON.values.push(Quat.z)
    trackJSON.values.push(Quat.w)

    const quaternion = new THREE.Quaternion().copy(Quat)

    const data = [0,0,0]
    data[Vector3] = 1

    const target = new THREE.Quaternion()
    const axis = new THREE.Vector3(data[0], data[1], data[2]).normalize()
    target.setFromAxisAngle(axis, vec)
    quaternion.premultiply(target)

    trackJSON.values.push(quaternion.x)
    trackJSON.values.push(quaternion.y)
    trackJSON.values.push(quaternion.z)
    trackJSON.values.push(quaternion.w)

    anim.tracks.push(trackJSON)

  }

  const faceIndex = faces.indexOf(clip[0])
  const roteValues = clip[1] == `2` ? 2 : (clip[1] == `'` ? -1 : 1)
  const vec = Math.PI/2 * facesVec[faceIndex] * roteValues

  moves_ce[faceIndex].forEach((j) => {
    animationAdd(`ce${("00"+Datas.c[j]).slice(-2)}.quaternion`,
                  facesXYZ[faceIndex], vec, bone_ce[Datas.c[j]])
  })
  moves_ed[faceIndex].forEach((j) => {
    animationAdd(`ed${("00"+Datas.ep[j]).slice(-2)}.quaternion`,
                  facesXYZ[faceIndex], vec, bone_ed[Datas.ep[j]])
  })
  moves_co[faceIndex].forEach((j) => {
    animationAdd(`co${("00"+Datas.cp[j]).slice(-2)}.quaternion`,
                  facesXYZ[faceIndex], vec, bone_co[Datas.cp[j]])
  })

	return anim
}


export function modelIndex(type, _id) {
		if(type=="ce")
				return _id
		else if(type=="co")
				return 6+_id
		else if(type=="ed")
				return 14+_id
		else 
				return null
}
function stateQuatnion(type, p, o) {
		if(type=="ce")
				return p
		else if(type=="co")
				return 6 + p*3 + o
		else if(type=="ed")
				return 30 + p*2 + o
		else 
				return null
}

const partsQua = [
	//  センター
	[0, 0, 0, -1],
	[0, 0.7071067811865476, 0, -0.7071067811865475],
	[0, 1, 0, 0],
	[0, 0.7071067811865475, 0, 0.7071067811865476],
	[0.7071067811865475, 0, 0, 0.7071067811865476],
	[-0.7071067811865475, 0, 0, 0.7071067811865476],

	//  コーナー
	[0, 0, 0, 1],
	[0.5, -0.5, 0.5, 0.5],
	[0.5, -0.5, 0.5, -0.5],
	[0, -0.7071067811865476, 0, 0.7071067811865475],
	[0, -0.7071067811865475, 0.7071067811865477, 0],
	[0, 0, 0.7071067811865475, -0.7071067811865476],
	[0, 1, 0, 0],
	[-0.5, -0.5, 0.5, -0.5],
	[-0.5, 0.5, 0.5, -0.5],
	[0, -0.7071067811865475, 0, -0.7071067811865476],
	[-0.7071067811865477, 0, 0, -0.7071067811865475],
	[-0.7071067811865475, 0.7071067811865476, 0, 0],
	[0.7071067811865475, 0, 0.7071067811865476, 0],
	[0.7071067811865475, 0, 0, -0.7071067811865477],
	[0, 0, -0.7071067811865475, -0.7071067811865475],
	[0, 0, 1, 0],
	[0.5, 0.5, 0.5, -0.5],
	[0.5, 0.5, -0.5, -0.5],
	[-0.7071067811865476, 0, 0.7071067811865475, 0],
	[0, 0.7071067811865477, 0.7071067811865475, 0],
	[0.7071067811865475, 0.7071067811865475, 0, 0],
	[1, 0, 0, 0],
	[-0.5, 0.5, 0.5, 0.5],
	[0.5, 0.5, 0.5, 0.5],

	//  エッヂ中段
	[0, 0, 0, 1],[-0.7071067811865475, 0, -0.7071067811865475, 0],
	[0, 0, 1, 0],[0, -0.7071067811865475, 0, 0.7071067811865475],
	[0, 1, 0, 0],[-0.7071067811865475, 0, 0.7071067811865475, 0],
	[1, 0, 0, 0],[0, 0.7071067811865475, 0, 0.7071067811865475],

	//  エッヂ上段
	[-0.4999999999999999, 0.5000000000000001, -0.5, -0.5],
	[0, 0, 0.7071067811865475, -0.7071067811865475],
	[0, 0.7071067811865476, -0.7071067811865475, 0],
	[-0.5, 0.5, 0.4999999999999999, -0.49999999999999983],
	[0.5, 0.5, -0.4999999999999999, 0.5000000000000001],
	[-0.7071067811865475, 0.7071067811865475, 0, 0],
	[0.7071067811865475, 0, 0, 0.7071067811865476],
	[-0.49999999999999994, 0.4999999999999999, -0.5, 0.49999999999999994],

	//  エッヂ下段
	[0.4999999999999999, 0.5000000000000001, 0.5, -0.5],
	[0, 0, 0.7071067811865475, 0.7071067811865474],
	[0, 0.7071067811865476, 0.7071067811865475, 0],
	[-0.5, -0.4999999999999999, 0.49999999999999994, 0.49999999999999983],
	[-0.5, 0.5, 0.4999999999999999, 0.5000000000000001],
	[-0.7071067811865475, -0.7071067811865474, 0, 0],
	[-0.7071067811865475, 0, 0, 0.7071067811865476],
	[-0.5, -0.4999999999999999, -0.5, -0.49999999999999983],
]

export function cubesetData(state) {
	const cube = Array.from({ length: 26 }, () => new THREE.Quaternion())
	
	for(let i=0;i<6;i++){
		const p = state.c[i]

		const moId = modelIndex("ce", p)
		const stquId = i
		const stqu = partsQua[stquId]

		cube[moId].set(stqu[0], stqu[1], stqu[2], stqu[3])
	}
	for(let i=0;i<8;i++){
		const p = state.cp[i]
		const o = state.co[i]

		const moId = modelIndex("co", p)
		const stquId = stateQuatnion("co", i, o)
		const stqu = partsQua[stquId]

		cube[moId].set(stqu[0], stqu[1], stqu[2], stqu[3])
	}
	for(let i=0;i<12;i++){
		const p = state.ep[i]
		const o = state.eo[i]

		const moId = modelIndex("ed", p)
		const stquId = stateQuatnion("ed", i, o)
		const stqu = partsQua[stquId]

		cube[moId].set(stqu[0], stqu[1], stqu[2], stqu[3])
	}

	return cube
}

export function cubeset(_obj, state) {
	let obj = null
	_obj.traverse( (child) => {
		if(child.name == "root") {
			obj = child
		}
	})
	const cube = obj.children

	for(let i=0;i<6;i++){
		const p = state.c[i]

		const moId = modelIndex("ce", p)
		const stquId = i
		const stqu = partsQua[stquId]

		cube[moId].quaternion.set(stqu[0], stqu[1], stqu[2], stqu[3])
	}
	for(let i=0;i<12;i++){
		const p = state.ep[i]
		const o = state.eo[i]

		const moId = modelIndex("ed", p)
		const stquId = stateQuatnion("ed", i, o)
		const stqu = partsQua[stquId]

		cube[moId].quaternion.set(stqu[0], stqu[1], stqu[2], stqu[3])
	}
	for(let i=0;i<8;i++){
		const p = state.cp[i]
		const o = state.co[i]

		const moId = modelIndex("co", p)
		const stquId = stateQuatnion("co", i, o)
		const stqu = partsQua[stquId]

		cube[moId].quaternion.set(stqu[0], stqu[1], stqu[2], stqu[3])
	}
}

export function hitObjecet(p, scene, camera, targetObj) {
	const raycaster = new THREE.Raycaster()
	const pointer = new THREE.Vector2()

	pointer.x = ( p.x / scene.clientWidth ) * 2 - 1
	pointer.y = - ( p.y / scene.clientHeight ) * 2 + 1
	
	raycaster.setFromCamera( pointer, camera )
	
	const intersects = raycaster.intersectObjects(targetObj)

	return intersects
}

export async function wait(ms){
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(); // setTimeoutの第一引数の関数として簡略化できる
		}, ms)
	});
}

export function objectPrint(_text) {
  const text = typeof _text === "string" ? _text : JSON.stringify(_text);
  const add = "  ";
  let indent = "";
  let result = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '{' || char === '[') {
      result += char + '\n';
      indent += add;
      result += indent;
    } else if (char === '}' || char === ']') {
      indent = indent.slice(0, -add.length);
      result += '\n' + indent + char;
    } else if (char === ',') {
      result += char + '\n' + indent;
    } else {
      result += char;
    }
  }

  return result;
}

export function positionGet(_obj) {
    let text = ``

		let obj = null
		_obj.traverse( (child) => {
			if(child.name == "root") {
				obj = child
			}
		})
    ani = Array.from( obj.children)

    ani.forEach((e, i) => {
        text += `${e.name} `
        text += `${Math.round(e.quaternion.x*100)/100} `
        text += `${Math.round(e.quaternion.y*100)/100} `
        text += `${Math.round(e.quaternion.z*100)/100} `
        text += `${Math.round(e.quaternion.w*100)/100}\n`
    })
    
    return text
}