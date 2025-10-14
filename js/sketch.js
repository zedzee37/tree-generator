/**
 *
 * @param {Vector} p1
 * @param {Vector} p2
 * @returns
 */
function Quad(p1, p2) {
    return {
        p1: p1,
        p2: p2,

        /**
         *
         * @param {Vector} p
         * @returns {boolean}
         */
        intersects: function (p) {
            if (p.x < this.p1.x || p.y < this.p1.y) {
                return false;
            }

            if (p.x > this.p2.x || p.y > this.p2.y) {
                return false;
            }

            return true;
        },

        /**
         *
         * @param {Vector} offset
         */
        draw: function (offset) {
            let offsetP1 = p5.Vector.add(this.p1, offset);

            rect(offsetP1.x, offsetP1.y, this.width(), this.height());
        },

        /**
         *
         * @returns {Array<Quad>}
         */
        split: function () {
            let resultQuads = [];

            let scaledQuad = this.scale(0.5);

            let width = scaledQuad.width();
            let height = scaledQuad.height();

            let p1Scaled = p5.Vector.mult(p1, 0.5);
            resultQuads.push(scaledQuad.offset(p1Scaled));
            resultQuads.push(
                scaledQuad.offset(createVector(width, 0)).offset(p1Scaled),
            );
            resultQuads.push(
                scaledQuad.offset(createVector(0, height)).offset(p1Scaled),
            );
            resultQuads.push(
                scaledQuad.offset(createVector(width, height)).offset(p1Scaled),
            );

            return resultQuads;
        },

        /**
         *
         * @param {number} factor
         * @returns {Quad}
         */
        scale: function (factor) {
            return Quad(
                p5.Vector.mult(this.p1, factor),
                p5.Vector.mult(this.p2, factor),
            );
        },

        /**
         *
         * @param {Vector} v
         * @returns {Quad}
         */
        offset: function (v) {
            return Quad(p5.Vector.add(this.p1, v), p5.Vector.add(this.p2, v));
        },

        /**
         *
         * @returns {number}
         */
        width: function () {
            return abs(this.p2.x - this.p1.x);
        },

        /**
         *
         * @returns {number}
         */
        height: function () {
            return abs(this.p2.y - this.p1.y);
        },
    };
}

/**
 *
 * @param {number} maxFill
 * @param {Quad} maxBounds
 * @returns {object}
 */
function QuadTree(maxFill, maxBounds) {
    return {
        head: QuadNode(maxBounds, maxFill),

        insert: function (point) {
            this.head.insert(point);
        },
    };
}

/**
 *
 * @param {Vector} bounds
 * @returns {object}
 */
function QuadNode(bounds, maxFill) {
    return {
        children: new Set([]),
        childNodes: [],
        maxFill: maxFill,
        quad: bounds,

        split: function () {
            let splitQuads = this.quad.split();

            for (let i = 0; i < splitQuads.length; i++) {
                let quad = splitQuads[i];
                this.childNodes.push(QuadNode(quad, this.maxFill));
            }

            this.children.forEach((point) => {
                let targetChild;
                for (let j = 0; j < this.childNodes.length; j++) {
                    let node = this.childNodes[j];

                    if (node.quad.intersects(point)) {
                        targetChild = node;
                        break;
                    }
                }

                if (targetChild == null) {
                    return;
                }

                targetChild.insert(point);
            });

            // means you cannot insert into this
            this.children = null;
        },

        /**
         *
         * @param {Vector} point
         *
         */
        insertToChildren: function (point) {
            for (let i = 0; i < this.childNodes.length; i++) {
                let node = this.childNodes[i];
                if (node.insert(point)) {
                    return true;
                }
            }
            return false;
        },

        /**
         *
         * @param {Vector} point
         * @returns {boolean}
         */
        insert: function (point) {
            if (!this.quad.intersects(point)) {
                return false;
            }

            if (this.children == null) {
                return this.insertToChildren(point);
            }

            if (
                this.children.size + 1 > this.maxFill &&
                !this.children.has(point)
            ) {
                this.split();
                return this.insertToChildren(point);
            }

            this.children.add(point);
            return true;
        },
    };
}

