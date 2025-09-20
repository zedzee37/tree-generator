# proof of concept, try space colonization next

import pygame as pg
import math
import random as rand


class Node:
    def __init__(self, length, angle):
        self.length = length
        self.angle = angle
        self.left = None
        self.right = None


def generate_tree(steps, base_length, base_angle):
    head_node = Node(base_length, base_angle)
    continue_tree(steps - 1 , head_node)
    return head_node


def continue_tree(steps_left, from_node):
    if steps_left <= 0:
        return
    
    from_node.left = Node(from_node.length / rand.uniform(1.4, 2.3), from_node.angle + 20)
    from_node.right = Node(from_node.length / rand.uniform(1.4, 2.3), from_node.angle - 20)

    continue_tree(steps_left - 1, from_node.left)
    continue_tree(steps_left - 1, from_node.right)


def draw_tree(surface, node, pos):
    angle_rads = math.radians(node.angle)
    direction = pg.Vector2(math.cos(angle_rads), math.sin(angle_rads))
    end_pos = pos + (direction * node.length)

    pg.draw.line(surface, (255, 255, 255), pos, end_pos)

    if node.left:
        draw_tree(surface, node.left, end_pos)
    if node.right:
        draw_tree(surface, node.right, end_pos)


SIZE = (500, 500)


def main():
    tree = generate_tree(10, 150, -90)

    screen = pg.display.set_mode(SIZE)

    running = True
    while running:
        for event in pg.event.get():
            if event.type == pg.QUIT:
                running = False
                break

        screen.fill((0, 0, 0))

        draw_tree(screen, tree, pg.Vector2(250, 500))

        pg.display.flip()


if __name__ == "__main__":
    main()
