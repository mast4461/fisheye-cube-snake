s = 3; % sidelength of cube

%% Define point coordinates and find neighbor points
v = 0:s-1;
[x, y] = meshgrid(v);
z = zeros(size(x)) + s -0.5;

% pn is for the neighborsearch
pn = [
        x(:), y(:), z(:)
        z(:), x(:), y(:)
        y(:), z(:), x(:)
        s-x(:)-1, s-y(:)-1, s-z(:)-1
        s-z(:)-1, s-x(:)-1, s-y(:)-1
        s-y(:)-1, s-z(:)-1, s-x(:)-1
    ];

kdtree = KDTreeSearcher(pn);

neighborInfo = rangesearch(kdtree, pn, 1);

z = zeros(size(x)) + s;

% p are the actual point coordinates
p = [
        x(:), y(:), z(:)
        z(:), x(:), y(:)
        y(:), z(:), x(:)
        s-x(:)-1, s-y(:)-1, s-z(:)-1
        s-z(:)-1, s-x(:)-1, s-y(:)-1
        s-y(:)-1, s-z(:)-1, s-x(:)-1
    ];

%% Data for sides
vx = [1,0,0];
vy = [0,1,0];
vz = [0,0,1];
vups = [-vy;vz;vz;vz;vz;vy];
vnormals = [-vz;vx;-vy;-vx;vy;vz];

vrights = zeros(6, 3);
for i = 1:6
    v = cross(vups(i, :), vnormals(i, :));
    vrights(i, :) = v/norm(v);
end

cmap = lines(6);

%% Generate some snake coordinates, probably well
jMax = round(s*s*6/3);
iss = zeros(jMax,1);
i = randi([1,numel(neighborInfo)]);
j = 1;
iter = 0;
while j <= jMax && iter < 4*jMax
    iter = iter + 1;
    if ~contains(iss, i)
        iss(j) = i;
        j = j + 1;
    else
        i = iss(j-1);
    end
    
    % get indices of neihgbors of point
    is = neighborInfo{i};
    is = is(2:end);
    
    % select neigbor index at random
    k = randi([1,numel(is)]);
    i = is(k);
end
a = p(iss,:);

% maximum absolute value element determines side
c = a - (s-1)/2;
[~, i] = max(abs(c), [], 2);
idx = sub2ind(size(a), 1:size(a, 1), i');
side = i + 3*(sign(a(idx)) == -1)';

nc = size(c, 1);
xs = zeros(nc, 1);
ys = zeros(nc, 1);

for i = 1:nc
    xs(i) = dot(a(i, :), vrights(side(i),:));
    ys(i) = dot(a(i, :), vups(side(i),:));
end

disp([xs, ys])

%% Plot 
figure(1)
clf

subplot(2,1,1)
pplot(p, 'o');

axis vis3d
daspect([1,1,1])

grid on
hold on

% plot neighbors
for i = 1:numel(neighborInfo)
    js = neighborInfo{i};
    for k = 2:numel(js)
        q = p([js(1), js(k)], :);
        pplot(q, 'color', [1,1,1]*0.5); 
    end
end

% plot snake
pplot(a, 'r', 'linewidth', 3);

% plot points on different sides with different colors
for i = 1:6
    pplot(a(side == i, :), 's', ...
        'markerfacecolor',cmap(i, :), ...
        'markersize', 20);
end


xlabel('x')
ylabel('y')
zlabel('z')


%% Second subplot
subplot(2,1,2)

% offsets from center to snake points
pplot(c, 'ro-');
axis vis3d
daspect([1,1,1])