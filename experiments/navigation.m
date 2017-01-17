s = 3;


is = 0;

p = [0,0];

nav(p, is, [0,-1], s)

function [p, is, h] = nav(p, is, h, s)
pp = p + h;

sideTable = [
    1 3 4 2
    4 2 0 5
    1 3 0 5
    2 4 0 5
    3 1 0 5
    1 3 2 4
];

c = [pp(1) < 0, pp(1) >= s, pp(2) < 0, pp(2) >= s];
if any(c)
   
   j = find(c, 1);
   
   is = 
   disp('is outside');
   
   
end

end