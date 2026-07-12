const svgNS = "http://www.w3.org/2000/svg";
const xmlNS = "http://www.w3.org/1999/xhtml";

let fontSize = 16
let anno_button_height = 32

export class AnnotationManager {
  constructor(svg, camera, containerWidth, containerHeight) {
    this.activeAnnotations = new Map();

    this.svg = svg

    this._setpu()

    this.onResize =  this.onResize.bind(this)
    window.addEventListener('resize', this.onResize)
  }
  _setpu(){
    const defs = document.createElementNS(svgNS, "defs");
    this.svg.appendChild(defs);

    this.arrowHeadMake(defs)
    this.circleHeadMake(defs)

    const unit = document.createElementNS(svgNS, "g");
    unit.classList.add("ano-unit")
    unit.setAttribute("transform", `translate(${0}, ${0})`); // これで一括移動

    const bubble = document.createElementNS(svgNS, "g");
    bubble.classList.add("ano-bubble")
    bubble.setAttribute("transform", `translate(${0}, ${0})`); // これで一括移動

    const frame = document.createElementNS(svgNS, "polygon");
    frame.classList.add("ano-frame")
    frame.setAttribute("points", "0 0, 200 0, 200 100, 0 100");

    bubble.appendChild(frame)

    const fObj = document.createElementNS(svgNS, "foreignObject") 
    fObj.classList.add("ano-fObj")
    fObj.setAttribute("width", "200")
    fObj.setAttribute("height", "100")

    const body = document.createElementNS(xmlNS, "div")
    body.classList.add("ano-body")
    body.innerHTML = ``

    fObj.appendChild(body)
    
    const bttonOk = document.createElementNS(xmlNS, "div")
    bttonOk.classList.add("ano-btton")
    bttonOk.innerHTML = `click`
    fObj.appendChild(bttonOk)

    // const bttonSkip = document.createElementNS(xmlNS, "div")
    // bttonSkip.classList.add("ano-btton")
    // bttonSkip.innerHTML = `skip`
    // fObj.appendChild(bttonSkip) 

    bubble.appendChild(fObj)

    unit.appendChild(bubble)

    const line = document.createElementNS(svgNS, "polyline");
    line.classList.add("ano-line")

    unit.appendChild(line)

    this.sourceSet = unit


    this.nowLoadingElement = null
    this.loadingIconMake()
  }
  nowAnno(){
    return Array.from(System.AnnotationManager.activeAnnotations)
  }
  loadingIconMake(){
    
    const ghexagon = document.createElementNS(svgNS, "g");
    ghexagon.classList.add("loading-icon")
    
    ghexagon.setAttribute("transform", `translate(${100}, ${100})`); // これで一括移動

    const frames = document.createElementNS(svgNS, "g");
    frames.classList.add("icon-frames")
    
    const R = 60

    const _p = [0, Math.PI/3, Math.PI*2/3, Math.PI, Math.PI*4/3, Math.PI*5/3]
    .map((v) => [Math.cos(v-Math.PI/2)*R, Math.sin(v-Math.PI/2)*R])


    const f1 = document.createElementNS(svgNS, "polygon");
    f1.setAttribute("points", _p.map((v) => v.join(" ")).join(","));

    const f2 = document.createElementNS(svgNS, "polygon");
    f2.setAttribute("points", `0 0, ${_p[1].join(" ")}`);
    const f3 = document.createElementNS(svgNS, "polygon");
    f3.setAttribute("points", `0 0, ${_p[3].join(" ")}`);
    const f4 = document.createElementNS(svgNS, "polygon");
    f4.setAttribute("points", `0 0, ${_p[5].join(" ")}`);

    frames.appendChild(f1)
    frames.appendChild(f2)
    frames.appendChild(f3)
    frames.appendChild(f4)

    ghexagon.appendChild(frames)

    function getIndex(i){
      return i%6
    }

    const lines = []
    // for(let i=0;i<3;i++){
    //   const _i = [getIndex(i*4), getIndex(i*4+1), getIndex(i*4+3)]
    //   lines.push(_p[_i[0]])
    //   lines.push(_p[_i[1]])
    //   lines.push([0, 0])
    //   lines.push(_p[_i[2]])
    // }
    // lines.push(_p[0])
    
    for(let i=0;i<6;i++){
      lines.push(_p[i])
    }
    lines.push(_p[0])

    // console.log(lines)
    
    const moveLine = document.createElementNS(svgNS, "path");
    moveLine.classList.add("moving-line")

    const _t = lines.map((d) => d.join(" ")).join(" L ")

    moveLine.setAttribute('d', `M ${_t} Z`)

    const sumLength = R * 3
    moveLine.style.strokeDasharray = `${R} ${sumLength - R}`;

    ghexagon.appendChild(moveLine)

    this.animateData_1 = {
      key: [
        { strokeDashoffset: 0 },
        { strokeDashoffset: -sumLength }
      ],
      move: {
        duration: 2000,
        iterations: Infinity,
        easing: 'linear'
      }
    }

    this.loadingIconItem = ghexagon
  }
  loadingIconSet(){
    this.nowLoadingElement = this.loadingIconItem.cloneNode(true)

    this.svg.classList.add("loading-ui-overlay")

    this.svg.appendChild(this.nowLoadingElement)

    const _svg = this.svg.getBoundingClientRect()
    const _icon = this.nowLoadingElement.getBoundingClientRect()

    const _d = {
      x: _svg.width/2,
      y: _svg.height/2
    }
    
    this.nowLoadingElement.setAttribute("transform",
      `translate(${_d.x}, ${_d.y})`)
    
    this.nowLoadingElement.animate(
      this.animateData_1.key,
      this.animateData_1.move,
    )
    .ready.then((et) => {
      // console.log(et) 
      this.nowAnimate = et
    }).catch((error) => {
      console.log(error)
    })
  }
  loadingIconRemove(){
    this.svg.classList.remove("loading-ui-overlay")

    this.svg.removeChild(this.nowLoadingElement)
    this.nowLoadingElement = null
  }
  arrowHeadMake(defs){
    const marker = document.createElementNS(svgNS, "marker");

    marker.setAttribute("id", "arrowhead");
    marker.setAttribute("markerWidth", "5");
    marker.setAttribute("markerHeight", "7");
    marker.setAttribute("refX", "0"); // 先端の位置調整
    marker.setAttribute("refY", "3");
    marker.setAttribute("orient", "auto"); // 自動回転！

    defs.appendChild(marker);

    const polygon = document.createElementNS(svgNS, "polygon")
    polygon.classList.add("ano-polygon")
    polygon.setAttribute("points", "0 0, 4 3, 0 6");
    marker.appendChild(polygon)

    defs.appendChild(marker)
  }
  circleHeadMake(defs){
    const marker = document.createElementNS(svgNS, "marker");

    marker.setAttribute("id", "circlehead");
    marker.setAttribute("markerWidth", "6");
    marker.setAttribute("markerHeight", "6");
    marker.setAttribute("refX", "3"); // 先端の位置調整
    marker.setAttribute("refY", "3");
    marker.setAttribute("orient", "auto"); // 自動回転！

    defs.appendChild(marker);

    const circle = document.createElementNS(svgNS, "circle");
    circle.classList.add("ano-polygon")
    circle.setAttribute("cx", "3")
    circle.setAttribute("cy", "3")
    circle.setAttribute("r", "3")

    marker.appendChild(circle);

    defs.appendChild(marker);
  }
  onResize(){
    this.activeAnnotations.forEach((svg, id) => {
      svg._annotationLineUpdata()
    })

    if(this.nowLoadingElement !== null){
      const _svg = this.svg.getBoundingClientRect()
      const _icon = this.nowLoadingElement.getBoundingClientRect()

      const _d = {
        x: _svg.width/2,
        y: _svg.height/2
      }
      
      this.nowLoadingElement.setAttribute("transform",
        `translate(${_d.x}, ${_d.y})`)
    }
  }

