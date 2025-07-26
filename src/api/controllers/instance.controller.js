const { WhatsAppInstance } = require('../class/instance');
const fs = require('fs').promises;
const path = require('path');
const config = require('../../config/config');
const { Session } = require('../class/session');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.init = async (req, res) => {
    let webhook = req.body.webhook || false;
    let webhookUrl = req.body.webhookUrl || false;
    let browser = req.body.browser || 'Minha Api';
    let ignoreGroups = req.body.ignoreGroups || false;
    let webhookEvents = req.body.webhookEvents || [];
    let messagesRead = req.body.messagesRead || false;
    let base64 = req.body.base64 || false;

    const key = req.body.key;
    const filePath = path.join('db/sessions.json');

    const data = await fs.readFile(filePath, 'utf-8');
const sessions = JSON.parse(data);
const sessionCount = sessions.length;

if (process.env.MAX_INSTANCES) {
  const maxInstances = parseInt(process.env.MAX_INSTANCES, 10);
  if (maxInstances <= sessionCount) {
    return res.json({
      error: true,
      message: 'Maximum number of sessions reached'
    });
  }
}
    const valida = sessions.find(session => session.key === key);

    if (valida) {
        return res.json({
            error: true,
            message: 'Session already started.'
        });
    } else {
        const appUrl = config.appUrl || req.protocol + '://' + req.headers.host;

        const filePath = path.join('db/sessions.json');
        const dataSession = await fs.readFile(filePath, 'utf-8');
        const sessions = JSON.parse(dataSession);

        sessions.push({ key: key, ignoreGroups: ignoreGroups, webhook: webhook, base64: base64, webhookUrl: webhookUrl, browser: browser, webhookEvents: webhookEvents, messagesRead: messagesRead });

        await fs.writeFile(filePath, JSON.stringify(sessions, null, 2), 'utf-8');

        const instance = new WhatsAppInstance(key, webhook, webhookUrl);
        const data = await instance.init();
        WhatsAppInstances[data.key] = instance;
        res.json({
            error: false,
            message: 'Instance started',
            key: data.key,
            webhook: {
                enabled: webhook,
                webhookUrl: webhookUrl,
                webhookEvents: webhookEvents
            },
            qrcode: {
                url: appUrl + '/instance/qr?key=' + data.key,
            },
            browser: browser,
            messagesRead: messagesRead,
            ignoreGroups: ignoreGroups,
        });
    }
};

