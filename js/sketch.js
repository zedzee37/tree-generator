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

			resultQuads.push(scaledQuad);
			resultQuads.push(scaledQuad.offset(createVector(width, 0)));
			resultQuads.push(scaledQuad.offset(createVector(0, height)));
			resultQuads.push(scaledQuad.offset(createVector(width, height)));

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

	return [startPoint, ...points, endPoint];
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

function setup() {
	createCanvas(400, 400);
}

function draw() {
	background(220);

	let pts = [
		createVector(0, 0),
		createVector(10, 10),
		createVector(60, 30),
		createVector(100, 100),
		createVector(mouseX, mouseY),
	];

	strokeWeight(5);
	let spline = getCatmullRomSpline(pts, 10);

	drawPoints(spline, createVector(0, 0));
	// drawPoints(pts, createVector(0, 0));
}
