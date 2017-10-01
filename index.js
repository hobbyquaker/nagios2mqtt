#!/usr/bin/env node

const Mqtt = require('mqtt');

const config = {
    mqttUrl: 'mqtt://127.0.0.1',
    topicPrefix: 'nagios/status/',
    publishRetain: true,
    keyPrefix: 'NAGIOS_',
    keys: [
        /* https://assets.nagios.com/downloads/nagioscore/docs/nagioscore/3/en/macrolist.html */
        'DATE',
        'DATE',
        'EVENTSTARTTIME',
        'SHORTDATETIME',
        'TIME',
        'TIMET',
        'HOSTDISPLAYNAME',
        'HOSTNAME',
        'HOSTSTATE',
        'HOSTSTATETYPE',
        'HOSTSTATEID',
        'HOSTOUTPUT',
        'LASTHOSTCHECK',
        'SERVICEDESC',
        'SERVICEDISPLAYNAME',
        'SERVICEOUTPUT',
        'SERVICESTATE',
        'SERVICESTATEID',
        'LASTSERVICECHECK',
        'NOTIFICATIONCOMMENT'
    ]
};
function getVar(name) {
    return process.env[config.keyPrefix + name]
}

const payload = {};
let topic = config.topicPrefix + getVar('HOSTNAME');

if (getVar('SERVICESTATE')) {
    topic += '/' + getVar('SERVICEDESC');
    payload.val = getVar('SERVICESTATE');
} else if (getVar('HOSTSTATE')) {
    payload.val = getVar('HOSTSTATE');
} else {
    process.exit(1);
}

payload.nagios = {};
config.keys.forEach(key => {
    payload.nagios[key] = getVar(key);
});

const mqtt = Mqtt.connect(config.mqttUrl);

mqtt.on('connect', () => {
    mqtt.publish(topic, JSON.stringify(payload), {retain: config.publishRetain}, () => {
        mqtt.end();
    });
});
