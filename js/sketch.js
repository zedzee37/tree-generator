function Quad(p1, p2) {
	return {
		p1: p1,
		p2: p2,

		intersects: function (p) {
			if (p.x < this.p1.x || p.y < this.p1.y) {
				return false;
			}

			if (p.x > this.p2.x || p.y > this.p2.y) {
				return false;
			}

			return true;
		},

		draw: function (offset) {
			let offsetP1 = p5.Vector.add(this.p1, offset);

			rect(offsetP1.x, offsetP1.y, this.width(), this.height());
		},

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

		scale: function (factor) {
			return Quad(
				p5.Vector.mult(this.p1, factor),
				p5.Vector.mult(this.p2, factor),
			);
		},

		offset: function (v) {
			return Quad(p5.Vector.add(this.p1, v), p5.Vector.add(this.p2, v));
		},

		width: function () {
			return abs(this.p2.x - this.p1.x);
		},

		height: function () {
			return abs(this.p2.y - this.p1.y);
		},
	};
}

function setup() {
	createCanvas(400, 400);
	parentQuad = Quad(createVector(0.0, 0.0), createVector(100, 100));
	childrenQuads = parentQuad.split();
	childChildQuads = childrenQuads[0].split();
}

function draw() {
	background(220);
	parentQuad.draw(createVector(100, 100));

	childrenQuads.forEach((quad) => {
		quad.draw(createVector(100, 200));
	});

	childChildQuads.forEach((quad) => {
		quad.draw(createVector(100, 200));
	});
}