  /**
   * 
   * @param {{id, x, y, width, height, text, eventName}} data 
   * @returns 
   */
  add(data) {
    data.svg =  this.svg
    data.sourceSet =  this.sourceSet.cloneNode(true)


    this.activeAnnotations.set(
      data.id,
      new SVGAnnotation(data)
    )

    return this.activeAnnotations.get(data.id)
  }

  /**
   * 3D座標を2Dスクリーン座標に変換する（心臓部）
   */
  _project(object3D) {
      const vector = new THREE.Vector3();
      object3D.getWorldPosition(vector);
      vector.project(this.camera);

      return {
          x: (vector.x * 0.5 + 0.5) * this.w,
          y: (-vector.y * 0.5 + 0.5) * this.h
      };
  }

  /**
   * 全ての注釈を最新のカメラ位置に合わせて更新
   */
  updateAll() {
    this.activeAnnotations.forEach((data, id) => {
        const screenPos = this._project(data.target3D);
        this.annotator.update(
            id, 
            screenPos.x, screenPos.y, 
            data.bubblePos.x, data.bubblePos.y
        );
    });
  }

  remove(id) {
    // SVG要素の削除処理などを呼び出し
    
    if(this.activeAnnotations.get(id) === undefined){
      console.log(`id: ${id}は存在しない、または既に削除されている`)
      return
    }

    this.activeAnnotations.get(id).delete();
    this.activeAnnotations.delete(id);
  }
}

