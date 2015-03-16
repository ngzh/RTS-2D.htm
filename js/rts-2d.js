function build_robot(){
    if(money[0] < 100){
        return;
    }

    money[0] -= 100;

    p0_units.push([
      p0_buildings[selected_id][0] + p0_buildings[selected_id][2] / 2,// X
      p0_buildings[selected_id][1] + p0_buildings[selected_id][3] / 2,// Y
      0,// Selected?
      p0_buildings[selected_id][6] != null
        ? p0_buildings[selected_id][6]
        : p0_buildings[0][0],// Destination X
      p0_buildings[selected_id][7] != null
        ? p0_buildings[selected_id][7]
        : p0_buildings[0][1],// Destination Y
      0,// Weapon reload
      100,// Health
    ]);
}

function distance(x0, y0, x1, y1){
    return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
}

function draw(){
    buffer.clearRect(
      0,
      0,
      width,
      height
    );

    var offset_x = x + camera_x;
    var offset_y = y + camera_y;
    buffer.translate(
      offset_x,
      offset_y
    );

    // Draw visible static world objects.
    for(var id in world_static){
        if(world_static[id][0] + world_static[id][2] + offset_x <= 0
          || world_static[id][0] + offset_x >= width
          || world_static[id][1] + world_static[id][3] + offset_y <= 0
          || world_static[id][1] + offset_y >= height){
            continue;
        }

        buffer.fillStyle = world_static[id][4];
        buffer.fillRect(
          world_static[id][0],
          world_static[id][1],
          world_static[id][2],
          world_static[id][3]
        );
    }

    buffer.font = '42pt sans-serif';
    buffer.textBaseline = 'middle';
    buffer.textAlign = 'center';

    // Draw visible player 1 buildings.
    for(var building in p1_buildings){
        if(p1_buildings[building][0] + p1_buildings[building][2] + offset_x <= 0
          || p1_buildings[building][0] + offset_x >= width
          || p1_buildings[building][1] + p1_buildings[building][3] + offset_y <= 0
          || p1_buildings[building][1] + offset_y >= height){
            continue;
        }

        buffer.fillStyle = '#600';
        buffer.fillRect(
          p1_buildings[building][0],
          p1_buildings[building][1],
          p1_buildings[building][2],
          p1_buildings[building][3]
        );
        buffer.fillStyle = '#0f0';
        buffer.fillRect(
          p1_buildings[building][0],
          p1_buildings[building][1] - 10,
          p1_buildings[building][2] * (p1_buildings[building][4] / 1000),
          5
        );

        buffer.fillStyle = '#fff';
        buffer.fillText(
          [
            'HQ',
            'F',
          ][p1_buildings[building][5] - 1],
          p1_buildings[building][0] + 50,
          p1_buildings[building][1] + 50
        );
    }

    // Draw visible player 0 buildings.
    buffer.strokeStyle = '#ddd';
    for(building in p0_buildings){
        if(p0_buildings[building][0] + p0_buildings[building][2] + offset_x <= 0
          || p0_buildings[building][0] + offset_x >= width
          || p0_buildings[building][1] + p0_buildings[building][3] + offset_y <= 0
          || p0_buildings[building][1] + offset_y >= height){
            continue;
        }

        buffer.fillStyle = p0_buildings[building][5]
          ? '#1f1'
          : '#060';
        buffer.fillRect(
          p0_buildings[building][0],
          p0_buildings[building][1],
          p0_buildings[building][2],
          p0_buildings[building][3]
        );
        buffer.fillStyle = '#0f0';
        buffer.fillRect(
          p0_buildings[building][0],
          p0_buildings[building][1] - 10,
          p0_buildings[building][2] * (p0_buildings[building][4] / 1000),
          5
        );

        buffer.fillStyle = '#fff';
        buffer.fillText(
          [
            'HQ',
            'F',
          ][p0_buildings[building][8] - 1],
          p0_buildings[building][0] + 50,
          p0_buildings[building][1] + 50
        );
    }

    // Draw visible player 1 units.
    for(var unit in p1_units){
        if(p1_units[unit][0] + 15 + x + camera_x <= 0
          || p1_units[unit][0] - 15 + x + camera_x >= width
          || p1_units[unit][1] + 15 + y + camera_y <= 0
          || p1_units[unit][1] - 15 + y + camera_y >= height){
            continue;
        }

        buffer.fillStyle = '#b00';
        buffer.fillRect(
          p1_units[unit][0] - 15,
          p1_units[unit][1] - 15,
          30,
          30
        );
        buffer.fillStyle = '#0f0';
        buffer.fillRect(
          p1_units[unit][0] - 15,
          p1_units[unit][1] - 25,
          30 * (p1_units[unit][5] / 100),
          5
        );
    }

    // Draw visible player 0 units.
    for(unit in p0_units){
        if(p0_units[unit][0] + 15 + x + camera_x <= 0
          || p0_units[unit][0] - 15 + x + camera_x >= width
          || p0_units[unit][1] + 15 + y + camera_y <= 0
          || p0_units[unit][1] - 15 + y + camera_y >= height){
            continue;
        }

        buffer.fillStyle = p0_units[unit][2] ? '#1f1' : '#0b0';
        buffer.fillRect(
          p0_units[unit][0] - 15,
          p0_units[unit][1] - 15,
          30,
          30
        );
        buffer.fillStyle = '#0f0';
        buffer.fillRect(
          p0_units[unit][0] - 15,
          p0_units[unit][1] - 25,
          30 * (p0_units[unit][6] / 100),
          5
        );
    }

    // Draw bullets.
    for(var bullet in bullets){
        // Set bullet color to team color.
        buffer.fillStyle = bullets[bullet][4]
          ? '#f00'
          : '#0f0';

        buffer.fillRect(
          Math.round(bullets[bullet][0]) - 5,
          Math.round(bullets[bullet][1]) - 5,
          10,
          10
        );
    }

    // Draw fog.
    buffer.fillStyle = '#000';
    for(var id in fog){
        buffer.fillRect(
          -settings['level-size'] + fog[id][0],
          -settings['level-size'] + fog[id][1],
          100,
          100
        );
    }

    // Draw selected building destination.
    for(building in p0_buildings){
        if(!p0_buildings[building][5]
          || p0_buildings[building][6] == null){
            continue;
        }

        buffer.beginPath();
        buffer.moveTo(
          p0_buildings[building][0] + p0_buildings[building][2] / 2,
          p0_buildings[building][1] + p0_buildings[building][2] / 2
        );
        buffer.lineTo(
          p0_buildings[building][6],
          p0_buildings[building][7]
        );
        buffer.closePath();
        buffer.stroke();
    }

    // Draw selected unit destinations and range.
    for(unit in p0_units){
        if(!p0_units[unit][2]){
            continue;
        }

        if(p0_units[unit][0] != p0_units[unit][3]
          || p0_units[unit][1] != p0_units[unit][4]){
            buffer.beginPath();
            buffer.moveTo(
              p0_units[unit][0],
              p0_units[unit][1]
            );
            buffer.lineTo(
              p0_units[unit][3],
              p0_units[unit][4]
            );
            buffer.closePath();
            buffer.stroke();
        }

        buffer.beginPath();
        buffer.arc(
          p0_units[unit][0],
          p0_units[unit][1],
          240,
          0,
          pi_times_two,
          false
        );
        buffer.closePath();
        buffer.stroke();
    }

    buffer.translate(
      -camera_x - x,
      -camera_y - y
    );

    // Draw selection box.
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

    // Draw building while in build mode.
    if(build_mode > 0){
        buffer.fillStyle='#1f1';

        var building_x = mouse_x - 50;
        var max_x = settings['level-size'] + camera_x + x - 100;
        var min_x = -settings['level-size'] + camera_x + x;

        if(building_x > max_x){
            building_x = max_x;

        }else if(building_x < min_x){
            building_x = min_x;
        }

        var building_y = mouse_y - 50;
        var max_y = settings['level-size'] + camera_y + y - 100;
        var min_y = -settings['level-size'] + camera_y + y;

        if(building_y > max_x){
            building_y = max_x;

        }else if(building_y < min_y){
            building_y = min_y;
        }

        buffer.fillRect(
          building_x,
          building_y,
          100,
          100
        );

        buffer.fillStyle='#fff';
        buffer.fillText(
          [
            'F',
            'R'
          ][selected_type - 1],
          building_x + 50,
          building_y + 50
        );
    }

    // Draw minimap frame.
    buffer.fillStyle = '#222';
    buffer.fillRect(
      0,
      height - 205,
      205,
      205
    );

    if(selected_type > 0){
        buffer.fillRect(
          205,
          height - 70,
          70,
          70
        );

        buffer.fillStyle = '#111';
        buffer.fillRect(
          205,
          height - 65,
          65,
          65
        );

        buffer.fillStyle='#fff';
        buffer.fillText(
          [
            'F',
            'R',
          ][selected_type - 1],
          240,
          height - 35
        );
    }

    // Draw player 0 money.
    buffer.fillStyle = '#fff';
    buffer.textAlign = 'left';
    buffer.fillText(
      '$' + money[0],
      5,
      height - 230
    );

    // Draw minimap background.
    buffer.fillStyle = world_static[0][4];
    buffer.fillRect(
      0,
      height - 200,
      200,
      200
    );

    // Draw player 1 buildings on minimap.
    buffer.fillStyle = '#600';
    for(building in p1_buildings){
        buffer.fillRect(
          100 + p1_buildings[building][0] / math[0],
          height - 100 + p1_buildings[building][1] / math[0],
          math[2],
          math[2]
        );
    }

    // Draw player 0 buildings on minimap.
    for(building in p0_buildings){
        buffer.fillStyle = p0_buildings[building][5] ? '#1f1' : '#060';
        buffer.fillRect(
          100 + p0_buildings[building][0] / math[0],
          height - 100 + p0_buildings[building][1] / math[0],
          math[2],
          math[2]
        );
    }

    // Draw player 1 units on minimap.
    buffer.fillStyle = '#b00';
    for(unit in p1_units){
        buffer.fillRect(
          100 + (p1_units[unit][0] - 15) / math[0],
          height - 100 + (p1_units[unit][1] - 15) / math[0],
          math[1],
          math[1]
        );
    }

    // Draw player 0 units on minimap.
    for(unit in p0_units){
        buffer.fillStyle = p0_units[unit][2] ? '#1f1' : '#0b0';
        buffer.fillRect(
          100 + (p0_units[unit][0] - 15) / math[0],
          height - 100 + (p0_units[unit][1] - 15) / math[0],
          math[1],
          math[1]
        );
    }

    // Draw fog of war on minimap.
    buffer.fillStyle = '#000';
    for(id in fog){
        buffer.fillRect(
          fog[id][0] / math[0],
          height - 200 + fog[id][1] / math[0],
          math[2],
          math[2]
        );
    }

    // Draw building destination on minimap.
    for(building in p0_buildings){
        // Only draw if building is selected.
        if(!p0_buildings[building][5]
          || p0_buildings[building][6] == null){
            continue;
        }

        buffer.beginPath();
        buffer.moveTo(
          100 + (p0_buildings[building][0] + p0_buildings[building][2] / 2) / math[0],
          height - 100 + (p0_buildings[building][1] + p0_buildings[building][3] / 2) / math[0]
        );
        buffer.lineTo(
          100 + p0_buildings[building][6] / math[0],
          height - 100 + p0_buildings[building][7] / math[0]
        );
        buffer.closePath();
        buffer.stroke();
    }

    // Draw unit destination and range on minimap.
    for(unit in p0_units){
        // Only draw if unit is selected.
        if(!p0_units[unit][2]){
            continue;
        }

        // Draw destination if the unit has one.
        if(p0_units[unit][0] != p0_units[unit][3]
          || p0_units[unit][1] != p0_units[unit][4]){
            buffer.beginPath();
            buffer.moveTo(
              100 + p0_units[unit][0] / math[0],
              height - 100 + p0_units[unit][1] / math[0]
            );
            buffer.lineTo(
              100 + p0_units[unit][3] / math[0],
              height - 100 + p0_units[unit][4] / math[0]
            );
            buffer.closePath();
            buffer.stroke();
        }

        // Draw range circle.
        buffer.beginPath();
        buffer.arc(
          100 + p0_units[unit][0] / math[0],
          height - 100 + p0_units[unit][1] / math[0],
          math[3],
          0,
          pi_times_two,
          false
        );
        buffer.closePath();
        buffer.stroke();
    }

    var temp_height = 0;
    var temp_width = 0;
    var temp_x = 0;
    var temp_y = 0;

    // Draw selection box on minimap.
    if(mouse_hold == 1){
        // Make sure box cannot go past right edge.
        temp_x = 100 - (x + camera_x - mouse_lock_x) / math[0];
        temp_width = (mouse_x - mouse_lock_x) / math[0];
        // Box past right edge? Decrease width to fix.
        if(temp_x > 200 - temp_width){
            temp_width = 200 - temp_x;
        }

        // Make sure box can't go past top edge.
        temp_y = height - 100 - (y + camera_y - mouse_lock_y) / math[0];
        temp_height = (mouse_y - mouse_lock_y) / math[0];

        // Box past top edge? Decrease height and make sure height isn't negative.
        if(temp_y < height - 200){
            temp_height -= height - 200 - temp_y;
            if(temp_height < 0){
                temp_height = 0;
            }

            // Adjust box starting Y position.
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

    // Draw camera boundaries on minimap.
    // Make sure box cannot go past right edge.
    temp_x = 100 - x / math[0] - camera_x / math[0];
    temp_width = width / math[0];
    // Box past right edge? Decrease width to fix.
    if(temp_x > 200 - temp_width){
        temp_width = 200 - temp_x;
    }

    // Make sure box can't go past top edge.
    temp_y = height - 100 - y / math[0] - camera_y / math[0];
    temp_height = height / math[0];
    // Box past top edge? decrease height and make sure height isn't negative.
    if(temp_y < height - 200){
        temp_height -= height - 200 - temp_y;
        if(temp_height < 0){
            temp_height = 0;
        }

        // Adjust box starting Y position.
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

    canvas.clearRect(
      0,
      0,
      width,
      height
    );
    canvas.drawImage(
      document.getElementById('buffer'),
      0,
      0
    );

    animationFrame = window.requestAnimationFrame(draw);
}

function fog_update_building(){
    for(var building in p0_buildings){
        // Check if each fog unit is within 390px of a building.
        for(var id in fog){
            if(distance(
              p0_buildings[building][0],
              p0_buildings[building][1],
              fog[id][0] - settings['level-size'],
              fog[id][1] - settings['level-size']
            ) < 390){
                delete fog[id];
            }
        }
    }
}

function logic(){
    money_timer += 1;
    if(money_timer > 99){
        money_timer = 0;
        money[0] += 1;
        money[1] += 1;
    }

    // Move camera down.
    if(key_down
      && camera_y > -settings['level-size']){
        camera_y -= settings['scroll-speed'];
        mouse_lock_y -= settings['scroll-speed'];
    }

    // Move camera left.
    if(key_left
      && camera_x < settings['level-size']){
        camera_x += settings['scroll-speed'];
        mouse_lock_x += settings['scroll-speed'];
    }

    // Move camera right.
    if(key_right
      && camera_x > -settings['level-size']){
        camera_x -= settings['scroll-speed'];
        mouse_lock_x -= settings['scroll-speed'];
    }

    // Move camera up.
    if(key_up
      && camera_y < settings['level-size']){
        camera_y += settings['scroll-speed'];
        mouse_lock_y += settings['scroll-speed'];
    }

    // Handle selection box.
    if(mouse_hold == 1){
        select();
    }

    buffer.clearRect(
      0,
      0,
      width,
      height
    );

    if(p1_buildings.length > 1
      && money[1] >= 100){
        money[1] -= 100;
        p1_units.push([
          p1_buildings[1][0] + p1_buildings[1][2] / 2,// X
          p1_buildings[1][1] + p1_buildings[1][3] / 2,// Y
          Math.floor(Math.random() * settings['level-size'] * 2) - settings['level-size'],// Destination X
          Math.floor(Math.random() * settings['level-size'] * 2) - settings['level-size'],// Destination Y
          0,// Weapon reload
          100,// Health
        ]);
    }

    for(var unit in p1_units){
        // If reloading, decrease reload,...
        if(p1_units[unit][4] > 0){
            p1_units[unit][4] -= 1;

        // ...else look for nearby p0 units to fire at.
        }else{
            var check_for_buildings = true;
            for(var p0_unit in p0_units){
                if(distance(
                  p1_units[unit][0],
                  p1_units[unit][1],
                  p0_units[p0_unit][0],
                  p0_units[p0_unit][1]
                ) < 240){
                    p1_units[unit][4] = 75;
                    bullets.push([
                      p1_units[unit][0],// X
                      p1_units[unit][1],// Y
                      p0_units[p0_unit][0],// destination X
                      p0_units[p0_unit][1],// destination Y
                      1,// Player
                    ]);
                    check_for_buildings = false;
                    break;
                }
            }

            // If no units in range, look for buildings to fire at.
            if(check_for_buildings){
                for(var building in p0_buildings){
                    if(distance(
                      p1_units[unit][0],
                      p1_units[unit][1],
                      p0_buildings[building][0] + 50,
                      p0_buildings[building][1] + 50
                    ) < 240){
                        p1_units[unit][4] = 75;
                        bullets.push([
                          p1_units[unit][0],// X
                          p1_units[unit][1],// Y
                          p0_buildings[building][0] + 50,// Destination X
                          p0_buildings[building][1] + 50,// Destination Y
                          1,// Player
                        ]);
                        break;
                    }
                }
            }
        }

        // Movement "AI", pick new destination once destination is reached.
        if(p1_units[unit][0] != p1_units[unit][2]
          || p1_units[unit][1] != p1_units[unit][3]){
            var j = m(
              p1_units[unit][0],
              p1_units[unit][1],
              p1_units[unit][2],
              p1_units[unit][3]
            );

            if(p1_units[unit][0] != p1_units[unit][2]){
                p1_units[unit][0] += 
                  (p1_units[unit][0] > p1_units[unit][2]
                    ? -j[0]
                    : j[0]
                  ) * .7;
            }

            if(p1_units[unit][1] != p1_units[unit][3]){
                p1_units[unit][1] +=
                  (p1_units[unit][1] > p1_units[unit][3]
                    ? -j[1]
                    : j[1]
                  ) * .7;
            }

            if(p1_units[unit][0] > p1_units[unit][2] - 5
              && p1_units[unit][0] < p1_units[unit][2] + 5
              && p1_units[unit][1] > p1_units[unit][3] - 5
              && p1_units[unit][1] < p1_units[unit][3] + 5){
                p1_units[unit][2] = Math.floor(Math.random() * settings['level-size'] * 2) - settings['level-size'];
                p1_units[unit][3] = Math.floor(Math.random() * settings['level-size'] * 2) - settings['level-size'];
            }
        }
    }

    for(unit in p0_units){
        // If not yet reached destination, move and update fog.
        if(Math.abs(p0_units[unit][0] - p0_units[unit][3]) > 1
          && Math.abs(p0_units[unit][1] - p0_units[unit][4]) > 1){
            var j = m(
              p0_units[unit][0],
              p0_units[unit][1],
              p0_units[unit][3],
              p0_units[unit][4]
            );

            if(p0_units[unit][0] != p0_units[unit][3]){
                p0_units[unit][0] +=
                  (p0_units[unit][0] > p0_units[unit][3]
                    ? -j[0]
                    : j[0]
                  ) * .7;
            }

            if(p0_units[unit][1] != p0_units[unit][4]){
                p0_units[unit][1] +=
                  (p0_units[unit][1] > p0_units[unit][4] 
                    ? -j[1]
                    : j[1]
                  ) * .7;
            }

            for(var id in fog){
                if(distance(
                  p0_units[unit][0],
                  p0_units[unit][1],
                  fog[id][0] - settings['level-size'] + 50,
                  fog[id][1] - settings['level-size'] + 50
                ) < 290){
                    delete fog[id];
                }
            }

        // Destination reached, make sure units don't overlap.
        }else{
            for(var other_unit in p0_units){
                if(unit == other_unit){
                    continue;
                }

                if(distance(
                  p0_units[unit][0],
                  p0_units[unit][1],
                  p0_units[other_unit][0],
                  p0_units[other_unit][1]
                ) < 20){
                    p0_units[unit][3] = p0_units[unit][0]
                      + Math.floor(Math.random() * 40) - 20;
                    p0_units[unit][4] = p0_units[unit][1]
                      + Math.floor(Math.random() * 40) - 20;

                    validate_destination(unit);

                    break;
                }
            }
        }

        // If reloading, decrease reload,...
        if(p0_units[unit][5] > 0){
            p0_units[unit][5] -= 1;
            continue;
        }

        var check_for_buildings = true;
        for(var p1_unit in p1_units){
            if(distance(
              p0_units[unit][0],
              p0_units[unit][1],
              p1_units[p1_unit][0],
              p1_units[p1_unit][1]
            ) < 240){
                p0_units[unit][5] = 75;
                bullets.push([
                  p0_units[unit][0],// X
                  p0_units[unit][1],// Y
                  p1_units[p1_unit][0],// destination X
                  p1_units[p1_unit][1],// destination Y
                  0,// Player
                ]);
                check_for_buildings = false;
                break;
            }
        }

        // If not checking for buildings, continue;
        if(!check_for_buildings){
            continue;
        }

        for(var building in p1_buildings){
            if(distance(
              p0_units[unit][0],
              p0_units[unit][1],
              p1_buildings[building][0] + 50,
              p1_buildings[building][1] + 50
            ) < 240){
                p0_units[unit][5] = 75;
                bullets.push([
                  p0_units[unit][0],// X
                  p0_units[unit][1],// Y
                  p1_buildings[building][0] + 50,// Destination X
                  p1_buildings[building][1] + 50,// Destination Y
                  0,// Player
                ]);
                break;
            }
        }
    }

    for(var bullet in bullets){
        // Calculate bullet movement.
        var j = m(
          bullets[bullet][0],
          bullets[bullet][1],
          bullets[bullet][2],
          bullets[bullet][3]
        );

        // Move bullet x.
        if(bullets[bullet][0] != bullets[bullet][2]){
            bullets[bullet][0] +=
              10
              * (bullets[bullet][0] > bullets[bullet][2]
                ? -j[0]
                : j[0]
              );
        }

        // Move bullet y.
        if(bullets[bullet][1] != bullets[bullet][3]){
            bullets[bullet][1] +=
              10
              * (bullets[bullet][1] > bullets[bullet][3]
                ? -j[1]
                : j[1]
              );
        }

        // If bullet reaches destination, check for collisions.
        if(bullets[bullet][0] <= bullets[bullet][2] - 10
          || bullets[bullet][0] >= bullets[bullet][2] + 10
          || bullets[bullet][1] <= bullets[bullet][3] - 10
          || bullets[bullet][1] >= bullets[bullet][3] + 10){
            continue;
        }

        if(bullets[bullet][4]){
            for(var unit in p0_units){
                if(bullets[bullet][0] <= p0_units[unit][0] - 15
                  || bullets[bullet][0] >= p0_units[unit][0] + 15
                  || bullets[bullet][1] <= p0_units[unit][1] - 15
                  || bullets[bullet][1] >= p0_units[unit][1] + 15){
                    continue;
                }

                p0_units[unit][6] -= 25;
                if(p0_units[unit][6] <= 0){
                    delete p0_units[unit];
                }

                break;
            }

            for(var building in p0_buildings){
                if(bullets[bullet][0] <= p0_buildings[building][0]
                  || bullets[bullet][0] >= p0_buildings[building][0] + 100
                  || bullets[bullet][1] <= p0_buildings[building][1]
                  || bullets[bullet][1] >= p0_buildings[building][1] + 100){
                    continue;
                }

                p0_buildings[building][4] -= 25;
                if(p0_buildings[building][4] <= 0){
                    delete p0_buildings[building];
                }

                break;
            }

        }else{
            for(var unit in p1_units){
                if(bullets[bullet][0] <= p1_units[unit][0] - 15
                  || bullets[bullet][0] >= p1_units[unit][0] + 15
                  || bullets[bullet][1] <= p1_units[unit][1] - 15
                  || bullets[bullet][1] >= p1_units[unit][1] + 15){
                    continue;
                }

                p1_units[unit][5] -= 25;
                if(p1_units[unit][5] <= 0){
                    delete p1_units[unit];
                }

                break;
            }

            for(var building in p1_buildings){
                if(bullets[bullet][0] <= p1_buildings[building][0]
                  || bullets[bullet][0] >= p1_buildings[building][0] + 100
                  || bullets[bullet][1] <= p1_buildings[building][1]
                  || bullets[bullet][1] >= p1_buildings[building][1] + 100){
                    continue;
                }

                p1_buildings[building][4] -= 25;
                if(p1_buildings[building][4] <= 0){
                    delete p1_buildings[building];
                }

                break;
            }
        }

        delete bullets[bullet];
    }
}

function m(x0, y0, x1, y1){
    var j0 = Math.abs(x0 - x1);
    var j1 = Math.abs(y0 - y1);

    if(j0 > j1){
        return [1, j1 / j0];

    }else{
        return j1 > j0 ? [j0 / j1, 1] : [.5, .5];
    }
}

function play_audio(id){
    if(settings['audio-volume'] <= 0){
        return;
    }

    document.getElementById(id).currentTime = 0;
    document.getElementById(id).play();
}

function reset(){
    if(!confirm('Reset settings?')){
        return;
    }

    document.getElementById('audio-volume').value = 1;
    document.getElementById('camera-keys').value = 'WASD';
    document.getElementById('fog-of-war').checked = true;
    document.getElementById('level-size').value = 1600;
    document.getElementById('ms-per-frame').value = 25;
    document.getElementById('scroll-speed').value = 10;

    save();
}

function resize(){
    if(mode <= 0){
        return;
    }

    height = window.innerHeight;
    document.getElementById('buffer').height = height;
    document.getElementById('canvas').height = height;
    y = height / 2;

    width = window.innerWidth;
    document.getElementById('buffer').width = width;
    document.getElementById('canvas').width = width;
    x = width / 2;
}

// Save settings into window.localStorage if they differ from default.
function save(){
    if(document.getElementById('audio-volume').value === 1){
        window.localStorage.removeItem('RTS-2D.htm-audio-volume');
        settings['audio-volume'] = 1;

    }else{
        settings['audio-volume'] = parseFloat(document.getElementById('audio-volume').value);
        window.localStorage.setItem(
          'RTS-2D.htm-audio-volume',
          settings['audio-volume']
        );
    }

    if(document.getElementById('camera-keys').value == 'WASD'){
        window.localStorage.removeItem('RTS-2D.htm-camera-keys');
        settings['camera-keys'] = 'WASD';

    }else{
        settings['camera-keys'] = document.getElementById('camera-keys').value;
        window.localStorage.setItem(
          'RTS-2D.htm-camera-keys',
          settings['camera-keys']
        );
    }

    if(document.getElementById('fog-of-war').checked){
        window.localStorage.removeItem('RTS-2D.htm-fog-of-war');
        settings['fog-of-war'] = true;

    }else{
        settings['fog-of-war'] = false;
        window.localStorage.setItem(
          'RTS-2D.htm-fog-of-war',
          0
        );
    }

    if(document.getElementById('level-size').value == 1600
      || isNaN(document.getElementById('level-size').value)
      || document.getElementById('level-size').value < 200){
        window.localStorage.removeItem('RTS-2D.htm-level-size');
        settings['level-size'] = 1600;

    }else{
        settings['level-size'] = parseInt(document.getElementById('level-size').value);
        window.localStorage.setItem(
          'RTS-2D.htm-level-size',
          settings['level-size']
        );
    }

    if(document.getElementById('ms-per-frame').value == 25
      || isNaN(document.getElementById('ms-per-frame').value)
      || document.getElementById('ms-per-frame').value < 1){
        window.localStorage.removeItem('RTS-2D.htm-ms-per-frame');
        settings['ms-per-frame'] = 25;

    }else{
        settings['ms-per-frame'] = parseInt(document.getElementById('ms-per-frame').value);
        window.localStorage.setItem(
          'RTS-2D.htm-ms-per-frame',
          settings['ms-per-frame']
        );
    }

    if(document.getElementById('scroll-speed').value == 10
      || isNaN(document.getElementById('scroll-speed').value)
      || document.getElementById('scroll-speed').value < 1){
        window.localStorage.removeItem('RTS-2D.htm-scroll-speed');
        settings['scroll-speed'] = 10;

    }else{
        settings['scroll-speed'] = parseInt(document.getElementById('scroll-speed').value);
        window.localStorage.setItem(
          'RTS-2D.htm-scroll-speed',
          settings['scroll-speed']
        );
    }
}

function select(){
    selected_id = -1;
    selected_type = -1;

    for(var unit in p0_units){
        p0_units[unit][2] = (
            (mouse_lock_x < x + p0_units[unit][0] + camera_x + 15
              && mouse_x > x + p0_units[unit][0] + camera_x - 15)
            || (mouse_lock_x > x + p0_units[unit][0] + camera_x - 15
              && mouse_x < x + p0_units[unit][0] + camera_x + 15)
          ) && (
            (mouse_lock_y < y + p0_units[unit][1] + camera_y + 15
              && mouse_y > y + p0_units[unit][1] + camera_y - 15)
            || (mouse_lock_y > y + p0_units[unit][1] + camera_y - 15
              && mouse_y < y + p0_units[unit][1] + camera_y + 15)
          );

        if(p0_units[unit][2]){
            selected_id = unit;
            selected_type = 0;
        }
    }

    for(var building in p0_buildings){
        if(selected_type != -1){
            p0_buildings[building][5] = 0;
            continue;
        }

        p0_buildings[building][5] = (
            (mouse_lock_x < x + p0_buildings[building][0] + camera_x + p0_buildings[building][2]
              && mouse_x > x + p0_buildings[building][0] + camera_x)
            || (mouse_lock_x > x + p0_buildings[building][0] + camera_x
              && mouse_x < x + p0_buildings[building][0] + camera_x + p0_buildings[building][2])
          ) && (
            (mouse_lock_y < y + p0_buildings[building][1] + camera_y + p0_buildings[building][3]
              && mouse_y > y + p0_buildings[building][1] + camera_y)
            || (mouse_lock_y > y + p0_buildings[building][1] + camera_y
              && mouse_y < y + p0_buildings[building][1] + camera_y + p0_buildings[building][3])
          );

        if(p0_buildings[building][5]){
            selected_id = building;
            selected_type = p0_buildings[building][8];
        }
    }
}

function setdestination(on_minimap){
    if(selected_type == 0){
        for(var unit in p0_units){
            if(!p0_units[unit][2]){
                continue;
            }

            p0_units[unit][3] = on_minimap
              ? math[0] * (mouse_x - 100)
              : mouse_x - x - camera_x;

            p0_units[unit][4] = on_minimap
              ? math[0] * (mouse_y - height + 100)
              : mouse_y - y - camera_y;

            validate_destination(unit);
        }

    }else if(selected_type > 1){
        for(var building in p0_buildings){
            if(!p0_buildings[building][5]){
                continue;
            }

            p0_buildings[building][6] = on_minimap
              ? math[0] * (mouse_x - 100)
              : mouse_x - x - camera_x;

            if(p0_buildings[building][6] > settings['level-size']){
                p0_buildings[building][6] = settings['level-size'];
            }else if(p0_buildings[building][6] < -settings['level-size']){
                p0_buildings[building][6] = -settings['level-size'];
            }

            p0_buildings[building][7] = on_minimap
              ? math[0] * (mouse_y - height + 100)
              : mouse_y - y - camera_y;

            if(p0_buildings[building][7] > settings['level-size']){
                p0_buildings[building][7] = settings['level-size'];
            }else if(p0_buildings[building][7] < -settings['level-size']){
                p0_buildings[building][7] = -settings['level-size'];
            }
        }
    }
}

function setmode(newmode){
    window.cancelAnimationFrame(animationFrame);
    window.clearInterval(interval);

    bullets = [];
    fog = [];
    p0_buildings = [];
    p0_units = [];
    p1_buildings = [];
    p1_units = [];
    world_static = [];

    mode = newmode;

    // New game mode.
    if(mode > 0){
        save();

        key_down = false;
        key_left = false;
        key_right = false;
        key_up = false;

        // Precalculate stuff.
        math = [
          settings['level-size'] / 100,
          15 / (settings['level-size'] / 200),
          50 / (settings['level-size'] / 200),
          120 / (settings['level-size'] / 200),
        ];

        money = [
          1000,
          750,
        ];
        mouse_hold = 0;
        mouse_lock_x = -1;
        mouse_lock_y = -1;
        mouse_x = -1;
        mouse_y = -1;
        selected_type = -1;

        document.getElementById('page').innerHTML = '<canvas id=canvas oncontextmenu="return false"></canvas><canvas id=buffer style=display:none></canvas>';
        document.getElementById('canvas').style.background = [
          '#277',
          '#444',
          '#321',
        ][mode - 1];

        world_static = [
          [
            -settings['level-size'],
            -settings['level-size'],
            settings['level-size'] * 2,
            settings['level-size'] * 2,
            [
              '#765',
              '#333',
              '#432',
            ][mode - 1],
          ],
        ];

        // Choose random starting locations.
        var start_x = Math.floor(Math.random() * 2);
        var start_y = Math.floor(Math.random() * 2);

        // Create player 0 HQ.
        p0_buildings = [
          [
            start_x ? -settings['level-size'] + 25 : settings['level-size'] - 125,// X
            start_y ? settings['level-size'] - 125 : -settings['level-size'] + 25,// Y
            100,// Width
            100,// Height
            1000,// Health
            0,// Selected
            start_x ? -settings['level-size'] + 75 : settings['level-size'] - 75,// Destination X
            start_y ? settings['level-size'] - 75  : -settings['level-size'] + 75,// Destination Y
            1,// Type
          ],
        ];

        // Create player 1 HQ and Factory.
        p1_buildings = [
          [
            start_x ? settings['level-size'] - 125 : -settings['level-size'] + 25,// X
            start_y ? -settings['level-size'] + 25 : settings['level-size'] -125,// Y
            100,// Width
            100,// Height
            1000,// Health
            1,// Type
          ],[
            start_x ? settings['level-size'] - 250 : -settings['level-size'] + 150,// X
            start_y ? -settings['level-size'] + 25 : settings['level-size'] -125,// Y
            100,// Width
            100,// Height
            1000,// Health
            2,// Type
          ],
        ];

        // Set camera position to HQ location.
        camera_x = -p0_buildings[0][0] - 50;
        camera_y = -p0_buildings[0][1] - 50;

        // Add fog of war, if settings allow it.
        if(settings['fog-of-war']){
            var temp_x = 0;
            var temp_y = 0;
            var times = Math.floor(settings['level-size'] / 50);// Half of level width divided by half of fog unit.

            var loop_counter = Math.pow(times, 2) - 1;// True number of fog units to add.
            do{
                fog.push([
                  temp_x * 100,// Fog X
                  temp_y,// Fog Y
                ]);

                // Add next fog unit one fog unit space to the right.
                temp_x += 1;

                // Done with this row, move on to the next.
                if(loop_counter % times == 0){
                    temp_y += 100;
                    temp_x = 0;
                }
            }while(loop_counter--);

            // Remove fog around initial buildings.
            fog_update_building();
        }

        buffer = document.getElementById('buffer').getContext('2d');
        canvas = document.getElementById('canvas').getContext('2d');

        resize();

        animationFrame = window.requestAnimationFrame(draw);
        interval = window.setInterval(
          'logic()',
          settings['ms-per-frame']
        );

    // Main menu mode.
    }else{
        buffer = 0;
        canvas = 0;

        document.getElementById('page').innerHTML = '<div style=display:inline-block;text-align:left;vertical-align:top><div class=c><b>Skirmish vs AI:</b><ul><li><a onclick=setmode(1)>Island</a><li><a onclick=setmode(2)>Urban</a><li><a onclick=setmode(3)>Wasteland</a></ul></div></div><div style="border-left:8px solid #222;display:inline-block;text-align:left"><div class=c><input id=camera-keys maxlength=4 value='
          + settings['camera-keys'] + '>Camera ↑←↓→<br><input disabled style=border:0 value=ESC>Main Menu</div><hr><div class=c><input id=audio-volume max=1 min=0 step=.01 type=range value='
          + settings['audio-volume'] + '>Audio<br><label><input '
          + (settings['fog-of-war'] ? 'checked ' : '') + 'id=fog-of-war type=checkbox>Fog of War</label><br><input id=level-size value='
          + settings['level-size'] + '>*2 Level Size<br><input id=ms-per-frame value='
          + settings['ms-per-frame'] + '>ms/Frame<br><input id=scroll-speed value='
          + settings['scroll-speed'] + '>Scroll Speed<br><a onclick=reset()>Reset Settings</a></div></div>';
    }
}

function validate_camera_move(mouse_x, mouse_y){
    camera_x = -math[0] * (mouse_x - 100);
    if(camera_x > settings['level-size']){
        camera_x = settings['level-size'];
    }else if(camera_x < -settings['level-size']){
        camera_x = -settings['level-size'];
    }

    camera_y = -math[0] * (mouse_y - height + 100);
    if(camera_y > settings['level-size']){
        camera_y = settings['level-size'];
    }else if(camera_y < -settings['level-size']){
        camera_y = -settings['level-size'];
    }
}

function validate_destination(unit_id){
    if(p0_units[unit_id][3] > settings['level-size']){
        p0_units[unit_id][3] = settings['level-size'];
    }else if(p0_units[unit_id][3] < -settings['level-size']){
        p0_units[unit_id][3] = -settings['level-size'];
    }

    if(p0_units[unit_id][4] > settings['level-size']){
        p0_units[unit_id][4] = settings['level-size'];
    }else if(p0_units[unit_id][4] < -settings['level-size']){
        p0_units[unit_id][4] = -settings['level-size'];
    }
}

var animationFrame = 0;
var buffer = 0;
var build_mode = 0;
var bullets = [];
var canvas = 0;
var camera_x = 0;
var camera_y = 0;
var fog = [];
var height = 0;
var interval = 0;
var key_down = false;
var key_left = false;
var key_right = false;
var key_up = false;
var math = 0;
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
var pi_times_two = Math.PI * 2;
var selected_id = -1;
var selected_type = -1;
var settings = {
  'audio-volume': window.localStorage.getItem('RTS-2D.htm-audio-volume') === null
    ? 1
    : parseFloat(window.localStorage.getItem('RTS-2D.htm-audio-volume')),
  'camera-keys': window.localStorage.getItem('RTS-2D.htm-camera-keys') === null
    ? 'WASD'
    : window.localStorage.getItem('RTS-2D.htm-camera-keys'),
  'fog-of-war': window.localStorage.getItem('RTS-2D.htm-fog-of-war') === null,
  'level-size': window.localStorage.getItem('RTS-2D.htm-level-size') === null
    ? 1600
    : parseFloat(window.localStorage.getItem('RTS-2D.htm-level-size')),
  'ms-per-frame': window.localStorage.getItem('RTS-2D.htm-ms-per-frame') === null
    ? 25
    : parseInt(window.localStorage.getItem('RTS-2D.htm-ms-per-frame')),
  'scroll-speed': window.localStorage.getItem('RTS-2D.htm-scroll-speed') === null
    ? 10
    : parseInt(window.localStorage.getItem('RTS-2D.htm-scroll-speed')),
};
var width = 0;
var world_static = [];
var x = 0;
var y = 0;

setmode(0);

window.onkeydown = function(e){
    if(mode <= 0){
        return;
    }

    var key = e.keyCode || e.which;

    if(key === 27){
        if(build_mode > 0){
            build_mode = 0;

        }else{
            setmode(0);
        }

        return;
    }

    // user selected HQ
    if(selected_type === 1){
        if(key === 70){
            build_mode = 1;
            return;
        }

    // user selected factory and pressed R button
    }else if(selected_type === 2
      && key === 82){
        build_robot();
        return;
    }

    key = String.fromCharCode(key);

    if(key === settings['camera-keys'][1]){
        key_left = true;

    }else if(key === settings['camera-keys'][3]){
        key_right = true;

    }else if(key === settings['camera-keys'][2]){
        key_down = true;

    }else if(key === settings['camera-keys'][0]){
        key_up = true;
    }
};

window.onkeyup = function(e){
    var key = String.fromCharCode(e.keyCode || e.which);

    if(key === settings['camera-keys'][1]){
        key_left = false;

    }else if(key === settings['camera-keys'][3]){
        key_right = false;

    }else if(key === settings['camera-keys'][2]){
        key_down = false;

    }else if(key === settings['camera-keys'][0]){
        key_up = false;
    }
};

window.onmousedown = function(e){
    if(mode <= 0){
        return;
    }

    e.preventDefault();

    // If not clicking on minimap.
    if(mouse_x > 200
      || mouse_y < height - 200){

        // Check if in buildling mode.
        if(build_mode > 0){
            // Build a factory.
            if(money[0] >= 250){
                build_mode = 0;
                money[0] -= 250;

                // Make sure building is within buildable limit.
                var building_x = mouse_x - camera_x - x - 50;
                if(building_x > settings['level-size'] - 100){
                    building_x = settings['level-size'] - 100;

                }else if(building_x < -settings['level-size']){
                    building_x = -settings['level-size'];
                }

                var building_y = mouse_y - camera_y - y - 50;
                if(building_y > settings['level-size'] - 100){
                    building_y = settings['level-size'] - 100;

                }else if(building_y < -settings['level-size']){
                    building_y = -settings['level-size'];
                }

                p0_buildings.push(
                  [
                    building_x,
                    building_y,
                    100,// Width
                    100,// Height
                    1000,// Health
                    0,// Selected
                    building_x + 50,// Destination X
                    building_y + 50,// Destination Y
                    2,// Type
                  ]
                );

                // Remove fog around buildings.
                fog_update_building();
            }

        // If unit selected or not clicking on build robot button.
        }else if(selected_type < 1
          || (mouse_y < height - 65
          || mouse_x > 270)){
            // Left click: start dragging.
            if(e.button == 0){
                mouse_hold = 1;
                mouse_lock_x = mouse_x;
                mouse_lock_y = mouse_y;

            // Right click: try to set selected building/unit destination.
            }else if(e.button == 2){
                setdestination(false);
            }

        // Else if HQ is selected, activate build mode.
        }else if(selected_type == 1){
            build_mode = 1;

        // Else if factory is selected, build robot.
        }else if(selected_type == 2){
            build_robot();
        }

    // Right clicking on minimap.
    }else if(e.button == 2){
        setdestination(true);

    // Other clicks: move camera.
    }else{
        mouse_hold = 2;

        validate_camera_move(
          mouse_x,
          mouse_y
        );
    }
};

window.onmousemove = function(e){
    if(mode <= 0){
        return;
    }

    mouse_x = e.pageX;
    mouse_y = e.pageY;

    // Dragging after click was not on minimap.
    if(mouse_hold == 1){
        select();

    // Dragging after click was on minimap.
    }else if(mouse_hold == 2){
        validate_camera_move(
          mouse_x,
          mouse_y
        );
    }
};

window.onmouseup = function(){
    mouse_hold = 0;
};

window.onresize = resize;
