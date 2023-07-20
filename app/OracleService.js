// Llamada a las dependencias del proyecto
import Web3 from 'web3'
import { Transaction as Tx } from 'ethereumjs-tx';
import fetch from 'node-fetch'

// Llamada a los archivos .json
import fs from 'fs';

const contractJson = JSON.parse(fs.readFileSync('../build/contracts/Oracle.json', 'utf8'));

// Instancia de web3
const web3 = new Web3('ws://127.0.0.1:7545')

// Información de direcciones de Ganache
const addressContract = '0x8Aa35f7eb75c9fE37c023413571d33fD28A96355'
const contractInstance = new web3.eth.Contract(contractJson.abi, addressContract)
const privateKey = Buffer.from('0x03475db2c97c8555185e54dd25a70d9e767525cd15b8d758576674613e4b74a9', 'hex')
const address = '0xd6405192b39555F06Cd82D5F8D514c24F7F29429'

// Obtener el número de bloque
web3.eth.getBlockNumber()
    .then(n => listenEvent(Number(n) - 1))

// Función: listenEvent()
function listenEvent(lastBlock) {
    contractInstance.events.__callBackNewData({}, { fromBlock: lastBlock, toBlock: 'latest' }, (err, event) => {
        event ? updateData() : null
        err ? console.log(err) : null
    })
}

// Función: updateData()
function updateData() {
    // start_date = 2015-09-07
    // end_date = 2015-09-08
    // api_key = DEMO_KEY
    const url = 'https://api.nasa.gov/neo/rest/v1/feed?start_date=2015-09-07&end_date=2015-09-08&api_key=DEMO_KEY' 

    fetch(url)
    .then(response => response.json())
    .then (json => setDataContract(json.element_count))
}

// Función: setDataContract(_value)
function setDataContract(_value) {
    web3.eth.getTransactionCount(address, (err, txNum) => {
        contractInstance.methods.setNumberAsteroids(_value).estimateGas({}, (err, gasAmount) => {
            let rawTx = {
                nonce: web3.utils.toHex(txNum),
                gasPrice: web3.utils.toHex(web3.utils.toWei('1.4', 'gwei')),
                gasLimit: web3.utils.toHex(gasAmount),
                to: addressContract,
                value: '0x00',
                data: contractInstance.methods.setNumberAsteroids(_value).encodeABI()
            }

            const tx = new Tx(rawTx)
            tx.sign(privateKey)
            const serializedTx = tx.serialize().toString('hex')
            web3.eth.sendSignedTransaction('0x' + serializedTx)
        })
    })
}