function build_robot(){
    if(money[0] >= 100){
        money[0] -= 100;

        p0_units.push([
            p0_buildings[0][0] + p0_buildings[0][2] / 2,// x
            p0_buildings[0][1] + p0_buildings[0][3] / 2,// y
            0,// selected?
            p0_buildings[0][6] != null ? p0_buildings[0][6] : p0_buildings[0][0],// destination x
            p0_buildings[0][7] != null ? p0_buildings[0][7] : p0_buildings[0][1],// destination y
            0,// weapon reload
            100// health
        ]);
    }
}

function draw(){
    if(money_timer > 99){
        money_timer = 0;
        money[0] += 1;
        money[1] += 1;
    }else{
        money_timer += 1;
    }

    if(key_down && camera_y > -settings[3]){
        camera_y -= settings[1];
        mouse_lock_y -= settings[1];
    }

    if(key_left && camera_x < settings[3]){
        camera_x += settings[1];
        mouse_lock_x += settings[1];
    }

    if(key_right && camera_x > -settings[3]){
        camera_x -= settings[1];
        mouse_lock_x -= settings[1];
    }

    if(key_up && camera_y < settings[3]){
        camera_y += settings[1];
        mouse_lock_y += settings[1];
    }

    if(mouse_hold == 1){
        select();
    }

    if(settings[5]){// clear?
        buffer.clearRect(
            0,
            0,
            width,
            height
        );
    }

    j = x + camera_x;
    q = y + camera_y;
    buffer.translate(
        j,
        q
    );

    i = world_static.length - 1;
    if(i >= 0){
        do{
            // if static world object is on screen, draw it
            if(world_static[i][0] + world_static[i][2] + j > 0
             && world_static[i][0] + j < width
             && world_static[i][1] + world_static[i][3] + q > 0
             && world_static[i][1] + q < height){
                buffer.fillStyle = world_static[i][4];
                buffer.fillRect(
                    world_static[i][0],
                    world_static[i][1],
                    world_static[i][2],
                    world_static[i][3]
                );
            }
        }while(i--);
    }

    i = p1_buildings.length - 1;
    if(i >= 0){
        if(ai_build_robot >= 230){
            ai_build_robot = 0;

            if(money[1] >= 100){
                money[1] -= 100;
                p1_units.push([
                    p1_buildings[0][0] + p1_buildings[0][2] / 2,// x
                    p1_buildings[0][1] + p1_buildings[0][3] / 2,// y
                    random_number(settings[3] * 2) - settings[3],// destination x
                    random_number(settings[3] * 2) - settings[3],// destination y
                    0,// weapon reload
                    100// health
                ]);
            }

        }else{
            ai_build_robot += 1;
        }

        do{
            // if building is on screen, draw it
            if(p1_buildings[i][0] + p1_buildings[i][2] + j > 0
             && p1_buildings[i][0] + j < width
             && p1_buildings[i][1] + p1_buildings[i][3] + q > 0
             && p1_buildings[i][1] + q < height){
                buffer.fillStyle = '#600';
                buffer.fillRect(
                    p1_buildings[i][0],
                    p1_buildings[i][1],
                    p1_buildings[i][2],
                    p1_buildings[i][3]
                );
                buffer.fillStyle = '#0f0';
                buffer.fillRect(
                    p1_buildings[i][0],
                    p1_buildings[i][1] - 10,
                    p1_buildings[i][2] * (p1_buildings[i][4] / 1000),
                    5
                );
            }
        }while(i--);
    }

    buffer.strokeStyle = '#ddd';
    i = p0_buildings.length - 1;
    if(i >= 0){
        do{
            // if building is on screen, draw it
            if(p0_buildings[i][0] + p0_buildings[i][2] + j > 0
             && p0_buildings[i][0] + j < width
             && p0_buildings[i][1] + p0_buildings[i][3] + q > 0
             && p0_buildings[i][1] + q < height){
                buffer.fillStyle = p0_buildings[i][5] ? '#1f1' : '#060';
                buffer.fillRect(
                    p0_buildings[i][0],
                    p0_buildings[i][1],
                    p0_buildings[i][2],
                    p0_buildings[i][3]
                );
                buffer.fillStyle = '#0f0';
                buffer.fillRect(
                    p0_buildings[i][0],
                    p0_buildings[i][1] - 10,
                    p0_buildings[i][2] * (p0_buildings[i][4] / 1000),
                    5
                );
            }
        }while(i--);
    }

    i = p1_units.length - 1;
    if(i >= 0){
        do{
            // if reloading, decrease reload
            if(p1_units[i][4] > 0){
                p1_units[i][4] -= 1;

            // else look for nearby p0 units to fire at
            }else{
                q = 1;
                j = p0_units.length - 1;
                if(j >= 0){
                    do{
                        if(Math.sqrt(Math.pow(p1_units[i][1] - p0_units[j][1], 2)
                         + Math.pow(p1_units[i][0] - p0_units[j][0], 2)) < 240){
                            p1_units[i][4] = 75;
                            bullets.push([
                                p1_units[i][0],// x
                                p1_units[i][1],// y
                                p0_units[j][0],// destination x
                                p0_units[j][1],// destination y
                                1// player
                            ]);
                            q = 0;
                            break;
                        }
                    }while(j--);
                }

                // if no units in range, look for buildings to fire at
                if(q){
                    j = p0_buildings.length - 1;
                    if(j >= 0){
                        do{
                            if(Math.sqrt(Math.pow(p1_units[i][1] - p0_buildings[j][1], 2)
                             + Math.pow(p1_units[i][0] - p0_buildings[j][0], 2)) < 240){
                                p1_units[i][4] = 75;
                                bullets.push([
                                    p1_units[i][0],// x
                                    p1_units[i][1],// y
                                    p0_buildings[j][0] + 50,// destination x
                                    p0_buildings[j][1] + 50,// destination y
                                    1// player
                                ]);
                                break;
                            }
                        }while(j--);
                    }
                }
            }

            // movement "ai", pick new destination once destination is reached
            if(p1_units[i][0] != p1_units[i][2] || p1_units[i][1] != p1_units[i][3]){
                j = m(
                    p1_units[i][0],
                    p1_units[i][1],
                    p1_units[i][2],
                    p1_units[i][3]
                );

                if(p1_units[i][0] != p1_units[i][2]){
                    p1_units[i][0] += (p1_units[i][0] > p1_units[i][2] ? -j[0] : j[0]) * .7;
                }

                if(p1_units[i][1] != p1_units[i][3]){
                    p1_units[i][1] += (p1_units[i][1] > p1_units[i][3] ? -j[1] : j[1]) * .7;
                }

                if(p1_units[i][0] > p1_units[i][2] - 5
                 && p1_units[i][0] < p1_units[i][2] + 5
                 && p1_units[i][1] > p1_units[i][3] - 5
                 && p1_units[i][1] < p1_units[i][3] + 5){
                    p1_units[i][2] = random_number(settings[3] * 2) - settings[3];
                    p1_units[i][3] = random_number(settings[3] * 2) - settings[3];
                }
            }

            // if unit is on screen, draw it
            if(p1_units[i][0] + 15 + x + camera_x > 0
             && p1_units[i][0] - 15 + x + camera_x < width
             && p1_units[i][1] + 15 + y + camera_y > 0
             && p1_units[i][1] - 15 + y + camera_y < height){
                buffer.fillStyle = '#b00';
                buffer.fillRect(
                    p1_units[i][0] - 15,
                    p1_units[i][1] - 15,
                    30,
                    30
                );
                buffer.fillStyle = '#0f0';
                buffer.fillRect(
                    p1_units[i][0] - 15,
                    p1_units[i][1] - 25,
                    30 * (p1_units[i][5] / 100),
                    5
                );
            }
        }while(i--);
    }

    i = p0_units.length - 1;
    if(i >= 0){
        do{
            // if not yet reached destination, move and update fog
            if(p0_units[i][0] != p0_units[i][3] || p0_units[i][1] != p0_units[i][4]){
                j=m(
                    p0_units[i][0],
                    p0_units[i][1],
                    p0_units[i][3],
                    p0_units[i][4]
                );

                if(p0_units[i][0] != p0_units[i][3]){
                    p0_units[i][0] += (p0_units[i][0] > p0_units[i][3] ? -j[0] : j[0]) * .7;
                }

                if(p0_units[i][1] != p0_units[i][4]){
                    p0_units[i][1] += (p0_units[i][1] > p0_units[i][4] ? -j[1] : j[1]) * .7;
                }

                j = fog.length - 1;
                if(i >= 0){
                    do{
                        // only check fog that is still fogging
                        if(fog[j][2] == 1){
                            if(Math.sqrt(Math.pow(p0_units[i][1] - fog[j][1] + settings[3] - 50, 2)
                                       + Math.pow(p0_units[i][0] - fog[j][0] + settings[3] - 50, 2)
                              ) < 290){
                                fog[j][2] = 0;
                            }
                        }
                    }while(j--);
                }
            }

            // if reloading, decrease reload
            if(p0_units[i][5] > 0){
                p0_units[i][5] -= 1;

            // else look for nearby p1 units to fire at
            }else{
                q = 1;
                j = p1_units.length - 1;
                if(j >= 0){
                    do{
                        if(Math.sqrt(Math.pow(p0_units[i][1] - p1_units[j][1], 2)
                         + Math.pow(p0_units[i][0] - p1_units[j][0], 2)) < 240){
                            p0_units[i][5] = 75;
                            bullets.push([
                                p0_units[i][0],// x
                                p0_units[i][1],// y
                                p1_units[j][0],// destination x
                                p1_units[j][1],// destination y
                                0// player
                            ]);
                            q = 0;
                            break;
                        }
                    }while(j--);
                }

                // if no units in range, look for buildings to fire at
                if(q){
                    j = p1_buildings.length - 1;
                    if(j >= 0){
                        do{
                            if(Math.sqrt(Math.pow(p0_units[i][1] - (p1_buildings[j][1] + 50), 2)
                             + Math.pow(p0_units[i][0] - (p1_buildings[j][0] + 50), 2)) < 240){
                                p0_units[i][5] = 75;
                                bullets.push([
                                    p0_units[i][0],// x
                                    p0_units[i][1],// y
                                    p1_buildings[j][0] + 50,// destination x
                                    p1_buildings[j][1] + 50,// destination y
                                    0// player
                                ]);
                                break;
                            }
                        }while(j--);
                    }
                }
            }

            // if unit is on screen, draw it
            if(p0_units[i][0] + 15 + x + camera_x > 0
             && p0_units[i][0] - 15 + x + camera_x < width
             && p0_units[i][1] + 15 + y + camera_y > 0
             && p0_units[i][1] - 15 + y + camera_y < height){
                buffer.fillStyle = p0_units[i][2] ? '#1f1' : '#0b0';
                buffer.fillRect(
                    p0_units[i][0] - 15,
                    p0_units[i][1] - 15,
                    30,
                    30
                );
                buffer.fillStyle = '#0f0';
                buffer.fillRect(
                    p0_units[i][0] - 15,
                    p0_units[i][1] - 25,
                    30 * (p0_units[i][6] / 100),
                    5
                );
            }
        }while(i--);
    }

    i = bullets.length - 1;
    if(i >= 0){
        do{
            // calculate bullet movement
            j = m(
                bullets[i][0],
                bullets[i][1],
                bullets[i][2],
                bullets[i][3]
            );

            // move bullet x
            if(bullets[i][0] != bullets[i][2]){
                bullets[i][0] += 10 * (bullets[i][0] > bullets[i][2] ? -j[0] : j[0]);
            }

            // move bullet y
            if(bullets[i][1] != bullets[i][3]){
                bullets[i][1] += 10 * (bullets[i][1] > bullets[i][3] ? -j[1] : j[1]);
            }

            // if bullet reaches destination, check for collisions
            if(bullets[i][0] > bullets[i][2] - 10
             && bullets[i][0] < bullets[i][2] + 10
             && bullets[i][1] > bullets[i][3] - 10
             && bullets[i][1] < bullets[i][3] + 10){
                if(bullets[i][4]){
                    j = p0_units.length - 1;
                    if(j >= 0){
                        do{
                            if(bullets[i][0] > p0_units[j][0] - 15
                             && bullets[i][0] < p0_units[j][0] + 15
                             && bullets[i][1] > p0_units[j][1] - 15
                             && bullets[i][1] < p0_units[j][1] + 15){
                                p0_units[j][6] -= 25;
                                if(p0_units[j][6] <= 0){
                                    p0_units.splice(j, 1);
                                }
                                break;
                            }
                        }while(j--);
                    }

                    j = p0_buildings.length - 1;
                    if(j >= 0){
                        do{
                            if(bullets[i][0] > p0_buildings[j][0]
                             && bullets[i][0] < p0_buildings[j][0] + 100
                             && bullets[i][1] > p0_buildings[j][1]
                             && bullets[i][1] < p0_buildings[j][1] + 100){
                                p0_buildings[j][4] -= 25;
                                if(p0_buildings[j][4] <= 0){
                                    p0_buildings.splice(j, 1);
                                }
                                break;
                            }
                        }while(j--);
                    }
                }else{
                    j = p1_units.length - 1;
                    if(j >= 0){
                        do{
                            if(bullets[i][0] > p1_units[j][0] - 15
                             && bullets[i][0] < p1_units[j][0] + 15
                             && bullets[i][1] > p1_units[j][1] - 15
                             && bullets[i][1] < p1_units[j][1] + 15){
                                p1_units[j][5] -= 25;
                                if(p1_units[j][5] <= 0){
                                    p1_units.splice(j, 1);
                                }
                                break;
                            }
                        }while(j--);
                    }

                    j = p1_buildings.length - 1;
                    if(j >= 0){
                        do{
                            if(bullets[i][0] > p1_buildings[j][0]
                             && bullets[i][0] < p1_buildings[j][0] + 100
                             && bullets[i][1] > p1_buildings[j][1]
                             && bullets[i][1] < p1_buildings[j][1] + 100){
                                p1_buildings[j][4] -= 25;
                                if(p1_buildings[j][4] <= 0){
                                    p1_buildings.splice(j, 1);
                                }
                                break;
                            }
                        }while(j--);
                    }
                }
                bullets.splice(i, 1);
            }
        }while(i--);

        // draw bullets
        i = bullets.length - 1;
        if(i >= 0){
            do{
                // set bullet color to team color
                buffer.fillStyle = bullets[i][4] ? '#f00' : '#0f0';

                buffer.fillRect(
                    bullets[i][0] - 5,
                    bullets[i][1] - 5,
                    10,
                    10
                );
             }while(i--);
         }
    }

    // draw fog
    buffer.fillStyle = '#000';
    i = fog.length - 1;
    if(i >= 0){
        do{
            if(fog[i][2]){
                buffer.fillRect(
                    -settings[3] + fog[i][0],
                    -settings[3] + fog[i][1],
                    100,
                    100
                );
            }
        }while(i--);
    }

    // draw building destination
    i = p0_buildings.length - 1;
    if(i >= 0){
        do{
            if(p0_buildings[i][5] && p0_buildings[i][6] != null){
                buffer.beginPath();
                buffer.moveTo(
                    p0_buildings[i][0] + p0_buildings[i][2] / 2,
                    p0_buildings[i][1] + p0_buildings[i][2] / 2
                );
                buffer.lineTo(
                    p0_buildings[i][6],
                    p0_buildings[i][7]
                );
                buffer.closePath();
                buffer.stroke();
            }
        }while(i--);
    }

    // draw unit destination and range
    i = p0_units.length - 1;
    if(i >= 0){
        do{
            if(p0_units[i][2]){
                // if not yet reached destination, draw destination line
                if(p0_units[i][0] != p0_units[i][3] || p0_units[i][1] != p0_units[i][4]){
                    buffer.beginPath();
                    buffer.moveTo(
                        p0_units[i][0],
                        p0_units[i][1]
                    );
                    buffer.lineTo(
                        p0_units[i][3],
                        p0_units[i][4]
                    );
                    buffer.closePath();
                    buffer.stroke();
                }

                // draw range circle
                buffer.beginPath();
                buffer.arc(
                    p0_units[i][0],
                    p0_units[i][1],
                    240,
                    0,
                    Math.PI * 2,
                    false
                );
                buffer.closePath();
                buffer.stroke();
            }
        }while(i--);
    }

    buffer.translate(
        -camera_x - x,
        -camera_y - y
    );

    // draw selection box
    if(mouse_hold == 1){
        buffer.beginPath();
        buffer.rect(
            mouse_lock_x,
            mouse_lock_y,
            mouse_x - mouse_lock_x,
            mouse_y - mouse_lock_y
        );
        buffer.closePath();
        buffer.stroke();
    }

    // draw minimap frame
    buffer.fillStyle = '#222';
    buffer.fillRect(
        0,
        height - 205,
        205,
        205
    );

    // draw robot buliding UI button
    if(p0_buildings.length > 0){
        buffer.fillRect(
            205,
            height - 70,
            70,
            70
        );
    }

    // draw robot building UI button background
    buffer.fillStyle = '#111';
    buffer.fillRect(
        0,
        height - 200,
        200,
        200
    );

    // draw robot building UI button text
    buffer.font = '27pt sans-serif';
    if(p0_buildings.length > 0){
        buffer.fillRect(
            205,
            height - 65,
            65,
            65
        );
        buffer.fillStyle='#fff';
        buffer.fillText(
            'R',
            225,
            height - 20
        );
    }

    // draw p0 money
    buffer.fillStyle = '#fff';
    buffer.fillText(
        '$' + money[0],
        5,
        height - 220
    );

    // draw minimap background
    buffer.fillStyle = world_static[0][4];
    buffer.fillRect(
        0,
        height - 200,
        200,
        200
    );

    // draw p1 buildings on minimap
    i = p1_buildings.length - 1;
    if(i >= 0){
        buffer.fillStyle = '#600';
        do{
            buffer.fillRect(
                100 + p1_buildings[i][0] / level_size_math,
                height - 100 + p1_buildings[i][1] / level_size_math,
                50 / (settings[3] / 200),
                50 / (settings[3] / 200)
            );
        }while(i--);
    }

    // draw p0 buildings on minimap
    i = p0_buildings.length - 1;
    if(i >= 0){
        do{
            buffer.fillStyle = p0_buildings[i][5] ? '#1f1' : '#060';
            buffer.fillRect(
                100 + p0_buildings[i][0] / level_size_math,
                height - 100 + p0_buildings[i][1] / level_size_math,
                50 / (settings[3] / 200),
                50 / (settings[3] / 200)
            );
        }while(i--);
    }

    // draw p1 units on minimap
    i = p1_units.length - 1;
    if(i >= 0){
        buffer.fillStyle = '#p0_buildings0';
        do{
            buffer.fillRect(
                100 + (p1_units[i][0] - 15) / level_size_math,
                height - 100 + (p1_units[i][1] - 15) / level_size_math,
                15 / (settings[3] / 200),
                15 / (settings[3] / 200)
            );
        }while(i--);
    }

    // draw p0 units on minimap*/
    i = p0_units.length - 1;
    if(i >= 0){
        do{
            buffer.fillStyle = p0_units[i][2] ? '#1f1' : '#0b0';
            buffer.fillRect(
                100 + (p0_units[i][0] - 15) / level_size_math,
                height - 100 + (p0_units[i][1] - 15) / level_size_math,
                15 / (settings[3] / 200),
                15 / (settings[3] / 200)
            );
        }while(i--);
    }

    // draw fog of war on minimap
    buffer.fillStyle = '#000';
    i = fog.length - 1;
    if(i >= 0){
        do{
            if(fog[i][2]){
                buffer.fillRect(
                    fog[i][0] / level_size_math,
                    height - 200 + fog[i][1] / level_size_math,
                    50 / (settings[3] / 200),
                    50 / (settings[3] / 200)
                );
            }
        }while(i--);
    }

    // draw building destination on minimap
    i = p0_buildings.length - 1;
    if(i >= 0){
        do{
            // if buliding is selected and has a destination, draw destination line
            if(p0_buildings[i][5] && p0_buildings[i][6] != null){
                buffer.beginPath();
                buffer.moveTo(
                    100 + (p0_buildings[i][0] + p0_buildings[i][2] / 2) / level_size_math,
                    height - 100 + (p0_buildings[i][1] + p0_buildings[i][3] / 2) / level_size_math
                );
                buffer.lineTo(
                    100 + p0_buildings[i][6] / level_size_math,
                    height - 100 + p0_buildings[i][7] / level_size_math
                );
                buffer.closePath();
                buffer.stroke();
            }
        }while(i--);
    }

    // draw unit destination and range on minimap
    i = p0_units.length - 1;
    if(i >= 0){
        do{
            // if unit is selected
            if(p0_units[i][2]){

                // if unit has a destination it has not yet reached, draw destination line
                if(p0_units[i][0] != p0_units[i][3] || p0_units[i][1] != p0_units[i][4]){
                    buffer.beginPath();
                    buffer.moveTo(
                        100 + p0_units[i][0] / level_size_math,
                        height - 100 + p0_units[i][1] / level_size_math
                    );
                    buffer.lineTo(
                        100 + p0_units[i][3] / level_size_math,
                        height - 100 + p0_units[i][4] / level_size_math
                    );
                    buffer.closePath();
                    buffer.stroke();
                }

                // draw range circle
                buffer.beginPath();
                buffer.arc(
                    100 + p0_units[i][0] / level_size_math,
                    height - 100 + p0_units[i][1] / level_size_math,
                    120 / (settings[3] / 200),
                    0,
                    Math.PI * 2,
                    false
                );
                buffer.closePath();
                buffer.stroke();
            }
        }while(i--);
    }

    var temp_height = 0;
    var temp_width = 0;
    var temp_x = 0;
    var temp_y = 0;

    // draw selection box on minimap
    if(mouse_hold == 1){
        // max sure box cannot go past right edge
        temp_x = 100 - (x + camera_x - mouse_lock_x) / level_size_math;
        temp_width = (mouse_x - mouse_lock_x) / level_size_math;
        if(temp_x > 200 - temp_width){
            // box past right edge, decrease width to fix
            temp_width = 200 - temp_x;
        }

        // make sure box can't go past top edge
        temp_y = height - 100 - (y + camera_y - mouse_lock_y) / level_size_math;
        temp_height = (mouse_y - mouse_lock_y) / level_size_math;
        if(temp_y < height - 200){
            // box past top edge, decrease height and make sure height isn't negative
            temp_height -= height - 200 - temp_y;
            if(temp_height < 0){
                temp_height = 0;
            }

            // adjust box starting y position
            temp_y = height - 200;
        }

        buffer.beginPath();
        buffer.rect(
            temp_x,
            temp_y,
            temp_width,
            temp_height
        );
        buffer.closePath();
        buffer.stroke();
    }

    // draw camera boundaries on minimap
    // max sure box cannot go past right edge
    temp_x = 100 - x / level_size_math - camera_x / level_size_math;
    temp_width = width / level_size_math;
    if(temp_x > 200 - temp_width){
        // box past right edge, decrease width to fix
        temp_width = 200 - temp_x;
    }

    // make sure box can't go past top edge
    temp_y = height - 100 - y / level_size_math - camera_y / level_size_math;
    temp_height = height / level_size_math;
    if(temp_y < height - 200){
        // box past top edge, decrease height and make sure height isn't negative
        temp_height -= height - 200 - temp_y;
        if(temp_height < 0){
            temp_height = 0;
        }

        // adjust box starting y position
        temp_y = height - 200;
    }

    buffer.beginPath();
    buffer.rect(
        temp_x,
        temp_y,
        temp_width,
        temp_height
    );
    buffer.closePath();
    buffer.stroke();

    // draw win/lose text if win/lose conditions met
    if((p0_buildings.length < 1 && p0_units.length < 1)
     || (p1_buildings.length < 1 && p1_units.length < 1)){
        buffer.textAlign = 'center';
        if(p0_buildings.length < 1){
            buffer.fillStyle = '#f00';
            buffer.fillText(
                'YOU LOSE! ☹',
                x,
                y / 2
            );

        }else{
            buffer.fillStyle = '#0f0';
            buffer.fillText(
                'YOU WIN! ☺' ,
                x,
                y / 2
            );
        }
        buffer.fillStyle = '#fff';
        buffer.fillText(
            'ESC = Main Menu',
            x,
            y / 2 + 50
        );
    }

    if(settings[5]){// clear?
        canvas.clearRect(
            0,
            0,
            width,
            height
        );
    }
    canvas.drawImage(
        get('buffer'),
        0,
        0
    );
}

