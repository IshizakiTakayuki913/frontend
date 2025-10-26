import * as THREE from 'three'

export class AnimationManager{
  count = 0
  mixers = []

  constructor(_data = {}){
  }
  create(_data = {scene: null}){
    this.count += 1

    const _mixer = new Animation({scene: _data.scene})
    this.mixers.push(_mixer)

    return _mixer
  }
}

export class Animation{
  mixer = null
  action = null
  // clip = null

  constructor(_data = {scene: null}){
    this.mixer = new THREE.AnimationMixer(_data.scene)

    this.finished = this.finished.bind(this)
  }
  sliceSet({animationData = null, start = 0, end = -1, timeScale = 1, fps = 24} = {}){

    const {duration} = animationData

    if(end < 0) end = duration

    if(end < start){
      console.warn(`The start value is greater than the end value.`)
      return false
    }

    const _clip = (animationData instanceof THREE.AnimationClip) ? animationData : Animation.makeAnimation(animationData)
    
    const clip = this.cutClipByTime(_clip, "step", start, end)
    
    const action = this.mixer.clipAction(clip)

    action.setLoop(THREE.LoopOnce, 0)
    action.clampWhenFinished = true
    action.timeScale = timeScale

    action.play()
    action.paused = true

    this.action = action

    return true
  }
  remove(){
    try {
      this.mixer.uncacheAction(this.action.getClip(), this.mixer.getRoot())
    } catch (error) {
    }
  }
  set({animationData = null, timeScale = 1} = {}){
    const {duration} = animationData

    const clip = (animationData instanceof THREE.AnimationClip) ? animationData : Animation.makeAnimation(animationData)
    
    const action = this.mixer.clipAction(clip)

    action.setLoop(THREE.LoopOnce, 0)
    action.clampWhenFinished = true
    action.timeScale = timeScale
    
    action.play()
    action.paused = true

    this.action = action

    return true
  }
  cutClipByTime(sourceClip, name, startTime, endTime) {
    const newTracks = [];

    sourceClip.tracks.forEach(track => {
      const times = track.times;
      const values = track.values;
      const valueSize = track.getValueSize(); // Vector3なら3, Quaternionなら4

      const newTimes = [];
      const newValues = [];

      // startTime 前の補間値を計算
      if (startTime > times[0]) {
        const startValue = this.interpolateAt(track, startTime);
        newTimes.push(0); // 新しいクリップは 0 秒から始める
        newValues.push(...startValue);
      }

      // 範囲内のキーをコピー
      for (let i = 0; i < times.length; i++) {
        if (times[i] >= startTime && times[i] <= endTime) {
          newTimes.push(times[i] - startTime); // 新しい時間基準に合わせる
          const v = values.slice(i * valueSize, (i + 1) * valueSize);
          newValues.push(...v);
        }
      }

      // endTime の補間値を計算
      if (endTime < times[times.length - 1]) {
        const endValue = this.interpolateAt(track, endTime);
        newTimes.push(endTime - startTime);
        newValues.push(...endValue);
      }

      // 新しいトラックを作成
      const TypedArray = values.constructor;
      const NewTrack = new track.constructor(track.name, newTimes, new TypedArray(newValues));
      newTracks.push(NewTrack);
    });

    return new THREE.AnimationClip(name, endTime - startTime, newTracks);
  }
  // 補間関数（線形 / クォータニオンは slerp）
  interpolateAt(track, time) {
    const times = track.times;
    const values = track.values;
    const valueSize = track.getValueSize();

    // 直前・直後のキーを探す
    let i = 0;
    while (i < times.length - 1 && times[i + 1] < time) i++;

    const t0 = times[i];
    const t1 = times[i + 1];
    const alpha = (time - t0) / (t1 - t0);

    const v0 = values.slice(i * valueSize, (i + 1) * valueSize);
    const v1 = values.slice((i + 1) * valueSize, (i + 2) * valueSize);

    if (valueSize === 4) {
      // Quaternion 補間
      const q0 = new THREE.Quaternion().fromArray(v0);
      const q1 = new THREE.Quaternion().fromArray(v1);
      return new THREE.Quaternion().slerpQuaternions(q0, q1, alpha).toArray();
    } else {
      // 線形補間
      return v0.map((v, idx) => v * (1 - alpha) + v1[idx] * alpha);
    }
  }
  finished(e){
    console.log(`animation finish`)
    // console.log(e)

    this.mixer.removeEventListener('finished', this.finished)
  }
  static makeAnimation(animationData = {}){
    // tracksを変換
    const tracks = animationData.tracks.map(track => {
      if (track.type === "quaternion") {
        return new THREE.QuaternionKeyframeTrack(
          track.name,
          track.times,
          track.values
        )
      } else if (track.type === "vector") {
        return new THREE.VectorKeyframeTrack(
          track.name,
          track.times,
          track.values
        )
      }else if (track.type === undefined) {
        return new THREE.QuaternionKeyframeTrack(
          track.name,
          track.times,
          track.values
        )
      }
    })

    // AnimationClip作成
    
    return new THREE.AnimationClip(animationData.name, animationData.duration, tracks)
  }
  showFrameAt({time = 0} = {}) {
    this.action.paused = true;
    this.action.time = time;
    this.mixer.update(0); // 即反映
  }
  play({timeScale = 2, eventFinished = false} = {}) {
    this.action.paused = false;
    this.action.timeScale = timeScale; // 逆方向
    if(eventFinished) this.mixer.addEventListener('finished', this.finished)
  }
  // ---- 停止 ----
  stop() {
    this.action.paused = true;
  }
}