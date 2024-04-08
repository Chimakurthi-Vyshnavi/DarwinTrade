import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { firebaseConfig, vapidKey } from "./config";

Notification.requestPermission().then(permission => {
        if(permission === 'granted') {
        // console.log("Permission granted")
        initFirebase();
    } else {
        // console.log("Permission denied!")
    }
})

export const initFirebase = async() => {
    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);
    onMessage(messaging, (payload) => {
        // console.log('foreground Message Received', payload);
        new Notification('DarwinTrade', {
            title : 'DarwinTrade',
            message : payload.data.message,
            contextMessage : payload.data.message,
        }as any)
    })
        
    return getToken(messaging, { vapidKey }).then((currentToken) => {
        if (currentToken) {
            // console.log('current token for client: ', currentToken);
        } else {
            // console.log('No registration token available. Request permission to generate one.');
        }
    }).catch((err) => {
        console.log('An error occurred while retrieving token. ', err);
    });
}