function get(i){
    return document.getElementById(i);
}

function m(x0, y0, x1, y1){
    var j0 = Math.abs(x0 - x1),
    j1 = Math.abs(y0 - y1);

    if(j0 > j1){
        return [1, j1 / j0];

    }else if(j1 > j0){
        return [j0 / j1, 1];

    }else{
        return [.5, .5];
    }
}

function setdestination(j){
    if(selected_type == 0){
        i = p0_units.length - 1;
        if(i >= 0){
            do{
                if(p0_units[i][2]){
                    p0_units[i][3] = j ? level_size_math * (mouse_x - 100) : mouse_x - x - camera_x;

                    if(p0_units[i][3] > settings[3]){
                        p0_units[i][3] = settings[3];
                    }else if(p0_units[i][3] < -settings[3]){
                        p0_units[i][3] = -settings[3];
                    }

                    p0_units[i][4] = j ? level_size_math * (mouse_y - height + 100) : mouse_y - y - camera_y;

                    if(p0_units[i][4] > settings[3]){
                        p0_units[i][4] = settings[3];
                    }else if(p0_units[i][4] < -settings[3]){
                        p0_units[i][4] = -settings[3];
                    }
                }
            }while(i--);
        }

    }else if(p0_buildings.length > 0){
        i = p0_buildings.length - 1;
        if(i >= 0){
            do{
                if(p0_buildings[i][5]){
                    p0_buildings[i][6] = j ? level_size_math * (mouse_x - 100) : mouse_x - x - camera_x;

                    if(p0_buildings[i][6] > settings[3]){
                        p0_buildings[i][6] = settings[3];
                    }else if(p0_buildings[i][6] < -settings[3]){
                        p0_buildings[i][6] = -settings[3];
                    }

                    p0_buildings[i][7] = j ? level_size_math * (mouse_y - height + 100) : mouse_y - y - camera_y;

                    if(p0_buildings[i][7] > settings[3]){
                        p0_buildings[i][7] = settings[3];
                    }else if(p0_buildings[i][7] < -settings[3]){
                        p0_buildings[i][7] = -settings[3];
                    }
                }
            }while(i--);
        }
    }
}
function play_audio(i){
    if(settings[2] > 0){// audio volume
        get(i).currentTime = 0;
        get(i).play();
    }
}

