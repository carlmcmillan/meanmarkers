L.MeanMarker = L.Marker.extend({
    options: {
        icon: null
    },

    uuid: '',
    iconXOffset: 25,
    iconYOffset: 50,

    WIDTH: 50,
    HEIGHT: 50,

    meanMarkerContainer: null,
    renderer: null,
    camera: null,
    icon: null,
    pointLight: null,
    scene: null,

    initialize: function (options) {
        this.uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        var markerDiv = '<div id="mean-marker-' + this.uuid + '"></div>';
        var iconXOffset = this.iconXOffset;
        var iconYOffset = this.iconYOffset;
        this.options.icon = L.divIcon({
            className: 'mean-marker',
            html: markerDiv,
            iconAnchor: [iconXOffset, iconYOffset]
        });
        L.Marker.prototype.initialize.call(this, options);
    },

    addTo: function (map) {
        map.addLayer(this);
        this._loadScene();
        return this;
    },

    _initContainer: function () {
        this.meanMarkerContainer = document.getElementById('mean-marker-' + this.uuid);
    },

    _setupRenderer: function () {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.WIDTH, this.HEIGHT);
        this.meanMarkerContainer.appendChild(this.renderer.domElement);
    },

    _setupCamera: function () {
        var VIEW_ANGLE = 45,
            ASPECT = this.WIDTH / this.HEIGHT,
            NEAR = 0.1,
            FAR = 10000;

        this.camera = new THREE.PerspectiveCamera(
            VIEW_ANGLE,
            ASPECT,
            NEAR,
            FAR
        );

        this.camera.position.z = 300;

        this.scene.add(this.camera);
    },

    _setupLight: function () {
        this.pointLight = new THREE.PointLight(0xFFFFFF);

        this.pointLight.position.x = 30;
        this.pointLight.position.y = 50;
        this.pointLight.position.z = 230;

        this.scene.add(this.pointLight);
    },

    _rotateAroundWorldAxis: function (object, axis, radians) {
        var rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeRotationAxis(axis.normalize(), radians);
        rotationMatrix.multiply(object.matrix);
        object.matrix = rotationMatrix;
        object.rotation.setEulerFromRotationMatrix(object.matrix);
    },

    _animateMarker: function () {
        var yAxis = new THREE.Vector3(0, 1, 0);
        this._rotateAroundWorldAxis(this.icon, yAxis, Math.PI / 180);
    },

    _update: function () {
        requestAnimFrame(this._update.bind(this));
        this.renderer.render(this.scene, this.camera);
        this._animateMarker();
    },

    _loadScene: function () {
        this.scene = new THREE.Scene();

        this._initContainer();
        this._setupRenderer();
        this._setupCamera();
        this._setupLight();

        var loader = new THREE.JSONLoader();
        var that = this;

        loader.load("../markers/monkey.json", function (geometry) {
            that.icon = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
            that.icon.scale.set(100, 100, 100);
            that.scene.add(that.icon);
            that._update();
        });
    }
});

L.meanMarker = function (latlng, options) {
    return new L.MeanMarker(latlng, options);
};


// Paul Irish shim
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();
