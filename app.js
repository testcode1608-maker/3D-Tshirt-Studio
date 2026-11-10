import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const viewer = document.querySelector('#viewer');
const loading = document.querySelector('#loading');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#17191e');
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
camera.position.set(0, 0.25, 6.6);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
viewer.prepend(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enablePan = true;
controls.minDistance = 3.8;
controls.maxDistance = 9;
controls.target.set(0, 0, 0);
controls.maxPolarAngle = Math.PI * 0.88;

scene.add(new THREE.HemisphereLight(0xdce5ff, 0x24202a, 2.0));
const key = new THREE.DirectionalLight(0xffe6ce, 3.1); key.position.set(-3.5, 5, 5); key.castShadow = true; key.shadow.mapSize.set(2048,2048); key.shadow.camera.left=-4; key.shadow.camera.right=4; key.shadow.camera.top=4; key.shadow.camera.bottom=-4; scene.add(key);
const fill = new THREE.DirectionalLight(0x9eb8ff, 1.6); fill.position.set(4, 1, 3); scene.add(fill);
const rim = new THREE.DirectionalLight(0xffffff, 2.5); rim.position.set(0, 3, -4); scene.add(rim);
const floor = new THREE.Mesh(new THREE.CircleGeometry(4.5, 80), new THREE.MeshStandardMaterial({color:'#24262c', roughness:.9}));
floor.rotation.x=-Math.PI/2; floor.position.y=-2.05; floor.receiveShadow=true; scene.add(floor);

function fabricTexture(){
  const c=document.createElement('canvas'); c.width=512;c.height=512; const x=c.getContext('2d');
  x.fillStyle='#ffffff';x.fillRect(0,0,512,512);
  for(let i=0;i<15000;i++){const v=Math.random()*35;x.fillStyle=`rgba(70,70,70,${Math.random()*.10})`;x.fillRect(Math.random()*512,Math.random()*512,1+Math.random()*2,1);}
  x.strokeStyle='rgba(70,70,70,.055)';x.lineWidth=1;
  for(let i=0;i<512;i+=4){x.beginPath();x.moveTo(i,0);x.lineTo(i,512);x.stroke();}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,2);return t;
}
const clothMap=fabricTexture();
const shirtMaterial=new THREE.MeshStandardMaterial({color:'#e9e6df',map:clothMap,roughness:.91,metalness:0,side:THREE.DoubleSide});
const shirt=new THREE.Group();scene.add(shirt);
const outline=new THREE.Shape();
outline.moveTo(-.58,1.38);outline.lineTo(-1.43,.92);outline.lineTo(-1.12,.20);outline.lineTo(-.78,.43);outline.lineTo(-.78,-1.55);outline.quadraticCurveTo(-.78,-1.68,-.64,-1.68);outline.lineTo(.64,-1.68);outline.quadraticCurveTo(.78,-1.68,.78,-1.55);outline.lineTo(.78,.43);outline.lineTo(1.12,.20);outline.lineTo(1.43,.92);outline.lineTo(.58,1.38);outline.quadraticCurveTo(.42,1.48,.28,1.43);outline.lineTo(-.28,1.43);outline.quadraticCurveTo(-.42,1.48,-.58,1.38);
const neck=new THREE.Path();neck.absellipse(0,1.35,.34,.19,0,Math.PI*2,true,0);outline.holes.push(neck);
const bodyGeo=new THREE.ExtrudeGeometry(outline,{depth:.13,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:.055,bevelThickness:.045,curveSegments:16});
bodyGeo.computeVertexNormals();
const body=new THREE.Mesh(bodyGeo,shirtMaterial);body.position.z=-.065;body.castShadow=true;body.receiveShadow=true;shirt.add(body);
const collar=new THREE.Mesh(new THREE.TorusGeometry(.335,.045,12,64),new THREE.MeshStandardMaterial({color:'#c8c5bf',roughness:.95}));
collar.position.set(0,1.35,.105);collar.scale.set(1,.57,1);collar.castShadow=true;shirt.add(collar);
const seamMat=new THREE.LineBasicMaterial({color:'#77756f',transparent:true,opacity:.38});
function seam(points){const g=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(p[0],p[1],.105)));shirt.add(new THREE.Line(g,seamMat));}
seam([[-.76,.40],[-.52,.28],[0,.23],[.52,.28],[.76,.40]]);
seam([[-.72,-1.48],[-.35,-1.49],[0,-1.49],[.35,-1.49],[.72,-1.48]]);
seam([[-1.22,.28],[-1.15,.36],[-1.08,.40]]);
seam([[1.22,.28],[1.15,.36],[1.08,.40]]);

