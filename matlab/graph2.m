s = 4; % sidelength of cube

o = 1/s;
v = linspace(-1 + o, 1 - o, s);
[x, y] = meshgrid(v);
z = ones(size(x));

p = [
        x(:), y(:), z(:)
        z(:), x(:), y(:)
        y(:), z(:), x(:)
        -x(:), -y(:), -z(:)
        -z(:), -x(:), -y(:)
        -y(:), -z(:), -x(:)
    ];

pplot(p, 'o');

axis vis3d
daspect([1,1,1])

grid on