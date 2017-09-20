var app = new Vue({
    el: '#app1',
    data: {
        address: 'ws://localhost:9090',
        state: 'disconnected',
        ros: {},
        pose: {
            x: 0,
            y: 0,
            linear_velocity: 0,
            angular_velocity: 0,
            theta: 0
        },
        line: 0,
        angle: 0,
        backgroundB: 255,
        backgroundG: 86,
        backgroundR: 69,
        loopMove: null,
        alongMoving: false
    },
    methods: {
        connect() {
            var vm = this;
            vm.ros = new ROSLIB.Ros({
                url: vm.address
            });

            vm.ros.on('connection', function() {
                vm.state = 'success';
                console.log(vm.state);
                vm.getPose();
            });

            vm.ros.on('error', function(error) {
                console.log('Error connecting to websocket server: ', error);
            });

            vm.ros.on('close', function() {
                console.log('Connection to websocket server closed.');
            });
        },
        moveOnce() {
            var vm = this;
            lineSpd = parseFloat(vm.line);
            angleSpd = parseFloat(vm.angle);
            var cmdVel = new ROSLIB.Topic({
                ros: vm.ros,
                name: '/turtle1/cmd_vel',
                messageType: 'geometry_msgs/Twist'
            });
            var twist = new ROSLIB.Message({
                linear: {
                    x: lineSpd,
                    y: 0.0,
                    z: 0.0
                },
                angular: {
                    x: 0.0,
                    y: 0.0,
                    z: angleSpd
                }
            });
            vm.alongMoving = true;
            cmdVel.publish(twist);
            setTimeout(() => { vm.alongMoving = false }, 999);
        },
        moveAlong() {
            var vm = this;
            vm.moveOnce();
            vm.loopMove = setInterval(vm.moveOnce, 1000);
        },
        moveStop() {
            var vm = this;
            clearInterval(vm.loopMove);
        },
        setColor() {
            var vm = this;
            var bgB = new ROSLIB.Param({
                ros: vm.ros,
                name: 'background_b'
            });
            var bgG = new ROSLIB.Param({
                ros: vm.ros,
                name: 'background_g'
            });
            var bgR = new ROSLIB.Param({
                ros: vm.ros,
                name: 'background_r'
            });

            bgB.set(parseInt(vm.backgroundB));
            bgG.set(parseInt(vm.backgroundG));
            bgR.set(parseInt(vm.backgroundR));

            vm.clearBoard();
            document.getElementById('canvas').style.backgroundColor = 'rgb(' + vm.backgroundR + ', ' + vm.backgroundG + ', ' + vm.backgroundB + ')';
        },
        clearBoard() {
            var vm = this;
            var clearing = new ROSLIB.Service({
                ros: vm.ros,
                name: '/clear',
                serviceType: 'std_srvs/Empty'
            });
            var request = new ROSLIB.ServiceRequest();
            clearing.callService(request, () => {
                console.log('cleared');
            });
        },
        getPose() {
            var vm = this;
            var listener = new ROSLIB.Topic({
                ros: vm.ros,
                name: '/turtle1/pose',
                messageType: 'turtlesim/Pose'
            });

            listener.subscribe(function(message) {
                vm.pose = message;
                document.getElementById('turtle').style.paddingLeft = (vm.pose.x * 45.090179412795976) + 'px';
                document.getElementById('turtle').style.paddingTop = (500 - (vm.pose.y * 45.090179412795976)) + 'px';
                document.getElementById('turtleImage').style.transform = 'rotate(' + ((-vm.pose.theta * 57.2958)+90) + 'deg';
                //console.log('Received message on ' + listener.name + ': ' + JSON.stringify(message));
                //listener.unsubscribe();
            });
            
        }
    },
    created() {
        console.log('23333');
        this.connect();
    }
});
