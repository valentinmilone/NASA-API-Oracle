// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Oracle {

    // https://api.nasa.gov/neo/rest/v1/feed?start_date=START_DATE&end_date=END_DATE&api_key=API_KEY

    // Dirección del Owner
    address owner;

    // Número asteroids
    uint public numberAsteroids;

    // Evento que reciba datos del oraculo
    event __callBackNewData();

    // Constructor
    constructor () {
        owner = msg.sender;
    }
    // Restricción de la ejecución de las funciones
    modifier onlyOwner() {
        require(msg.sender == owner, 'Only Owner');
        _;
    }

    function update() public onlyOwner {
        emit __callBackNewData();
    }

    // Función para configuración manual del numero de asteroids   
    function setNumberAsteroids(uint _num) public onlyOwner {
        numberAsteroids = _num;
    }


}