function resize(){
    if(mode > 0){
        width = window.innerWidth;
        get('buffer').width = width;
        get('canvas').width = width;

        height = window.innerHeight;
        get('buffer').height = height;
        get('canvas').height = height;

        x = width / 2;
        y = height / 2;
    }
}

function random_number(i){
    return Math.floor(Math.random() * i);
}

function save(){
    i = 3;
    do{
        j = [
            'ms-per-frame',
            'scroll-speed',
            'audio-volume',
            'level-size'
        ][i];

        if(isNaN(get(j).value) || get(j).value == [25, 10, 1, 1600][i] || get(j).value < [1, 1, 0, 200][i]){
            ls.removeItem('rts-2d-' + i);
            settings[i] = [
                25,
                10,
                1,
                1600
            ][i];
            get(j).value = settings[i];

        }else{
            settings[i] = parseFloat(get(j).value);
            ls.setItem(
                'rts-2d-' + i,
                settings[i]
            );
        }
    }while(i--);

    if(get('camera-keys').value == 'WASD'){
        ls.removeItem('rts-2d-4');
        settings[4] = 'WASD';

    }else{
        settings[4] = get('camera-keys').value;
        ls.setItem(
            'rts-2d-4',
            settings[4]
        );
    }

    settings[5] = get('clear').checked;
    if(settings[5]){
        ls.removeItem('rts-2d-5');

    }else{
        ls.setItem(
            'rts-2d-5',
            0
        );
    }

    settings[6] = get('fog-of-war').checked;
    if(settings[6]){
        ls.removeItem('rts-2d-6');

    }else{
        ls.setItem(
            'rts-2d-6',
            0
        );
    }
}

