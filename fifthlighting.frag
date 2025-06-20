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


float frameGyroid(vec3 position)
{
    float scale = 15.0;
    position *= scale;
    return abs(0.7 * dot(sin(position), cos(position.yzx)) / scale) - 0.02;
}


float sdTorus( vec3 p, vec2 t )
{
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float sdCappedCylinder( vec3 p, float h, float r )
{
  vec2 d = abs(vec2(length(p.xz),p.y)) - vec2(r,h);
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

float sdVerticalCapsule( vec3 p, float h, float r )
{
  p.y -= clamp( p.y, 0.0, h );
  return length( p ) - r;
}

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

float basesAndShaft(vec3 pos) {
  float finalBase;
  float baseUpper = sdCappedCylinder(pos - vec3(0.0, 3.2, 0.0), 0.15, 1.4);
  finalBase = baseUpper;
  float baseCenter = sdCappedCylinder(pos - vec3(0.0, 1.47, 0.0), 0.03, 0.9);
  finalBase = min(finalBase, baseCenter);
  float baseLower = sdCappedCylinder(pos - vec3(0.0, -1.12, 0.0), 0.08, 1.0);
  finalBase = min(finalBase, baseLower);
  float shaft = sdVerticalCapsule(pos - vec3(0.0, -1.1, 0.0), 0.7, 0.1);
  finalBase = min(finalBase, shaft);

  return finalBase;
}

float stabilizers(vec3 pos) {
  vec3 inner = pos - vec3(0.0, -1.0, 0.0);
  inner.x = abs(inner.x) - 0.6;
  float stabilizer = sdVerticalCapsule(inner, 4.02, 0.1);

  vec3 frame = pos - vec3(0.0, -1.37, 0.0);
  frame.xz = abs(frame.xz) - 1.77;

  float newline = sdVerticalCapsule(frame, 2.8, 0.08);
  stabilizer = min(stabilizer, newline);

  vec3 bar = pos - vec3(0.0, 1.47, 0.0);
  float xbar = sdBox(bar, vec3(2.5, 0.03, 0.13));
  float zbar = sdBox(bar, vec3(0.13, 0.03, 2.5));
  float binding = min(xbar, zbar);
  stabilizer = min(stabilizer, binding);


  return stabilizer;
}


float wireframe(vec3 pos) {
  vec3 tor = pos;
  tor.y = abs(tor.y) - 1.5;
  float torus = sdTorus(tor, vec2(2.5, 0.1));
  
  float frame = sdCappedCylinder(pos - vec3(0.0), 1.5, 2.55);
  float inner = sdCappedCylinder(pos - vec3(0.0), 2.5, 2.5);
  frame = max(frame, -inner);

  float gyroid = frameGyroid(pos);
  frame = max(frame, gyroid);
  
  frame = min(frame, torus);


  return frame;
}

// not seen in the first segment but most ray marchers
// will tuck their final sdf return into a function called map
// in the first segment we returned the distance, but most
// ray marchers will eventually need to do something else/better
float map(vec3 pos) {
  float final = basesAndShaft(pos);
  final = min(final, stabilizers(pos));
  final = min(final, wireframe(pos));
  return final;
}



float march(vec3 ro, vec3 rd) {
  float td = 0.0;
  for (int i = 0; i < 256; i++ ) { //how many steps you can take at max
    vec3 pos = ro + rd * td; //where are we right now
    float dist = map(pos); // how far is the closest thing
    if (abs(dist) < 0.001) break; //we've hit the surface
    td += dist; //move along the ray as far as we can
    if (td > 100.0) break; //we've left our scene - quit
  }
  return td;
}

vec3 getNormal(vec3 position) 
{
    vec2 offset = vec2(0.03, 0.0);
    vec3 normals = vec3(
        map(position + offset.xyy) - map(position - offset.xyy),
        map(position + offset.yxy) - map(position - offset.yxy),
        map(position + offset.yyx) - map(position - offset.yyx));              
    return normalize(normals);
}

vec3 lighting(vec3 hit, vec3 view) {
  vec3 normal = getNormal(hit); // vec3(td - 0.5) * color;
  vec3 light_dir = -normalize(hit); //the light is at 0,0;
  vec3 lambertian_color = vec3(0.6, 0.4, 0.4) * 2.0;
  vec3 specular_color = vec3(1.0, 0.7, 0.33333);
  float diffuse_and_ambient = dot(light_dir, normal) * 0.5 + 0.5;
  vec3 lambertian_amount = diffuse_and_ambient* lambertian_color;

  vec3 halfvec = normalize(-view + light_dir);
  vec3 specular_amount = specular_color * pow(max(0.0, dot(halfvec, normal)), 5.0);

  float mixpct = 0.75;
  vec3 color = mix(lambertian_amount, specular_amount, mixpct);


  vec3 light_dir2 = normalize(vec3(2.0, 0.0, -5.0) - hit);
  vec3 diffuse_col2 = vec3(0.3, 0.3, 0.0);
  vec3 specular_col2 = vec3(0.9, 0.7, 0.3) * 2.0;
  vec3 lambert2 = diffuse_col2 * max(0.0, dot(light_dir2, normal));
  vec3 halfvec2 = normalize(-view + light_dir2);
  vec3 specular2 = specular_col2 * pow(max(0.0, dot(halfvec2, normal)), 30.0);

  color += mix(lambert2, specular2, mixpct);
  //color = lambert2; //see what these effects are alone in debug
  //color = specular2;
  return color;
}

void main() {
  vec2 st = (2.0 * uv - 1.0) * vec2(u_resolution.x / u_resolution.y, 1.0);;
  vec2 mouse = u_mouse.xy / u_resolution;
  vec3 ro = vec3(0.0, 0.0, -5.0);
  vec3 rd = normalize(vec3(st, 1.0));
  float td = march(ro, rd);
  
  vec3 hit = ro + td*rd; //the hit position
  vec3 color = lighting(hit, rd); //must include hit pos and viewing direction


  //color = lambertian_amount * 0.35 + specular_amount * 0.75;
  //color = (color + 1.0) * 0.5;
  if(td > 100.0) {
    out_color = vec4(0.0, 0.0, 0.0, 1.0);
  }
  else {
    out_color = vec4(color, 1.0);
  }
}
