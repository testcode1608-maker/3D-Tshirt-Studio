import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const $ = (s) => document.querySelector(s);
const viewer = $('#viewer');
const loading = $('#loading');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#1b1f26');
const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
camera.position.set(0, .2, 6.4);
const renderer = new THREE.WebGLRenderer({antialias:true, alpha:false, preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.14;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
viewer.prepend(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = .055;
controls.enablePan = true;
controls.minDistance = 3.4;
controls.maxDistance = 10;
controls.target.set(0, 0, 0);
controls.maxPolarAngle = Math.PI * .88;

scene.add(new THREE.HemisphereLight(0xe2e9f4, 0x29242a, 2.0));
const key = new THREE.DirectionalLight(0xffe6d1, 3.0);
key.position.set(-3.5, 5, 5); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048); scene.add(key);
const fill = new THREE.DirectionalLight(0x9fbfff, 1.7); fill.position.set(4, 1, 3); scene.add(fill);
const rim = new THREE.DirectionalLight(0xffffff, 2.4); rim.position.set(0, 3, -4); scene.add(rim);
const floor = new THREE.Mesh(new THREE.CircleGeometry(4.5, 80), new THREE.MeshStandardMaterial({color:'#252a32', roughness:.94}));
floor.rotation.x = -Math.PI / 2; floor.position.y = -2.04; floor.receiveShadow = true; scene.add(floor);

function makeFabricTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 512, 512);
  for (let i=0; i<19000; i++) {
    const alpha = Math.random() * .075;
    ctx.fillStyle = 'rgba(65,65,65,' + alpha + ')';
    ctx.fillRect(Math.random()*512, Math.random()*512, 1 + Math.random()*2, 1);
  }
  ctx.strokeStyle = 'rgba(70,70,70,.045)'; ctx.lineWidth = 1;
  for (let i=0; i<512; i+=4) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,512); ctx.stroke(); }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2,2);
  return texture;
}
const fabric = makeFabricTexture();
const shirtMaterial = new THREE.MeshStandardMaterial({color:'#e9e6df', map:fabric, roughness:.9, metalness:0, side:THREE.DoubleSide});
const shirt = new THREE.Group(); scene.add(shirt);
const outline = new THREE.Shape();
outline.moveTo(-.58,1.38); outline.lineTo(-1.43,.92); outline.lineTo(-1.12,.20);
outline.lineTo(-.78,.43); outline.lineTo(-.78,-1.55); outline.quadraticCurveTo(-.78,-1.68,-.64,-1.68);
outline.lineTo(.64,-1.68); outline.quadraticCurveTo(.78,-1.68,.78,-1.55); outline.lineTo(.78,.43);
outline.lineTo(1.12,.20); outline.lineTo(1.43,.92); outline.lineTo(.58,1.38);
outline.quadraticCurveTo(.42,1.48,.28,1.43); outline.lineTo(-.28,1.43); outline.quadraticCurveTo(-.42,1.48,-.58,1.38);
const neck = new THREE.Path(); neck.absellipse(0,1.35,.34,.19,0,Math.PI*2,true,0); outline.holes.push(neck);
const bodyGeometry = new THREE.ExtrudeGeometry(outline,{depth:.13,bevelEnabled:true,bevelSegments:5,steps:1,bevelSize:.055,bevelThickness:.045,curveSegments:18});
bodyGeometry.computeVertexNormals();
const body = new THREE.Mesh(bodyGeometry,shirtMaterial);
body.position.z = -.065; body.castShadow = true; body.receiveShadow = true; shirt.add(body);
const collar = new THREE.Mesh(new THREE.TorusGeometry(.335,.045,14,72),new THREE.MeshStandardMaterial({color:'#c8c5bf',roughness:.94}));
collar.position.set(0,1.35,.105); collar.scale.set(1,.57,1); collar.castShadow = true; shirt.add(collar);
const seamMaterial = new THREE.LineBasicMaterial({color:'#77756f',transparent:true,opacity:.35});
function addSeam(points) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(p[0],p[1],.105)));
  shirt.add(new THREE.Line(geometry,seamMaterial));
}
addSeam([[-.76,.4],[-.52,.28],[0,.23],[.52,.28],[.76,.4]]);
addSeam([[-.72,-1.48],[-.35,-1.49],[0,-1.49],[.35,-1.49],[.72,-1.48]]);
addSeam([[-1.22,.28],[-1.15,.36],[-1.08,.4]]);
addSeam([[1.22,.28],[1.15,.36],[1.08,.4]]);