function select(){
    selected_type = -1;

    i = p0_units.length - 1;
    if(i >= 0){
        do{
            p0_units[i][2] = (
                (mouse_lock_x < x + p0_units[i][0] + camera_x + 15 && mouse_x > x + p0_units[i][0] + camera_x - 15)
                || (mouse_lock_x > x + p0_units[i][0] + camera_x - 15 && mouse_x < x + p0_units[i][0] + camera_x + 15)
            )&&(
                (mouse_lock_y < y + p0_units[i][1] + camera_y + 15 && mouse_y > y + p0_units[i][1] + camera_y - 15)
                || (mouse_lock_y > y + p0_units[i][1] + camera_y - 15 && mouse_y < y + p0_units[i][1] + camera_y + 15)
            );

            if(p0_units[i][2]){
                selected_type = 0;
            }
        }while(i--);
    }

    i = p0_buildings.length - 1;
    if(i >= 0){
        do{
            if(selected_type == -1){
                p0_buildings[i][5] = (
                    (mouse_lock_x < x + p0_buildings[i][0] + camera_x + p0_buildings[i][2]
                      && mouse_x > x + p0_buildings[i][0] + camera_x)
                    || (mouse_lock_x > x + p0_buildings[i][0] + camera_x
                      && mouse_x < x + p0_buildings[i][0] + camera_x + p0_buildings[i][2])
                )&&(
                    (mouse_lock_y < y + p0_buildings[i][1] + camera_y + p0_buildings[i][3]
                      && mouse_y > y + p0_buildings[i][1] + camera_y)
                    || (mouse_lock_y > y + p0_buildings[i][1] + camera_y
                      && mouse_y < y + p0_buildings[i][1] + camera_y + p0_buildings[i][3])
                );

                if(p0_buildings[i][5]){
                    selected_type = 1;
                }

            }else{
                p0_buildings[i][5] = 0;
            }
        }while(i--);
    }
}