/**
 *
 * @param {Array<Vector>} points
 * @param {number} inbetweenPointCount
 * @returns {Array<Vector>}
 */
function getCatmullRomSpline(points, inbetweenPointCount) {
    if (!Array.isArray(points) || points.length <= 1) {
        return [];
    }

    points = extrapolateEndPoints(points);
    if (points.length === 0) {
        return [];
    }

    let timeStep = 1 / (inbetweenPointCount + 1);
    let pts = [];

    for (let i = 1; i < points.length - 2; i++) {
        let p0 = points[i];
        let p1 = points[i + 1];
        let v0 = p5.Vector.mult(approxPointVelocity(points, i), 0.5);
        let v1 = p5.Vector.mult(approxPointVelocity(points, i + 1), 0.5);

        pts.push(p0);

        for (let j = 0; j < inbetweenPointCount; j++) {
            let t = (j + 1) * timeStep;

            let t2 = t * t;
            let t3 = t2 * t;

            let h00 = 2 * t3 - 3 * t2 + 1;
            let h10 = t3 - 2 * t2 + t;
            let h01 = -2 * t3 + 3 * t2;
            let h11 = t3 - t2;

            let term0 = p5.Vector.mult(p0, h00);
            let term1 = p5.Vector.mult(v0, h10);
            let term2 = p5.Vector.mult(p1, h01);
            let term3 = p5.Vector.mult(v1, h11);

            let pt = p5.Vector.add(term0, term1).add(term2).add(term3);

            pts.push(pt);
        }
    }

    // Add final point
    pts.push(points[points.length - 2]);

    return pts;
}

/**
 *
 * @param {Array<Vector>} points
 * @returns {Array<Vector>}
 */
function extrapolateEndPoints(points) {
    if (points.length <= 1) {
        return [];
    }

    let startPoint = points[0];
    let nextPoint = points[1];
    let startPointSlope = p5.Vector.sub(startPoint, nextPoint);
    let extrapolatedStartPoint = p5.Vector.add(startPoint, startPointSlope);

    let endPoint = points[points.length - 1];
    let prevPoint = points[points.length - 2];
    let endPointSlope = p5.Vector.sub(endPoint, prevPoint);
    let extrapolatedEndPoint = p5.Vector.add(endPoint, endPointSlope);

    return [extrapolatedStartPoint, ...points, extrapolatedEndPoint];
}

/**
 *
 * @param {Array<Vector>} points
 * @param {number} i
 * @returns {Vector | null}
 */
function approxPointVelocity(points, i) {
    if (i <= 0 || i >= points.length - 1) {
        return null;
    }

    var prevPoint = points[i - 1];
    var nextPoint = points[i + 1];

    return p5.Vector.sub(nextPoint, prevPoint);
}

/**
 *
 * @param {Array<Vector>} points
 * @param {Vector} offset
 */
function drawPoints(points, offset) {
    let prevPoint = offset;
    for (let i = 0; i < points.length; i++) {
        let point = p5.Vector.add(points[i], offset);

        line(prevPoint.x, prevPoint.y, point.x, point.y);

        prevPoint = point;
    }
}

/**
 *
 * @param {QuadNode} quadNode
 */
function drawQuadTree(quadNode) {
    if (quadNode.children != null) {
        quadNode.quad.draw(createVector(0, 0));
        quadNode.children.forEach((point) => {
            circle(point.x, point.y, 5);
        });
    }

    if (quadNode.childNodes != undefined) {
        quadNode.childNodes.forEach((node) => drawQuadTree(node));
    }
}

function setup() {
    quadTree = QuadTree(1, Quad(createVector(0, 0), createVector(400, 400)));
    quadTree.insert(createVector(210, 90));
    quadTree.insert(createVector(50, 50));
    quadTree.insert(createVector(49, 50));
    quadTree.insert(createVector(390, 80));

    createCanvas(400, 400);
}

function draw() {
    background(220);

    drawQuadTree(quadTree.head);
}
