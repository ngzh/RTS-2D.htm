'use strict';

function load_level(id){
    load_tech();

    document.getElementById('canvas').style.background = [
      '#277',
      '#444',
      '#321',
    ][id];

    world_static = [
      {
        'color': [
          '#765',
          '#333',
          '#432',
        ][id],
        'height': settings['level-size'] * 2,
        'width': settings['level-size'] * 2,
        'x': -settings['level-size'],
        'y': -settings['level-size'],
      },
    ];

    // Choose random starting locations.
    var start_x = Math.floor(Math.random() * 2);
    var start_y = Math.floor(Math.random() * 2);

    // Setup players.
    players = {
      0: {
        'buildings': [],
        'money': settings['money'],
        'units': [],
      },
      1: {
        'buildings': [],
        'money': settings['money'],
        'units': [],
      },
    };

    build_building(
      0,
      'HQ',
      start_x
        ? -settings['level-size'] + 25
        : settings['level-size'] - 125,
      start_y
        ? settings['level-size'] - 125
        : -settings['level-size'] + 25,
      true
    );
    build_building(
      1,
      'HQ',
      start_x
        ? settings['level-size'] - 125
        : -settings['level-size'] + 25,
      start_y
        ? -settings['level-size'] + 25
        : settings['level-size'] - 125
    );
}

function load_tech(id){
    id = id || 'default';

    var tech = {
      'default': {
        'buildings': {
          'Factory': {
            'children': [
              'R',
            ],
            'cost': 250,
            'key': 70,
            'label': 'F',
          },
          'HQ': {
            'children': [
              'F',
            ],
            'cost': 0,
            'label': 'HQ',
          },
        },
        'units': {
          'Robot': {
            'cost': 100,
            'key': 82,
          },
        },
      },
    };

    buildings = tech[id]['buildings'];
    units = tech[id]['units'];
}