function setmode(newmode){
    clearInterval(interval);

    bullets = [];
    mode = newmode;

    // new game mode
    if(mode > 0){
        save();

        key_down = 0;
        key_left = 0;
        key_right = 0;
        key_up = 0;

        level_size_math = settings[3] / 100;

        money = [
            1000,
            1000
        ];
        mouse_hold = 0;
        mouse_lock_x = -1;
        mouse_lock_y = -1;
        mouse_x = -1;
        mouse_y = -1;
        selected_type = -1;

        get('page').innerHTML = '<canvas id=canvas oncontextmenu="return false"></canvas>';
        get('canvas').style.background = [
            '#277',
            '#444',
            '#321'
        ][mode - 1];

        world_static = [
            [
                -settings[3],
                -settings[3],
                settings[3] * 2,
                settings[3] * 2,
                [
                    '#765',
                    '#333',
                    '#432'
                ][mode - 1]
            ]
        ];

        i = random_number(2);
        j = random_number(2);
        p0_buildings = [
            [
                i ? -settings[3] + 25 : settings[3] - 125,// x
                j ? settings[3] - 125 : -settings[3] + 25,// y
                100,// width
                100,// height
                1000,// health
                0,// selected
                i ? -settings[3] + 200 : settings[3] - 200,// destination x
                j ? settings[3] - 75  : -settings[3] + 75// destination y
            ]
        ];
        p1_buildings = [
            [
                i ? settings[3] - 125 : -settings[3] + 25,// x
                j ? -settings[3] + 25 : settings[3] -125,// y
                100,// width
                100,// height
                1000// health
            ]
        ];
        p0_units = [];
        p1_units = [];

        // set camera position to building location
        camera_x = -p0_buildings[0][0] - 50;
        camera_y = -p0_buildings[0][1] - 50;

        // add fog of war, if settings allow it
        fog = [];
        if(settings[6]){
            var temp_x = 0;
            var temp_y = 0;
            var times = Math.floor(settings[3] / 50);// half of level width divided by half of fog unit

            i = Math.pow(times, 2) - 1;// true number of fog units to add
            do{
                fog.push([
                    temp_x * 100,// fog x
                    temp_y,// fog y
                    1// fog fogging
                ]);

                // add next fog unit one fog unit space to the right
                temp_x += 1;

                // done with this row, move on to the next
                if(i % times == 0){
                    temp_y += 100;
                    temp_x = 0;
                }
            }while(i--);

            // since player cannot YET build buildings, remove fog around buildings now
            i = p0_buildings.length - 1;
            do{
                // check each fog unit if within 390px of building
                j = fog.length - 1;
                do{
                    if(Math.sqrt(Math.pow(p0_buildings[i][1] - fog[j][1] + settings[3], 2)
                               + Math.pow(p0_buildings[i][0] - fog[j][0] + settings[3], 2)
                      ) < 390){
                        fog[j][2] = 0;
                    }
                }while(j--);
            }while(i--);
        }

        buffer = get('buffer').getContext('2d');
        canvas = get('canvas').getContext('2d');

        resize();

        interval = setInterval('draw()', settings[0]);

    // main menu mode
    }else{
        buffer = 0;
        canvas = 0;

        get('page').innerHTML = '<div style="border-right:8px solid #222;display:inline-block;text-align:left;vertical-align:top"><div class=c><b>RTS-2D</b></div><hr><div class=c><b>Skirmish vs AI:</b><ul><li><a onclick=setmode(1)>Island</a><li><a onclick=setmode(2)>Urban</a><li><a onclick=setmode(3)>Wasteland</a></ul></div><hr><div class=c><label><input '
            + (settings[6] ? 'checked ' : '') + 'id=fog-of-war type=checkbox>Fog of War</label><br><input id=level-size size=3 value='
            + settings[3] + '>*2 Level Size<br><input id=scroll-speed size=1 value='
            + settings[1] + '>Scroll Speed</div></div><div style=display:inline-block;text-align:left><div class=c><input id=camera-keys maxlength=4 size=3 value='
            + settings[4] + '>Camera ↑←↓→<br><input disabled size=3 style=border:0 value=ESC>Main Menu</div><hr><div class=c><input id=audio-volume max=1 min=0 step=.01 type=range value='
            + settings[2] + '>Audio<br><label><input '
            + (settings[5] ? 'checked ' : '') + 'id=clear type=checkbox>Clear</label><br><a onclick="if(confirm(\'Reset settings?\')){get(\'audio-volume\').value=get(\'clear\').checked=get(\'fog-of-war\').checked=1;get(\'camera-keys\').value=\'WASD\';get(\'scroll-speed\').value=10;get(\'level-size\').value=1600;get(\'ms-per-frame\').value=25;save();setmode(0)}">Reset Settings</a><br><a onclick="get(\'hack-span\').style.display=get(\'hack-span\').style.display==\'none\'?\'inline\':\'none\'">Hack</a><span id=hack-span style=display:none><br><br><input id=ms-per-frame size=1 value='
            + settings[0] + '>ms/Frame</span></div></div>';
    }
}

