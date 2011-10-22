if (!Detector.webgl) Detector.addGetWebGLMessage();

var controlsProps = {
    R: 0,
    G: 0,
    B: 0,
    objectType: 0,
	selectionType: 0
};

var container,
stats;

var camera,
scene,
renderer,
projector;

var objects = [],
plane,
geometry,
plane,
clicks = [],
parent;

var mouse = new THREE.Vector2(),
offset = new THREE.Vector3(),
INTERSECTED,
SELECTED,
DRAG,
BRUSHTYPE = 'LINE',
CONTROLTYPE ='MOVE',
radius = 50;

var foregroundColorSelector,
backgroundColorSelector,
menu,
COLOR = [0, 0, 0],
BACKGROUND_COLOR = [255, 255, 255],
palette,
STORAGE = window.localStorage,
//canvas,
//flattenCanvas,
BRUSHES = [
    'Point',
    'Line',
    'Circle',
    'Polygon',
    'Rectangle'
],
isFgColorSelectorVisible = false,
isBgColorSelectorVisible = false,
isAboutVisible = false,
isMenuMouseOver = false,
shiftKeyIsDown = false,
altKeyIsDown = false;
//var mouseX = 0, mouseY = 0;
var mesh;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
//var totalLength = Math.sqrt(Math.pow(windowHalfX*2,2) + Math.pow(windowHalfY*2,2)); // used for the scaling function

//document.addEventListener( 'mousemove', onDocumentMouseMove, false );
var lightS = {
    type: 'v3',
    value: new THREE.Vector3(1, 1, 0)
};

// var shaderMaterial = new THREE.MeshShaderMaterial({
// uniforms:       {
// color: {type: 'v3', value: new THREE.Vector3(1,0,1)},
// lightsource: lightS
// },
// vertexShader:   $('#vertpt').text(),
// fragmentShader: $('#fragpt').text()
// });
init();
animate();

function init() {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
        } else {
        alert('The File APIs are not fully supported in this browser.');
    }
    setupScene();
    showGUI();

    setupMenu();
}
var gui;
function showGUI(game) {
    gui = new DAT.GUI();
    DAT.GUI.autoPlace = true;

    $("#uiContainer").append(gui.domElement);

    gui.add(controlsProps, 'objectType').options({
        'Point': 0,
        'Line': 1,
        'Circle': 2,
        'Poly': 3,
        'Rect': 4
    }).onChange(function(newValue) {

        switch (newValue) {
        case 0:
            BRUSHTYPE = 'POINT';
            break;
        case 1:
            BRUSHTYPE = 'LINE';
            break;
        case 2:
            BRUSHTYPE = 'CIRCLE';
            break;
        case 3:
            BRUSHTYPE = 'POLYGON';
            break;
        case 4:
            BRUSHTYPE = 'RECTANGLE';
            break;
        default:
            BRUSHTYPE = 'POINT';
            break;
        }
    }).listen();
	
	gui.add(controlsProps, 'selectionType').options({
		'Move': 0,
        'Scale': 1,
        'Warp': 2,
		'Rotate': 3
    }).onChange(function(newValue) {

        switch (newValue) {
        case 0:
            CONTROLTYPE = 'MOVE';
            break;
        case 1:
            CONTROLTYPE = 'SCALE';
            break;
        case 2:
            CONTROLTYPE = 'WARP';
            break;
        case 3:
            CONTROLTYPE = 'ROTATE';
            break;
        default:
            CONTROLTYPE = 'MOVE';
            break;
        }
    }).listen();
	
	
	gui.add(this, 'onMenuSave').name('Save'); // Specify a custom name.
	gui.add(this, 'onMenuLoad').name('Load'); // Specify a custom name.
	gui.add(this, 'onMenuClear').name('Clear'); // Specify a custom name.
	
	gui.autoListen = true;
    gui.close();
}
function setupMenu()
 {
    palette = new Palette();
    container.appendChild(renderer.domElement);
    foregroundColorSelector = new ColorSelector(palette);
    foregroundColorSelector.addEventListener('change', onForegroundColorSelectorChange, false);
    container.appendChild(foregroundColorSelector.container);

    backgroundColorSelector = new ColorSelector(palette);
    backgroundColorSelector.addEventListener('change', onBackgroundColorSelectorChange, false);
    container.appendChild(backgroundColorSelector.container);
    menu = new Menu();
    menu.foregroundColor.addEventListener('click', onMenuForegroundColor, false);
    menu.backgroundColor.addEventListener('click', onMenuBackgroundColor, false);
    menu.save.addEventListener('click', onMenuSave, false);
    menu.clear.addEventListener('click', onMenuClear, false);
    menu.container.addEventListener('mouseover', onMenuMouseOver, false);
    menu.container.addEventListener('mouseout', onMenuMouseOut, false);
    container.appendChild(menu.container);
}

