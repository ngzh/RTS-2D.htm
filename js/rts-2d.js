'use strict';

function build_building(player, building_type, building_x, building_y, fog_override){
    if(players[player]['money'] < buildings[building_type]['cost']){
        return;
    }

    // Make sure building is within buildable limit.
    if(building_x > settings['level-size'] - buildings[building_type]['width']){
        building_x = settings['level-size'] - buildings[building_type]['width'];

    }else if(building_x < -settings['level-size']){
        building_x = -settings['level-size'];
    }

    if(building_y > settings['level-size'] - buildings[building_type]['height']){
        building_y = settings['level-size'] - buildings[building_type]['height'];

    }else if(building_y < -settings['level-size']){
        building_y = -settings['level-size'];
    }

    fog_override = fog_override || false;

    if(player === 0
      && !fog_override){
        // Don't allow building on fog.
        var loop_counter = fog.length - 1;
        if(loop_counter >= 0){
            do{
                if(!fog[loop_counter]['display']){
                    continue;
                }

                if(distance(
                  building_x,
                  building_y,
                  fog[loop_counter]['x'] - settings['level-size'] + buildings[building_type]['width'] / 2,
                  fog[loop_counter]['y'] - settings['level-size'] + buildings[building_type]['height'] / 2
                ) < 70){
                    return;
                }
            }while(loop_counter--);
        }
    }

    players[player]['money'] -= buildings[building_type]['cost'];

    var building = {
      'damage': 0,
      'destination-x': building_x + buildings[building_type]['width'] / 2,
      'destination-y': building_y + buildings[building_type]['height'] / 2,
      'range': 0,
      'reload': 0,
      'reload-current': 0,
      'selected': false,
      'type': building_type,
      'x': building_x,
      'y': building_y,
    };

    for(var property in buildings[building_type]){
        building[property] = buildings[building_type][property];
    }

    players[player]['buildings'].push(building);

    if(player === 0){
        build_mode = '';

        if(fog.length > 0){
            fog_update_building();
        }
    }
}

