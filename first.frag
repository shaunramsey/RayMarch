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

//the sdf function for a sphere
float sdSphere(vec3 p, float r) 
{
	return length(p) - r;
}


// not seen in the first segment but most ray marchers
// will tuck their final sdf return into a function called map
// in the first segment we returned the distance, but most 
// ray marchers will eventually need to do something else/better
float map(vec3 pos) {
   float sdf = sdSphere(pos, 1.0); 
   return sdf;
}


float march(vec3 ro, vec3 rd) 
{
	float td = 0.0;
	for(int i = 0; i < 64; i++)  //how many steps you can take at max
	{
		vec3 pos = ro + rd * td; //where are we right now
		float dist = map(pos); // how far is the closest thing
		if (dist < 0.001) break; //we've hit the surface
		td += dist; //move along the ray as far as we can
		if (td > 100.0) break; //we've left our scene - quit
	}
	return td;
}


void main(){
    vec2 st = (2. * uv - 1.) * vec2(u_resolution.x / u_resolution.y, 1.);
    vec2 mouse = u_mouse.xy / u_resolution;
    vec3 ro = vec3(0.0, 0.0, 3.0);
    vec3 rd = vec3(st, -1.0);
    float td = march(ro, rd);

    vec3 color = vec3(1.0, 0.0, 0.5); // PINKISH
    color = vec3(td - 1.5) * color;

    if (td > 100.0) //we didn't hit anything
    {
      color = vec3(0.0);
    }
    out_color = vec4(color, 1.0);
}