function setupScene() {
    container = document.createElement('div');
    document.body.appendChild(container);
    height = window.innerHeight;
    //camera = new THREE.OrthographicCamera(0, aspect_ratio * 1000, 1000, 0, 10000, -10000);
    camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, height / 2, height / -2, 1, 1000);
    //camera = new THREE.OrthographicCamera(0, aspect_ratio * 1000, 1000, 0, 10000, -10000);
    camera.position.set(0, 0, 800);
    //camera.position.z = 600;

    scene = new THREE.Scene();
    //scene.fog = new THREE.Fog(0x000000, 1, 1500);

    //var light = new THREE.PointLight(0xff2200);
    //light.position.set(100, 100, 100);
    //scene.add(light);
    //var light = new THREE.AmbientLight(0x333333);
    //scene.add(light);

    var geometry = new THREE.CubeGeometry(100, 100, 1);

    //var material = new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff, shading: THREE.FlatShading } );
    // construct 8 blend shapes
    // for ( var i = 0; i < geometry.vertices.length; i ++ ) {
    //
    // 					var vertices = [];
    //
    // 					for ( var v = 0; v < geometry.vertices.length; v ++ ) {
    //
    // 						vertices.push( new THREE.Vertex( geometry.vertices[ v ].position.clone() ) )
    //
    // 						if ( v === i ) {
    //
    // 							vertices[ vertices.length - 1 ].position.x *= 2;
    // 							vertices[ vertices.length - 1 ].position.y *= 2;
    // 							vertices[ vertices.length - 1 ].position.z *= 2;
    //
    // 						}
    //
    // 					}
    //
    // 					geometry.morphTargets.push( { name: "target" + i, vertices: vertices } );
    //
    // 				}
    parent = new THREE.Object3D();
    //parent.position.y = 50;
    //objects.push(parent);
    scene.add(parent);
    mesh = new THREE.Mesh(geometry, getMaterial(Math.random() * 0xffffff));
    mesh.overdraw = true;
	mesh.color = mesh.materials[0].color.getHex();
    objects.push(mesh);
    scene.add(mesh);
    geometry = new THREE.SphereGeometry(radius, 20, 20);
    mesh = new THREE.Mesh(geometry, getMaterial(Math.random() * 0xffffff));
    mesh.overdraw = true;
    //mesh.position.x = 200;
	mesh.color = mesh.materials[0].color.getHex();
    objects.push(mesh);
    scene.add(mesh);
    plane = new THREE.Mesh(new THREE.PlaneGeometry(window.innerWidth, window.innerHeight, 8, 8), new THREE.MeshBasicMaterial({
        color: 0x000000,
        opacity: 0.50,
        transparent: true,
        wireframe: true
    }));

    plane.lookAt(camera.position);
    plane.visible = false;
    scene.add(plane)

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    //container.appendChild( renderer.domElement );
    renderer.sortObjects = false;
    projector = new THREE.Projector();


    renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
    renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
    renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);
	document.addEventListener( 'keydown', onDocumentKeyDown, false );
}

