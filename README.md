# RayMarch
A repository for ray marching tutorials and code. Code is provided under an MIT license.

I received a grant for 5 weeks to teach two students the fundamentals of ray marching from the ground up. I challenged them to gather resources, watch videos, and find holes in those resources. Our goal was to produce tutorial content to then teach ray marching to other students in the future. They decided to make videos! This page lists links to the shaders we created as well as to other content that we deemed useful to pull these students up to speed. They had no math background or graphics knowledge before we began, so if they can do it - you can too!

The video tutorial focuses on using shader toy to teach you the fundamentals. Because of that, I decided to use another resource to provide some variety. The resource I choose is https://glsl.app. When moving to writing your own fragment shaders in a standalone application, glsl.app will be just a tad closer. Another advantage is that it can be set to compile on edit.

I wrote the following fragment shader by watching the student's first ray marching segment and adapting to my style. I tend to comment more than the students but I also tended towards using more common variable names. Your mileage may vary and my hope is that the combination of the resources is more beneficial than just one.

You can check out the fragment shader from the first coded segment on raymarching [First Fragment Shader](first.frag).

<img src="firstfrag.png" width="200">

Turns out this display mode is also useful in debugging. By looking at the "depth map" directly, you can sometimes determine if your transforms are working the way you had intended.

At the end of that segment, Bryce has some fun and adds some motion to the sphere via the time parameter. You can check that out here [Second Fragment Shader](second.frag).



Links to other Content!

Lots of great resources are from those that came before. Check them out!
Inigo Quilez has a wealth of topics and articles on his website (and shadertoy) that are useful to anybody starting out.
We were inspired by his youtube video here: [Inigo Quilez's Mathematical Landscape](https://www.youtube.com/watch?v=BFld4EBO2RE&t=1s) but we wanted to offer up a little more help to get users on their feet.
If you're going to get into computer graphics, chances are you'll bump into more of his stuff - as we did [Inigo Quilez's Website](https://iquilezles.org/)


Resource Content
- [SDF Functions](https://iquilezles.org/articles/distfunctions/)
- More To Come