const artCanvas = document.createElement('canvas'); artCanvas.width = 512; artCanvas.height = 512;
const artContext = artCanvas.getContext('2d');
const artTexture = new THREE.CanvasTexture(artCanvas); artTexture.colorSpace = THREE.SRGBColorSpace;
const artMaterial = new THREE.MeshBasicMaterial({map:artTexture,transparent:true,depthWrite:false,side:THREE.DoubleSide});
const artwork = new THREE.Mesh(new THREE.PlaneGeometry(1,1),artMaterial);
artwork.position.set(0,.22,.166); shirt.add(artwork);
let artImage = null, artScale = 1, placement = 'center', fit = 'oversized';
function redrawArtwork() {
  artContext.clearRect(0,0,512,512);
  if (artImage) {
    const max = 420 * artScale;
    const ratio = Math.min(max/artImage.width,max/artImage.height);
    const w = artImage.width*ratio, h = artImage.height*ratio;
    artContext.drawImage(artImage,(512-w)/2,(512-h)/2,w,h);
  }
  artTexture.needsUpdate = true;
  artwork.visible = !!artImage;
  $('#save-status').textContent = artImage ? '● تم تحديث التصميم' : '● جاهز للتصميم';
}
function setPlacement(value) {
  placement = value;
  artwork.position.set(value==='left' ? -.37 : 0, value==='back' ? .25 : .22, value==='back' ? -.17 : .166);
  artwork.rotation.y = value==='back' ? Math.PI : 0;
  if (value==='back') setGarmentView('back');
  else setGarmentView('front');
  document.querySelectorAll('.placement').forEach(b=>b.classList.toggle('active',b.dataset.place===value));
}
function setGarmentView(value) {
  shirt.visible = true; personalModel.visible = false;
  shirt.rotation.y = value==='back' ? Math.PI : 0;
  $('#front-view').classList.toggle('active',value==='front');
  $('#back-view').classList.toggle('active',value==='back');
  $('#model-view').classList.remove('active');
  $('#view-name').textContent = value==='back' ? 'الواجهة الخلفية' : 'الواجهة الأمامية';
  $('#stage-caption').textContent = value==='back' ? 'معاينة ظهر القميص' : 'معاينة واجهة القميص';
}
function applyFit(value) {
  fit = value;
  const scales = {regular:[1,1,1],oversized:[1.12,1.04,1],slim:[.9,1,1]};
  shirt.scale.set(...scales[value]);
  $('#fit-label').textContent = value==='regular' ? 'عادي' : value==='slim' ? 'ضيق' : 'واسع';
  document.querySelectorAll('.fit-chip').forEach(b=>b.classList.toggle('active',b.dataset.fit===value));
}

const personalModel = new THREE.Group(); personalModel.visible = false; scene.add(personalModel);
let loadedModel = null;
const gltfLoader = new GLTFLoader();
function showPersonalModel() {
  if (!loadedModel) {
    $('#model-status').textContent = 'حمّل ملف GLB أو GLTF أولاً لعرض نموذجك.';
    return;
  }
  shirt.visible = false; personalModel.visible = true;
  $('#front-view').classList.remove('active'); $('#back-view').classList.remove('active');
  $('#model-view').classList.add('active');
  $('#view-name').textContent = 'عارضك الشخصي';
  $('#stage-caption').textContent = 'نموذجك ثلاثي الأبعاد — اسحب لتدويره';
  controls.target.set(0,0,0);
}
function resize() {
  const w = viewer.clientWidth, h = viewer.clientHeight;
  if (!w || !h) return;
  camera.aspect = w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h,false);
}
new ResizeObserver(resize).observe(viewer); resize();
function animate() { requestAnimationFrame(animate); controls.update(); renderer.render(scene,camera); }
animate();
setTimeout(()=>loading.classList.add('hidden'),850);

document.querySelectorAll('.swatch').forEach(button=>button.addEventListener('click',()=>{
  shirtMaterial.color.set(button.dataset.color);
  document.querySelectorAll('.swatch').forEach(item=>item.classList.toggle('active',item===button));
}));
document.querySelectorAll('.size-chip').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('.size-chip').forEach(item=>item.classList.toggle('active',item===button));
}));
document.querySelectorAll('.fit-chip').forEach(button=>button.addEventListener('click',()=>applyFit(button.dataset.fit)));
document.querySelectorAll('.placement').forEach(button=>button.addEventListener('click',()=>setPlacement(button.dataset.place)));

