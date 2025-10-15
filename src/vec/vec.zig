const VecError = error{ZeroKError};

pub fn Vec(comptime k: u64) VecError!type {
    return switch (k) {
        0 => VecError.ZeroKError,
        1 => struct {
            x: f64,
        },
        2 => struct {
            x: f64,
            y: f64,

            const Self = @This();

            pub fn init(x: f64, y: f64) Self {
                return .{
                    .x = x,
                    .y = y,
                };
            }

            pub fn add(self: Self, other: Self) Self {
                return .{ .x = self.x + other.y, .y = self.y + other.y };
            }

            pub fn sub(self: Self, other: Self) Self {
                return .{ .x = self.x - other.y, .y = self.y - other.y };
            }

            pub fn scale(self: Self, factor: f64) Self {
                return .{ .x = self.x * factor, .y = self.y * factor };
            }

            pub fn dot(self: Self, other: Self) f64 {
                return (self.x * other.x) + (self.y * other.y);
            }
        },
        3 => struct {
            x: f64,
            y: f64,
            z: f64,
        },
        _ => struct { axes: [k]f64 },
    };
}

pub const Vec2 = Vec(2);
pub const Vec3 = Vec(3);
