import {
  State, set_color_data, hitObjecet, cubeset
} from './solve.js'

export class colorinput{
  Colorset = false

	constructor(_data = {scene: null, disp: null, camOut: null,
      ObjectManager: null, AnimeManager: null, SceneManager: null, status: null, Color_completion: null}) {
		this.scene = _data.scene
		this.disp = _data.disp
		this.camOut = _data.camOut

    this.ObjectManager = _data.ObjectManager
    this.AnimeManager = _data.AnimeManager
    this.SceneManager =  _data.SceneManager

    this.status =  _data.status
    this.Color_completion =  _data.Color_completion
    

		this.mousePress = false
		this.touchPress = false
		this.touchId = undefined
    this.choiceColor = undefined
    this.check_list = undefined
    this.color_index = undefined

    this.menu = document.createElement('div')
    this.menu.id = "color-menu"
    this.menu.classList.add("color-menu-bar")
    const CD = document.createElement("div")
    CD.classList.add("menu-colors")
    for(let i=0;i<6;i++){
      const nCD = CD.cloneNode(true)
      nCD.classList.add(`c${i}`)
      this.menu.appendChild(nCD)
    }
    
    this.disp.appendChild(this.menu)
    // document.getElementById('main-display').appendChild(this.menu)


    const colors = ["#1617ff","#ff1616","#15d832","#d88015","#ececec","#e9f121"]
    const menu = this.menu.children
    for(let i=0; i<menu.length; i++)  menu[i].style.backgroundColor = colors[i]

    this.mouseDown = this.mouseDown.bind(this)
		this.scene.addEventListener('mousedown', this.mouseDown)

    this.mouseMove = this.mouseMove.bind(this)
		this.scene.addEventListener('mousemove', this.mouseMove)

    this.mouseUp = this.mouseUp.bind(this)
		this.scene.addEventListener('mouseup', this.mouseUp)

    this.touchStart = this.touchStart.bind(this)
		this.scene.addEventListener('touchstart', this.touchStart, { passive: true })
    
    this.touchMove = this.touchMove.bind(this)
		this.scene.addEventListener('touchmove', this.touchMove, { passive: true })

    this.touchEnd = this.touchEnd.bind(this)
		this.scene.addEventListener('touchend', this.touchEnd)

    this.click = this.click.bind(this)
    this.menu.addEventListener("click", this.click)

    
    cubeset(this.ObjectManager.objects.cube, new State())
    this.Intiset()
  }
  Check_pos(type = undefined, index = undefined){
    const CTS={
      e: [275, 550, 1100, 2185, 240, 3840],
      c: [51, 102, 204, 153, 15, 240]
    }
    const face_row = {
      c:[
        [4,3,0],[4,0,1],[4,1,2],[4,2,3],
        [5,0,3],[5,1,0],[5,2,1],[5,3,2]
      ],
      e:[
        [0,3],[0,1],[2,1],[2,3],
        [4,0],[4,1],[4,2],[4,3],
        [5,0],[5,1],[5,2],[5,3],
      ],
    }

    let D = this.cData
      
    function num(type, pos){
      let a = (2 ** 12) -1
      for(let n of pos)	a &= CTS[type][n]
      return ((Math.log2(a)<0)?-1:Math.log2(a))
    }
    function parts_check(D){
      let c = []
      for(let t of ["e","c"]){
        // console.log(t)
        for(let y of D[t]){
          c.push(num(t,y))
        }
      }
      return c
    }
    function oll_input(D){
      const a = {c:[],e:[]}
      for(let i=0;i<8;i++){
        for(let j=0;j<3;j++){
          if(D.c[i][j] == -1)  a.c.push([i,j])
        }
      }
      for(let i=0;i<12;i++){
        for(let j=0;j<2;j++){
          if(D.e[i][j] == -1)  a.e.push([i,j])
        }
      }
      return {
        check: (a.c.length == 0 && a.e.length == 0),
        count: a,
      }
    }
    function color_count(D){
      const a = []
      let T =true
      for(let i=0;i<D.count.length;i++){
        if(D.count[i] != 0){
          a.push([i,D.count[i]])
          T = false
        }
      }
      return {check: T, count: a}
    }
    function compareNumbers(a, b) {
      return b - a;
    }
    function face_row_check(D){
      // console.log(D.c)
      const row = face_row
      const cp_hit = [-1,-1,-1,-1,-1,-1,-1,-1]
      const ep_hit = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
      for(let i=0;i<8;i++){
        const A = D.c[i]
        // console.log(`A [${A.join(' ')}]`)
        for(let s=0;s<row.c.length;s++){
          let A_count = 0
          let limit = 3
          let hit = true
          const B = row.c[s]
          // console.log(`  B [${B.join(' ')}]`)
          for(let f=0;f<limit;f++){
            // console.log(`    A_count[${A_count}] f%3[${f%3}] A[${A[A_count]}] == B[${B[f%3]}]`)
            if(A[A_count] == B[f%3]){
              A_count += 1
              if(hit){
                hit=false
                limit = f + 3
              }  
            }
          }
          if(A_count==3){
            // console.log(`- true -`)
            cp_hit[i] = s
            break
          }
        }
      }
      
      for(let i=0;i<12;i++){
        const A = D.e[i]
        // console.log(`A [${A.join(' ')}]`)
        for(let s=0;s<row.e.length;s++){
          let A_count = 0
          let limit = 2
          let hit = true
          const B = row.e[s]
          // console.log(`  B [${B.join(' ')}]`)
          for(let f=0;f<limit;f++){
            // console.log(`    A_count[${A_count}] f%3[${f%3}] A[${A[A_count]}] == B[${B[f%3]}]`)
            if(A[A_count] == B[f%2]){
              A_count += 1
              if(hit){
                hit=false
                limit = f + 2
              }  
            }
          }
          if(A_count==2){
            // console.log(`- true -`)
            ep_hit[i] = s
            break
          }
        }
      }

      const cp_sort = cp_hit.concat()
      const ep_sort = ep_hit.concat()
      
      cp_sort.sort(compareNumbers)
      ep_sort.sort(compareNumbers)

      const cp_count = [0,0,0,0,0,0,0,0]
      const ep_count = [0,0,0,0,0,0,0,0,0,0,0,0]

      for(let i of cp_sort) i>=0?cp_count[i]++:true
      for(let i of ep_sort) i>=0?ep_count[i]++:true

      let cp_bit = 1,ep_bit = 1
      for(let i of cp_count)  cp_bit&=i
      for(let i of ep_count)  ep_bit&=i

      // console.log(cp_hit)
      // console.log(ep_hit)
      // console.log(cp_count)
      // console.log(ep_count)

      // console.log(cp_bit&ep_bit==1?"face_row_check OK":"falsface_row_check NO")

      return {
        check: (cp_bit&ep_bit)==1,
        cp_hit: cp_hit,
        ep_hit: ep_hit,
        cp_count: cp_count,
        ep_count: ep_count,
      }
    }
    function ver_check(D){
      let co_vec = []
      for(let i of D.c)
        co_vec.push(i[0]>3?0:(i[1]>3?1:2))

      let eo_vec = []
      for(let i of D.e)
        eo_vec.push((i[0]>3)?0:((i[1]>3)?1:((i[0]%2==0)?0:1)))

      const co_v_count = co_vec.reduce((a, b) => a + b, 0,)
      const eo_v_count = eo_vec.reduce((a, b) => a + b, 0,)

      // console.log(`co_v [${co_v_count%3}] eo_v [${eo_v_count%2}]`)

      return {
        check: (co_v_count%3+eo_v_count%2)==0,
        co: co_vec,
        eo: eo_vec,
        co_v: co_v_count%3,
        eo_v: eo_v_count%2,
      }
    }
    function pos_parity_check(C, P){
      let cp =  C.concat(), ep = P.concat()
      const check = {check:false, c:0, e:0}
      for(let i=0;i<7;i++){
        for(let s=i+1;s<8;s++){
          if(cp[i]>cp[s]){
            const box = cp[i]
            cp[i] = cp[i]
            cp[i] = box
            check.c += 1
          }
        }
      }
      
      for(let i=0;i<11;i++){
        for(let s=i+1;s<12;s++){
          if(ep[i]>ep[s]){
            const box = ep[i]
            ep[i] = ep[i]
            ep[i] = box
            check.e += 1
          }
        }
      }
      check.c %= 2
      check.e %= 2
      check.check = (check.c == check.e)
      return check
    }

    // console.log(C1 == true?"color_count OK":C1)
    // console.log(C2 == true?"oll_input OK":C2)
    // console.log(check)
    const C1 = color_count(D)     //入力されている色の数が正しいか
    const C2 = oll_input(D)       //全ての面に色が入力されているか
    const C3 = face_row_check(D)  //partsとしてあり得るか
    const C4 = ver_check(D)       //向きがあっているか
    const C5 = pos_parity_check(C3.cp_hit, C3.ep_hit)       //向きがあっているか

    // console.log({C1, C2, C3, C4, C5})

    this.check_list = {
      c1: C1,
      c2: C2,
      c3: C3,
      c4: C4,
      c5: C5,
    }

    if(!(C1.check && C2.check && C3.check && C4.check && C5.check))  return false

    console.log("------OK-----")
    let solved_state = new State({
      cp:C3.cp_hit, co:C4.co, ep:C3.ep_hit, eo:C4.eo
    })
    // console.log(D)
    // console.log(solved_state)
    return solved_state
  }
  Color_set(parts){
    if(this.choiceColor == undefined){
      // console.log("no Color")
      return
    }
    // console.log(parts)
    const choice_parts = parts.object.name

  //  console.log(`search_part ${partsNamt} name ${parts.object.name}`)
  //  console.log(parts)


    const parts_type = choice_parts.slice(0,2)
    const be = parseInt(choice_parts.slice(2,4))
    const num = parseInt(parts.object.name.at(-1))

    if(!(parts_type === "ed" || parts_type === "co"))	return
    if(isNaN(num))	return

    const pos = parts

    // console.log(`Color_set type [${parts_type}] num [${be}]index [${num}]`)
    const face = {parts: choice_parts, type: parts_type, Pindex: be, Findex: num}
    // console.log(face)

    
    if(this.cData[face.type[0]][face.Pindex][face.Findex]  == this.color_index[this.choiceColor]) return
    if(this.cData[face.type[0]][face.Pindex][face.Findex]  != -1)
      this.cData.count[this.cData[face.type[0]][face.Pindex][face.Findex]] += 1

    
    const f = parts.object
    let Check_ans = false
    f.material.color = set_color_data[this.choiceColor]
    // console.log(`type [${face.type[0]}] Pin [${[face.Pindex]}] Fin [${face.Findex}]`)
    // console.log(this.cData)

    this.cData[face.type[0]][face.Pindex][face.Findex] = this.color_index[this.choiceColor]
    this.cData.count[this.color_index[this.choiceColor]] -= 1
    // console.log(this.cData)
    Check_ans = this.Check_pos(face.type[0],face.Pindex)
    // console.log(Check_ans)
    
    if(Check_ans === false) return

    // this.cube_mode="stay"
    this.Color_completion(Check_ans)
    // this.menu.style.display = "none"
  }
  Intiset(){
    this.menu.style.display = "flex"

    const a=[],b=[]
    for(; a.length<12;)a.push([-1,-1])
    for(; b.length<8;)b.push([-1,-1,-1])
    this.cData={
      e: a,
      c: b,
      count: [8,8,8,8,8,8],
    }
    
    const parts = System.ObjectManager.objects.cube.children

    const corner = parts.slice(6,14)
    const edge = parts.slice(14)

    const gray = {r:0.5,g:0.5,b:0.5}
  
    for(let i=0;i<corner.length;i++){
      let F = corner[i].children
      for(let s=0;s<3;s++)
        F[s+1].material.color = gray
    }
  
    for(let i=0;i<edge.length;i++){
      let F = edge[i].children
      for(let s=0;s<2;s++)
        F[s+1].material.color = gray
    }

    const ci = [0,1,2,3,4,5]
    const n_ci = new Array(6)
    for(let i=0;i<6;i++)  n_ci[ci[i]] = i
    this.color_index = n_ci
    // console.log(this.color_index)
  }
  XX (r,x,y) {return x*Math.cos(r)-y*Math.sin(r)}
  YY (r,x,y) {return x*Math.sin(r)+y*Math.cos(r)}
  mouseDown(e){
    if(!this.status()) return
    if(e.target.tagName !== 'CANVAS') return
    if(this.touchPress) return
    
    const _parts = hitObjecet(
      {x:e.offsetX , y:e.offsetY},
			this.scene,
      this.camOut,
      [this.ObjectManager.objects.cube]
    )

    const part = _parts.length > 0 ? _parts[0] : null

    if(part === null) return

    this.mousePress = true
    this.Color_set(part)
  }
  mouseMove(e){
    if(!this.status()) return
    if(e.target.tagName !== 'CANVAS') return
    if(this.touchPress) return
    if(!this.mousePress) return
    
    const _parts = hitObjecet(
      {x:e.offsetX , y:e.offsetY},
			this.scene,
      this.camOut,
      [this.ObjectManager.objects.cube]
    )

    const part = _parts.length > 0 ? _parts[0] : null

    if(part === null) return

    this.Color_set(part)
  }
  touchStart(e){
    if(!this.status()) return
    if(e.target.tagName !== 'CANVAS') return
    if(this.mousePress || this.touchPress) return

    if(e.touches.length>1)  return

    const _parts = hitObjecet(
      {x:e.touches[0].clientX , y:e.touches[0].clientY},
			this.scene,
      this.camOut,
      [this.ObjectManager.objects.cube]
    )

    const part = _parts.length > 0 ? _parts[0] : null

    if(part === null) return

    this.touchPress = true
    this.touchId = e.touches[0].identifier
    this.Color_set(part)
  }
  touchMove(e){
    if(!this.status()) return
    if(e.target.tagName !== 'CANVAS') return
    if(this.mousePress) return
    if(!this.touchPress) return

    if(e.touches.length>1)  return

    const _parts = hitObjecet(
      {x:e.touches[0].clientX , y:e.touches[0].clientY},
			this.scene,
      this.camOut,
      [this.ObjectManager.objects.cube]
    )

    const part = _parts.length > 0 ? _parts[0] : null

    if(part === null) return

    console.log("asdasd")

    this.Color_set(part)
  }
  mouseUp(e){
    if(!this.mousePress)	return

    this.mousePress = false
  }
  touchEnd(e){
    if(!this.touchPress)	return

    if(e.changedTouches[0].identifier ==this.touchId){
      this.touchId = undefined
      this.touchPress = false
    }
  }
  click(e){
    if(e.target.classList[0] != "menu-colors") return
    const id = parseInt(e.target.classList[1][1])
    
    if(this.choiceColor != id){
      if(this.choiceColor !== undefined)
        this.menu.children[this.choiceColor].classList.remove("choice-color")
      this.menu.children[id].classList.add("choice-color")
      this.choiceColor = id
    }
  }
  dispose(){
    document.getElementById('main-display').removeChild(this.menu)

		this.scene.removeEventListener('mousedown', this.mouseDown)
		this.scene.removeEventListener('mousemove', this.mouseMove)
		this.scene.removeEventListener('mouseup', this.mouseUp)

		this.scene.removeEventListener('touchstart', this.touchStart)    
		this.scene.removeEventListener('touchmove', this.touchMove)
		this.scene.removeEventListener('touchend', this.touchEnd)
  }
}