const upload = $('#image-upload');
upload.addEventListener('change',()=>{
  const file = upload.files?.[0]; if(!file) return;
  if(file.size>10*1024*1024){alert('حجم الصورة يجب ألا يتجاوز 10 ميغابايت.');upload.value='';return;}
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = ()=>{artImage=image;redrawArtwork();};
  image.onerror = ()=>$('#save-status').textContent='● تعذر قراءة الصورة';
  image.src = url;
});
$('#art-scale').addEventListener('input',event=>{
  artScale = Number(event.target.value)/100;
  $('#scale-value').textContent = event.target.value+'%';
  redrawArtwork();
});
$('#remove-art').addEventListener('click',()=>{artImage=null;upload.value='';redrawArtwork();});

function bindPhotoInput(inputId,previewId) {
  const input = $('#'+inputId), preview = $('#'+previewId);
  input.addEventListener('change',()=>{
    const file=input.files?.[0]; if(!file)return;
    if(file.size>10*1024*1024){alert('حجم الصورة يجب ألا يتجاوز 10 ميغابايت.');input.value='';return;}
    const oldUrl=preview.dataset.objectUrl;
    if(oldUrl) URL.revokeObjectURL(oldUrl);
    const url=URL.createObjectURL(file);
    preview.src=url; preview.dataset.objectUrl=url; preview.hidden=false;
    const label=input.closest('label');
    const small=label?.querySelector('small');
    if(small) small.textContent='تم تحميل الصورة';
  });
}
bindPhotoInput('portrait-upload','portrait-preview');
bindPhotoInput('side-upload','side-preview');
bindPhotoInput('full-upload','full-preview');

$('#model-upload').addEventListener('change',()=>{
  const file=$('#model-upload').files?.[0]; if(!file)return;
  const url=URL.createObjectURL(file);
  gltfLoader.load(url,gltf=>{
    if(loadedModel) personalModel.remove(loadedModel);
    loadedModel=gltf.scene;
    const box=new THREE.Box3().setFromObject(loadedModel);
    const size=box.getSize(new THREE.Vector3());
    const center=box.getCenter(new THREE.Vector3());
    loadedModel.position.sub(center);
    const maxDim=Math.max(size.x,size.y,size.z)||1;
    loadedModel.scale.setScalar(3.35/maxDim);
    loadedModel.traverse(node=>{
      if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}
    });
    personalModel.add(loadedModel);
    $('#model-status').textContent='تم تحميل النموذج بنجاح. اضغط «عارضي» في المعاينة لعرضه.';
    $('#model-view').disabled=false;
    URL.revokeObjectURL(url);
  },undefined,error=>{
    console.error(error);
    $('#model-status').textContent='تعذر فتح الملف. تأكد أنه GLB أو GLTF صالح.';
    URL.revokeObjectURL(url);
  });
});

$('#front-view').addEventListener('click',()=>setGarmentView('front'));
$('#back-view').addEventListener('click',()=>setGarmentView('back'));
$('#model-view').addEventListener('click',showPersonalModel);
function resetCamera() {
  camera.position.set(0,.2,6.4); controls.target.set(0,0,0); controls.update();
  setGarmentView('front'); applyFit(fit);
}
$('#reset-view').addEventListener('click',resetCamera);
$('#reset-tool').addEventListener('click',resetCamera);
$('#rotate-tool').addEventListener('click',()=>{
  controls.autoRotate=!controls.autoRotate; controls.autoRotateSpeed=1.25;
  $('#rotate-tool').classList.toggle('active',controls.autoRotate);
});
$('#select-tool').addEventListener('click',()=>{
  controls.autoRotate=false; $('#rotate-tool').classList.remove('active'); $('#select-tool').classList.add('active');
});
$('#export-btn').addEventListener('click',()=>{
  renderer.render(scene,camera);
  const link=document.createElement('a');
  link.download='3d-tshirt-studio-preview.png';
  link.href=renderer.domElement.toDataURL('image/png');
  link.click();
});
$('#ai-generate').addEventListener('click',()=>{
  const prompt=$('#ai-prompt').value.trim();
  $('#ai-status').textContent=prompt
    ? 'الوصف محفوظ في هذه الجلسة. التوليد الفعلي يحتاج ربط واجهة AI آمنة من جهة الخادم؛ لن نعرض نتيجة وهمية.'
    : 'اكتب وصفاً للتصميم أولاً، ثم اربط خدمة التوليد بالذكاء الاصطناعي.';
});