var ai_build_robot = 0;
var buffer = 0;
var bullets = [];
var canvas = 0;
var camera_x = 0;
var camera_y = 0;
var fog = [];
var height = 0;
var i = 0;
var interval = 0;
var j = 0;
var key_down = 0;
var key_left = 0;
var key_right = 0;
var key_up = 0;
var level_size_math = 0;
var ls = window.localStorage;
var mode = 0;
var money = [];
var money_timer = 0;
var mouse_hold = 0;
var mouse_lock_x = 0;
var mouse_lock_y = 0;
var mouse_x = 0;
var mouse_y = 0;
var p0_buildings = [];
var p0_units = [];
var p1_buildings = [];
var p1_units = [];
var q = 0;
var selected_type = -1;
var settings = [
    ls.getItem('rts-2d-0') === null ?     25 : parseInt(ls.getItem('rts-2d-0')),// milliseconds-per-frame
    ls.getItem('rts-2d-1') === null ?     10 : parseInt(ls.getItem('rts-2d-1')),// scroll speed
    ls.getItem('rts-2d-2') === null ?      1 : parseFloat(ls.getItem('rts-2d-2')),// audio volume
    ls.getItem('rts-2d-3') === null ?   1600 : parseFloat(ls.getItem('rts-2d-3')),// level size
    ls.getItem('rts-2d-4') === null ? 'WASD' : ls.getItem('rts-2d-4'),// camera move keys
    ls.getItem('rts-2d-5') === null,// clear?
    ls.getItem('rts-2d-6') === null// fog of war
];
var width = 0;
var world_static = [];
var x = 0;
var y = 0;