function getMaterial(color){
	return new THREE.MeshBasicMaterial({
        color: color,
		shading: THREE.FlatShading
    });
}

function onMenuForegroundColor()
 {
    cleanPopUps();

    foregroundColorSelector.show();
    foregroundColorSelector.container.style.left = ((window.innerWidth - foregroundColorSelector.container.offsetWidth) / 2) + 'px';
    foregroundColorSelector.container.style.top = ((window.innerHeight - foregroundColorSelector.container.offsetHeight) / 2) + 'px';

    isFgColorSelectorVisible = true;
}

function onMenuBackgroundColor(){}

// COLOR SELECTORS
function onForegroundColorSelectorChange(event)
 {  
	if(SELECTED){
		COLOR = foregroundColorSelector.getColor();
		COLOR = RGB2HTML(COLOR[0],COLOR[1],COLOR[2]);
		SELECTED.materials[0] = getMaterial(COLOR)
		setObjectData(SELECTED,'color', COLOR);
	}
}

function onBackgroundColorSelectorChange(event){}
function onMenuSave(){}
function onMenuLoad(){}
function onMenuClear()
 {
    //scene.objects=[];
	INTERSECTED = null;
	SELECTED = null;
    objects = [];
    scene = new THREE.Scene();
    //scene.fog = new THREE.Fog(0x000000, 1, 15000);


    //var light = new THREE.PointLight(0xff2200);
    //light.position.set(100, 100, 100);
    //scene.add(light);

   // var light = new THREE.AmbientLight(0x333333);
   // scene.add(light);

    parent = new THREE.Object3D();
    //parent.position.y = 50;
    objects.push(parent);
    scene.add(parent);

    plane = new THREE.Mesh(new THREE.PlaneGeometry(window.innerWidth, window.innerHeight, 8, 8), new THREE.MeshBasicMaterial({
        color: 0x000000,
        opacity: 0.25,
        transparent: true,
        wireframe: true
    }));
    plane.lookAt(camera.position);
    plane.visible = false;
    scene.add(plane);

    render();
}
function onMenuMouseOver()
 {
    isMenuMouseOver = true;
}

function onMenuMouseOut()
 {
    isMenuMouseOver = false;
}

function onDocumentDragEnter(event)
 {
    event.stopPropagation();
    event.preventDefault();
}

function onDocumentDragOver(event)
 {
    event.stopPropagation();
    event.preventDefault();
}
function cleanPopUps()
 {
	gui.close();
    if (isFgColorSelectorVisible)
    {
        foregroundColorSelector.hide();
        isFgColorSelectorVisible = false;
    }

    if (isBgColorSelectorVisible)
    {
        backgroundColorSelector.hide();
        isBgColorSelectorVisible = false;
    }
}

function animate() {

    requestAnimationFrame(animate);
    render();

}

function render() {
    renderer.render(scene, camera);
}