export class SVGAnnotation {
  constructor(data) {
    const {svg, id, pos, width, height, text, eventName, button, button_text, sourceSet, line} = data
    this.svg = svg
    this.id = id
    this.pos = pos
    this.pos.dist = this.pos.dist || {
      "w": 0,
      "h": 0
    }

    this.width = width
    this.height = height
    this.maxWidth = data.maxWidth || 0
    this.maxHeight = data.maxHeight || 0
    
    this.text = (typeof text) === "string" ? text : text.join("<br>")
    console.log(this.text)
    this.line = line || null

    this.eventName = eventName
    this.button = button
    this.button_text = button_text
    this.sourceSet = sourceSet

    this.x = null
    this.y = null

    this.sourceSet.id = id

    this.a_bubble = sourceSet.querySelector('.ano-bubble');

    this.a_frame = sourceSet.querySelector('.ano-frame');

    this.a_fObj = sourceSet.querySelector('.ano-fObj')

    this.a_parent_frmae = null


    const _framePos = {
      w: this._viewportToPx(this.width),
      h: this._viewportToPx(this.height),
    }

    this.a_fObj.setAttribute("width", `${_framePos.w}`)
    this.a_fObj.setAttribute("height", `${_framePos.h}`)

    this.a_body = sourceSet.querySelector('.ano-body')
    this.a_body.innerHTML = this.text
    
    this.a_line = sourceSet.querySelector('.ano-line')

    this.svg.appendChild(this.sourceSet)


    if(this.line !== null){
      this.a_line.setAttribute("marker-end", `url(#${this.line.headType})`)

      // if(this.line.frmae !== undefined && this.line.frmae){

        const _f = document.createElementNS(svgNS, "rect") 
        _f.classList.add("ano-parent-frmae")

        this.a_parent_frmae = _f

        this.sourceSet.insertBefore(this.a_parent_frmae, this.sourceSet.firstChild)
      // }
    }


    this._annotationLineUpdata()

    if(button){
      const el = this.sourceSet.querySelector(".ano-btton")
      el.style.display = "block"
      el.innerText = button_text
      el.addEventListener("click", (e)=>{
        const event = new CustomEvent("tutorial", {
          detail: {
            type: "annotation click",
            name: "click"
          }
        });
        window.dispatchEvent(event);
      })
    }

    // console.log({eventName})
    // if(eventName === "annotation"){
    //   const el = this.sourceSet.querySelector(".ano-btton")
    //   el.style.display = "block"
    //   el.addEventListener("click", (e)=>{
    //     const event = new CustomEvent("tutorial", {
    //       detail: {
    //         type: "annotation",
    //         name: "click"
    //       }
    //     });
    //     window.dispatchEvent(event);
    //   })
    // }
    // else if(eventName === "function-button"){
    //   const el = this.sourceSet.querySelector(".ano-btton")
    //   el.style.display = "block"
    //   el.addEventListener("click", (e)=>{
    //     const event = new CustomEvent("tutorial", {
    //       detail: {
    //         type: "function-button",
    //         name: "skip"
    //       }
    //     });
    //     window.dispatchEvent(event);
    //   })
    // }
  }
  static viewportToPx(svg, viewportStr) {
    if(typeof viewportStr === "number") return viewportStr
    // 正規表現で「数字部分」と「単位部分」に分離する
    const match = viewportStr.match(/^([0-9.]+)(vw|vh|px|min|max)$/);
    if (!match) return 0;

    console.log({match, len: match.length})

    const value = parseFloat(match[1]); // "70" -> 70
    const unit = match[2];              // "vh"

    if(unit === "px") return value

    const svgs = {
      w: svg.clientWidth,
      h: svg.clientHeight
    }

    const one = function e(){
      if(unit === "vw") return svgs.w
      if(unit === "vh") return svgs.h

      if(unit === "min") return Math.min(svgs.w, svgs.h)
      if(unit === "max") return Math.max(svgs.w, svgs.h)
    } 

    return one() * value / 100
  }
  _viewportToPx(viewportStr) {
    if(typeof viewportStr === "number") return viewportStr
    // 正規表現で「数字部分」と「単位部分」に分離する
    const match = viewportStr.match(/^([-?0-9.]+)(vw|vh|px|min|max|mj|hmj)$/);
    if (!match) return 0;

    // console.log({match, len: match.length})

    const value = parseFloat(match[1]); // "70" -> 70
    const unit = match[2];              // "vh"

    if(unit === "px") return value
    if(unit === "mj") return fontSize * value + 20
    if(unit === "hmj"){
      if(this.button) return fontSize * value * 1.5 + 20 + anno_button_height
      return fontSize * value * 1.5 + 20
    }

    const svgs = {
      w: this.svg.clientWidth,
      h: this.svg.clientHeight
    }

    const one = function e(){
      if(unit === "vw") return svgs.w
      if(unit === "vh") return svgs.h

      if(unit === "min") return Math.min(svgs.w, svgs.h)
      if(unit === "max") return Math.max(svgs.w, svgs.h)
    } 

    return one() * value / 100
  }
  _annotationLineUpdata(){
    const svgs = {
      w: this.svg.clientWidth,
      h: this.svg.clientHeight
    }

    const _p = document.querySelector(this.pos.parentElement).getBoundingClientRect()
    const _bubblePos = {
      x: _p.width * this.pos.parentPos.w + _p.left,
      y: _p.height * this.pos.parentPos.h + _p.top
    }

    const _framePos = {
      w: this._viewportToPx(this.width),
      h: this._viewportToPx(this.height)
    }

    _framePos.w = Math.min(_framePos.w, svgs.w-20)
    _framePos.h = Math.min(_framePos.h, svgs.h-20)


    if(this.maxWidth){
      _framePos.w = Math.min(_framePos.w, this._viewportToPx(this.maxWidth))
    }
    if(this.maxHeight){
      _framePos.h = Math.min(_framePos.h, this._viewportToPx(this.maxHeight))
    }

    const _dist = {
      w: this._viewportToPx(this.pos.dist.w),
      h: this._viewportToPx(this.pos.dist.h)
    }

    _bubblePos.x -= _framePos.w * this.pos.myPos.w
    _bubblePos.y -= _framePos.h * this.pos.myPos.h
    
    _bubblePos.x += _dist.w
    _bubblePos.y += _dist.h


    if(_bubblePos.x < 10)  _bubblePos.x = 10
    if(_bubblePos.y < 10)  _bubblePos.y = 10
    if(svgs.w-_framePos.w-10 < _bubblePos.x) _bubblePos.x = svgs.w-_framePos.w-10
    if(svgs.h-_framePos.h-10 < _bubblePos.y) _bubblePos.y = svgs.h-_framePos.h-10

    this.a_bubble.setAttribute("transform",
      `translate(${_bubblePos.x}, ${_bubblePos.y})`)

    this.x = _bubblePos.x
    this.y = _bubblePos.y

    const _t = `0 0, ${_framePos.w} 0, ${_framePos.w} ${_framePos.h}, 0 ${_framePos.h}`
    this.a_frame.setAttribute("points", `${_t}`)
    
    this.a_fObj.setAttribute("width", `${_framePos.w}`)
    this.a_fObj.setAttribute("height", `${_framePos.h}`)

    if(this.line === null)  return 

    const _endPos = document.querySelector(this.line.endElement).getBoundingClientRect()
    const _lineEnd = {
      x: _endPos.width * this.line.endPos.w + _endPos.left,
      y: _endPos.height * this.line.endPos.h + _endPos.top
    }

    const _lineStart = {
      x: _framePos.w * this.line.startPos.w + this.x,
      y: _framePos.h * this.line.startPos.h + this.y
    }

    const __t = [
      [_lineStart.x, _lineStart.y],
      [_lineEnd.x, _lineStart.y],
      [_lineEnd.x, _lineEnd.y]
    ]

    if(this.line.startPos.h === 0 || this.line.startPos.h === 1)
    __t[1] = [_lineStart.x, _lineEnd.y]

    if(this.line.headType === "arrowhead"){
      if(0.1 > Math.abs(__t[2][0] - __t[1][0])) __t[2][1] += __t[1][1]<__t[2][1]? -20 : 20
      else if(0.1 > Math.abs(__t[2][1] - __t[1][1])) __t[2][0] += __t[1][0]<__t[2][0]? -20 : 20
    }
  

    this.a_line.setAttribute("points", `${__t.map((e)=>e.join(",")).join(" ")}`)

    if(this.a_parent_frmae != null){
      this.a_parent_frmae.setAttribute("x", _endPos.x)
      this.a_parent_frmae.setAttribute("y", _endPos.y)
      this.a_parent_frmae.setAttribute("width", _endPos.width)
      this.a_parent_frmae.setAttribute("height", _endPos.height)
    }
  }
  updateLeaderLine(startX, startY, endX, endY) {
    const data = [
      [this.x + this.width*0.9, this.y + this.height],
      [this.x + this.width*0.9, endY],
      [endX + 10, endY],
    ]
    const text = data.map((e)=>e.join(",")).join(" ")
    // console.log(text)
    this.line.setAttribute("points", text)
  }
  updateLeaderLineJson(data) {
    const text = data.map((e)=>e.join(",")).join(" ")
    // console.log(text)
    this.line.setAttribute("points", text)
  }

