import { initializeApp } from "firebase/app";
import { getMessaging } from 'firebase/messaging/sw';
import { firebaseConfig } from "./config";

initializeApp(firebaseConfig)

const messaging = getMessaging()