function setObjectData(object, property, value){
	var index = objects.indexOf(object);
	if(index >= 0){
		switch(property){
			case 'color':
			objects[index].materials[0] = new THREE.MeshBasicMaterial({
		        color: value
		    });
			objects[index].color = objects[index].materials[0].color.getHex();
			return true;
			break;
			case 'scale':
			//objects[object].materials[0] = new THREE.MeshBasicMaterial({
		    //    color: COLOR
		    //});
			return true;
			break;
			case 'rotation':
			return true;
			break;
		}
	}
	return false;
}
function getObject(object){
	var index = objects.indexOf(object);
	if(index>=0){
		return objects[index];
	}
	return null;
}
var DRAGGING = false;
function onDocumentMouseDown(event) {
    cleanPopUps();
    DRAGGING = true;
    event.preventDefault();

    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    projector.unprojectVector(vector, camera);

    var ray = new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize());

    var intersects = ray.intersectObjects(objects);

    if (intersects.length > 0) {

        SELECTED = intersects[0].object;
		SELECTED.currentColor = SELECTED.materials[0].color.getHex();
        SELECTED.materials[0] = new THREE.MeshBasicMaterial({
            color: 0xf5894e //RED
        });
        var intersects = ray.intersectObject(plane);
        offset.copy(intersects[0].point).subSelf(plane.position);

        container.style.cursor = 'move';

    } else {
		if (SELECTED) {
			SELECTED.materials[0].color.getHex(getObject(SELECTED).color)
		}
        SELECTED = null;
        if (event.shiftKey) {
            var intersects = ray.intersectScene(scene);
            if (intersects.length === 1) {
                clicks.push(intersects[0].point);
            }
        } else {
            clicks = [];
        }
    }

}
function onDocumentMouseMove(event) {

    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    projector.unprojectVector(vector, camera);

    var ray = new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize());

    if (SELECTED && DRAGGING) {
		action(ray);
        return;
    }

    var intersects = ray.intersectObjects(objects);

    if (intersects.length > 0) {

        if (INTERSECTED != intersects[0].object) {

            if (INTERSECTED) {
                INTERSECTED.materials[0].color.setHex(getObject(INTERSECTED).color);
            }

            INTERSECTED = intersects[0].object;
            var index = scene.objects.indexOf(INTERSECTED);
            plane.position.copy(INTERSECTED.position);

        }

        container.style.cursor = 'pointer';

    } else {

        if (INTERSECTED) {
			INTERSECTED.materials[0].color.setHex(getObject(INTERSECTED).color);
		}

        INTERSECTED = null;

        container.style.cursor = 'auto';

    }
    if (!event.shiftKey) {
        createObject(ray);
        clicks = [];
    }
    render();

}
function onDocumentMouseUp(event) {
    DRAGGING = false;
    event.preventDefault();

    if (INTERSECTED) {
        plane.position.copy(INTERSECTED.position);
        DRAG = null;
    }
    container.style.cursor = 'auto';
}
function onDocumentKeyDown(event){
    switch (event.keyCode){
		//actions
		case 65: //a
			controlsProps.selectionType = 0;
			CONTROLTYPE = 'MOVE';
			swoosh('MOVE');
			break;
		case 83://s
			controlsProps.selectionType = 1;
			CONTROLTYPE = 'SCALE';
			swoosh('SCALE');
			break;
		case 68://d
			controlsProps.selectionType = 2;
			CONTROLTYPE = 'ROTATE';
			swoosh('ROTATE');
			break;
		case 70://f
			controlsProps.selectionType = 2;
			CONTROLTYPE = 'WARP';
			swoosh('WARP');
			break;
		//objects
		case 49: //1
			controlsProps.objectType = 0;
			BRUSHTYPE = 'POINT';
			swoosh('POINT');
			break;
		case 50://2
			controlsProps.objectType = 1;
			BRUSHTYPE = 'LINE';
			swoosh('LINE');
			break;
		case 51://3
			controlsProps.objectType = 2;
			BRUSHTYPE = 'CIRCLE';
			swoosh('CIRCLE');
			break;
		case 52://4
			controlsProps.objectType = 3;
			BRUSHTYPE = 'POLYGON';
			swoosh('POLYGON');
			break;
		case 53: //5
			controlsProps.objectType = 4;
			BRUSHTYPE = 'RECTANGLE';
			swoosh('RECTANGLE');
			break;
		}
    }
function action(ray){
	switch(CONTROLTYPE){
		case 'MOVE':
			DRAG = SELECTED;
        	var intersects = ray.intersectObject(plane);
        	DRAG.position.copy(intersects[0].point.subSelf(offset));
		break;
		case 'ROTATE':
			DRAG = SELECTED;
			direction = new THREE.Vector3(mouse.x - DRAG.position.x, 0, -mouse.y - DRAG.position.y);
    		DRAG.rotation.z = Math.atan(direction.x/direction.z);
		break;
		case 'SCALE':
			DRAG = SELECTED;
			var intersects = ray.intersectObject(plane);
			pnt = intersects[0].point.subSelf(offset);
			direction = new THREE.Vector3(pnt.x - DRAG.position.x, 0, pnt.y - DRAG.position.y);
			if(direction.length() > 0.1){
    			DRAG.scale = new THREE.Vector3(direction.length()/radius,direction.length()/radius,direction.length()/radius);
			}
		break;
		case 'WARP':
		break;
	}
}

