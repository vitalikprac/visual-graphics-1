(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const a of o.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function l(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerpolicy&&(o.referrerPolicy=r.referrerpolicy),r.crossorigin==="use-credentials"?o.credentials="include":r.crossorigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(r){if(r.ep)return;r.ep=!0;const o=l(r);fetch(r.href,o)}})();let t,u,c,h;function P(e){this.name=e,this.iVertexBuffer=t.createBuffer(),this.count=0,this.BufferData=function(i){t.bindBuffer(t.ARRAY_BUFFER,this.iVertexBuffer),t.bufferData(t.ARRAY_BUFFER,new Float32Array(i),t.STREAM_DRAW),this.count=i.length/3},this.Draw=function(){t.bindBuffer(t.ARRAY_BUFFER,this.iVertexBuffer),t.vertexAttribPointer(c.iAttribVertex,3,t.FLOAT,!1,0,0),t.enableVertexAttribArray(c.iAttribVertex),t.drawArrays(t.LINE_STRIP,0,this.count)}}function w(e,i){this.name=e,this.prog=i,this.iAttribVertex=-1,this.iColor=-1,this.iModelViewProjectionMatrix=-1,this.Use=function(){t.useProgram(this.prog)}}function f(){t.clearColor(0,0,0,1),t.clear(t.COLOR_BUFFER_BIT|t.DEPTH_BUFFER_BIT);let e=m4.perspective(Math.PI/8,1,8,12),i=h.getViewMatrix(),l=m4.axisRotation([.707,.707,0],.7),n=m4.translation(0,0,-10),r=m4.multiply(l,i),o=m4.multiply(n,r),a=m4.multiply(e,o);t.uniformMatrix4fv(c.iModelViewProjectionMatrix,!1,a),t.uniform4fv(c.iColor,[0,1,0,1]),u.Draw()}function A(e){let i=6,l=6,n=4,r=.5,o=0;for(let a=0;a<=l;a+=.05)for(let s=0;s<2*Math.PI;s+=.1){let d=a*Math.cos(s),m=a*Math.sin(s),p=i*Math.PI/l,S=n*Math.pow(Math.E,-r*a)*Math.sin(p*a+o);e.push(d/3,m/3,S/3)}}function E(){let e=[];return A(e),e}function g(){let e=L(t,vertexShaderSource,fragmentShaderSource);c=new w("Basic",e),c.Use(),c.iAttribVertex=t.getAttribLocation(e,"vertex"),c.iModelViewProjectionMatrix=t.getUniformLocation(e,"ModelViewProjectionMatrix"),c.iColor=t.getUniformLocation(e,"color"),u=new P("Surface"),u.BufferData(E()),t.enable(t.DEPTH_TEST)}function L(e,i,l){let n=e.createShader(e.VERTEX_SHADER);if(e.shaderSource(n,i),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS))throw new Error("Error in vertex shader:  "+e.getShaderInfoLog(n));let r=e.createShader(e.FRAGMENT_SHADER);if(e.shaderSource(r,l),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw new Error("Error in fragment shader:  "+e.getShaderInfoLog(r));let o=e.createProgram();if(e.attachShader(o,n),e.attachShader(o,r),e.linkProgram(o),!e.getProgramParameter(o,e.LINK_STATUS))throw new Error("Link error in program:  "+e.getProgramInfoLog(o));return o}function M(){let e;try{if(e=document.getElementById("webglcanvas"),t=e.getContext("webgl"),!t)throw"Browser does not support WebGL"}catch{document.getElementById("canvas-holder").innerHTML="<p>Sorry, could not get a WebGL graphics context.</p>";return}try{g()}catch(i){document.getElementById("canvas-holder").innerHTML="<p>Sorry, could not initialize the WebGL graphics context: "+i+"</p>";return}h=new TrackballRotator(e,f,1),f()}document.addEventListener("DOMContentLoaded",M);