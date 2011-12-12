        var gl;
        function initGL(canvas) {
            try {
                gl = canvas.getContext("experimental-webgl");
                gl.viewportWidth = canvas.width;
                gl.viewportHeight = canvas.height;

                gl.shaderTypeMap = {
                     "text/x-fragment": gl.FRAGMENT_SHADER,
                     "text/x-vertex": gl.VERTEX_SHADER
                 };

                gl.getShaderType = function (shaderScript) {
                    return this.shaderTypeMap[shaderScript.type];
                };

                gl.shaderFromElementID = function(id) {
                        var shaderScript = document.getElementById(id);
                        if (!shaderScript) {
                            return null;
                        }
                        var shaderType = this.getShaderType(shaderScript);
                        var shader = shaderType && this.createShader(shaderType);

                        gl.shaderSource(shader, this.getShaderText(shaderScript));
                        gl.compileShader(shader);

                        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                            alert(gl.getShaderInfoLog(shader));
                            return null;
                        }

                        return shader;
                    };
                gl.getShaderText = function(shaderScript) {
                    var str = "";
                    var k = shaderScript.firstChild;
                    while (k) {
                        if (k.nodeType == 3) {
                            str += k.textContent;
                        }
                        k = k.nextSibling;
                    }
                    return str;
                };


            } catch (e) {
            }
            if (!gl) {
                alert("Could not initialise WebGL, sorry :-(");
            }
        }

        var shaderProgram;
        function initShaders() {
            var fragmentShader = gl.shaderFromElementID("shader-fs");
            var vertexShader = gl.shaderFromElementID("shader-vs");

            shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                alert("Could not initialise shaders");
            }

            gl.useProgram(shaderProgram);

            shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
            gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

            shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
            gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

            shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
            shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
            shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
        }

        var ourTexture;
        function initTexture() {
            try{
           var texture = ourTexture = gl.createTexture();
            var side = 512;
                var count = side*side;
            var arrBuff = new ArrayBuffer(count*2);
            var sixteenBuffer = new Int16Array(arrBuff);
            var ourbuffer = new Uint8Array(arrBuff);

            var stepSize = 65536 / count;
            var val = -32768;
            for(var t = 0 ; t< count; t++) {

//                   sixteenBuffer[t] = t;
//                val += stepSize;
                sixteenBuffer[t] = (t<<(t>>14));
            }
                   gl.bindTexture(gl.TEXTURE_2D, texture);
           //     gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texImage2D(gl.TEXTURE_2D,0, gl.LUMINANCE_ALPHA,
                        side,side, 0,
                        gl.LUMINANCE_ALPHA,gl.UNSIGNED_BYTE,ourbuffer);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.bindTexture(gl.TEXTURE_2D, null);
        } catch(e) { alert(e.toString());}


        }

        var dualUseVertexBuffer;
        var indexBuffer;
        function initBuffers() {

            dualUseVertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, dualUseVertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0,1,0,1,1,0,1]), gl.STATIC_DRAW);
            dualUseVertexBuffer.itemSize = 2;
            dualUseVertexBuffer.numItems = 4;

            indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,0,2,3]), gl.STATIC_DRAW);
            indexBuffer.itemSize = 1;
            indexBuffer.numItems = 6;
        }

        var mvMatrix = mat4.create();
        var pMatrix = mat4.create();
        function drawScene() {
            gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            //mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

            mat4.identity(pMatrix);

            mat4.identity(mvMatrix);
        //    mat4.translate(mvMatrix, [-.5,-.5, -0.1]);
            mat4.translate(mvMatrix, [-1, -1, -0.1]);
            mat4.scale(mvMatrix,[2,2,2]);

            gl.bindBuffer(gl.ARRAY_BUFFER, dualUseVertexBuffer);
            gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, dualUseVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, ourTexture);
            gl.uniform1i(shaderProgram.samplerUniform, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
            gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
            gl.drawElements(gl.TRIANGLES, indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        }

        function tick() {
            requestAnimFrame(tick);
            drawScene();
        }


        function webGLStart() {
            var canvas = document.getElementById("lesson05-canvas");
            initGL(canvas);
            initShaders();
            initBuffers();
            initTexture();

            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.enable(gl.DEPTH_TEST);

            tick();
        }