function createObject(ray) {
    switch (BRUSHTYPE) {
    case 'LINE':
        if (clicks.length > 1) {
            geometry = new THREE.Geometry();
            for (var i in clicks) {
                geometry.vertices.push(new THREE.Vertex(clicks[i]));
            }
            addLine(geometry, Math.random() * 0xffffff);
        }
        break;
    case 'POINT':
        if (clicks.length === 1) {
            addPoint(clicks, Math.random() * 0xffffff, 0, 0);
        }
        break;
    case 'CIRCLE':
		if (clicks.length === 1) {
			addSphere(ray);
		}
        break;
    case 'POLYGON':
        if (clicks.length > 3) {
            var californiaShape = new THREE.Shape(clicks);
            var california3d = new THREE.ExtrudeGeometry(californiaShape, {
                amount: 5
            });
            //var californiaPoints = californiaShape.createPointsGeometry();
            addMesh(california3d, Math.random() * 0xffffff, 0, 0);
        }
        break;
    case 'RECTANGLE':
        if (clicks.length > 1 && clicks.length < 5) {
            var rec = GetRectangle(clicks);
            geometry = new THREE.CubeGeometry(rec.xlength, rec.ylength, 5);
            mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
                color: Math.random() * 0xffffff
            }));
            mesh.position = new THREE.Vector3(rec.x, rec.y, 0);
			mesh.color = mesh.materials[0].color.getHex();
            objects.push(mesh);
            scene.add(mesh);
            //clicks[1] = new THREE.Vector3(clicks[0].x + center.xlength, clicks[0].y, clicks[0].z);
            //clicks[2] = new THREE.Vector3(clicks[1].x, clicks[1].y-center.ylength, clicks[1].z);
            //clicks[3] = new THREE.Vector3(clicks[2].x - center.xlength, clicks[2].y, clicks[2].z);
            //clicks.push(new THREE.Vector3(clicks[0]));
            //var californiaShape = new THREE.Shape(clicks);
            //var california3d = new THREE.ExtrudeGeometry( californiaShape, { amount: 5	} );
            //var californiaPoints = californiaShape.createPointsGeometry();
            //addMesh(california3d, Math.random() * 0xffffff , 0,0);
        }
        break;
    }
}

function addGeometry(geometry, points, spacedPoints, color, x, y, z, rx, ry, rz, s) {

    // 3d shape
    var mesh = new THREE.Mesh(geometry, [new THREE.MeshLambertMaterial({
        color: color
    }), new THREE.MeshBasicMaterial({
        color: 0x000000,
        wireframe: true
    })]);
    mesh.position.set(x, y, z - 75);
    mesh.rotation.set(rx, ry, rz);
    mesh.scale.set(s, s, s);
    objects.push(mesh);
    parent.add(mesh);

    // solid line
    var line = new THREE.Line(points, new THREE.LineBasicMaterial({
        color: color,
        linewidth: 2
    }));
    line.position.set(x, y, z + 25);
    line.rotation.set(rx, ry, rz);
    line.scale.set(s, s, s);
    parent.add(line);

    // transparent line from real points
    var line = new THREE.Line(points, new THREE.LineBasicMaterial({
        color: color,
        opacity: 0.5
    }));
    line.position.set(x, y, z + 75);
    line.rotation.set(rx, ry, rz);
    line.scale.set(s, s, s);
    parent.add(line);

    // vertices from real points
    var pgeo = THREE.GeometryUtils.clone(points);
    var particles = new THREE.ParticleSystem(pgeo, new THREE.ParticleBasicMaterial({
        color: color,
        size: 2,
        opacity: 0.75
    }));
    particles.position.set(x, y, z + 75);
    particles.rotation.set(rx, ry, rz);
    particles.scale.set(s, s, s);
    parent.add(particles);

    // transparent line from equidistance sampled points
    var line = new THREE.Line(spacedPoints, new THREE.LineBasicMaterial({
        color: color,
        opacity: 0.2
    }));
    line.position.set(x, y, z + 100);
    line.rotation.set(rx, ry, rz);
    line.scale.set(s, s, s);
    parent.add(line);

    // equidistance sampled points
    var pgeo = THREE.GeometryUtils.clone(spacedPoints);
    var particles2 = new THREE.ParticleSystem(pgeo, new THREE.ParticleBasicMaterial({
        color: color,
        size: 2,
        opacity: 0.5
    }));
    particles2.position.set(x, y, z + 100);
    particles2.rotation.set(rx, ry, rz);
    particles2.scale.set(s, s, s);
    parent.add(particles2);

}