setmode(0);

window.onkeydown = function(e){
    if(mode > 0){
        i = window.event ? event : e;
        i = i.charCode ? i.charCode : i.keyCode;

        if(i === 82 && p0_buildings.length > 0){
            build_robot();

        }else if(String.fromCharCode(i) === settings[4][1]){
            key_left = 1;

        }else if(String.fromCharCode(i) === settings[4][3]){
            key_right = 1;

        }else if(String.fromCharCode(i) === settings[4][2]){
            key_down = 1;

        }else if(String.fromCharCode(i) === settings[4][0]){
            key_up = 1;

        }else if(i === 27){
            setmode(0);
        }
    }
};

window.onkeyup = function(e){
    i = window.event ? event : e;
    i = i.charCode ? i.charCode : i.keyCode;

    if(String.fromCharCode(i) === settings[4][1]){
        key_left = 0;

    }else if(String.fromCharCode(i) === settings[4][3]){
        key_right = 0;

    }else if(String.fromCharCode(i) === settings[4][2]){
        key_down = 0;

    }else if(String.fromCharCode(i) === settings[4][0]){
        key_up = 0;
    }
};

window.onmousedown = function(e){
    if(mode > 0){
        e.preventDefault();

        // if not clicking on minimap
        if(mouse_x > 200 || mouse_y < height - 200){

            // if unit selected or not clicking on build robot button
            if(selected_type < 1 || (mouse_y < height - 65 || mouse_x > 270)){
                // left click: start dragging
                if(e.button == 0){
                    mouse_hold = 1;
                    mouse_lock_x = mouse_x;
                    mouse_lock_y = mouse_y;

                // right click: try to set selected building/unit destination
                }else if(e.button == 2){
                    setdestination(0);
                }

            // try to build a robot
            }else{
                build_robot();
            }

        // clicking on minimap
        }else{
            // right click: set unit destination
            if(e.button == 2){
                setdestination(1);

            // other clicks: move camera
            }else{
                mouse_hold = 2;

                camera_x = -level_size_math * (mouse_x - 100);
                if(camera_x > settings[3]){
                    camera_x = settings[3];
                }else if(camera_x < -settings[3]){
                    camera_x = -settings[3];
                }

                camera_y = -level_size_math * (mouse_y - height + 100);
                if(camera_y > settings[3]){
                    camera_y = settings[3];
                }else if(camera_y < -settings[3]){
                    camera_y = -settings[3];
                }
            }
        }
    }
};

window.onmousemove = function(e){
    if(mode > 0){
        mouse_x = e.pageX;
        if(mouse_x < 0){
            mouse_x = 0;
        }else if(mouse_x > width){
            mouse_x = width;
        }

        mouse_y = e.pageY;
        if(mouse_y < 0){
            mouse_y = 0;
        }else if(mouse_y > height){
            mouse_y = height;
        }

        // dragging after click was not on minimap
        if(mouse_hold == 1){
            select();

        // dragging after click was on minimap
        }else if(mouse_hold == 2){

            camera_x = -level_size_math * (mouse_x - 100);
            if(camera_x > settings[3]){
                camera_x = settings[3];
            }else if(camera_x < -settings[3]){
                camera_x = -settings[3];
            }

            camera_y = -level_size_math * (mouse_y - height + 100);
            if(camera_y > settings[3]){
                camera_y = settings[3];
            }else if(camera_y < -settings[3]){
                camera_y = -settings[3];
            }
        }
    }
};

window.onmouseup = function(){
    mouse_hold = 0;
};

window.onresize = resize;
