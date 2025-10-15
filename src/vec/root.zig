const vec = @import("vec.zig");

const Vec2 = vec.Vec2;
const Vec3 = vec.Vec3;

pub fn Vec(comptime k: u64) type {
    return vec.Vec(k);
}