function addSphere(ray){
	var intersects = ray.intersectObject(plane);
	center = intersects[0].point;
	geometry = new THREE.SphereGeometry(radius, 20, 20);
    mesh = new THREE.Mesh(geometry, getMaterial(Math.random() * 0xffffff));
    mesh.overdraw = true;
    mesh.position = center;
	mesh.color = mesh.materials[0].color.getHex();
    objects.push(mesh);
    scene.add(mesh);
}

function addLine(points, color) {
    // solid line
	var line = new THREE.Line(points, new THREE.LineBasicMaterial({
        color: color,
        linewidth: 2
    }));
    line.updateMatrix();
    //line.position.set( 0,0,0 );
    //line.data = "unfilled";
	line.color = mesh.materials[0].color.getHex();
    objects.push(line);
    parent.add(line);
}

function addMesh(geometry, color, centerx, centery) {
    var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
        color: color
    }));
    mesh.position.set(centerx, centery, 0);
	mesh.color = mesh.materials[0].color.getHex();
    objects.push(mesh);
    parent.add(mesh);
}

function addPoint(point, color, centerx, centery) {
    var geometry = new THREE.SphereGeometry(5, 5, 5);
    var p = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
        color: color
    }));
    p.position = point[0];
    p.data = "unassigned";
	p.color = mesh.materials[0].color.getHex();
    //var particles = new THREE.ParticleSystem( point, new THREE.ParticleBasicMaterial( { color: color, size: 2, opacity: 1 } ) );
    //particles.position.set( centerx, centery, 0 );
    objects.push(p);
    parent.add(p);
}

function GetCenter(points) {
    var maxX = maxY = -1e6;
    var minX = minY = 1e6;

    for (var i in points) {
        if (points[i].x > maxX) {
            maxX = points[i].x;
        }
        if (points[i].x < minX) {
            minX = points[i].x;
        }
        if (points[i].y > maxY) {
            maxY = points[i].y;
        }
        if (points[i].y < minY) {
            minY = points[i].y;
        }
    }

    ret = {
        x: (maxX - minX) / 2.0,
        y: (maxY - minY) / 2.0,
    };
    return ret;
}

function GetRectangle(points) {
    var maxX = maxY = -1e6;
    var minX = minY = 1e6;

    for (var i in points) {
        if (points[i].x > maxX) {
            maxX = points[i].x;
        }
        if (points[i].x < minX) {
            minX = points[i].x;
        }
        if (points[i].y > maxY) {
            maxY = points[i].y;
        }
        if (points[i].y < minY) {
            minY = points[i].y;
        }
    }

    ret = {
        x: (maxX - minX) / 2.0,
        y: (maxY - minY) / 2.0,
        xlength: Math.abs(maxX - minX),
        ylength: Math.abs(maxY - minY)
    };
    return ret;
}