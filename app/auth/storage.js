import *  as SecureStorage from 'expo-secure-store'
const key="authToken"
const storeToken = async authToken => {
    try { 
        return await SecureStorage.setItemAsync(key,authToken)
    }
    catch (error) {
        console.log('error storing token',error)
    }
    

}

const getToken = async () => {
    try {
        return await SecureStorage.getItemAsync(key)
    }
    catch (error) {
        console.log('failed to get token',error.message)
    }
}

const removeToken = async () => {
    try {
        return await SecureStorage.deleteItemAsync()
    }
    catch (error) {
        console.log("failed to remove token",error)
    }
}

export default {getToken,storeToken,removeToken}