// A removable transparent artwork layer sits just above the front fabric.
const artCanvas=document.createElement('canvas');artCanvas.width=512;artCanvas.height=512;
const artCtx=artCanvas.getContext('2d');
const artTexture=new THREE.CanvasTexture(artCanvas);artTexture.colorSpace=THREE.SRGBColorSpace;
const artMaterial=new THREE.MeshBasicMaterial({map:artTexture,transparent:true,depthWrite:false,side:THREE.DoubleSide});
const art=new THREE.Mesh(new THREE.PlaneGeometry(1,1),artMaterial);art.position.set(0,.22,.165);shirt.add(art);
let hasArt=false,artImage=null,placement='center',artScale=1;
function drawArt(){artCtx.clearRect(0,0,512,512);if(artImage){const max=420*artScale;let w=artImage.width,h=artImage.height;const s=Math.min(max/w,max/h);w*=s;h*=s;artCtx.drawImage(artImage,(512-w)/2,(512-h)/2,w,h);}artTexture.needsUpdate=true;hasArt=!!artImage;art.visible=hasArt;}
function setPlacement(p){placement=p;art.position.z=p==='back'?-.17:.165;art.position.x=p==='left'?-.37:0;art.position.y=p==='back'?.25:.22;art.rotation.y=p==='back'?Math.PI:0;art.visible=hasArt;if(p==='back')showBack(true);else showBack(false);document.querySelectorAll('.placement').forEach(b=>b.classList.toggle('active',b.dataset.place===p));}
function showBack(back){shirt.rotation.y=back?Math.PI:0;document.querySelector('#front-view').classList.toggle('active',!back);document.querySelector('#back-view').classList.toggle('active',back);document.querySelector('#view-name').textContent=back?'BACK VIEW':'FRONT VIEW';}
function resize(){const w=viewer.clientWidth,h=viewer.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);}
new ResizeObserver(resize).observe(viewer);resize();
function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);}animate();
setTimeout(()=>loading.classList.add('hidden'),700);

document.querySelectorAll('.swatch').forEach(btn=>btn.addEventListener('click',()=>{shirtMaterial.color.set(btn.dataset.color);document.querySelectorAll('.swatch').forEach(b=>b.classList.toggle('active',b===btn));}));
document.querySelectorAll('.size-chip').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.size-chip').forEach(b=>b.classList.toggle('active',b===btn));}));
document.querySelectorAll('.placement').forEach(btn=>btn.addEventListener('click',()=>setPlacement(btn.dataset.place)));
const upload=document.querySelector('#image-upload'),zone=document.querySelector('#upload-zone');
zone.addEventListener('click',()=>upload.click());
upload.addEventListener('change',()=>{const file=upload.files?.[0];if(!file)return;if(file.size>10*1024*1024){alert('Please choose an image smaller than 10 MB.');return;}const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{artImage=img;drawArt();document.querySelector('#save-status').textContent='● DESIGN UPDATED';};img.src=reader.result;};reader.readAsDataURL(file);});
document.querySelector('#art-scale').addEventListener('input',e=>{artScale=Number(e.target.value)/100;document.querySelector('#scale-value').textContent=e.target.value+'%';drawArt();});
document.querySelector('#remove-art').addEventListener('click',()=>{artImage=null;drawArt();upload.value='';});
document.querySelector('#front-view').addEventListener('click',()=>showBack(false));
document.querySelector('#back-view').addEventListener('click',()=>showBack(true));
function resetCamera(){shirt.rotation.set(0,0,0);camera.position.set(0,.25,6.6);controls.target.set(0,0,0);controls.update();showBack(false);}
document.querySelector('#reset-view').addEventListener('click',resetCamera);
document.querySelector('#reset-tool').addEventListener('click',resetCamera);
document.querySelector('#rotate-tool').addEventListener('click',()=>{controls.autoRotate=!controls.autoRotate;controls.autoRotateSpeed=1.4;});
document.querySelector('#export-btn').addEventListener('click',()=>{renderer.render(scene,camera);const a=document.createElement('a');a.download='threadlab-tshirt-preview.png';a.href=renderer.domElement.toDataURL('image/png');a.click();});