  /**
   * 座標と形状の更新（アニメーションループで呼ぶ）
   */
  update(id, targetX, targetY, bubbleX, bubbleY, width = 220) {
    const item = this.activeAnnotations.get(id);
    if (!item) return;

    // A. テキストの高さに合わせてforeignObjectをリサイズ
    item.fObj.setAttribute("width", width);
    const textHeight = item.div.scrollHeight;
    item.fObj.setAttribute("height", textHeight);

    // B. 吹き出し本体の位置移動
    item.g.setAttribute("transform", `translate(${bubbleX}, ${bubbleY})`);

    // C. Polygon（外枠）の頂点計算（メカニカルな角落ちデザイン）
    const margin = 5;
    const w = width;
    const h = textHeight;
    const points = `
        ${margin},0 ${w-margin},0 ${w},${margin} 
        ${w},${h-margin} ${w-margin},${h} ${margin},${h} 
        0,${h-margin} 0,${margin}
    `;
    item.polygon.setAttribute("points", points);

    // D. リーダーライン（しなやかなS字カーブ）の更新
    // 吹き出しの底(中央)からターゲットへ
    const startX = bubbleX + w / 2;
    const startY = bubbleY + h;
    const cp1y = (startY + targetY) / 2;
    
    // 3次ベジェ曲線: M(始点) C(制御点1, 制御点2, 終点)
    const d = `M ${startX} ${startY} C ${startX} ${cp1y}, ${targetX} ${startY}, ${targetX} ${targetY}`;
    item.path.setAttribute("d", d);
  }
  delete(){
    this.svg.removeChild(this.sourceSet)
  }
}