function build_unit(player, unit_type){
    if(players[player]['money'] < units[unit_type]['cost']){
        return;
    }

    players[player]['money'] -= units[unit_type]['cost'];

    var temp_selected_id = player > 0
      ? 1
      : selected_id;
    var unit = {
      'damage': 25,
      'destination-x': player > 0
        ? Math.floor(Math.random() * settings['level-size'] * 2) - settings['level-size']
        : players[player]['buildings'][temp_selected_id]['destination-x'],
      'destination-y': player > 0
        ? Math.floor(Math.random() * settings['level-size'] * 2) - settings['level-size']
        : players[player]['buildings'][temp_selected_id]['destination-y'],
      'health': 100,
      'selected': false,
      'range': 240,
      'reload': 75,
      'reload-current': 0,
      'x': players[player]['buildings'][temp_selected_id]['x']
        + buildings[players[player]['buildings'][temp_selected_id]['type']]['width'] / 2,
      'y': players[player]['buildings'][temp_selected_id]['y']
        + buildings[players[player]['buildings'][temp_selected_id]['type']]['height'] / 2,
    };

    for(var property in units[unit_type]){
        unit[property] = units[unit_type][property];
    }

    players[player]['units'].push(unit);
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

    buffer.font = '42pt sans-serif';
    buffer.textAlign = 'center';
    buffer.textBaseline = 'middle';

    // Save current buffer state.
    buffer.save();

    // Translate to camera position.
    var offset_x = x + camera_x;
    var offset_y = y + camera_y;
    buffer.translate(
      offset_x,
      offset_y
    );

    // Draw visible static world objects.
    for(var id in world_static){
        if(world_static[id]['x'] + world_static[id]['width'] + offset_x <= 0
          || world_static[id]['x'] + offset_x >= width
          || world_static[id]['y'] + world_static[id]['height'] + offset_y <= 0
          || world_static[id]['y'] + offset_y >= height){
            continue;
        }

        buffer.fillStyle = world_static[id]['color'];
        buffer.fillRect(
          world_static[id]['x'],
          world_static[id]['y'],
          world_static[id]['width'],
          world_static[id]['height']
        );
    }

    // Draw visible player 1 buildings.
    for(var building in players[1]['buildings']){
        if(players[1]['buildings'][building]['x']
            + players[1]['buildings'][building]['width'] + offset_x <= 0
          || players[1]['buildings'][building]['x'] + offset_x >= width
          || players[1]['buildings'][building]['y']
            + players[1]['buildings'][building]['height'] + offset_y <= 0
          || players[1]['buildings'][building]['y'] + offset_y >= height){
            continue;
        }

        buffer.fillStyle = '#600';
        buffer.fillRect(
          players[1]['buildings'][building]['x'],
          players[1]['buildings'][building]['y'],
          players[1]['buildings'][building]['width'],
          players[1]['buildings'][building]['height']
        );
        buffer.fillStyle = '#0f0';
        buffer.fillRect(
          players[1]['buildings'][building]['x'],
          players[1]['buildings'][building]['y'] - 10,
          players[1]['buildings'][building]['width']
            * (players[1]['buildings'][building]['health'] / buildings[players[1]['buildings'][building]['type']]['health']),
          5
        );

        buffer.fillStyle = '#fff';
        buffer.font = players[1]['buildings'][building]['labelSize'] + 'pt sans-serif';
        buffer.fillText(
          players[1]['buildings'][building]['label'],
          players[1]['buildings'][building]['x'] + players[1]['buildings'][building]['width'] / 2,
          players[1]['buildings'][building]['y'] + players[1]['buildings'][building]['height'] / 2
        );
    }

    // Draw visible player 0 buildings.
    for(building in players[0]['buildings']){
        if(players[0]['buildings'][building]['x']
            + players[0]['buildings'][building]['width'] + offset_x <= 0
          || players[0]['buildings'][building]['x'] + offset_x >= width
          || players[0]['buildings'][building]['y']
            + players[0]['buildings'][building]['height'] + offset_y <= 0
          || players[0]['buildings'][building]['y'] + offset_y >= height){
            continue;
        }

        buffer.fillStyle = players[0]['buildings'][building]['selected']
          ? '#1f1'
          : '#060';
        buffer.fillRect(
          players[0]['buildings'][building]['x'],
          players[0]['buildings'][building]['y'],
          players[0]['buildings'][building]['width'],
          players[0]['buildings'][building]['height']
        );
        buffer.fillStyle = '#0f0';
        buffer.fillRect(
          players[0]['buildings'][building]['x'],
          players[0]['buildings'][building]['y'] - 10,
          players[0]['buildings'][building]['width']
            * (players[0]['buildings'][building]['health'] / buildings[players[0]['buildings'][building]['type']]['health']),
          5
        );

        buffer.fillStyle = '#fff';
        buffer.font = players[0]['buildings'][building]['labelSize'] + 'pt sans-serif';
        buffer.fillText(
          players[0]['buildings'][building]['label'],
          players[0]['buildings'][building]['x'] + players[0]['buildings'][building]['width'] / 2,
          players[0]['buildings'][building]['y'] + players[0]['buildings'][building]['height'] / 2
        );
    }

    // Draw visible player 1 units.
    for(var unit in players[1]['units']){
        if(players[1]['units'][unit]['x'] + 15 + offset_x <= 0
          || players[1]['units'][unit]['x'] - 15 + offset_x >= width
          || players[1]['units'][unit]['y'] + 15 + offset_y <= 0
          || players[1]['units'][unit]['y'] - 15 + offset_y >= height){
            continue;
        }

        buffer.fillStyle = '#b00';
        buffer.fillRect(
          players[1]['units'][unit]['x'] - 15,
          players[1]['units'][unit]['y'] - 15,
          30,
          30
        );
        buffer.fillStyle = '#0f0';
        buffer.fillRect(
          players[1]['units'][unit]['x'] - 15,
          players[1]['units'][unit]['y'] - 25,
          30 * (players[1]['units'][unit]['health'] / 100),
          5
        );
    }

    // Draw visible player 0 units.
    for(unit in players[0]['units']){
        if(players[0]['units'][unit]['x'] + 15 + offset_x <= 0
          || players[0]['units'][unit]['x'] - 15 + offset_x >= width
          || players[0]['units'][unit]['y'] + 15 + offset_y <= 0
          || players[0]['units'][unit]['y'] - 15 + offset_y >= height){
            continue;
        }

        buffer.fillStyle = players[0]['units'][unit]['selected'] ? '#1f1' : '#0b0';
        buffer.fillRect(
          players[0]['units'][unit]['x'] - 15,
          players[0]['units'][unit]['y'] - 15,
          30,
          30
        );
        buffer.fillStyle = '#0f0';
        buffer.fillRect(
          players[0]['units'][unit]['x'] - 15,
          players[0]['units'][unit]['y'] - 25,
          30 * (players[0]['units'][unit]['health'] / 100),
          5
        );
    }

    // Draw bullets.
    for(var bullet in bullets){
        buffer.fillStyle = bullets[bullet]['color'];
        buffer.fillRect(
          Math.round(bullets[bullet]['x']) - 5,
          Math.round(bullets[bullet]['y']) - 5,
          10,
          10
        );
    }

    // Draw fog.
    buffer.fillStyle = settings['fog-color'];
    for(var id in fog){
        if(!fog[id]['display']){
            continue;
        }

        buffer.fillRect(
          -settings['level-size'] + fog[id]['x'],
          -settings['level-size'] + fog[id]['y'],
          100,
          100
        );
    }

    // Draw selected building destination and range.
    for(building in players[0]['buildings']){
        if(!players[0]['buildings'][building]['selected']
          || players[0]['buildings'][building]['destination-x'] === null){
            continue;
        }

        buffer.beginPath();
        buffer.moveTo(
          players[0]['buildings'][building]['x']
            + players[0]['buildings'][building]['width'] / 2,
          players[0]['buildings'][building]['y']
            + players[0]['buildings'][building]['height'] / 2
        );
        buffer.lineTo(
          players[0]['buildings'][building]['destination-x'],
          players[0]['buildings'][building]['destination-y']
        );
        buffer.closePath();
        buffer.stroke();

        if(players[0]['buildings'][building]['range'] > 0){
            buffer.beginPath();
            buffer.arc(
              players[0]['buildings'][building]['x'],
              players[0]['buildings'][building]['y'],
              players[0]['buildings'][building]['range'],
              0,
              math[4],
              false
            );
            buffer.closePath();
            buffer.stroke();
        }
    }

    // Draw selected unit destinations and range.
    for(unit in players[0]['units']){
        if(!players[0]['units'][unit]['selected']){
            continue;
        }

        if(players[0]['units'][unit]['x'] != players[0]['units'][unit]['destination-x']
          || players[0]['units'][unit]['y'] != players[0]['units'][unit]['destination-y']){
            buffer.beginPath();
            buffer.moveTo(
              players[0]['units'][unit]['x'],
              players[0]['units'][unit]['y']
            );
            buffer.lineTo(
              players[0]['units'][unit]['destination-x'],
              players[0]['units'][unit]['destination-y']
            );
            buffer.closePath();
            buffer.stroke();
        }

        buffer.beginPath();
        buffer.arc(
          players[0]['units'][unit]['x'],
          players[0]['units'][unit]['y'],
          players[0]['units'][unit]['range'],
          0,
          math[4],
          false
        );
        buffer.closePath();
        buffer.stroke();
    }

    // Restore the buffer state.
    buffer.restore();

    // Draw selection box.
    if(mouse_hold === 1){
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
    if(build_mode.length > 0){
        buffer.fillStyle = '#1f1';

        var building_x = mouse_x - buildings[build_mode]['width'] / 2;
        building_x = Math.min(
          building_x,
          settings['level-size'] + camera_x + x - buildings[build_mode]['width']
        );
        building_x = Math.max(
          building_x,
          -settings['level-size'] + camera_x + x
        );

        var building_y = mouse_y - buildings[build_mode]['height'] / 2;
        building_y = Math.min(
          building_y,
          settings['level-size'] + camera_y + y - buildings[build_mode]['height']
        );
        building_y = Math.max(
          building_y,
          -settings['level-size'] + camera_y + y
        );

        buffer.fillRect(
          building_x,
          building_y,
          buildings[build_mode]['width'],
          buildings[build_mode]['height']
        );


        buffer.fillStyle = '#fff';
        buffer.font = buildings[build_mode]['labelSize'] + 'pt sans-serif';
        buffer.fillText(
          build_mode,
          building_x + buildings[build_mode]['width'] / 2,
          building_y + buildings[build_mode]['height'] / 2
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

    if(selected_type !== ''
      && selected_type !== 'Unit'){
        var offset = 0;
        for(var label in buildings[selected_type]['children']){
            buffer.fillStyle = '#222';
            buffer.fillRect(
              205 + offset,
              height - 70,
              70,
              70
            );

            buffer.fillStyle = '#111';
            buffer.fillRect(
              205 + offset,
              height - 65,
              65,
              65
            );

            buffer.fillStyle = '#fff';
            buffer.font = '42pt sans-serif';
            buffer.fillText(
              buildings[selected_type]['children'][label],
              240 + offset,
              height - 25
            );

            offset += 70;
        }
    }

    // Draw minimap background.
    buffer.fillStyle = world_static[0]['color'];
    buffer.fillRect(
      0,
      height - 200,
      200,
      200
    );

    // Draw player 1 buildings on minimap.
    buffer.fillStyle = '#600';
    for(building in players[1]['buildings']){
        var minimap = math[buildings[players[1]['buildings'][building]['type']]['minimap']];
        buffer.fillRect(
          100 + players[1]['buildings'][building]['x'] / math[0],
          height - 100 + players[1]['buildings'][building]['y'] / math[0],
          minimap,
          minimap
        );
    }

    // Draw player 0 buildings on minimap.
    for(building in players[0]['buildings']){
        var minimap = math[buildings[players[0]['buildings'][building]['type']]['minimap']];
        buffer.fillStyle = players[0]['buildings'][building]['selected'] ? '#1f1' : '#060';
        buffer.fillRect(
          100 + players[0]['buildings'][building]['x'] / math[0],
          height - 100 + players[0]['buildings'][building]['y'] / math[0],
          minimap,
          minimap
        );
    }

    // Draw player 1 units on minimap.
    buffer.fillStyle = '#b00';
    for(unit in players[1]['units']){
        buffer.fillRect(
          100 + (players[1]['units'][unit]['x'] - 15) / math[0],
          height - 100 + (players[1]['units'][unit]['y'] - 15) / math[0],
          math[1],
          math[1]
        );
    }

    // Draw player 0 units on minimap.
    for(unit in players[0]['units']){
        buffer.fillStyle = players[0]['units'][unit]['selected'] ? '#1f1' : '#0b0';
        buffer.fillRect(
          100 + (players[0]['units'][unit]['x'] - 15) / math[0],
          height - 100 + (players[0]['units'][unit]['y'] - 15) / math[0],
          math[1],
          math[1]
        );
    }

    // Draw fog on minimap.
    buffer.fillStyle = settings['fog-color'];
    for(id in fog){
        if(!fog[id]['display']){
            continue;
        }

        buffer.fillRect(
          fog[id]['x'] / math[0],
          height - 200 + fog[id]['y'] / math[0],
          math[2],
          math[2]
        );
    }

    // Draw building destination on minimap.
    for(building in players[0]['buildings']){
        // Only draw if building is selected.
        if(!players[0]['buildings'][building]['selected']
          || players[0]['buildings'][building]['destination-x'] === null){
            continue;
        }

        buffer.beginPath();
        buffer.moveTo(
          100 + (players[0]['buildings'][building]['x']
            + players[0]['buildings'][building]['width'] / 2) / math[0],
          height - 100 + (players[0]['buildings'][building]['y']
            + players[0]['buildings'][building]['height'] / 2) / math[0]
        );
        buffer.lineTo(
          100 + players[0]['buildings'][building]['destination-x'] / math[0],
          height - 100 + players[0]['buildings'][building]['destination-y'] / math[0]
        );
        buffer.closePath();
        buffer.stroke();
    }

    // Draw selected unit destination and range on minimap.
    for(unit in players[0]['units']){
        if(!players[0]['units'][unit]['selected']){
            continue;
        }

        // Draw destination if the unit has one.
        if(players[0]['units'][unit]['x'] != players[0]['units'][unit]['destination-x']
          || players[0]['units'][unit]['y'] != players[0]['units'][unit]['destination-y']){
            buffer.beginPath();
            buffer.moveTo(
              100 + players[0]['units'][unit]['x'] / math[0],
              height - 100 + players[0]['units'][unit]['y'] / math[0]
            );
            buffer.lineTo(
              100 + players[0]['units'][unit]['destination-x'] / math[0],
              height - 100 + players[0]['units'][unit]['destination-y'] / math[0]
            );
            buffer.closePath();
            buffer.stroke();
        }

        // Draw range circle.
        buffer.beginPath();
        buffer.arc(
          100 + players[0]['units'][unit]['x'] / math[0],
          height - 100 + players[0]['units'][unit]['y'] / math[0],
          math[3],
          0,
          math[4],
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
    if(mouse_hold === 1){
        // Make sure box cannot go past right edge.
        temp_x = 100 - (offset_x - mouse_lock_x) / math[0];
        temp_width = (mouse_x - mouse_lock_x) / math[0];
        // Box past right edge? Decrease width to fix.
        if(temp_x > 200 - temp_width){
            temp_width = 200 - temp_x;
        }

        // Make sure box can't go past top edge.
        temp_y = height - 100 - (offset_y - mouse_lock_y) / math[0];
        temp_height = (mouse_y - mouse_lock_y) / math[0];

        // Box past top edge? Decrease height and make sure height isn't negative.
        if(temp_y + temp_height < height - 200){
            temp_height = height - 200 - temp_y;
        }
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

    // Draw win/lose text if win/lose conditions met.
    if((players[0]['buildings'].length < 1 && players[0]['units'].length < 1)
      || (players[1]['buildings'].length < 1 && players[1]['units'].length < 1)){

        if(players[0]['buildings'].length < 1){
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

    buffer.fillStyle = '#fff';

    if(paused){
        buffer.fillText(
          'PAUSED',
          x,
          y / 2 + 100
        );
    }

    // Draw player 0 money.
    buffer.textAlign = 'left';
    buffer.textBaseline = 'alphabetic';
    buffer.fillText(
      players[0]['money'],
      5,
      height - 215
    );

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
    for(var building in players[0]['buildings']){
        // Check if fog is within 390px of a building.
        var loop_counter = fog.length - 1;
        do{
            if(distance(
              players[0]['buildings'][building]['x'],
              players[0]['buildings'][building]['y'],
              fog[loop_counter]['x'] - settings['level-size'],
              fog[loop_counter]['y'] - settings['level-size']
            ) > 390){
                continue;
            }

            if(settings['fog-type'] === 2){
                fog[loop_counter]['display'] = false;

            }else{
                fog.splice(
                  loop_counter,
                  1
                );
            }
        }while(loop_counter--);
    }
}

function get_movement_speed(x0, y0, x1, y1){
    var angle = Math.atan(Math.abs(y0 - y1) / Math.abs(x0 - x1));
    return [
      Math.cos(angle),
      Math.sin(angle),
    ];
}

function logic(){
    if(paused){
        return;
    }

    // If infinite fog is selected, reset fog.
    if(settings['fog-type'] === 2){
        for(var id in fog){
            fog[id]['display'] = true;
        }
    }

    money_timer += 1;
    if(money_timer >= settings['frames-per-income']){
        money_timer = 0;
        players[0]['money'] += 1;
        players[1]['money'] += 1;
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
    if(mouse_hold === 1){
        select();
    }

    // AI: attempt to build a unit if factory exists.
    if(players[1]['buildings'].length > 1){
        build_unit(
          1,
          'Robot'
        );

    // AI: attempt to build a factory if it doesn't exist.
    }else if(players[1]['buildings'].length > 0
      && players[1]['buildings'][0]['type'] === 'HQ'
      && players[1]['money'] > 250){
        build_building(
          1,
          'F',
          players[1]['buildings'][0]['x'] > 0
            ? players[1]['buildings'][0]['x'] - 125
            : players[1]['buildings'][0]['x'] + 125,
          players[1]['buildings'][0]['y']
        );
    }

    for(var building in players[1]['buildings']){
        if(players[1]['buildings'][building]['range'] <= 0){
            continue;
        }

        // If reloading, decrease reload,...
        if(players[1]['buildings'][building]['reload-current'] > 0){
            players[1]['buildings'][building]['reload-current'] -= 1;

        // ...else look for nearby p0 units to fire at.
        }else{
            var check_for_buildings = true;
            for(var p0_unit in players[0]['units']){
                if(distance(
                  players[1]['buildings'][building]['x'],
                  players[1]['buildings'][building]['y'],
                  players[0]['units'][p0_unit]['x'],
                  players[0]['units'][p0_unit]['y']
                ) > players[1]['buildings'][building]['range']){
                    continue;
                }

                players[1]['buildings'][building]['reload-current'] = players[1]['buildings'][building]['reload'];
                bullets.push({
                  'color': '#f66',
                  'damage': players[1]['buildings'][building]['damage'],
                  'destination-x': players[0]['units'][p0_unit]['x'],
                  'destination-y': players[0]['units'][p0_unit]['y'],
                  'player': 1,
                  'x': players[1]['buildings'][building]['x']
                    + buildings[players[1]['buildings'][building]['type']]['width'] / 2,
                  'y': players[1]['buildings'][building]['y']
                    + buildings[players[1]['buildings'][building]['type']]['height'] / 2,
                });
                check_for_buildings = false;
                break;
            }

            // If no units in range, look for buildings to fire at.
            if(check_for_buildings){
                for(var p0_building in players[0]['buildings']){
                    if(distance(
                      players[1]['buildings'][building]['x'],
                      players[1]['buildings'][building]['y'],
                      players[0]['buildings'][p0_building]['x']
                        + buildings[players[0]['buildings'][p0_building]['type']]['width'] / 2,
                      players[0]['buildings'][p0_building]['y']
                        + buildings[players[0]['buildings'][p0_building]['type']]['height'] / 2
                    ) > players[1]['buildings'][building]['range']){
                        continue;
                    }

                    players[1]['buildings'][building]['reload-current'] = players[1]['buildings'][building]['reload'];
                    bullets.push({
                      'color': '#f66',
                      'damage': players[1]['buildings'][building]['damage'],
                      'destination-x': players[0]['buildings'][p0_building]['x']
                        + buildings[players[0]['buildings'][p0_building]['type']]['width'] / 2,
                      'destination-y': players[0]['buildings'][p0_building]['y']
                        + buildings[players[0]['buildings'][p0_building]['type']]['height'] / 2,
                      'player': 1,
                      'x': players[1]['buildings'][building]['x']
                        + buildings[players[1]['buildings'][building]['type']]['width'] / 2,
                      'y': players[1]['buildings'][building]['y']
                        + buildings[players[1]['buildings'][building]['type']]['height'] / 2,
                    });
                    break;
                }
            }
        }
    }

    for(building in players[0]['buildings']){
        if(players[0]['buildings'][building]['range'] <= 0){
            continue;
        }

        // If reloading, decrease reload,...
        if(players[0]['buildings'][building]['reload-current'] > 0){
            players[0]['buildings'][building]['reload-current'] -= 1;

        // ...else look for nearby p0 units to fire at.
        }else{
            var check_for_buildings = true;
            for(var p1_unit in players[1]['units']){
                if(distance(
                  players[0]['buildings'][building]['x'],
                  players[0]['buildings'][building]['y'],
                  players[1]['units'][p1_unit]['x'],
                  players[1]['units'][p1_unit]['y']
                ) > players[0]['buildings'][building]['range']){
                    continue;
                }

                players[0]['buildings'][building]['reload-current'] = players[0]['buildings'][building]['reload'];
                bullets.push({
                  'color': '#f66',
                  'damage': players[0]['buildings'][building]['damage'],
                  'destination-x': players[1]['units'][p1_unit]['x'],
                  'destination-y': players[1]['units'][p1_unit]['y'],
                  'player': 0,
                  'x': players[0]['buildings'][building]['x']
                    + buildings[players[0]['buildings'][building]['type']]['width'] / 2,
                  'y': players[0]['buildings'][building]['y']
                    + buildings[players[0]['buildings'][building]['type']]['height'] / 2,
                });
                check_for_buildings = false;
                break;
            }

            // If no units in range, look for buildings to fire at.
            if(check_for_buildings){
                for(var p1_building in players[1]['buildings']){
                    if(distance(
                      players[0]['buildings'][building]['x'],
                      players[0]['buildings'][building]['y'],
                      players[1]['buildings'][p1_building]['x']
                        + buildings[players[1]['buildings'][p1_building]['type']]['width'] / 2,
                      players[1]['buildings'][p1_building]['y']
                        + buildings[players[1]['buildings'][p1_building]['type']]['height'] / 2
                    ) > players[0]['buildings'][building]['range']){
                        continue;
                    }

                    players[0]['buildings'][building]['reload-current'] = players[0]['buildings'][building]['reload'];
                    bullets.push({
                      'color': '#f66',
                      'damage': players[0]['buildings'][building]['damage'],
                      'destination-x': players[1]['buildings'][p1_building]['x']
                        + buildings[players[1]['buildings'][p1_building]['type']]['width'] / 2,
                      'destination-y': players[1]['buildings'][p1_building]['y']
                        + buildings[players[1]['buildings'][p1_building]['type']]['height'] / 2,
                      'player': 0,
                      'x': players[0]['buildings'][building]['x']
                        + buildings[players[0]['buildings'][building]['type']]['width'] / 2,
                      'y': players[0]['buildings'][building]['y']
                        + buildings[players[0]['buildings'][building]['type']]['height'] / 2,
                    });
                    break;
                }
            }
        }
    }

    for(var unit in players[1]['units']){
        // If reloading, decrease reload,...
        if(players[1]['units'][unit]['reload-current'] > 0){
            players[1]['units'][unit]['reload-current'] -= 1;

        // ...else look for nearby p0 units to fire at.
        }else{
            var check_for_buildings = true;
            for(var p0_unit in players[0]['units']){
                if(distance(
                  players[1]['units'][unit]['x'],
                  players[1]['units'][unit]['y'],
                  players[0]['units'][p0_unit]['x'],
                  players[0]['units'][p0_unit]['y']
                ) > players[1]['units'][unit]['range']){
                    continue;
                }

                players[1]['units'][unit]['reload-current'] = players[1]['units'][unit]['reload'];
                bullets.push({
                  'color': '#f66',
                  'damage': players[1]['units'][unit]['damage'],
                  'destination-x': players[0]['units'][p0_unit]['x'],
                  'destination-y': players[0]['units'][p0_unit]['y'],
                  'player': 1,
                  'x': players[1]['units'][unit]['x'],
                  'y': players[1]['units'][unit]['y'],
                });
                check_for_buildings = false;
                break;
            }

            // If no units in range, look for buildings to fire at.
            if(check_for_buildings){
                for(var building in players[0]['buildings']){
                    if(distance(
                      players[1]['units'][unit]['x'],
                      players[1]['units'][unit]['y'],
                      players[0]['buildings'][building]['x']
                        + buildings[players[0]['buildings'][building]['type']]['width'] / 2,
                      players[0]['buildings'][building]['y']
                        + buildings[players[0]['buildings'][building]['type']]['height'] / 2
                    ) > players[1]['units'][unit]['range']){
                        continue;
                    }

                    players[1]['units'][unit]['reload-current'] = players[1]['units'][unit]['reload'];
                    bullets.push({
                      'color': '#f66',
                      'damage': players[1]['units'][unit]['damage'],
                      'destination-x': players[0]['buildings'][building]['x']
                        + buildings[players[0]['buildings'][building]['type']]['width'] / 2,
                      'destination-y': players[0]['buildings'][building]['y']
                        + buildings[players[0]['buildings'][building]['type']]['height'] / 2,
                      'player': 1,
                      'x': players[1]['units'][unit]['x'],
                      'y': players[1]['units'][unit]['y'],
                    });
                    break;
                }
            }
        }

        // Movement "AI", pick new destination once destination is reached.
        if(players[1]['units'][unit]['x'] != players[1]['units'][unit]['destination-x']
          || players[1]['units'][unit]['y'] != players[1]['units'][unit]['destination-y']){
            var speeds = get_movement_speed(
              players[1]['units'][unit]['x'],
              players[1]['units'][unit]['y'],
              players[1]['units'][unit]['destination-x'],
              players[1]['units'][unit]['destination-y']
            );

            if(players[1]['units'][unit]['x'] != players[1]['units'][unit]['destination-x']){
                players[1]['units'][unit]['x'] += 
                  (players[1]['units'][unit]['x'] > players[1]['units'][unit]['destination-x']
                    ? -speeds[0]
                    : speeds[0]
                  ) * .7;
            }

            if(players[1]['units'][unit]['y'] != players[1]['units'][unit]['destination-y']){
                players[1]['units'][unit]['y'] +=
                  (players[1]['units'][unit]['y'] > players[1]['units'][unit]['destination-y']
                    ? -speeds[1]
                    : speeds[1]
                  ) * .7;
            }

            if(players[1]['units'][unit]['x'] > players[1]['units'][unit]['destination-x'] - 5
              && players[1]['units'][unit]['x'] < players[1]['units'][unit]['destination-x'] + 5
              && players[1]['units'][unit]['y'] > players[1]['units'][unit]['destination-y'] - 5
              && players[1]['units'][unit]['y'] < players[1]['units'][unit]['destination-y'] + 5){
                players[1]['units'][unit]['destination-x'] = Math.floor(Math.random() * settings['level-size'] * 2)
                  - settings['level-size'];
                players[1]['units'][unit]['destination-y'] = Math.floor(Math.random() * settings['level-size'] * 2)
                  - settings['level-size'];
            }
        }
    }

    for(unit in players[0]['units']){
        var update_fog = false;

        // If not yet reached destination, move unit.
        if(Math.abs(players[0]['units'][unit]['x'] - players[0]['units'][unit]['destination-x']) > 1
          && Math.abs(players[0]['units'][unit]['y'] - players[0]['units'][unit]['destination-y']) > 1){
            var speeds = get_movement_speed(
              players[0]['units'][unit]['x'],
              players[0]['units'][unit]['y'],
              players[0]['units'][unit]['destination-x'],
              players[0]['units'][unit]['destination-y']
            );

            if(players[0]['units'][unit]['x'] != players[0]['units'][unit]['destination-x']){
                players[0]['units'][unit]['x'] +=
                  (players[0]['units'][unit]['x'] > players[0]['units'][unit]['destination-x']
                    ? -speeds[0]
                    : speeds[0]
                  ) * .7;
            }

            if(players[0]['units'][unit]['y'] != players[0]['units'][unit]['destination-y']){
                players[0]['units'][unit]['y'] +=
                  (players[0]['units'][unit]['y'] > players[0]['units'][unit]['destination-y'] 
                    ? -speeds[1]
                    : speeds[1]
                  ) * .7;
            }

            update_fog = true;

        // Destination reached, make sure units don't overlap.
        }else{
            for(var other_unit in players[0]['units']){
                if(unit === other_unit){
                    continue;
                }

                if(distance(
                  players[0]['units'][unit]['x'],
                  players[0]['units'][unit]['y'],
                  players[0]['units'][other_unit]['x'],
                  players[0]['units'][other_unit]['y']
                ) < 20){
                    players[0]['units'][unit]['destination-x'] = players[0]['units'][unit]['x']
                      + Math.floor(Math.random() * 40) - 20;
                    players[0]['units'][unit]['destination-y'] = players[0]['units'][unit]['y']
                      + Math.floor(Math.random() * 40) - 20;

                    validate_destination(
                      'units',
                      unit
                    );

                    break;
                }
            }
        }

        // Update fog.
        if(settings['fog-type'] === 2
          || update_fog){
            var loop_counter = fog.length - 1;
            if(loop_counter >= 0){
                do{
                    if(distance(
                      players[0]['units'][unit]['x'],
                      players[0]['units'][unit]['y'],
                      fog[loop_counter]['x'] - settings['level-size'] + 50,
                      fog[loop_counter]['y'] - settings['level-size'] + 50
                    ) < 290){
                        if(settings['fog-type'] === 2){
                            fog[loop_counter]['display'] = false;

                        }else{
                            fog.splice(
                              loop_counter,
                              1
                            );
                        }
                    }
                }while(loop_counter--);
            }
        }

        // If reloading, decrease reload,...
        if(players[0]['units'][unit]['reload-current'] > 0){
            players[0]['units'][unit]['reload-current'] -= 1;
            continue;
        }

        var check_for_buildings = true;
        for(var p1_unit in players[1]['units']){
            if(distance(
              players[0]['units'][unit]['x'],
              players[0]['units'][unit]['y'],
              players[1]['units'][p1_unit]['x'],
              players[1]['units'][p1_unit]['y']
            ) > players[0]['units'][unit]['range']){
                continue;
            }

            players[0]['units'][unit]['reload-current'] = players[0]['units'][unit]['reload'];
            bullets.push({
              'color': '#090',
              'damage': players[0]['units'][unit]['damage'],
              'destination-x': players[1]['units'][p1_unit]['x'],
              'destination-y': players[1]['units'][p1_unit]['y'],
              'player': 0,
              'x': players[0]['units'][unit]['x'],
              'y': players[0]['units'][unit]['y'],
            });
            check_for_buildings = false;
            break;
        }

        // If not checking for buildings, continue;
        if(!check_for_buildings){
            continue;
        }

        for(var building in players[1]['buildings']){
            if(distance(
              players[0]['units'][unit]['x'],
              players[0]['units'][unit]['y'],
              players[1]['buildings'][building]['x']
                + buildings[players[1]['buildings'][building]['type']]['width'] / 2,
              players[1]['buildings'][building]['y']
                + buildings[players[1]['buildings'][building]['type']]['width'] / 2
            ) > players[0]['units'][unit]['range']){
                continue;
            }

            players[0]['units'][unit]['reload-current'] = players[0]['units'][unit]['reload'];
            bullets.push({
              'color': '#090',
              'damage': players[0]['units'][unit]['damage'],
              'destination-x': players[1]['buildings'][building]['x']
                + buildings[players[1]['buildings'][building]['type']]['width'] / 2,
              'destination-y': players[1]['buildings'][building]['y']
                + buildings[players[1]['buildings'][building]['type']]['height'] / 2,
              'player': 0,
              'x': players[0]['units'][unit]['x'],
              'y': players[0]['units'][unit]['y'],
            });
            break;
        }
    }

    for(var bullet in bullets){
        // Calculate bullet movement.
        var speeds = get_movement_speed(
          bullets[bullet]['x'],
          bullets[bullet]['y'],
          bullets[bullet]['destination-x'],
          bullets[bullet]['destination-y']
        );

        // Move bullet x.
        if(bullets[bullet]['x'] != bullets[bullet]['destination-x']){
            bullets[bullet]['x'] +=
              10
              * (bullets[bullet]['x'] > bullets[bullet]['destination-x']
                ? -speeds[0]
                : speeds[0]
              );
        }

        // Move bullet y.
        if(bullets[bullet]['y'] != bullets[bullet]['destination-y']){
            bullets[bullet]['y'] +=
              10
              * (bullets[bullet]['y'] > bullets[bullet]['destination-y']
                ? -speeds[1]
                : speeds[1]
              );
        }

        // If bullet reaches destination, check for collisions.
        if(bullets[bullet]['x'] <= bullets[bullet]['destination-x'] - 10
          || bullets[bullet]['x'] >= bullets[bullet]['destination-x'] + 10
          || bullets[bullet]['y'] <= bullets[bullet]['destination-y'] - 10
          || bullets[bullet]['y'] >= bullets[bullet]['destination-y'] + 10){
            continue;
        }

        if(bullets[bullet]['player'] === 1){
            for(var unit in players[0]['units']){
                if(bullets[bullet]['x'] <= players[0]['units'][unit]['x'] - 15
                  || bullets[bullet]['x'] >= players[0]['units'][unit]['x'] + 15
                  || bullets[bullet]['y'] <= players[0]['units'][unit]['y'] - 15
                  || bullets[bullet]['y'] >= players[0]['units'][unit]['y'] + 15){
                    continue;
                }

                players[0]['units'][unit]['health'] -= bullets[bullet]['damage'];
                if(players[0]['units'][unit]['health'] <= 0){
                    players[0]['units'].splice(
                      unit,
                      1
                    );
                }

                break;
            }

            for(var building in players[0]['buildings']){
                if(bullets[bullet]['x'] <= players[0]['buildings'][building]['x']
                  || bullets[bullet]['x'] >= players[0]['buildings'][building]['x'] + 100
                  || bullets[bullet]['y'] <= players[0]['buildings'][building]['y']
                  || bullets[bullet]['y'] >= players[0]['buildings'][building]['y'] + 100){
                    continue;
                }

                players[0]['buildings'][building]['health'] -= bullets[bullet]['damage'];
                if(players[0]['buildings'][building]['health'] <= 0){
                    if(selected_id === building){
                        build_mode = '';
                        selected_id = -1;
                        selected_type = '';
                    }

                    players[0]['buildings'].splice(
                      building,
                      1
                    );
                }

                break;
            }

        }else{
            for(var unit in players[1]['units']){
                if(bullets[bullet]['x'] <= players[1]['units'][unit]['x'] - 15
                  || bullets[bullet]['x'] >= players[1]['units'][unit]['x'] + 15
                  || bullets[bullet]['y'] <= players[1]['units'][unit]['y'] - 15
                  || bullets[bullet]['y'] >= players[1]['units'][unit]['y'] + 15){
                    continue;
                }

                players[1]['units'][unit]['health'] -= bullets[bullet]['damage'];
                if(players[1]['units'][unit]['health'] <= 0){
                    players[1]['units'].splice(
                      unit,
                      1
                    );
                }

                break;
            }

            for(var building in players[1]['buildings']){
                if(bullets[bullet]['x'] <= players[1]['buildings'][building]['x']
                  || bullets[bullet]['x'] >= players[1]['buildings'][building]['x'] + 100
                  || bullets[bullet]['y'] <= players[1]['buildings'][building]['y']
                  || bullets[bullet]['y'] >= players[1]['buildings'][building]['y'] + 100){
                    continue;
                }

                players[1]['buildings'][building]['health'] -= bullets[bullet]['damage'];
                if(players[1]['buildings'][building]['health'] <= 0){
                    players[1]['buildings'].splice(
                      building,
                      1
                    );
                }

                break;
            }
        }

        bullets.splice(
          bullet,
          1
        );
    }

    // Only update building fog removal
    //   if infinite fog is selected.
    if(settings['fog-type'] === 2){
        fog_update_building();
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
    if(!window.confirm('Reset settings?')){
        return;
    }

    var ids = {
      'audio-volume': 1,
      'camera-keys': 'WASD',
      'frames-per-income': 100,
      'fog-color': '#000000',
      'fog-type': 1,
      'level-size': 1600,
      'money': 1000,
      'ms-per-frame': 25,
      'scroll-speed': 10,
    };
    for(var id in ids){
        document.getElementById(id).value = ids[id];
    }

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

    buffer.font = '42pt sans-serif';
    buffer.strokeStyle = '#ddd';
}

// Save settings into window.localStorage if they differ from default.
function save(){
    var ids = {
      'audio-volume': 1,
      'camera-keys': 'WASD',
      'fog-color': '#000000',
      'pause-key': 'P',
    };
    for(var id in ids){
        settings[id] = document.getElementById(id).value;

        if(settings[id] == ids[id]){
            window.localStorage.removeItem('RTS-2D.htm-' + id);

        }else{
            window.localStorage.setItem(
              'RTS-2D.htm-' + id,
              settings[id]
            );
        }
    }

    ids = {
      'fog-type': 1,
      'frames-per-income': 100,
      'level-size': 1600,
      'money': 1000,
      'ms-per-frame': 25,
      'scroll-speed': 10,
    };
    for(var id in ids){
        settings[id] = parseInt(document.getElementById(id).value);

        if(settings[id] == ids[id]
          || isNaN(settings[id])){
            window.localStorage.removeItem('RTS-2D.htm-' + id);

        }else{
            window.localStorage.setItem(
              'RTS-2D.htm-' + id,
              settings[id]
            );
        }
    }
}

function select(){
    selected_id = -1;
    selected_type = '';

    for(var unit in players[0]['units']){
        players[0]['units'][unit]['selected'] = (
            (mouse_lock_x < x + players[0]['units'][unit]['x'] + camera_x + 15
              && mouse_x > x + players[0]['units'][unit]['x'] + camera_x - 15)
            || (mouse_lock_x > x + players[0]['units'][unit]['x'] + camera_x - 15
              && mouse_x < x + players[0]['units'][unit]['x'] + camera_x + 15)
          ) && (
            (mouse_lock_y < y + players[0]['units'][unit]['y'] + camera_y + 15
              && mouse_y > y + players[0]['units'][unit]['y'] + camera_y - 15)
            || (mouse_lock_y > y + players[0]['units'][unit]['y'] + camera_y - 15
              && mouse_y < y + players[0]['units'][unit]['y'] + camera_y + 15)
          );

        if(players[0]['units'][unit]['selected']){
            selected_id = unit;
            selected_type = 'Unit';
        }
    }

    for(var building in players[0]['buildings']){
        if(selected_type !== ''){
            players[0]['buildings'][building]['selected'] = 0;
            continue;
        }

        players[0]['buildings'][building]['selected'] = (
            (mouse_lock_x < x + players[0]['buildings'][building]['x'] + camera_x + players[0]['buildings'][building]['width']
              && mouse_x > x + players[0]['buildings'][building]['x'] + camera_x)
            || (mouse_lock_x > x + players[0]['buildings'][building]['x'] + camera_x
              && mouse_x < x + players[0]['buildings'][building]['x'] + camera_x + players[0]['buildings'][building]['width'])
          ) && (
            (mouse_lock_y < y + players[0]['buildings'][building]['y'] + camera_y + players[0]['buildings'][building]['height']
              && mouse_y > y + players[0]['buildings'][building]['y'] + camera_y)
            || (mouse_lock_y > y + players[0]['buildings'][building]['y'] + camera_y
              && mouse_y < y + players[0]['buildings'][building]['y'] + camera_y + players[0]['buildings'][building]['height'])
          );

        if(players[0]['buildings'][building]['selected']){
            selected_id = building;
            selected_type = players[0]['buildings'][building]['type'];
        }
    }
}

function setdestination(on_minimap){
    if(selected_type === 'Unit'){
        for(var unit in players[0]['units']){
            if(!players[0]['units'][unit]['selected']){
                continue;
            }

            players[0]['units'][unit]['destination-x'] = on_minimap
              ? math[0] * (mouse_x - 100)
              : mouse_x - x - camera_x;

            players[0]['units'][unit]['destination-y'] = on_minimap
              ? math[0] * (mouse_y - height + 100)
              : mouse_y - y - camera_y;

            validate_destination(
              'units',
              unit
            );
        }

    }else{
        for(var building in players[0]['buildings']){
            if(!players[0]['buildings'][building]['selected']){
                continue;
            }

            players[0]['buildings'][building]['destination-x'] = on_minimap
              ? math[0] * (mouse_x - 100)
              : mouse_x - x - camera_x;

            players[0]['buildings'][building]['destination-y'] = on_minimap
              ? math[0] * (mouse_y - height + 100)
              : mouse_y - y - camera_y;

            validate_destination(
              'buildings',
              building
            );
        }
    }
}

function setmode(newmode){
    window.cancelAnimationFrame(animationFrame);
    window.clearInterval(interval);

    bullets = [];
    fog = [];
    math = [];
    players = {};
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
          Math.PI * 2,
        ];

        mouse_hold = 0;
        mouse_lock_x = -1;
        mouse_lock_y = -1;
        mouse_x = -1;
        mouse_y = -1;
        paused = false;
        selected_type = '';

        document.body.innerHTML =
          '<canvas id=canvas oncontextmenu="return false"></canvas><canvas id=buffer></canvas>';

        // Add fog, if settings allow it.
        if(settings['fog-type'] > 0){
            var temp_x = 0;
            var temp_y = 0;
            var times = Math.floor(settings['level-size'] / 50);

            var loop_counter = Math.pow(times, 2) - 1;
            do{
                fog.push({
                  'display': true,
                  'x': temp_x * 100,
                  'y': temp_y,
                });

                // Add next fog unit one fog unit space to the right.
                temp_x += 1;

                // Done with this row, move on to the next.
                if(loop_counter % times === 0){
                    temp_y += 100;
                    temp_x = 0;
                }
            }while(loop_counter--);
        }

        load_level(mode - 1);

        // Set camera position to HQ location.
        camera_x = -players[0]['buildings'][0]['x'] - players[0]['buildings'][0]['width'] / 2;
        camera_y = -players[0]['buildings'][0]['y'] - players[0]['buildings'][0]['height'] / 2;

        buffer = document.getElementById('buffer').getContext('2d', {
          'alpha': false,
        });
        canvas = document.getElementById('canvas').getContext('2d');

        resize();

        animationFrame = window.requestAnimationFrame(draw);
        interval = window.setInterval(
          logic,
          settings['ms-per-frame']
        );

        return;
    }

    // Main menu mode.
    buffer = 0;
    canvas = 0;

    document.body.innerHTML = '<div><div><b>Skirmish vs AI:</b><ul><li><a onclick=setmode(1)>Island</a><li><a onclick=setmode(2)>Urban</a><li><a onclick=setmode(3)>Wasteland</a></ul></div></div><div class=right><div><input id=camera-keys maxlength=4 value='
      + settings['camera-keys'] + '>Camera ↑←↓→<br><input disabled value=ESC>Main Menu<br><input id=pause-key maxlength=1 value='
      + settings['pause-key'] + '>Pause</div><hr><div><input id=audio-volume max=1 min=0 step=0.01 type=range value='
      + settings['audio-volume'] + '>Audio<br><select id=fog-type>'
        + '<option value=2>Infinite</option>'
        + '<option value=1>Finite</option>'
        + '<option value=0>No</option>'
      + '</select>Fog<br><input id=fog-color value='
      + settings['fog-color'] + ' type=color>Fog Color<br><input id=frames-per-income value='
      + settings['frames-per-income'] + '>Frames/Income<br><input id=level-size value='
      + settings['level-size'] + '>*2 Level Size<br><input id=money value='
      + settings['money'] + '>Money<br><input id=ms-per-frame value='
      + settings['ms-per-frame'] + '>ms/Frame<br><input id=scroll-speed value='
      + settings['scroll-speed'] + '>Scroll Speed<br><a onclick=reset()>Reset Settings</a></div></div>';

    document.getElementById('fog-type').value = settings['fog-type'];
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

function validate_destination(type, id){
    if(players[0][type][id]['destination-x'] > settings['level-size']){
        players[0][type][id]['destination-x'] = settings['level-size'];
    }else if(players[0][type][id]['destination-x'] < -settings['level-size']){
        players[0][type][id]['destination-x'] = -settings['level-size'];
    }

    if(players[0][type][id]['destination-y'] > settings['level-size']){
        players[0][type][id]['destination-y'] = settings['level-size'];
    }else if(players[0][type][id]['destination-y'] < -settings['level-size']){
        players[0][type][id]['destination-y'] = -settings['level-size'];
    }
}

var animationFrame = 0;
var buffer = 0;
var buildings = {};
var build_mode = '';
var bullets = [];
var camera_x = 0;
var camera_y = 0;
var canvas = 0;
var fog = [];
var height = 0;
var interval = 0;
var key_down = false;
var key_left = false;
var key_right = false;
var key_up = false;
var math = [];
var mode = 0;
var money_timer = 0;
var mouse_hold = 0;
var mouse_lock_x = 0;
var mouse_lock_y = 0;
var mouse_x = 0;
var mouse_y = 0;
var paused = false;
var players = {};
var selected_id = -1;
var selected_type = '';
var settings = {
  'audio-volume': window.localStorage.getItem('RTS-2D.htm-audio-volume') !== null
    ? parseFloat(window.localStorage.getItem('RTS-2D.htm-audio-volume'))
    : 1,
  'camera-keys': window.localStorage.getItem('RTS-2D.htm-camera-keys') || 'WASD',
  'fog-color': window.localStorage.getItem('RTS-2D.htm-fog-color') || '#000000',
  'fog-type': window.localStorage.getItem('RTS-2D.htm-fog-type') || 1,
  'frames-per-income': parseFloat(window.localStorage.getItem('RTS-2D.htm-frames-per-income')) || 100,
  'level-size': parseFloat(window.localStorage.getItem('RTS-2D.htm-level-size')) || 1600,
  'money': window.localStorage.getItem('RTS-2D.htm-money') !== null
    ? parseFloat(window.localStorage.getItem('RTS-2D.htm-money'))
    : 1000,
  'ms-per-frame': parseInt(window.localStorage.getItem('RTS-2D.htm-ms-per-frame')) || 25,
  'pause-key': window.localStorage.getItem('RTS-2D.htm-pause-key') || 'P',
  'scroll-speed': parseInt(window.localStorage.getItem('RTS-2D.htm-scroll-speed')) || 10,
};
var units = {};
var width = 0;
var world_static = [];
var x = 0;
var y = 0;

window.onkeydown = function(e){
    if(mode <= 0){
        return;
    }

    var key = e.keyCode || e.which;

    if(key === 27){
        if(build_mode.length > 0){
            build_mode = '';

        }else{
            setmode(0);
        }

        return;
    }

    if(!paused){
        // If HQ selected.
        if(selected_type === 'HQ'){
            // Check if building build hotkey pressed.
            for(var building in buildings){
                if(key === buildings[building]['key']){
                    build_mode = buildings[building]['label'];
                    return;
                }
            }

        // If Factory selected.
        }else if(selected_type === 'F'){
            // Check if unit build hotkey pressed.
            for(var unit in units){
                if(key === units[unit]['key']){
                    build_unit(
                      0,
                      unit
                    );
                    return;
                }
            }
        }
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

    }else if(key === settings['pause-key']){
        paused = !paused;
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

window.onload = function(e){
    setmode(0);
};

window.onmousedown = function(e){
    if(mode <= 0
      || paused){
        return;
    }

    e.preventDefault();

    // If not clicking on minimap.
    if(mouse_x > 200
      || mouse_y < height - 200){

        // Check if in buildling mode.
        if(build_mode.length > 0){
            // Attempt to build a building.
            build_building(
              0,
              build_mode,
              mouse_x - camera_x - x - buildings[build_mode]['width'] / 2,
              mouse_y - camera_y - y - buildings[build_mode]['height'] / 2
            );

        // If unit selected or not clicking on build robot button.
        }else if(selected_type === ''
          || selected_type === 'Unit'
          || mouse_y < height - 65
          || mouse_x > 270){
            // Left click: start dragging.
            if(e.button === 0){
                mouse_hold = 1;
                mouse_lock_x = mouse_x;
                mouse_lock_y = mouse_y;

            // Right click: try to set selected building/unit destination.
            }else if(e.button === 2){
                setdestination(false);
            }

        // Else if HQ is selected, activate build mode.
        }else if(selected_type === 'HQ'){
            build_mode = 'F';

        // Else if factory is selected, build robot.
        }else if(selected_type === 'F'){
            build_unit(
              0,
              'Robot'
            );
        }

    // Right clicking on minimap.
    }else if(e.button === 2){
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
    if(mode <= 0
      || paused){
        return;
    }

    mouse_x = e.pageX;
    mouse_y = e.pageY;

    if(e.button === 2){
        setdestination(
          mouse_x <= 200
          && mouse_y >= height - 200
        );
    }

    // Dragging after click was not on minimap.
    if(mouse_hold === 1){
        select();

    // Dragging after click was on minimap.
    }else if(mouse_hold === 2){
        validate_camera_move(
          mouse_x,
          mouse_y
        );
    }
};

window.onmouseup = function(e){
    mouse_hold = 0;
};

window.onresize = resize;
