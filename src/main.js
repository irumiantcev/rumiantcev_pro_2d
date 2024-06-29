import { k } from './kaboomCtx';
import { dialogueData, scaleFactor } from './constants';
import { displayDialogue, setCamScale } from './utils';

k.loadSprite('spritesheet', './spritesheet.png', {
    sliceX: 39,
    sliceY: 31,
    anims: {
        'idle-down': 940,
        'walk-down': { from: 940, to: 943, loop: true, speed: 8 },
        'idle-side': 979,
        'walk-side': { from: 979, to: 982, loop: true, speed: 8 },
        'idle-up': 1018,
        'walk-up': { from: 1018, to: 1021, loop: true, speed: 8 },
    },
});

k.loadSprite('map', './map.png');

k.setBackground(k.Color.fromHex('#311047'));

k.scene('main', async () => {
    const mapData = await (await fetch('./map.json')).json();
    const layers = mapData.layers;

    const map = k.make([k.sprite('map'), k.pos(0), k.scale(scaleFactor)]);

    const player = k.make([
        k.sprite('spritesheet', { anim: 'idle-down' }),
        k.area({
            shape: new k.Rect(k.vec2(0, 3), 10, 10),
        }),
        k.body(),
        k.anchor('center'),
        k.pos(),
        k.scale(scaleFactor),
        { speed: 250, direction: 'down', isInDialogue: false },
        'player',
    ]);

    k.add(map);

    for (const layer of layers) {
        if (layer.name === 'boundaries') {
            for (const boundary of layer.objects) {
                map.add([
                    k.area({
                        shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
                    }),
                    k.body({ isStatic: true }),
                    k.pos(boundary.x, boundary.y),
                    boundary.name,
                ]);

                if (boundary.name) {
                    player.onCollide(boundary.name, () => {
                        if (boundary.name !== 'wall') {
                            player.isInDialogue = true;
                            displayDialogue(dialogueData[boundary.name], () => (player.isInDialogue = false));
                        } else {
                            mousePos = null;
                            isMouseReleased = false;
                            stopAnim();
                        }
                    });
                }
            }

            continue;
        }

        if (layer.name === 'spawnpoints') {
            for (const entity of layer.objects) {
                if (entity.name === 'player') {
                    player.pos = k.vec2((map.pos.x + entity.x) * scaleFactor, (map.pos.y + entity.y) * scaleFactor);
                    k.add(player);

                    continue;
                }
            }
        }
    }

    setCamScale(k);

    player.isInDialogue = true;
    displayDialogue(dialogueData['greeting'], () => (player.isInDialogue = false));

    k.onResize(() => {
        setCamScale(k);
    });

    const stopAnim = () => {
        if (player.direction === 'down') {
            player.play('idle-down');

            return;
        }

        if (player.direction === 'up') {
            player.play('idle-up');

            return;
        }

        player.play('idle-side');
    };

    let isMouseReleased = false;
    let mousePos = null;
    let previousPos = null;

    k.onMouseRelease(mouseBtn => {
        if (mouseBtn !== 'left' || player.isInDialogue) return;

        isMouseReleased = true;
        mousePos = k.toWorld(k.mousePos());
    });

    k.onUpdate(() => {
        k.camPos(player.pos.x, player.pos.y + 50);

        if (isMouseReleased) {
            player.moveTo(mousePos, player.speed);

            if (!previousPos) {
                previousPos = player.pos;
            }

            const mouseAngle = player.pos.angle(mousePos);

            const lowerBound = 50;
            const upperBound = 125;

            if (mouseAngle > lowerBound && mouseAngle < upperBound && player.curAnim() !== 'walk-up' && mouseAngle !== 0) {
                player.play('walk-up');
                player.direction = 'up';
            } else if (mouseAngle < -lowerBound && mouseAngle > -upperBound && player.curAnim() !== 'walk-down' && mouseAngle !== 0) {
                player.play('walk-down');
                player.direction = 'down';
            } else if (Math.abs(mouseAngle) > upperBound && mouseAngle !== 0) {
                player.flipX = false;

                if (player.curAnim() !== 'walk-side') {
                    player.play('walk-side');
                }
                player.direction = 'right';
            } else if (Math.abs(mouseAngle) < lowerBound && mouseAngle !== 0) {
                player.flipX = true;

                if (player.curAnim() !== 'walk-side') {
                    player.play('walk-side');
                }
                player.direction = 'left';
            }

            if ((player.pos.x === mousePos.x && player.pos.y === mousePos.y) || player.isInDialogue) {
                mousePos = null;
                isMouseReleased = false;

                stopAnim();
            }
        }
    });

    k.onKeyDown(() => {
        const keyMap = [
            k.isKeyDown('right'),
            k.isKeyDown('left'),
            k.isKeyDown('up'),
            k.isKeyDown('down'),
            k.isKeyDown('w'),
            k.isKeyDown('d'),
            k.isKeyDown('s'),
            k.isKeyDown('a'),
        ];

        let nbOfKeyPressed = 0;
        for (const key of keyMap) {
            if (key) {
                nbOfKeyPressed++;
            }
        }

        if (nbOfKeyPressed > 1) return;

        if (player.isInDialogue) return;

        if (k.isKeyDown('right') || k.isKeyDown('d')) {
            player.flipX = false;

            if (player.curAnim() !== 'walk-side') {
                player.play('walk-side');
            }

            player.direction = 'right';
            player.move(player.speed, 0);

            return;
        }

        if (k.isKeyDown('left') || k.isKeyDown('a')) {
            player.flipX = true;

            if (player.curAnim() !== 'walk-side') {
                player.play('walk-side');
            }
            player.direction = 'left';
            player.move(-player.speed, 0);

            return;
        }

        if (k.isKeyDown('up') || k.isKeyDown('w')) {
            if (player.curAnim() !== 'walk-up') {
                player.play('walk-up');
            }

            player.direction = 'up';
            player.move(0, -player.speed);

            return;
        }

        if (k.isKeyDown('down') || k.isKeyDown('s')) {
            if (player.curAnim() !== 'walk-down') {
                player.play('walk-down');
            }

            player.direction = 'down';
            player.move(0, player.speed);

            return;
        }
    });

    k.onKeyRelease(stopAnim);
});

k.go('main');
