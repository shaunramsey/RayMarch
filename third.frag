#version 300 es

precision highp float;
precision highp sampler2D;

in vec2 uv;
out vec4 out_color;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_mouse;
uniform sampler2D u_textures[16];

// all the lines above this are standard for glsl.app
// they hook in shadertoy's equivalents (things like iTime/iMouse)

//the sdf function for a box
float sdBox( vec3 p, vec3 b )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

//the sdf function for a sphere
float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

//a 2d rotation matrix
mat2 rotate2d(float angle) {
  return mat2( cos(angle), -sin(angle), sin(angle), cos(angle));
}

// not seen in the first segment but most ray marchers
// will tuck their final sdf return into a function called map
// in the first segment we returned the distance, but most
// ray marchers will eventually need to do something else/better
float map(vec3 pos) {
  // the next two lines are from the last segment
  // vec3 sphereCenter = vec3(cos(u_time), sin(3.0*u_time), 0.7 * sin(u_time));
  // float sdf = sdSphere(pos - sphereCenter, 1.0);
  pos.xy = mod(pos.xy, 2.0) - 1.0;
  float ball = sdSphere(pos, 1.0);
  return ball;


  //mid-way point of the 4th segment
  //float sdf = sdSphere(pos - vec3(-0.8, 0.0, 0.0), 1.0);
  // vec3 boxPos = pos - vec3(0.8, 0.0, 0.0); //translate over;
  // float box = sdBox(boxPos, vec3(1.0));
  // sdf = max(sdf, -box);
  //return sdf;
}


vec3 getNormal(vec3 position) 
{
    vec2 offset = vec2(0.01, 0.0);
    vec3 normals = vec3(
        map(position + offset.xyy) - map(position - offset.xyy),
        map(position + offset.yxy) - map(position - offset.yxy),
        map(position + offset.yyx) - map(position - offset.yyx));              
    return normalize(normals);
}

float march(vec3 ro, vec3 rd) {
  float td = 0.0;
  for (int i = 0; i < 64; i++ ) { //how many steps you can take at max
    vec3 pos = ro + rd * td; //where are we right now
    float dist = map(pos); // how far is the closest thing
    if (dist < 0.001) break; //we've hit the surface
    td += dist; //move along the ray as far as we can
    if (td > 100.0) break; //we've left our scene - quit
  }
  return td;
}

void main() {
  vec2 st = (2.0 * uv - 1.0) * vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 mouse = u_mouse.xy / u_resolution;
  vec3 ro = vec3(0.0, 0.0, 5.0);
  vec3 rd = vec3(st, -1.0);
  float td = march(ro, rd);

  vec3 color = vec3(1.0, 0.0, 0.5); // PINKISH
  //instead of rendering according to the "total distance" of that pixel
  //we render based on a normal numerically computed from the map
  color = getNormal(ro+td*rd); // vec3(td - 0.5) * color;

  if (
    td >
    100.0 //we didn't hit anything
  ) {
    color = vec3(0.0);
  }
  out_color = vec4(color, 1.0);
}
