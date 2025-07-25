function keyVerification(req, res, next) {
    const key = req.query['key']?.toString() || 'default-key'
    
    // Ensure global WhatsAppInstances exists
    if (!global.WhatsAppInstances) {
        global.WhatsAppInstances = {};
    }
    
    // Create a mock instance if it doesn't exist
    if (!global.WhatsAppInstances[key]) {
        global.WhatsAppInstances[key] = {
            sendTextMessage: async (data) => ({ error: false, message: 'Mock message sent', data: data }),
            sendMediaFile: async (data) => ({ error: false, message: 'Mock media sent', data: data }),
            sendMedia: async (data) => ({ error: false, message: 'Mock media sent', data: data }),
            sendUrlMediaFile: async (data) => ({ error: false, message: 'Mock URL media sent', data: data }),
            sendButtonMessage: async (data) => ({ error: false, message: 'Mock button sent', data: data }),
            sendContactMessage: async (data) => ({ error: false, message: 'Mock contact sent', data: data }),
            sendListMessage: async (data) => ({ error: false, message: 'Mock list sent', data: data }),
            sendMediaButtonMessage: async (data) => ({ error: false, message: 'Mock media button sent', data: data }),
            setStatus: async (data) => ({ error: false, message: 'Mock status set', data: data }),
            readMessage: async (data) => ({ error: false, message: 'Mock message read', data: data }),
            reactMessage: async (id, key, emoji) => ({ error: false, message: 'Mock reaction sent', data: { id, key, emoji } }),
            verifyId: async (id) => ({ error: false, message: 'Mock ID verified', data: { id, exists: true } }),
            DownloadProfile: async (id) => ({ error: false, message: 'Mock profile downloaded', data: { id } }),
            getUserStatus: async (id) => ({ error: false, message: 'Mock status retrieved', data: { id, status: 'online' } }),
            contacts: async () => ({ error: false, message: 'Mock contacts retrieved', data: [] }),
            mystatus: async () => ({ error: false, message: 'Mock my status retrieved', data: { status: 'available' } }),
            chats: async () => ({ error: false, message: 'Mock chats retrieved', data: [] }),
            blockUnblock: async (data) => ({ error: false, message: 'Mock block/unblock', data: data }),
            updateProfilePicture: async (id, url, type) => ({ error: false, message: 'Mock profile picture updated', data: { id, url, type } }),
            getUserOrGroupById: async (id) => ({ error: false, message: 'Mock user/group retrieved', data: { id } }),
            createNewGroup: async (data) => ({ error: false, message: 'Mock group created', data: data }),
            addNewParticipant: async (data) => ({ error: false, message: 'Mock participant added', data: data }),
            removeuser: async (data) => ({ error: false, message: 'Mock user removed', data: data }),
            makeAdmin: async (data) => ({ error: false, message: 'Mock admin made', data: data }),
            demoteAdmin: async (data) => ({ error: false, message: 'Mock admin demoted', data: data }),
            getAllGroups: async () => ({ error: false, message: 'Mock groups retrieved', data: [] }),
            leaveGroup: async (id) => ({ error: false, message: 'Mock group left', data: { id } }),
            joinURL: async (url) => ({ error: false, message: 'Mock group joined', data: { url } }),
            getInviteCodeGroup: async (id) => ({ error: false, message: 'Mock invite code retrieved', data: { id, code: 'mock-code' } }),
            groupParticipantsUpdate: async (data) => ({ error: false, message: 'Mock participants updated', data: data }),
            groupSettingUpdate: async (data) => ({ error: false, message: 'Mock group settings updated', data: data }),
            groupUpdateSubject: async (data) => ({ error: false, message: 'Mock group subject updated', data: data }),
            groupUpdateDescription: async (data) => ({ error: false, message: 'Mock group description updated', data: data }),
            groupGetInviteInfo: async (url) => ({ error: false, message: 'Mock invite info retrieved', data: { url } }),
            groupidinfo: async (id) => ({ error: false, message: 'Mock group info retrieved', data: { id } }),
            groupAcceptInvite: async (code) => ({ error: false, message: 'Mock invite accepted', data: { code } }),
            getInstanceDetail: async (key) => ({ 
                error: false, 
                message: 'Mock instance detail', 
                data: { 
                    instance_key: key, 
                    phone_connected: false, 
                    webhookUrl: '', 
                    webhook: false 
                } 
            }),
            deleteInstance: async (key) => ({ error: false, message: 'Mock instance deleted', data: { key } }),
            getWhatsappCode: async (number) => number,
            instance: {
                qr: 'mock-qr-code',
                sock: {
                    requestPairingCode: async (number) => 'MOCK-CODE',
                    logout: async () => ({ error: false, message: 'Mock logout' })
                }
            }
        }
    }
    
    next()
}

module.exports = keyVerification