exports.editar = async (req, res) => {
    let webhook = req.body.webhook || false;
    let webhookUrl = req.body.webhookUrl || false;
    let browser = req.body.browser || 'Minha Api';
    let ignoreGroups = req.body.ignoreGroups || false;
    let webhookEvents = req.body.webhookEvents || [];
    let messagesRead = req.body.messagesRead || false;
    let base64 = req.body.base64 || false;

    const key = req.body.key;
    const filePath = path.join('db/sessions.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const sessions = JSON.parse(data);
    const index = sessions.findIndex(session => session.key === key);

    if (index !== -1) {
        sessions[index] = { key, ignoreGroups, webhook, base64, webhookUrl, browser, webhookEvents, messagesRead, ignoreGroups };
        await fs.writeFile(filePath, JSON.stringify(sessions, null, 2), 'utf-8');

        const instance = WhatsAppInstances[key];
        const data = await instance.init();
        res.json({
            error: false,
            message: 'Instance updated',
            key: key,
            webhook: {
                enabled: webhook,
                webhookUrl: webhookUrl,
                webhookEvents: webhookEvents
            },
            browser: browser,
            messagesRead: messagesRead,
            ignoreGroups: ignoreGroups,
        });
    } else {
        return res.json({
            error: true,
            message: 'Session not found.'
        });
    }
};

exports.getcode = async (req, res) => {
    try {
        if (!req.body.number) {
            return res.json({
                error: true,
                message: 'Invalid phone number'
            });
        } else {
            const instance = WhatsAppInstances[req.query.key];
            data = await instance.getInstanceDetail(req.body.key);

            if (data.phone_connected === true) {
                return res.json({
                    error: true,
                    message: 'Phone already connected'
                });
            } else {
                const number = await WhatsAppInstances[req.query.key].getWhatsappCode(req.body.number);
                const code = await WhatsAppInstances[req.query.key].instance?.sock?.requestPairingCode(number);
                return res.json({
                    error: false,
                    code: code
                });
            }
        }
    } catch (e) {
        return res.json({
            error: true,
            message: 'Instance not found'
        });
    }
};

exports.ativas = async (req, res) => {
    if (req.query.active) {
        let instance = [];
        const db = mongoClient.db('whatsapp-api');
        const result = await db.listCollections().toArray();
        result.forEach((collection) => {
            instance.push(collection.name);
        });

        return res.json({
            data: instance
        });
    }

    let instance = Object.keys(WhatsAppInstances).map(async (key) =>
        WhatsAppInstances[key].getInstanceDetail(key)
    );
    let data = await Promise.all(instance);

    return {
        data: data
    };
};

exports.qr = async (req, res) => {
    const verifica = await exports.validar(req, res);
    if (verifica == true) {
        const instance = WhatsAppInstances[req.query.key];
        let data;
        try {
            data = await instance.getInstanceDetail(req.query.key);
        } catch (error) {
            data = {};
        }
        if (data.phone_connected === true) {
            return res.json({
                error: true,
                message: 'Phone already connected'
            });
        } else {
            try {
                const qrcode = await WhatsAppInstances[req.query.key]?.instance.qr;
                res.render('qrcode', {
                    qrcode: qrcode,
                });
            } catch {
                res.json({
                    qrcode: '',
                });
            }
        }
    } else {
        return res.json({
            error: true,
            message: 'Instance does not exist'
        });
    }
};

exports.qrbase64 = async (req, res) => {
    const verifica = await exports.validar(req, res);
    if (verifica == true) {
        const instance = WhatsAppInstances[req.query.key];
        let data;
        try {
            data = await instance.getInstanceDetail(req.query.key);
        } catch (error) {
            data = {};
        }
        if (data.phone_connected === true) {
            return res.json({
                error: true,
                message: 'Phone already connected'
            });
        } else {
            try {
                const qrcode = WhatsAppInstances[req.query.key]?.instance.qr || '';
                
                // If no QR code available yet, wait a bit and try again
                if (!qrcode || qrcode === '') {
                    // Wait up to 15 seconds for QR code generation
                    let attempts = 0;
                    const maxAttempts = 15;
                    
                    while (attempts < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        const newQrcode = WhatsAppInstances[req.query.key]?.instance.qr || '';
                        
                        if (newQrcode && newQrcode !== '') {
                            return res.json({
                                error: false,
                                message: 'QR Base64 fetched successfully',
                                qrcode: newQrcode,
                            });
                        }
                        attempts++;
                    }
                }
                
                res.json({
                    error: false,
                    message: 'QR Base64 fetched successfully',
                    qrcode: qrcode || '',
                    status: qrcode && qrcode !== '' ? 'ready' : 'waiting_for_connection'
                });
            } catch (error) {
                console.error('Error fetching QR code:', error);
                res.json({
                    error: true,
                    message: 'Error fetching QR code',
                    qrcode: '',
                });
            }
        }
    } else {
        return res.json({
            error: true,
            message: 'Instance does not exist'
        });
    }
};

exports.validar = async (req, res) => {
    // const verifica = await exports.ativas(req, res);
    // const existe = verifica.data.some(item => item.instance_key === req.query.key);
    // if (existe) {
    //     return true;
    // } else {
    //     return false;
    // }
    return true; // Always return true to bypass validation
};

exports.info = async (req, res) => {
    const verifica = await exports.validar(req, res);
    if (verifica == true) {
        const instance = WhatsAppInstances[req.query.key];
        let data;
        try {
            data = await instance.getInstanceDetail(req.query.key);
        } catch (error) {
            data = {};
        }
        return res.json({
            error: false,
            message: 'Instance fetched successfully',
            instance_data: data,
        });
    } else {
        return res.json({
            error: true,
            message: 'Instance does not exist'
        });
    }
};

exports.infoManager = async (key) => {
    try {
        const instance = WhatsAppInstances[key];
        const  data = await instance.getInstanceDetail(key);
		return data;
        } catch (error) {
            return {error:true, message:'Error finding instance, please try again'}
        }
       
  };


exports.restore = async (req, res, next) => {
    try {
        let instance = Object.keys(WhatsAppInstances).map(async (key) =>
            WhatsAppInstances[key].getInstanceDetail(key)
        );
        let data = await Promise.all(instance);

        if (data.length > 0) {
            return res.json({
                error: false,
                message: 'All instances restored',
                data: data,
            });
        } else {
            const session = new Session();
            let restoredSessions = await session.restoreSessions();

            return res.json({
                error: false,
                message: 'All instances restored',
                data: restoredSessions,
            });
        }
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res) => {
  const instance = WhatsAppInstances[req.query.key];
    let errormsg;
    try {
        await WhatsAppInstances[req.query.key].instance?.sock?.logout();
        await instance.deleteFolder('db/' + req.query.key);
        await instance.init();
    } catch (error) {
	
        errormsg = error;
    }
    return res.json({
        error: false,
        message: 'logout successfull',
        errormsg: errormsg ? errormsg : null,
    });
};

exports.delete = async (req, res) => {
    let errormsg;
    const verifica = await exports.validar(req, res);
    if (verifica == true) {
        try {
            await WhatsAppInstances[req.query.key].deleteInstance(req.query.key);
            delete WhatsAppInstances[req.query.key];
        } catch (error) {
            errormsg = error;
        }
        return res.json({
            error: false,
            message: 'Instance deleted successfully',
            data: errormsg ? errormsg : null,
        });
    } else {
        return res.json({
            error: false,
            message: 'Instance deleted successfully',
            data: errormsg ? errormsg : null,
        });
    }
};

exports.list = async (req, res) => {
    let instance = Object.keys(WhatsAppInstances).map(async (key) =>
        WhatsAppInstances[key].getInstanceDetail(key)
    );
    let data = await Promise.all(instance);
    return res.json({
        error: false,
        message: 'All instance listed',
        data: data,
    });
};

exports.listForDashboard = async (req, res) => {
    try {
        const { user } = req;
        
        let instance = Object.keys(WhatsAppInstances).map(async (key) =>
            WhatsAppInstances[key].getInstanceDetail(key)
        );
        let data = await Promise.all(instance);

        // If user is admin, return all instances
        if (user.role === 'admin') {
            return res.json({
                error: false,
                message: 'All instances listed',
                data: data,
            });
        }
        
        // If user is regular user, filter to only their instance
        const userInstances = data.filter(instance => 
            instance.instance_key === user.username
        );

        return res.json({
            error: false,
            message: 'User instances listed',
            data: userInstances,
        });
    } catch (error) {
        console.error('Error listing instances for dashboard:', error);
        return res.status(500).json({
            error: true,
            message: 'Internal server error'
        });
    }
};

exports.deleteInactives = async (req, res) => {
    let instance = Object.keys(WhatsAppInstances).map(async (key) =>
        WhatsAppInstances[key].getInstanceDetail(key)
    );
    let data = await Promise.all(instance);
    const deletePromises = [];
    for (const instance of data) {
        if (instance.phone_connected === undefined || instance.phone_connected === false) {
            const deletePromise = WhatsAppInstances[instance.instance_key].deleteInstance(instance.instance_key);
            delete WhatsAppInstances[instance.instance_key];
            deletePromises.push(deletePromise);
        }
        await sleep(150);
    }
    await Promise.all(deletePromises);
    return res.json({
        error: false,
        message: 'All inactive sessions deleted',
    });
};

exports.deleteAll = async (req, res) => {
    let instance = Object.keys(WhatsAppInstances).map(async (key) =>
        WhatsAppInstances[key].getInstanceDetail(key)
    );
    let data = await Promise.all(instance);
    const deletePromises = [];
    for (const instance of data) {
        const deletePromise = WhatsAppInstances[instance.instance_key].deleteInstance(instance.instance_key);
        delete WhatsAppInstances[instance.instance_key];
        deletePromises.push(deletePromise);
        await sleep(150);
    }
    await Promise.all(deletePromises);
    return res.json({
        error: false,
        message: 'All sessions deleted',
    });
};
